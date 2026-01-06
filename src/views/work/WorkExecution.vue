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
                    <button v-for="line in lines" :key="line.lineId" @click="selectLine(line)"
                        class="cursor-pointer w-full py-4 rounded-xl bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 font-bold transition">
                        {{ line.lineName }}
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
                        {{ selectedLine.lineName }}
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

                    <!-- 진행 중 작업 있음 -->
                    <section v-if="currentWork" class="bg-white rounded-3xl shadow-sm border overflow-hidden">
                        <div class="p-6 border-b bg-gray-50 flex justify-between items-center">
                            <h3 class="text-lg font-bold text-gray-800">
                                현재 진행 작업
                            </h3>

                            <div class="flex items-center gap-2">
                                <!-- 작업 상태 배지 -->
                                <span class="px-3 py-1 rounded-full text-xs font-bold" :class="{
                                    'bg-emerald-100 text-emerald-700': currentWork.status === 'WO_RUN',
                                    'bg-amber-100 text-amber-700': currentWork.status === 'WO_PAUSE'
                                }">
                                    {{ currentWork.status === 'WO_RUN' ? '작업 중' : '일시 정지' }}
                                </span>

                                <!-- 작업지시 코드 -->
                                <span
                                    class="text-sm font-mono text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full">
                                    {{ currentWork.workOrderCode }}
                                </span>
                            </div>
                        </div>


                        <div class="p-8">
                            <div class="flex flex-col md:flex-row justify-between gap-8 mb-10">
                                <div class="flex-1">
                                    <p class="text-sm font-bold text-gray-400 mb-2">품목명</p>
                                    <h1 class="text-3xl font-black text-gray-900 mb-4">
                                        {{ currentWork.materialName }}
                                    </h1>

                                    <div class="flex gap-4">
                                        <div class="bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-600">
                                            목표: {{ currentWork.targetQty }} {{ currentWork.unit }}
                                        </div>
                                    </div>
                                </div>

                                <!-- 진행률 -->
                                <div
                                    class="flex flex-col items-center justify-center bg-indigo-50 rounded-3xl p-6 min-w-[200px] border border-indigo-100">
                                    <p class="text-xs font-bold text-gray-500 mt-4">
                                        작업 경과 시간
                                    </p>
                                    <p class="text-2xl font-mono font-bold text-indigo-700">
                                        {{ formattedElapsedTime }}
                                    </p>
                                </div>
                            </div>

                            <!-- 액션 -->
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <button
                                    class="cursor-pointer col-span-2 py-6 bg-slate-600 text-white rounded-2xl font-black text-xl hover:bg-slate-700"
                                    @click="openHistoryModal">
                                    이력 보기
                                </button>



                                <button v-if="currentWork.status === 'WO_RUN'"
                                    class="cursor-pointer py-6 bg-amber-500 text-white rounded-2xl font-black text-lg"
                                    @click="openPauseModal">
                                    일시 정지
                                </button>

                                <button v-else-if="currentWork.status === 'WO_PAUSE'"
                                    class="cursor-pointer py-6 bg-emerald-600 text-white rounded-2xl font-black text-lg"
                                    @click="openResumeModal">
                                    작업 재개
                                </button>


                                <button
                                    class="cursor-pointer py-6 bg-rose-600 text-white rounded-2xl font-black text-lg hover:bg-rose-700 active:scale-95">
                                    작업 종료
                                </button>
                            </div>
                        </div>
                    </section>

                    <!-- 진행 중 작업 없음 -->
                    <section v-else class="bg-white rounded-3xl shadow-sm border p-10 text-center text-gray-400">
                        현재 진행 중인 작업이 없습니다.
                    </section>
                </div>


                <!-- ===== Side ===== -->
                <div class="space-y-6">
                    <section class="bg-gray-800 rounded-3xl p-6 text-white shadow-xl">
                        <h3 class="text-lg font-bold mb-4">
                            다음 작업 대기열
                        </h3>

                        <!-- 대기 작업 있음 -->
                        <div v-if="waitingWorks.length" class="space-y-4">
                            <div v-for="wo in waitingWorks" :key="wo.workOrderId" @click="openStartModal(wo)"
                                class="bg-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/20 transition">
                                <p class="text-[17px] font-bold text-indigo-300 mb-1">
                                    {{ wo.workOrderCode }}
                                </p>

                                <h4 class="font-bold text-[16px] mb-2">
                                    {{ wo.materialName }}
                                </h4>

                                <span class="text-[15px] text-gray-300">
                                    목표: {{ wo.targetQty }} {{ wo.unit }}
                                </span>
                            </div>
                        </div>

                        <!-- 대기 작업 없음 -->
                        <div v-else class="text-gray-400 text-sm text-center py-6">
                            대기 중인 작업이 없습니다.
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>

    <!-- ===== 작업 시작 모달 ===== -->
    <div v-if="showStartModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in">

            <!-- 제목 -->
            <h3 class="text-2xl font-black text-gray-900 mb-4">
                작업을 시작할까요?
            </h3>

            <!-- 작업 정보 -->
            <div class="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
                <p class="text-sm text-gray-500">작업 지시</p>
                <p class="font-mono font-bold text-indigo-600">
                    {{ selectedWaitingWork?.workOrderCode }}
                </p>

                <p class="text-sm text-gray-500 mt-2">품목</p>
                <p class="font-bold text-gray-800">
                    {{ selectedWaitingWork?.materialName }}
                </p>

                <p class="text-sm text-gray-500 mt-2">목표 수량</p>
                <p class="font-semibold">
                    {{ selectedWaitingWork?.targetQty }} {{ selectedWaitingWork?.unit }}
                </p>
            </div>

            <!-- 작업자 -->
            <div class="flex items-center gap-3 mb-8">
                <div
                    class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black">
                    {{ userInitial }}
                </div>
                <div>
                    <p class="text-sm text-gray-500">작업자</p>
                    <p class="font-bold text-gray-900">
                        {{ userName }}
                    </p>
                </div>
            </div>

            <!-- 버튼 -->
            <div class="flex gap-3">
                <button @click="closeStartModal"
                    class="cursor-pointer flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">
                    취소
                </button>

                <button @click="startSelectedWork"
                    class="cursor-pointer flex-1 py-3 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 active:scale-95">
                    작업 시작
                </button>
            </div>
        </div>
    </div>

    <div v-if="showPauseModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 class="text-xl font-black mb-4 text-gray-900">
                작업을 일시 정지할까요?
            </h3>

            <textarea v-model="workNote" placeholder="사유를 간단히 입력해주세요 (선택)"
                class="w-full border rounded-xl p-3 text-sm mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows="3"></textarea>

            <div class="flex gap-3">
                <button @click="closeAllWorkModals"
                    class="cursor-pointer flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-600">
                    취소
                </button>

                <button @click="confirmPauseWork" class="flex-1 py-3 rounded-xl bg-amber-500 text-white font-black">
                    일시 정지
                </button>
            </div>
        </div>
    </div>


    <div v-if="showResumeModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h3 class="text-xl font-black mb-4 text-gray-900">
                작업을 재개할까요?
            </h3>

            <textarea v-model="workNote" placeholder="재개 메모 (선택)"
                class="w-full border rounded-xl p-3 text-sm mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                rows="3"></textarea>

            <div class="flex gap-3">
                <button @click="closeAllWorkModals"
                    class="cursor-pointer flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-600">
                    취소
                </button>

                <button @click="confirmResumeWork"
                    class="cursor-pointer flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black">
                    작업 재개
                </button>
            </div>
        </div>
    </div>

    <!-- ===== 작업 이력 모달 ===== -->
    <div v-if="showHistoryModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">

            <!-- 헤더 -->
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <span class="text-indigo-600">⏱</span>
                    작업 로그
                </h3>
                <button @click="closeHistoryModal" class="text-gray-400 hover:text-gray-700 text-xl">
                    ✕
                </button>
            </div>

            <!-- 타임라인 -->
            <div class="relative pl-6 space-y-6 max-h-[420px] overflow-y-auto">

                <!-- 세로 라인 -->
                <div class="absolute left-[10px] top-0 bottom-0 w-px bg-gray-200"></div>

                <div v-for="(h, idx) in workHistories" :key="idx" class="relative">

                    <!-- 점 -->
                    <div class="absolute left-[-2px] w-4 h-4 rounded-full" :class="actionColor(h.action)">
                    </div>

                    <!-- 내용 -->
                    <div class="ml-6">
                        <p class="font-bold text-gray-900">
                            {{ actionLabel(h.action) }}
                        </p>
                        <p class="text-sm text-gray-500">
                            {{ h.actedAt }}
                        </p>

                        <div v-if="h.note" class="mt-2 bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                            {{ h.note }}
                        </div>
                    </div>
                </div>

                <div v-if="!workHistories.length" class="text-center text-gray-400 py-10">
                    작업 이력이 없습니다.
                </div>
            </div>

            <!-- 하단 -->
            <div class="flex justify-end mt-8">
                <button @click="closeHistoryModal"
                    class="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                    닫기
                </button>
            </div>
        </div>
    </div>


</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getDailyWorkOrders, startWorkOrder, pauseWorkOrder, resumeWorkOrder, endWorkOrder, getWorkOrderHistory } from '@/api/production/workOrder'
import { getProductionLines } from '@/api/production/productionPlan'

const currentTime = ref('')
const selectedLine = ref(null)

const currentWork = ref(null)
const waitingWorks = ref([])
const lines = ref([])
const showStartModal = ref(false)
const selectedWaitingWork = ref(null)
const showPauseModal = ref(false)
const showResumeModal = ref(false)
const workNote = ref('')
const showHistoryModal = ref(false)
const workHistories = ref([])

const router = useRouter()
const userStore = useUserStore()

const workElapsedSeconds = ref(0)
let workTimer = null

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

const getTodayKST = () => {
    const now = new Date()
    const kstOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(now.getTime() + kstOffset)

    return kstDate.toISOString().slice(0, 10)
}


onMounted(async () => {
    initializeUser()
    lines.value = await getProductionLines()
})

const selectLine = async (line) => {
    selectedLine.value = line
    await loadWorkOrders(line.lineId)
}

const loadWorkOrders = async (lineId) => {
    const today = getTodayKST()
    const res = await getDailyWorkOrders(today)
    const linesData = res.data

    const lineData = linesData.find(l => l.lineId === lineId)
    if (!lineData) {
        console.warn('lineData 없음', lineId, linesData)
        currentWork.value = null
        waitingWorks.value = []
        return
    }

    const normalize = (wo) => {
        const mainItem = wo.items?.[0] ?? {}

        return {
            workOrderId: wo.workOrderId,
            workOrderCode: wo.workOrderCode,
            status: wo.status,
            materialName: mainItem.itemName ?? '-',
            targetQty: mainItem.plannedQuantity ?? 0,
            producedQty: mainItem.producedQuantity ?? 0,
            unit: mainItem.unit ?? ''
        }
    }

    currentWork.value =
        lineData.workOrders.find(wo => wo.status === 'WO_RUN' || wo.status === 'WO_PAUSE')
            ? normalize(lineData.workOrders.find(wo => wo.status === 'WO_RUN' || wo.status === 'WO_PAUSE'))
            : null

    waitingWorks.value =
        lineData.workOrders
            .filter(wo => wo.status === 'WO_READY')
            .map(normalize)

    if (currentWork.value) {
        if (currentWork.value.status === 'WO_RUN') {
            await initElapsedTime(currentWork.value.workOrderId)
        } else {
            stopTickTimer()
        }
    } else {
        stopTickTimer()
    }

}

onMounted(() => {
    setInterval(() => {
        currentTime.value = new Date().toTimeString().split(' ')[0]
    }, 1000)
})

const openStartModal = (wo) => {
    selectedWaitingWork.value = wo
    showStartModal.value = true
}

const closeStartModal = () => {
    showStartModal.value = false
    selectedWaitingWork.value = null
}

const startSelectedWork = async () => {
    if (!selectedWaitingWork.value) return

    await startWorkOrder(selectedWaitingWork.value.workOrderId)
    workElapsedSeconds.value = 0
    startTimer()

    closeStartModal()
    await loadWorkOrders(selectedLine.value.lineId)
}

const initElapsedTime = async (woId) => {
    const res = await getWorkOrderHistory(woId)
    const histories = Array.isArray(res.data) ? res.data : []

    workElapsedSeconds.value = calculateElapsedSeconds(histories)
    startTickTimer()
}

const startTickTimer = () => {
    if (workTimer) return
    workTimer = setInterval(() => {
        workElapsedSeconds.value++
    }, 1000)
}

const stopTickTimer = () => {
    if (workTimer) {
        clearInterval(workTimer)
        workTimer = null
    }
}

const calculateElapsedSeconds = (histories) => {
    let total = 0
    let runningFrom = null

    histories.forEach(h => {
        if (h.action === 'START' || h.action === 'RESUME') {
            runningFrom = new Date(h.actedAt)
        }

        if (h.action === 'PAUSE' || h.action === 'END') {
            if (runningFrom) {
                total += (new Date(h.actedAt) - runningFrom) / 1000
                runningFrom = null
            }
        }
    })
    if (runningFrom) {
        total += (Date.now() - runningFrom.getTime()) / 1000
    }
    return Math.floor(total)
}

const formattedElapsedTime = computed(() => {
    const sec = workElapsedSeconds.value
    const h = String(Math.floor(sec / 3600)).padStart(2, '0')
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
    const s = String(sec % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
})

const pauseWork = async () => {
    if (!currentWork.value) return

    await pauseWorkOrder(currentWork.value.workOrderId)

    stopTickTimer()
    await loadWorkOrders(selectedLine.value.lineId)
}

const resumeWork = async () => {
    if (!currentWork.value) return

    await resumeWorkOrder(currentWork.value.workOrderId)

    await initElapsedTime(currentWork.value.workOrderId)
    await loadWorkOrders(selectedLine.value.lineId)
}

const openPauseModal = () => {
    workNote.value = ''
    showPauseModal.value = true
}

const openResumeModal = () => {
    workNote.value = ''
    showResumeModal.value = true
}

const closeAllWorkModals = () => {
    showPauseModal.value = false
    showResumeModal.value = false
    workNote.value = ''
}

const confirmPauseWork = async () => {
    await pauseWorkOrder(
        currentWork.value.workOrderId,
        workNote.value
    )

    closeAllWorkModals()
    stopTickTimer()
    await loadWorkOrders(selectedLine.value.lineId)
}

const confirmResumeWork = async () => {
    await resumeWorkOrder(
        currentWork.value.workOrderId,
        workNote.value
    )


    closeAllWorkModals()
    await initElapsedTime(currentWork.value.workOrderId)
    await loadWorkOrders(selectedLine.value.lineId)
}

const openHistoryModal = async () => {
    if (!currentWork.value) return

    const res = await getWorkOrderHistory(currentWork.value.workOrderId)
    const histories = Array.isArray(res.data) ? res.data : []

    workHistories.value = histories
        .slice()
        .sort((a, b) => new Date(b.actedAt) - new Date(a.actedAt))

    showHistoryModal.value = true
}


const closeHistoryModal = () => {
    showHistoryModal.value = false
    workHistories.value = []
}

const actionLabel = (action) => {
    switch (action) {
        case 'START': return '가동 시작'
        case 'PAUSE': return '일시 정지'
        case 'RESUME': return '작업 재개'
        case 'END': return '작업 종료'
        default: return action
    }
}

const actionColor = (action) => {
    switch (action) {
        case 'START': return 'bg-indigo-500'
        case 'PAUSE': return 'bg-amber-500'
        case 'RESUME': return 'bg-emerald-500'
        case 'END': return 'bg-rose-500'
        default: return 'bg-gray-400'
    }
}




onUnmounted(() => {
    stopTickTimer()
})

</script>
