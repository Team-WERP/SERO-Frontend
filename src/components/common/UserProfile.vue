<template>
    <div class="user-profile" @click="openModal()">
        <div class="user-profile__avatar">
            {{ userInitial }}
        </div>

        <div class="user-profile__info">
            <div class="user-profile__name">{{ userName }}</div>
            <div class="user-profile__role">{{ userRole }}
                <span v-if="userPosition">
                    · {{ userPosition }}
                </span>
            </div>
        </div>

        <UserProfileModal v-if="isModalActive" @close="isModalActive = false" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user";
import UserProfileModal from "./UserProfileModal.vue";

const userStore = useUserStore();

const userName = localStorage.getItem("name");
const userRole = computed(() => userStore.userRoleLabel);
const userPosition = computed(() => userStore.userPosition);
const userInitial = computed(() => userName ? userName.charAt(0) : "");
const isModalActive = ref(false);

const openModal = () => {
    isModalActive.value = !isModalActive.value;
}

const handleClickOutside = (event) => {
    if (isModalActive.value && !event.target.closest(".user-profile")) {
        isModalActive.value = false;
    }
};

onMounted(() => {
    window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-profile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.user-profile__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #4C4CDD;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
}

.user-profile__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-profile__name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

.user-profile__role {
    font-size: 12px;
    color: #6b7280;
}
</style>
