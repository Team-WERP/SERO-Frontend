<template>
    <div class="profile-modal" @click.stop>
        <div class="profile-modal__header">
            <div class="profile-modal__avatar">
                {{ userInitial }}
            </div>
            <div class="profile-modal__details">
                <p class="name">{{ userName }}</p>
                <p class="email">{{ userEmail }}</p>
                <div class="tags">
                    <span v-if="userRole" class="tag">{{ userRole }}</span>
                    <span v-if="userDept" class="tag">{{ userDept }}</span>
                </div>
            </div>
        </div>

        <div class="divider"></div>

        <ul class="profile-modal__menu">
            <li @click="goToMyPage">
                <span class="icon">👤</span> 내 정보 수정
            </li>
            <li @click="goToSettings">
                <span class="icon">⚙️</span> 설정
            </li>
        </ul>

        <div class="divider"></div>

        <div class="profile-modal__footer">
            <button class="logout-btn" @click="handleLogout">
                로그아웃
            </button>
        </div>

        <div class="divider"></div>

        <div class="px-4 py-3 text-xs text-gray-500 flex justify-between items-center">
            <div>
                로그아웃까지 남은 시간:
                <span :class="userStore.isExpiringSoon
                    ? 'text-red-500 font-bold'
                    : 'text-gray-700 font-semibold'">
                    {{ userStore.remainingTimeText }}
                </span>
            </div>

            <button @click="extendSession" class="text-blue-600 text-xs font-semibold hover:underline">
                연장
            </button>
        </div>


        <Toast :show="showToast" message="세션이 1분 후 만료됩니다. 연장해주세요." />
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { logout as logoutApi } from '@/api/auth';
import Toast from '@/components/common/Toast.vue';

const router = useRouter();
const userStore = useUserStore();

const emit = defineEmits(['close']);

const showToast = ref(false);
const toastShown = ref(false);

const userEmail = computed(() => userStore.user.email);
const userDept = computed(() => userStore.userPosition);
const userName = localStorage.getItem("name");
const userRole = computed(() => userStore.userRoleLabel);
const userPosition = computed(() => userStore.userPosition);
const userInitial = computed(() => userName ? userName.charAt(0) : "");


const goToMyPage = () => {
    router.push('/system/mypage'); // 마이페이지 라우트 경로 (예시)
    emit('close');
};

const goToSettings = () => {
    alert("설정 페이지 준비 중입니다.");
    emit('close');
};

const handleLogout = async () => {
    try {
        emit('close');

        const type = userStore.hasAuthority("AC_CLI")
            ? "client"
            : "hq";

        await logoutApi(type);
    } catch (e) {
        console.error("로그아웃 API 실패", e);
    } finally {
        userStore.logout();
        router.replace("/login");
    }
};

watch(
    () => userStore.remainingTimeMs,
    (v) => {
        // 🔔 1분 미만 경고
        if (v <= 60_000 && v > 0 && !toastShown.value) {
            showToast.value = true;
            toastShown.value = true;

            setTimeout(() => {
                showToast.value = false;
            }, 4000);
        }

        // ⛔ 만료
        if (v <= 0) {
            userStore.logout();
            router.replace("/login");
        }
    }
);

const extendSession = async () => {
    await userStore.refreshToken();
    toastShown.value = false; // 🔄 다시 토스트 허용
};
</script>

<style scoped>
.profile-modal {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    width: 280px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    z-index: 1000;
    overflow: hidden;
    animation: fadeIn 0.2s ease-out;
    cursor: default;
}

/* 상단 정보 영역 */
.profile-modal__header {
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.profile-modal__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #4C4CDD;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
    flex-shrink: 0;
}

.profile-modal__details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
}

.name {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.email {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tags {
    display: flex;
    gap: 6px;
    margin-top: 4px;
}

.tag {
    font-size: 11px;
    padding: 2px 6px;
    background-color: #f3f4f6;
    color: #4b5563;
    border-radius: 4px;
    font-weight: 500;
}

/* 구분선 */
.divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 0;
}

/* 메뉴 리스트 */
.profile-modal__menu {
    list-style: none;
    padding: 8px 0;
    margin: 0;
}

.profile-modal__menu li {
    padding: 10px 20px;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.2s;
}

.profile-modal__menu li:hover {
    background-color: #f9fafb;
}

.icon {
    font-size: 16px;
}

/* 하단 버튼 영역 */
.profile-modal__footer {
    padding: 12px 16px;
    background-color: #f9fafb;
}

.logout-btn {
    width: 100%;
    padding: 8px;
    border: 1px solid #d1d5db;
    background-color: white;
    color: #374151;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
}

.logout-btn:hover {
    background-color: #fee2e2;
    border-color: #fecaca;
    color: #b91c1c;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>