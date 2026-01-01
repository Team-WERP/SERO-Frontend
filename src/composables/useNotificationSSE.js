import { onMounted, onBeforeUnmount } from 'vue';
import { useNotificationStore } from '@/stores/notification';

/**
 * SSE 알림 연결 Composable
 * 사용자 권한(직원/고객사)에 따라 동적으로 엔드포인트를 분기하여 연결합니다.
 */
export function useNotificationSSE() {
    const notificationStore = useNotificationStore();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    /**
     * JWT 토큰 페이로드를 파싱하는 내부 헬퍼 함수
     */
    const getDecodedToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    /**
     * 토큰의 auth 정보에 따라 SSE 연결 URL 결정
     * 직원: /notifications/sse/connect
     * 고객사: /clients/notifications/sse/connect
     */
    const getSseUrl = () => {
        const token = localStorage.getItem('accessToken');
        
        // 백엔드 컨트롤러 설정에 맞춘 경로 정의
        const defaultPath = '/notifications/sse/connect';
        const clientPath = '/clients/notifications/sse/connect';

        if (!token) return `${API_BASE_URL}${defaultPath}`;

        const decoded = getDecodedToken(token);
        
        // 토큰의 auth 값이 'AC_CLI'인 경우 고객사 경로 사용
        if (decoded && decoded.auth === 'AC_CLI') {
            return `${API_BASE_URL}${clientPath}`;
        }

        return `${API_BASE_URL}${defaultPath}`;
    };

    /**
     * Fetch API를 사용한 SSE 연결 수행
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
            
            // 사용자 권한별 URL 가져오기
            const sseUrl = getSseUrl();

            const response = await fetch(sseUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`,
                    'Accept': 'text/event-stream'
                },
                credentials: 'include',
                signal: controller.signal
            });

            if (!response.ok) {
                // 403 에러 발생 시 백엔드 Security 설정을 확인해야 함
                throw new Error(`SSE 연결 실패: ${response.status}`);
            }

            console.log(`SSE 연결 성공: ${sseUrl}`);
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
     * SSE 메시지 파싱 및 스토어 저장/브라우저 알림
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
                notificationStore.addNotification(notification);

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
     * 연결 끊김 시 지수 백오프 알고리즘을 사용한 재연결
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
        }
    };

    const disconnect = () => {
        notificationStore.disconnect();
    };

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    };

    onMounted(async () => {
        // 초기 로드 시 알림 내역과 읽지 않은 개수 동기화
        await notificationStore.fetchNotifications();
        await notificationStore.fetchUnreadCount();

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
