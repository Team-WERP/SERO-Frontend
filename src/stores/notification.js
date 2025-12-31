import { defineStore } from 'pinia';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '@/api/notification';

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        notifications: [],
        unreadCount: 0,
        isConnected: false,
        eventSource: null
    }),

    getters: {
        unreadNotifications: (state) =>
            state.notifications.filter(n => !n.read),

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
                if (notification && !notification.read) {
                    notification.read = true;
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

            if (!notification.read) {
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
         * 모든 알림 읽음 처리
         */
        async markAllNotificationsAsRead() {
            try {
                await markAllAsRead();

                // 모든 알림을 읽음 상태로 변경
                this.notifications.forEach(n => {
                    n.read = true;
                });
                this.unreadCount = 0;
            } catch (error) {
                console.error('모든 알림 읽음 처리 실패:', error);
            }
        },

        /**
         * 알림 삭제
         */
        async removeNotification(notificationId) {
            try {
                await deleteNotification(notificationId);

                // 삭제할 알림이 읽지 않은 상태였다면 개수 감소
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && !notification.read) {
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                }

                // 목록에서 제거
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
            } catch (error) {
                console.error('알림 삭제 실패:', error);
            }
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
