import { onMounted, onBeforeUnmount } from 'vue';
import { useNotificationStore } from '@/stores/notification';

/**
 * SSE 알림 연결 Composable
 * EventSource를 사용하여 백엔드와 SSE 연결 (withCredentials로 자동 쿠키 전송)
 */
export function useNotificationSSE() {
    const notificationStore = useNotificationStore();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    /**
     * Fetch API를 사용한 수동 SSE 연결 (JWT 헤더 지원)
     */
    const connect = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn('SSE 연결 실패: 토큰 없음');
            return;
        }

        try {
            const cleanToken = token.trim();
            const controller = new AbortController();

            const response = await fetch(`${API_BASE_URL}/notifications/sse/connect`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Accept': 'text/event-stream'
                },
                credentials: 'include',
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`SSE 연결 실패: ${response.status}`);
            }

            console.log('SSE 연결 성공');
            notificationStore.setConnected(true);
            reconnectAttempts = 0;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            const eventSource = {
                close: () => {
                    controller.abort();
                    reader.cancel();
                }
            };

            notificationStore.setEventSource(eventSource);

            const readStream = async () => {
                try {
                    while (true) {
                        const { done, value } = await reader.read();

                        if (done) {
                            console.log('SSE 스트림 종료');
                            handleDisconnect();
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n\n');
                        buffer = lines.pop() || '';

                        for (const line of lines) {
                            if (line.trim()) {
                                parseSSEMessage(line);
                            }
                        }
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('SSE 스트림 읽기 에러:', error);
                        handleDisconnect();
                    }
                }
            };

            readStream();

        } catch (error) {
            console.error('SSE 연결 생성 실패:', error);
            handleDisconnect();
        }
    };

    /**
     * SSE 메시지 파싱
     */
    const parseSSEMessage = (message) => {
        const lines = message.split('\n');
        let eventType = 'message';
        let data = '';

        for (const line of lines) {
            if (line.startsWith('event:')) {
                eventType = line.substring(6).trim();
            } else if (line.startsWith('data:')) {
                data = line.substring(5).trim();
            }
        }

        if (eventType === 'connect') {
            console.log('SSE 연결 확인:', data);
        } else if (eventType === 'notification') {
            try {
                const notification = JSON.parse(data);
                console.log('새 알림 수신:', notification);
                notificationStore.addNotification(notification);

                // 브라우저 알림 표시
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.content,
                        icon: '/favicon.ico'
                    });
                }
            } catch (error) {
                console.error('알림 데이터 파싱 실패:', error);
            }
        }
    };

    /**
     * 연결 종료 처리 및 재연결
     */
    const handleDisconnect = () => {
        notificationStore.setConnected(false);

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && localStorage.getItem('accessToken')) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
            console.log(`SSE 재연결 시도 ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} (${delay}ms 후)...`);

            setTimeout(() => {
                connect();
            }, delay);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.warn('SSE 최대 재연결 시도 횟수 초과');
        }
    };

    /**
     * SSE 연결 해제
     */
    const disconnect = () => {
        notificationStore.disconnect();
    };

    /**
     * 브라우저 알림 권한 요청
     */
    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    onMounted(async () => {
        // 초기 데이터 로드
        await notificationStore.fetchNotifications();
        await notificationStore.fetchUnreadCount();

        // SSE 연결 및 브라우저 알림 권한 요청
        connect();
        requestNotificationPermission();
    });

    onBeforeUnmount(() => {
        disconnect();
    });

    return {
        connect,
        disconnect,
        isConnected: () => notificationStore.isConnected
    };
}
