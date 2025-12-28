import { defineStore } from 'pinia';
import { getMyNotifications, getUnreadCount, markAsRead } from '@/api/notification';

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        unreadCount: 0,
        isConnected: false,
        eventSource: null
    }),

    getters: {
        unreadNotifications: (state) =>
            state.notifications.filter(n => !n.isRead),

        hasUnread: (state) => state.unreadCount > 0
    },

    actions: {
        /**
         * 알림 목록 조회
         */
        async fetchNotifications() {
            try {
                const data = await getMyNotifications();
                this.notifications = data;
            } catch (error) {
                console.error('알림 목록 조회 실패:', error);
            }
        },

        /**
         * 읽지 않은 알림 개수 조회
         */
        async fetchUnreadCount() {
            try {
                const count = await getUnreadCount();
                this.unreadCount = count;
            } catch (error) {
                console.error('읽지 않은 알림 개수 조회 실패:', error);
            }
        },

        /**
         * 알림 읽음 처리
         */
        async markNotificationAsRead(notificationId) {
            try {
                await markAsRead(notificationId);

                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                }
            } catch (error) {
                console.error('알림 읽음 처리 실패:', error);
            }
        },

        /**
         * SSE 실시간 알림 추가
         */
        addNotification(notification) {
            this.notifications.unshift(notification);

            if (!notification.isRead) {
                this.unreadCount++;
            }

            if (this.notifications.length > 50) {
                this.notifications.pop();
            }
        },

        /**
         * SSE 연결 상태 설정
         */
        setConnected(connected) {
            this.isConnected = connected;
        },

        /**
         * EventSource 저장
         */
        setEventSource(eventSource) {
            this.eventSource = eventSource;
        },

        /**
         * SSE 연결 종료
         */
        disconnect() {
            if (this.eventSource) {
                this.eventSource.close();
                this.eventSource = null;
            }
            this.isConnected = false;
        },

        /**
         * 초기화
         */
        reset() {
            this.notifications = [];
            this.unreadCount = 0;
            this.disconnect();
        }
    }
});
