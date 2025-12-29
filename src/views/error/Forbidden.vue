<template>
    <div class="forbidden">
        <h1>🚫 접근 권한이 없습니다</h1>

        <p class="desc">
            해당 페이지에 접근할 권한이 없습니다.
        </p>

        <p class="path">
            요청 경로: <strong>{{ route.path }}</strong>
        </p>

        <div class="actions">
            <button @click="goHome">메인으로 이동</button>
        </div>
    </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const goHome = () => {
    router.push('/')
}
</script>

<style scoped>
.forbidden {
    padding: 48px;
}

.desc {
    margin-top: 12px;
    color: #6b7280;
}

.path {
    margin-top: 8px;
    font-size: 13px;
    color: #9ca3af;
}

.actions {
    margin-top: 24px;
}

button {
    padding: 8px 16px;
    background: #4C4CDD;
    color: white;
    border-radius: 6px;
}
</style>