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
        unreadNotifications: (state) => state.notifications.filter(n => !n.read),
        hasUnread: (state) => state.unreadCount > 0
    },

    actions: {
        /**
         * 알림 목록 조회 및 개수 동기화
         */
        async fetchInitialData() {
            try {
                // 두 정보를 동시에 가져와 상태 일관성 유지
                const [list, count] = await Promise.all([
                    getMyNotifications(),
                    getUnreadCount()
                ]);
                this.notifications = list;
                this.unreadCount = count;
            } catch (error) {
                console.error('초기 알림 데이터 로드 실패:', error);
            }
        },

        async fetchNotifications() {
            try {
                this.notifications = await getMyNotifications();
            } catch (error) { console.error('알림 로드 실패:', error); }
        },

        async fetchUnreadCount() {
            try {
                this.unreadCount = await getUnreadCount();
                console.log(this.unreadCount)
            } catch (error) { console.error('카운트 로드 실패:', error); }
        },

        /**
         * 모든 알림 읽음 처리 (UI 즉시 반영)
         */
        async markAllNotificationsAsRead() {
            // 읽지 않은 알림이 이미 0이면 무시
            if (this.unreadCount === 0) return;

            try {
                // 1. 서버 API 호출 (백엔드 컨트롤러의 /read-all 엔드포인트)
                await markAllAsRead(); 

                // 2. 프론트엔드 로컬 상태 강제 업데이트
                // 배열 전체를 순회하여 read를 true로 변경
                this.notifications = this.notifications.map(n => ({
                    ...n,
                    read: true
                }));
                
                // 3. 개수 초기화
                this.unreadCount = 0;
                
            } catch (error) {
                console.error('모든 알림 읽음 처리 실패:', error);
                // 에러 발생 시 상태 롤백을 위해 다시 조회 시도
                await this.fetchInitialData();
            }
        },

        /**
         * 단일 알림 읽음 처리
         */
        async markNotificationAsRead(notificationId) {
            try {
                await markAsRead(notificationId);
                const n = this.notifications.find(item => item.id === notificationId);
                if (n && !n.read) {
                    n.read = true;
                    this.unreadCount = Math.max(0, this.unreadCount - 1);
                }
            } catch (error) { console.error('읽음 처리 실패:', error); }
        },

        async removeNotification(notificationId) {
            try {
                await deleteNotification(notificationId);
                const n = this.notifications.find(item => item.id === notificationId);
                if (n && !n.read) this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.notifications = this.notifications.filter(item => item.id !== notificationId);
            } catch (error) { console.error('삭제 실패:', error); }
        },

        addNotification(notification) {
            if (this.notifications.some(n => n.id === notification.id)) return;
            this.notifications.unshift(notification);
            if (!notification.read) this.unreadCount++;
            if (this.notifications.length > 50) this.notifications.pop();
        },

        setConnected(status) { this.isConnected = status; },
        setEventSource(es) { this.eventSource = es; },
        disconnect() {
            if (this.eventSource) { this.eventSource.close(); this.eventSource = null; }
            this.isConnected = false;
        },
        reset() { this.disconnect(); this.notifications = []; this.unreadCount = 0; }
    }
});