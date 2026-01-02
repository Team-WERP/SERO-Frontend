<template>
    <div class="notification-dropdown">
        <div class="dropdown-header">
            <div class="header-left">
                <h3 class="dropdown-title">알림</h3>
                <span class="unread-count">{{ unreadCount }}개의 새 알림</span>
            </div>
            <button
                v-if="notifications.length > 0"
                class="mark-all-read-btn"
                @click.stop="handleMarkAllAsRead"
                :disabled="unreadCount === 0"
            >
                모두 읽음
            </button>
        </div>

        <div class="notification-list">
            <template v-if="notifications.length > 0">
                <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="{ 'notification-item--unread': !notification.read }"
                >
                    <div class="notification-icon" :class="`notification-icon--${notification.type.toLowerCase()}`">
                        <component :is="getNotificationIcon(notification.type)" />
                    </div>

                    <div class="notification-content" @click="handleNotificationClick(notification)">
                        <div class="notification-title">{{ notification.title }}</div>
                        <div class="notification-message">{{ notification.content }}</div>
                        <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
                    </div>

                    <button
                        class="delete-btn"
                        @click.stop="handleDelete(notification.id)"
                        title="삭제"
                    >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </template>

            <div v-else class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                        fill="currentColor"
                    />
                </svg>
                <p class="empty-message">새로운 알림이 없습니다</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';

const emit = defineEmits(['close']);

const router = useRouter();
const notificationStore = useNotificationStore();

const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);

const getNotificationIcon = (type) => {
    const iconMap = {
        ORDER: () => h('svg', {
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            xmlns: 'http://www.w3.org/2000/svg'
        }, [
            h('path', {
                d: 'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z'
            })
        ]),
        SHIPPING: () => h('svg', {
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            xmlns: 'http://www.w3.org/2000/svg'
        }, [
            h('path', {
                d: 'M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM6 18C5.45 18 5 17.55 5 17C5 16.45 5.45 16 6 16C6.55 16 7 16.45 7 17C7 17.55 6.55 18 6 18ZM20 9.5L21.96 12H17V9.5H20ZM18 18C17.45 18 17 17.55 17 17C17 16.45 17.45 16 18 16C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18Z'
            })
        ]),
        APPROVAL: () => h('svg', {
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            xmlns: 'http://www.w3.org/2000/svg'
        }, [
            h('path', {
                d: 'M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z'
            })
        ]),
        PRODUCTION: () => h('svg', {
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            xmlns: 'http://www.w3.org/2000/svg'
        }, [
            h('path', {
                d: 'M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 20 23.1 19.3 22.7 19Z'
            })
        ]),
        SYSTEM: () => h('svg', {
            viewBox: '0 0 24 24',
            fill: 'currentColor',
            xmlns: 'http://www.w3.org/2000/svg'
        }, [
            h('path', {
                d: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'
            })
        ])
    };

    return iconMap[type] || iconMap.SYSTEM;
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
        const date = new Date(timestamp.replace(' ', 'T'));
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

        return timestamp.split(' ')[0];
    } catch (error) {
        return timestamp;
    }
};

const handleNotificationClick = async (notification) => {
    if (!notification.read) {
        await notificationStore.markNotificationAsRead(notification.id);
    }

    if (notification.redirectUrl) {
        // 레거시 URL 수정 (임시 처리)
        let url = notification.redirectUrl;
        if (url.startsWith('/goods-issues/')) {
            url = url.replace('/goods-issues/', '/warehouse/goods-issues/');
        }
        router.push(url);
    }

    emit('close');
};

const handleMarkAllAsRead = async () => {
    if (notificationStore.unreadCount === 0) return;

    try {
        await notificationStore.markAllNotificationsAsRead();
    } catch (error) {
        alert('알림 읽음 처리에 실패했습니다.');
    }
};

const handleDelete = async (notificationId) => {
    await notificationStore.removeNotification(notificationId);
};
</script>

<style scoped>
.notification-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 400px;
    max-height: 600px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    z-index: 1000;
    animation: dropdown-fade-in 0.2s ease-out;
}

@keyframes dropdown-fade-in {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #4C4CDD 0%, #6366f1 100%);
    color: white;
}

.header-left {
    display: flex;
    flex-direction: column;
}

.dropdown-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
}

.unread-count {
    font-size: 13px;
    opacity: 0.9;
}

.mark-all-read-btn {
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.mark-all-read-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
}

.mark-all-read-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.notification-list {
    max-height: 500px;
    overflow-y: auto;
}

.notification-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s;
    position: relative;
}

.notification-item:hover {
    background-color: #f9fafb;
}


.notification-item--unread {
    background-color: #eff6ff;
}

.notification-item--unread:hover {
    background-color: #dbeafe;
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notification-icon svg {
    width: 20px;
    height: 20px;
}

.notification-icon--order {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
}

.notification-icon--shipping {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
}

.notification-icon--approval {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
}

.notification-icon--production {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
}

.notification-icon--system {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    color: white;
}

.notification-content {
    flex: 1;
    min-width: 0;
    cursor: pointer;
}

.delete-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    transition: all 0.2s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.delete-btn:hover {
    color: #ef4444;
    background: #fee2e2;
    border-radius: 4px;
}

.delete-btn svg {
    width: 14px;
    height: 14px;
}

.notification-title {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
}

.notification-message {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.notification-time {
    font-size: 12px;
    color: #9ca3af;
}


.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
}

.empty-icon {
    width: 64px;
    height: 64px;
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-message {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
}

.notification-list::-webkit-scrollbar {
    width: 6px;
}

.notification-list::-webkit-scrollbar-track {
    background: #f3f4f6;
}

.notification-list::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>
