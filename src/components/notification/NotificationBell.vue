<template>
    <div class="notification-bell">
        <button class="bell-button" @click="toggleDropdown">
            <svg
                class="bell-icon"
                :class="{ 'bell-icon--ring': hasNewNotification }"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.89 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
                    fill="currentColor"
                />
            </svg>

            <span v-if="unreadCount > 0" class="notification-badge">
                {{ displayCount }}
            </span>
        </button>

        <NotificationDropdown
            v-if="isOpen"
            @close="closeDropdown"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import NotificationDropdown from './NotificationDropdown.vue';

const notificationStore = useNotificationStore();
const isOpen = ref(false);
const hasNewNotification = ref(false);

const unreadCount = computed(() => notificationStore.unreadCount);

const displayCount = computed(() => {
    return unreadCount.value > 99 ? '99+' : unreadCount.value;
});

const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
    isOpen.value = false;
};

// 새 알림이 왔을 때 애니메이션 효과
watch(unreadCount, (newCount, oldCount) => {
    if (newCount > oldCount) {
        hasNewNotification.value = true;
        setTimeout(() => {
            hasNewNotification.value = false;
        }, 1000);
    }
});

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event) => {
    const notificationElement = event.target.closest('.notification-bell');
    if (!notificationElement && isOpen.value) {
        closeDropdown();
    }
};

import { onMounted, onBeforeUnmount } from 'vue';

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notification-bell {
    position: relative;
}

.bell-button {
    position: relative;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.bell-button:hover {
    background-color: #f3f4f6;
}

.bell-icon {
    width: 24px;
    height: 24px;
    color: #6b7280;
    transition: color 0.2s;
}

.bell-button:hover .bell-icon {
    color: #4C4CDD;
}

.bell-icon--ring {
    animation: ring 0.5s ease-in-out;
}

@keyframes ring {
    0% { transform: rotate(0deg); }
    10% { transform: rotate(15deg); }
    20% { transform: rotate(-15deg); }
    30% { transform: rotate(15deg); }
    40% { transform: rotate(-15deg); }
    50% { transform: rotate(10deg); }
    60% { transform: rotate(-10deg); }
    70% { transform: rotate(5deg); }
    80% { transform: rotate(-5deg); }
    90% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
}

.notification-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
    animation: badge-pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes badge-pop {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}
</style>
