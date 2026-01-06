<template>
    <div class="min-h-screen bg-gray-100 font-sans">

        <header class="h-14 bg-indigo-600 flex items-center justify-between px-6 shadow">
            <h1 class="text-white font-bold tracking-wider">
                SERO WORK
            </h1>

            <div class="flex items-center gap-4">
                <div class="w-9 h-9 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold">
                    {{ userInitial }}
                </div>
                <span class="text-white text-sm font-medium">
                    {{ userName }}
                </span>
                <button class="cursor-pointer text-sm px-3 py-1.5 rounded bg-white/20 text-white hover:bg-white/30"
                    @click="handleLogout">
                    로그아웃
                </button>
            </div>
        </header>


        <!-- ===== Line Select (Before) ===== -->
        <div v-if="!selectedLine" class="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
            <div class="bg-white rounded-3xl shadow p-10 w-full max-w-md text-center">
                <h2 class="text-xl font-black text-gray-900 mb-6">
                    작업 라인을 선택해주세요
                </h2>

                <div class="space-y-3">
                    <button v-for="line in lines" :key="line.id" @click="selectLine(line)"
                        class="w-full py-4 rounded-xl bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition">
                        {{ line.name }}
                    </button>
                </div>
            </div>
        </div>

        <!-- ===== Main Work Screen (After Line Select) ===== -->
        <div v-else class="p-4 lg:p-6">
            <!-- ===== Info Header ===== -->
            <header class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white rounded-2xl p-5 shadow-sm border-l-8 border-indigo-600">
                    <p class="text-xs font-bold text-gray-500 mb-1">현재 투입 라인</p>
                    <h2 class="text-2xl font-black text-gray-900">
                        {{ selectedLine.name }}
                    </h2>
                </div>

                <div class="bg-white rounded-2xl p-5 shadow-sm">
                    <p class="text-xs font-bold text-gray-500 mb-1">현재 작업자</p>
                    <h2 class="text-2xl font-black text-gray-900">
                        김작업
                        <span class="text-sm font-medium text-gray-400">반장</span>
                    </h2>
                </div>

                <div class="bg-indigo-600 rounded-2xl p-5 shadow-lg text-white flex justify-between items-center">
                    <div>
                        <p class="text-xs font-bold opacity-80 mb-1">현재 시간</p>
                        <h2 class="text-2xl font-mono font-bold">
                            {{ currentTime }}
                        </h2>
                    </div>
                    <span class="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                        가동 중
                    </span>
                </div>
            </header>

            <!-- ===== Main Grid ===== -->
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

                <!-- ===== Current Work ===== -->
                <div class="xl:col-span-2 space-y-6">
                    <section class="bg-white rounded-3xl shadow-sm border overflow-hidden">
                        <div class="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-gray-800">
                                현재 진행 작업
                            </h3>
                            <span
                                class="text-sm font-mono text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">
                                WO-250315-001
                            </span>
                        </div>

                        <div class="p-8">
                            <div class="flex flex-col md:flex-row justify-between gap-8 mb-10">
                                <div class="flex-1">
                                    <p class="text-sm font-bold text-gray-400 mb-2">품목명</p>
                                    <h1 class="text-3xl font-black text-gray-900 mb-4">
                                        구동모터 A-Type
                                        <span class="text-indigo-600">(MC-A01)</span>
                                    </h1>

                                    <div class="flex gap-4">
                                        <div class="bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-600">
                                            공정: 권선/절연
                                        </div>
                                        <div class="bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-600">
                                            목표: 1,000 EA
                                        </div>
                                    </div>
                                </div>

                                <div
                                    class="flex flex-col items-center justify-center bg-indigo-50 rounded-3xl p-6 min-w-[200px] border border-indigo-100">
                                    <p class="text-sm font-bold text-indigo-600 mb-2">
                                        진행률
                                    </p>
                                    <div class="text-5xl font-black text-indigo-700">
                                        65<span class="text-2xl">%</span>
                                    </div>
                                    <div class="w-full h-2 bg-indigo-200 rounded-full mt-4 overflow-hidden">
                                        <div class="bg-indigo-600 h-full w-[65%]"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <button
                                    class="col-span-2 py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow hover:bg-indigo-700 active:scale-95">
                                    실적 등록
                                </button>
                                <button
                                    class="py-6 bg-amber-500 text-white rounded-2xl font-black text-lg hover:bg-amber-600 active:scale-95">
                                    일시 정지
                                </button>
                                <button
                                    class="py-6 bg-rose-600 text-white rounded-2xl font-black text-lg hover:bg-rose-700 active:scale-95">
                                    작업 종료
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- ===== Side ===== -->
                <div class="space-y-6">
                    <section class="bg-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <h3 class="text-lg font-bold mb-4">
                            다음 작업 대기열
                        </h3>

                        <div class="space-y-4">
                            <div v-for="i in 3" :key="i" class="bg-white/10 rounded-2xl p-4">
                                <p class="text-xs font-bold text-indigo-300 mb-1">
                                    우선순위 {{ i }}
                                </p>
                                <h4 class="font-bold text-sm mb-2">
                                    소나타 DN8 범퍼 조립
                                </h4>
                                <span class="text-xs text-gray-300">
                                    목표: 500 EA
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const currentTime = ref('')
const selectedLine = ref(null)

const lines = [
    { id: 1, name: '제 1 제조라인' },
    { id: 2, name: '제 2 제조라인' }
]
const router = useRouter()
const userStore = useUserStore()

const initializeUser = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
        router.push('/worker/login')
        return
    }

    if (!userStore.isAuthenticated) {
        userStore.setFromToken(token)
    }
}

const userName = computed(() => userStore.userName || '작업자')
const userInitial = computed(() => {
    const name = userStore.userName || '작업자'
    return name.charAt(0)
})

const handleLogout = () => {
    if (!confirm('로그아웃 하시겠습니까?')) return
    userStore.logout()
    router.push('/work/login')
}


onMounted(() => {
    initializeUser()
})


const selectLine = (line) => {
    selectedLine.value = line
}


onMounted(() => {
    setInterval(() => {
        currentTime.value = new Date().toTimeString().split(' ')[0]
    }, 1000)
})
</script>
