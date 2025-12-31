import api from './axios';

/**
 * 알림 API 서비스
 */

/**
 * 내 알림 목록 조회 (최대 50개, 최신순)
 */
export const getMyNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

/**
 * 읽지 않은 알림 개수 조회
 */
export const getUnreadCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

/**
 * 알림 읽음 처리
 * @param {number} notificationId
 */
export const markAsRead = async (notificationId) => {
    await api.patch(`/notifications/${notificationId}/read`);
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = async () => {
    await api.patch('/notifications/read-all');
};

/**
 * 알림 삭제
 * @param {number} notificationId
 */
export const deleteNotification = async (notificationId) => {
    await api.delete(`/notifications/${notificationId}`);
};
