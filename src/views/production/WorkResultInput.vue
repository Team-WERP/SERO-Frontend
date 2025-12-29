<template>
    <div class="wo-page">
        <div class="page-header">
            <div>
                <h1 class="page-title">작업지시 실적 등록</h1>
                <p class="page-desc">당일 작업지시를 시작·중지·종료하고 실적을 등록합니다.</p>
            </div>
            <div class="header-right">
                <span class="work-date-label">작업일</span>
                <input type="date" v-model="selectedDate" @change="fetchList" class="date-picker" />
            </div>
        </div>

        <div class="table-container">
            <div class="table-info">
                <span>총 {{ list.length }}건</span>
                <div class="legend">
                    <span class="dot pause"></span> 일시 중단
                    <span class="dot run"></span> 가동 중
                </div>
            </div>

            <table class="wo-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>작업지시번호</th>
                        <th>라인</th>
                        <th>품목명</th>
                        <th>규격</th>
                        <th>계획수량</th>
                        <th>상태</th>
                        <th>작업제어</th>
                        <th>로그</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(wo, idx) in list" :key="wo.woId">
                        <td>{{ idx + 1 }}</td>
                        <td>{{ wo.woCode }}</td>
                        <td>{{ wo.lineName }}</td>
                        <td>{{ wo.materialName }}</td>
                        <td>{{ wo.materialSpec }}</td>
                        <td>{{ wo.plannedQuantity.toLocaleString() }} {{ wo.baseUnit }}</td>
                        <td>
                            <span class="status-badge" :class="wo.woStatus">
                                {{ statusLabel(wo.woStatus) }}
                            </span>
                        </td>

                        <td class="ctrl-group">
                            <!-- READY -->
                            <button v-if="wo.woStatus === 'WO_READY'" class="btn-ctrl start-btn" @click="openStart(wo)">
                                ▶ 시작
                            </button>

                            <!-- RUN -->
                            <template v-else-if="wo.woStatus === 'WO_RUN'">
                                <div class="timer-box running">
                                    {{ formatHMS(displaySeconds[wo.woId] ?? 0) }}
                                </div>
                                <button class="btn-ctrl pause-btn" @click="openPause(wo)">⏸</button>
                                <button class="btn-ctrl stop-btn" @click="openEndConfirm(wo)">■</button>
                            </template>

                            <!-- PAUSE -->
                            <template v-else-if="wo.woStatus === 'WO_PAUSE'">
                                <div class="timer-box paused">
                                    {{ formatHMS(displaySeconds[wo.woId] ?? 0) }}
                                </div>
                                <button class="btn-ctrl resume-btn" @click="resume(wo)">▶</button>
                                <button class="btn-ctrl stop-btn" @click="openEndConfirm(wo)">■</button>
                            </template>

                            <span v-else class="done-text">작업 종료됨</span>
                        </td>

                        <td>
                            <button class="btn-log" @click="openHistory(wo)">🧾</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- CONFIRM MODALS -->
        <div v-if="['START', 'PAUSE', 'END_CONFIRM'].includes(activeModal)" class="modal-backdrop">
            <div class="modal confirm-modal">
                <div class="confirm-icon" :class="activeModal.toLowerCase()">
                    {{ activeModal === 'START' ? '▶' : activeModal === 'PAUSE' ? '⏸' : '■' }}
                </div>

                <h3>
                    {{ activeModal === 'START' ? '작업 시작' : activeModal === 'PAUSE' ? '일시 중지' : '작업 종료' }}
                </h3>

                <p v-if="activeModal === 'START'">
                    <strong>{{ selectedWO?.materialName }}</strong> 작업을 시작하시겠습니까?
                </p>
                <p v-else-if="activeModal === 'PAUSE'">작업을 잠시 중단하시겠습니까?</p>
                <p v-else>작업을 종료하고 실적을 등록하시겠습니까?</p>

                <div class="confirm-actions">
                    <button class="btn ghost" @click="closeModal">아니오</button>
                    <button class="btn primary" :class="{ danger: activeModal === 'END_CONFIRM' }"
                        @click="activeModal === 'START' ? start() : activeModal === 'PAUSE' ? pause() : openResult()">
                        네, 실행합니다
                    </button>
                </div>
            </div>
        </div>

        <!-- RESULT MODAL -->
        <div v-if="activeModal === 'RESULT'" class="modal-backdrop">
            <div class="modal result-modal">
                <header class="modal-header">
                    <div class="header-title">📝 생산 실적 등록</div>
                    <button class="close-x" @click="closeModal">✕</button>
                </header>

                <div class="modal-body">
                    <div class="info-summary">
                        <div class="info-row">
                            <span>작업 지시 번호:</span> <strong>{{ selectedWO?.woCode }}</strong>
                        </div>
                        <div class="info-row">
                            <span>품목명:</span>
                            <span class="blue-text">{{ selectedWO?.materialName }}</span>
                        </div>
                    </div>

                    <div class="form-grid">

                        <div class="form-group">
                            <label>양품 수량</label>
                            <input type="number" v-model.number="endForm.goodQuantity" class="input-good" />
                        </div>

                        <div class="form-group">
                            <label class="danger-text">불량 수량</label>
                            <input type="number" v-model.number="endForm.defectiveQuantity" class="input-bad" />
                        </div>

                        <div class="form-group">
                            <label>작업 시작</label>
                            <input type="time" v-model="endForm.startTime" />
                        </div>

                        <div class="form-group">
                            <label>작업 종료</label>
                            <input type="time" v-model="endForm.endTime" />
                        </div>

                        <div class="form-group full">
                            <label>비고 (메모)</label>
                            <textarea v-model="endForm.note" placeholder="특이사항을 입력하세요"></textarea>
                        </div>
                    </div>

                    <!-- 아이템별 생산 수량 -->
                    <div class="form-group full" style="margin-top: 20px">
                        <label>아이템별 생산 수량</label>

                        <table class="wo-table">
                            <thead>
                                <tr>
                                    <th>품목명</th>
                                    <th>계획 수량</th>
                                    <th>생산 수량</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in previewItems" :key="item.workOrderItemId">
                                    <td>{{ item.itemName }}</td>
                                    <td>{{ item.plannedQuantity }}</td>
                                    <td>
                                        <input type="number" v-model.number="item.producedQuantity" min="0"
                                            style="width: 100px; text-align: right;" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                <footer class="modal-footer">
                    <button class="btn ghost" @click="closeModal">취소</button>
                    <button class="btn primary" @click="end">등록 완료</button>
                </footer>
            </div>
        </div>

        <!-- HISTORY DRAWER -->
        <div v-if="activeModal === 'HISTORY'" class="modal-backdrop" @click.self="closeModal">
            <div class="drawer">
                <header class="drawer-header">
                    <div class="drawer-title">🕒 작업 로그</div>
                    <button class="close-x-dark" @click="closeModal">✕</button>
                </header>

                <div class="timeline-container">
                    <div v-for="(h, i) in historyList" :key="i" class="timeline-item">
                        <div class="timeline-dot"></div>
                        <div class="timeline-content">
                            <div class="log-action">{{ historyLabel(h.action) }}</div>
                            <div class="log-date">{{ h.actedAt }}</div>
                            <div class="log-box" v-if="h.note">{{ h.note }}</div>
                        </div>
                    </div>

                    <div v-if="historyList.length === 0" class="empty-history">
                        로그가 없습니다.
                    </div>
                </div>

                <footer class="drawer-footer">
                    <button class="btn-close-full" @click="closeModal">닫기</button>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
    getWorkOrdersByDate,
    startWorkOrder,
    pauseWorkOrder,
    resumeWorkOrder,
    endWorkOrder,
    getWorkOrderHistory,
    previewWorkOrderResult
} from '@/api/production/workOrder.js'

const getTodayKST = () => {
    const now = new Date()
    const kstOffset = 9 * 60 * 60 * 1000
    const kst = new Date(now.getTime() + kstOffset)
    return kst.toISOString().slice(0, 10)
}

const selectedDate = ref(getTodayKST())
const list = ref([])

const activeModal = ref(null)
const selectedWO = ref(null)
const historyList = ref([])
const previewItems = ref([])

const endForm = ref({
    goodQuantity: 0,
    defectiveQuantity: 0,
    startTime: '09:00',
    endTime: '18:00',
    note: ''
})

/** ---------------------------
 * 시간 파서: "YYYY-MM-DD HH:mm:ss"를 안전하게 Date로 변환
 * (히스토리 actedAt 포맷 기준)
 * -------------------------- */
const parseDT = (str) => {
    if (!str) return null
    const iso = String(str).replace(' ', 'T') // Safari 호환
    const d = new Date(iso)
    return isNaN(d.getTime()) ? null : d
}

const isStart = (a) => ['START', '작업 시작', '작업시작'].includes(a)
const isResume = (a) => ['RESUME', '작업 재개', '작업재개'].includes(a)
const isPause = (a) => ['PAUSE', '일시 정지', '일시정지'].includes(a)
const isEnd = (a) => ['END', '작업 종료', '작업 완료', '작업종료', '작업완료'].includes(a)

/**
 * 히스토리로 누적 시간 계산
 * - START/RESUME ~ PAUSE/END 구간 누적
 * - 마지막이 RUN이면 runningFrom(Date) 반환
 */
const calcElapsedFromHistory = (history) => {
    let elapsed = 0
    let open = null

    for (const h of history) {
        const t = parseDT(h.actedAt)
        if (!t) continue

        if (isStart(h.action) || isResume(h.action)) {
            open = t
        } else if (isPause(h.action) || isEnd(h.action)) {
            if (open) {
                elapsed += Math.max(0, Math.floor((t - open) / 1000))
                open = null
            }
        }
    }
    return { elapsed, runningFrom: open }
}

/** 타이머 상태
 * baseSeconds[woId]   : 히스토리로 확정된 누적(초) (PAUSE까지 누적)
 * runningSince[woId]  : RUN이면 마지막 START/RESUME 시각(Date)
 */
const baseSeconds = ref({})
const runningSince = ref({})

/** 화면 표시용: base + live */
const displaySeconds = ref({})

let tickId = null
const startTick = () => {
    if (tickId) return
    tickId = setInterval(() => {
        const now = new Date()
        for (const wo of list.value) {
            const id = wo.woId
            const base = baseSeconds.value[id] ?? 0
            const from = runningSince.value[id]
            if (wo.woStatus === 'WO_RUN' && from instanceof Date) {
                const live = base + Math.max(0, Math.floor((now - from) / 1000))
                displaySeconds.value[id] = live
            } else {
                displaySeconds.value[id] = base
            }
        }
    }, 1000)
}

const stopTick = () => {
    if (tickId) clearInterval(tickId)
    tickId = null
}

/** 목록 로드 + 각 WO 타이머 동기화 */
const syncOneWO = async (wo) => {
    // RUN/PAUSE/DONE 모두 누적시간을 보여주기 위해 히스토리를 읽는다.
    const { data: history } = await getWorkOrderHistory(wo.woId)
    if (!Array.isArray(history)) return

    const { elapsed, runningFrom } = calcElapsedFromHistory(history)

    baseSeconds.value[wo.woId] = elapsed

    // RUN이면 runningSince 세팅, 그 외는 제거
    if (wo.woStatus === 'WO_RUN' && runningFrom) {
        runningSince.value[wo.woId] = runningFrom
    } else {
        delete runningSince.value[wo.woId]
    }

    // 초기 표시값
    displaySeconds.value[wo.woId] = elapsed
}

const fetchList = async () => {
    const { data } = await getWorkOrdersByDate(selectedDate.value)
    list.value = data || []

    // 타이머 상태 초기화
    baseSeconds.value = {}
    runningSince.value = {}
    displaySeconds.value = {}

    // 각 WO 히스토리로 시간 동기화
    for (const wo of list.value) {
        await syncOneWO(wo)
    }

    startTick()
}

/* ---------- MODAL OPENERS ---------- */
const openStart = (wo) => {
    selectedWO.value = wo
    activeModal.value = 'START'
}

const openPause = (wo) => {
    selectedWO.value = wo
    activeModal.value = 'PAUSE'
}

const openEndConfirm = (wo) => {
    selectedWO.value = wo
    activeModal.value = 'END_CONFIRM'
}

const toHHMM = (d) => {
    if (!(d instanceof Date)) return ''
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
}

const getFirstStartTime = (history) => {
    if (!Array.isArray(history)) return null

    const first = history
        .filter(h => isStart(h.action))
        .map(h => parseDT(h.actedAt))
        .filter(d => d instanceof Date)
        .sort((a, b) => a - b)[0]

    return first || null
}

const openResult = async () => {
    const woId = selectedWO.value.woId

    // 1. 기본 값 세팅
    endForm.value.goodQuantity =
        selectedWO.value?.plannedQuantity ?? 0
    endForm.value.defectiveQuantity = 0
    endForm.value.note = ''

    const { data: history } = await getWorkOrderHistory(woId)
    const firstStart = getFirstStartTime(history)

    endForm.value.startTime = firstStart ? toHHMM(firstStart) : ''
    endForm.value.endTime = toHHMM(new Date())

    const { data } = await previewWorkOrderResult(woId, {
        goodQuantity: endForm.value.goodQuantity
    })

    previewItems.value = data.items

    activeModal.value = 'RESULT'
}

const openHistory = async (wo) => {
    selectedWO.value = wo
    const { data } = await getWorkOrderHistory(wo.woId)
    historyList.value = data || []
    activeModal.value = 'HISTORY'
}

const closeModal = () => {
    activeModal.value = null
    selectedWO.value = null
    historyList.value = []
}

/* ---------- ACTIONS ---------- */
const start = async () => {
    await startWorkOrder(selectedWO.value.woId, '작업 시작')
    closeModal()
    await fetchList()
}

const pause = async () => {
    await pauseWorkOrder(selectedWO.value.woId, '일시 정지')
    closeModal()
    await fetchList()
}

const resume = async (wo) => {
    await resumeWorkOrder(wo.woId, '작업 재개')
    await fetchList()
}

const end = async () => {
    await endWorkOrder(selectedWO.value.woId, {
        goodQuantity: endForm.value.goodQuantity,
        defectiveQuantity: endForm.value.defectiveQuantity,
        startTime: `${selectedDate.value} ${endForm.value.startTime}:00`,
        endTime: `${selectedDate.value} ${endForm.value.endTime}:00`,
        note: endForm.value.note,

        items: previewItems.value.map(i => ({
            workOrderItemId: i.workOrderItemId,
            producedQuantity: i.producedQuantity
        }))
    })
    closeModal()
    await fetchList()
}

/* ---------- LABELS / FORMAT ---------- */
const statusLabel = (s) => ({
    WO_READY: '대기',
    WO_RUN: '진행중',
    WO_PAUSE: '일시정지',
    WO_DONE: '완료'
}[s] || s)

const historyLabel = (a) => ({
    START: '작업 시작',
    PAUSE: '일시 정지',
    RESUME: '작업 재개',
    END: '작업 완료'
}[a] || a)

const formatHMS = (sec) => {
    const s = Math.max(0, Number(sec) || 0)
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${ss}`
}

watch(() => endForm.value.goodQuantity, async (qty) => {
    if (!selectedWO.value) return

    const { data } = await previewWorkOrderResult(
        selectedWO.value.woId,
        { goodQuantity: qty }
    )

    previewItems.value = data.items
})

onMounted(fetchList)
onBeforeUnmount(stopTick)
</script>


<style scoped>
/* 1. 기본 레이아웃 및 텍스트 스타일 */
.wo-page {
    padding: 5px;
}

.page-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
}

.page-desc {
    font-size: 14px;
    color: #6b7280;
}

.date-picker {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-weight: 600;
}

/* 2. 테이블 디자인 */
.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table-info {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    font-weight: 600;
}

.legend {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #666;
    font-size: 12px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.dot.pause {
    background: #f59e0b;
}

.dot.run {
    background: #22c55e;
}

.wo-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
}

.wo-table th {
    background: #f8f9fb;
    padding: 14px;
    color: #4b5563;
    font-size: 13px;
    border-bottom: 1px solid #eee;
}

.wo-table td {
    padding: 14px;
    border-bottom: 1px solid #f9f9f9;
    font-size: 13px;
}

.code-text {
    font-weight: 800;
    color: #111827;
}

.material-text {
    font-weight: 700;
    color: #111827;
}

.qty-text {
    font-weight: 700;
}

/* 3. 상태 및 제어 버튼 (사진 스타일) */
.status-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 800;
    background: #eee;
}

.status-badge.WO_RUN {
    background: #e8f5e9;
    color: #2e7d32;
}

.status-badge.WO_PAUSE {
    background: #fff8e1;
    color: #f57f17;
}

.status-badge.WO_DONE {
    background: #f3f4f6;
    color: #6b7280;
}

.ctrl-group {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}

.timer-box {
    font-family: 'Courier New', Courier, monospace;
    font-weight: 900;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 14px;
    min-width: 92px;
}

.timer-box.running {
    background: #3b82f6;
    color: white;
}

.timer-box.paused {
    background: #f59e0b;
    color: white;
}

.btn-ctrl {
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: 32px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.start-btn {
    background: #3b82f6;
    color: white;
    padding: 0 12px;
}

.pause-btn {
    background: #f59e0b;
    color: white;
    width: 32px;
}

.stop-btn {
    background: #ef4444;
    color: white;
    width: 32px;
}

.resume-btn {
    background: #f59e0b;
    color: white;
    width: 32px;
}

.done-text {
    color: #9ca3af;
    font-weight: 700;
}

.btn-log {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
}

/* 4. 결과 등록 모달 */
.result-modal {
    width: 500px;
    border-radius: 12px;
    overflow: hidden;
    background: white;
}

.modal-header {
    background: #3b82f6;
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    font-weight: 900;
    font-size: 16px;
}

.close-x {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
}

.modal-body {
    padding: 24px;
}

.info-summary {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
}

.info-row {
    margin-bottom: 6px;
    font-size: 14px;
}

.blue-text {
    color: #3b82f6;
    font-weight: 800;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-group.full {
    grid-column: span 2;
}

.form-group label {
    display: block;
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 6px;
    color: #4a5568;
}

.danger-text {
    color: #ef4444 !important;
}

input,
select,
textarea {
    width: 100%;
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    box-sizing: border-box;
}

.input-good {
    border: 2px solid #3b82f6;
}

.input-bad {
    border: 2px solid #ef4444;
}

textarea {
    height: 80px;
    resize: none;
}

.modal-footer {
    padding: 16px 24px 24px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

/* 5. 확인 모달 (START/PAUSE/END_CONFIRM) */
.confirm-modal {
    width: 320px;
    padding: 30px;
    text-align: center;
    border-radius: 16px;
    background: white;
}

.confirm-icon {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    font-weight: 900;
}

.confirm-icon.start {
    background: #3b82f6;
}

.confirm-icon.pause {
    background: #f59e0b;
}

.confirm-icon.end_confirm {
    background: #ef4444;
}

/* 6. 타임라인 드로어 */
.drawer {
    width: 380px;
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    background: white;
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
}

.drawer-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.drawer-title {
    font-size: 18px;
    font-weight: 900;
}

.close-x-dark {
    background: none;
    border: none;
    color: #999;
    font-size: 20px;
    cursor: pointer;
}

.timeline-container {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    position: relative;
}

.timeline-container::before {
    content: '';
    position: absolute;
    left: 31px;
    top: 24px;
    bottom: 24px;
    width: 2px;
    background: #e5e7eb;
}

.timeline-item {
    position: relative;
    padding-left: 40px;
    margin-bottom: 30px;
}

.timeline-dot {
    position: absolute;
    left: 3px;
    top: 4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #3b82f6;
    z-index: 2;
}

.log-action {
    font-weight: 900;
    font-size: 15px;
    margin-bottom: 4px;
}

.log-date {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
}

.log-box {
    background: #f3f4f6;
    padding: 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    color: #4b5563;
}

.empty-history {
    color: #9ca3af;
    font-weight: 700;
    text-align: center;
    padding: 40px 0;
}

.drawer-footer {
    padding: 16px;
    border-top: 1px solid #eee;
}

.btn-close-full {
    width: 100%;
    padding: 12px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 8px;
    font-weight: 800;
    cursor: pointer;
}

/* 공용 모달 백드롭 */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 900;
    cursor: pointer;
    border: none;
}

.btn.ghost {
    background: #f3f4f6;
    color: #4b5563;
}

.btn.primary {
    background: #3b82f6;
    color: white;
}

.btn.danger {
    background: #ef4444;
    color: white;
}

.confirm-actions {
    display: flex;
    gap: 8px;
    margin-top: 20px;
    justify-content: center;
}
</style>
