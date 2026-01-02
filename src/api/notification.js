import api from './axios';

/**
 * JWT 토큰에서 권한 정보를 추출하여 BASE URL 결정
 */
const getBaseUrl = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return '/notifications';

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        // auth 값이 AC_CLI(고객사 권한 코드)인 경우 /clients 경로 사용
        return payload.auth === 'AC_CLI' ? '/clients/notifications' : '/notifications';
    } catch (e) {
        return '/notifications';
    }
};

/**
 * 내 알림 목록 조회 (최대 50개, 최신순)
 */
export const getMyNotifications = async () => {
    return (await api.get(getBaseUrl())).data;
};

/**
 * 읽지 않은 알림 개수 조회
 */
export const getUnreadCount = async () => {
    return (await api.get(`${getBaseUrl()}/unread-count`)).data;
};

/**
 * 알림 읽음 처리
 * @param {number} notificationId
 */
export const markAsRead = async (notificationId) => {
    await api.patch(`${getBaseUrl()}/${notificationId}/read`);
};

/**
 * 모든 알림 읽음 처리
 */
export const markAllAsRead = async () => {
    await api.patch(`${getBaseUrl()}/read-all`);
};

/**
 * 알림 삭제
 * @param {number} notificationId
 */
export const deleteNotification = async (notificationId) => {
    await api.delete(`${getBaseUrl()}/${notificationId}`);
};