import { onMounted, onBeforeUnmount } from 'vue';
import { useNotificationStore } from '@/stores/notification';

export function useNotificationSSE() {
    const notificationStore = useNotificationStore();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    const getDecodedToken = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            return JSON.parse(window.atob(base64));
        } catch (e) { return null; }
    };

    const getSseUrl = () => {
        const token = localStorage.getItem('accessToken');
        const defaultPath = '/notifications/sse/connect';
        const clientPath = '/clients/notifications/sse/connect';

        if (!token) return `${API_BASE_URL}${defaultPath}`;
        const decoded = getDecodedToken(token);
        const path = (decoded && decoded.auth === 'AC_CLI') ? clientPath : defaultPath;
        return `${API_BASE_URL}${path}`;
    };

    const connect = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const controller = new AbortController();
            const sseUrl = getSseUrl();

            const response = await fetch(sseUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token.trim()}`, 'Accept': 'text/event-stream' },
                signal: controller.signal
            });

            if (!response.ok) throw new Error(`연결 실패: ${response.status}`);

            notificationStore.setConnected(true);
            reconnectAttempts = 0;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            notificationStore.setEventSource({
                close: () => { controller.abort(); reader.cancel(); }
            });

            const readStream = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) { handleDisconnect(); break; }
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) { if (line.trim()) parseSSEMessage(line); }
                }
            };
            readStream();
        } catch (error) { handleDisconnect(); }
    };

    const parseSSEMessage = (message) => {
        const lines = message.split('\n');
        let eventType = 'message';
        let data = '';

        for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.substring(6).trim();
            else if (line.startsWith('data:')) data = line.substring(5).trim();        }

        if (eventType === 'notification') {
            const notification = JSON.parse(data);
            notificationStore.addNotification(notification);
            if (Notification.permission === 'granted') {
                new Notification(notification.title, { body: notification.content });
            }
        }
    };

    const handleDisconnect = () => {
        notificationStore.setConnected(false);
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS && localStorage.getItem('accessToken')) {
            reconnectAttempts++;
            setTimeout(connect, Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000));
        }
    };

    onMounted(async () => {
        await notificationStore.fetchNotifications();
        await notificationStore.fetchUnreadCount();
        connect();
        if (Notification.permission === 'default') Notification.requestPermission();
    });

    onBeforeUnmount(() => notificationStore.disconnect());

    return { connect, disconnect: notificationStore.disconnect, isConnected: () => notificationStore.isConnected };
}