<template>
    <div class="wo-page">

        <!-- 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">작업지시 실적 등록</h1>
                <p class="page-desc">
                    당일 작업지시를 시작·중지·종료하고 실적을 등록합니다.
                </p>
            </div>

            <input type="date" v-model="selectedDate" @change="fetchList" />
        </div>

        <!-- 라인별 그룹 -->
        <div v-for="group in lineGroups" :key="group.lineId" class="line-section">
            <h3 class="line-title">{{ group.lineName }}</h3>

            <table class="wo-table">
                <thead>
                    <tr>
                        <th>작업지시번호</th>
                        <th>PR</th>
                        <th>PP</th>
                        <th>품목</th>
                        <th>계획수량</th>
                        <th>상태</th>
                        <th>경과시간</th>
                        <th>작업제어</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="wo in group.items" :key="wo.woId">
                        <td>{{ wo.woCode }}</td>
                        <td>{{ wo.prCode }}</td>
                        <td>{{ wo.ppCode }}</td>

                        <td>
                            <div class="code">
                                <div class="primary">{{ wo.materialName }}</div>
                                <div class="secondary">{{ wo.materialCode }}</div>
                            </div>
                        </td>

                        <td>{{ wo.quantity.toLocaleString() }}</td>

                        <td>
                            <span class="status" :class="wo.woStatus">
                                {{ statusLabel(wo.woStatus) }}
                            </span>
                        </td>

                        <td class="timer">
                            {{ timers[wo.woId] || '00:00:00' }}
                        </td>

                        <!-- 제어 -->
                        <td class="controls">
                            <!-- READY -->
                            <button v-if="wo.woStatus === 'WO_READY'" class="ctrl-btn play"
                                @click="openModal('START', wo)">▶</button>

                            <!-- RUN -->
                            <template v-else-if="wo.woStatus === 'WO_RUN'">
                                <button class="ctrl-btn pause" @click="openModal('PAUSE', wo)">⏸</button>
                                <button class="ctrl-btn stop" @click="openModal('END_CONFIRM', wo)">⏹</button>
                            </template>

                            <!-- PAUSE -->
                            <template v-else-if="wo.woStatus === 'WO_PAUSE'">
                                <button class="ctrl-btn play" @click="resume(wo)">▶</button>
                                <button class="ctrl-btn stop" @click="openModal('END_CONFIRM', wo)">⏹</button>
                            </template>

                            <!-- DONE -->
                            <span v-else class="muted">완료</span>

                            <!-- 로그 -->
                            <button class="log-btn" @click="openModal('HISTORY', wo)">🧾</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ===================== -->
        <!-- START MODAL -->
        <!-- ===================== -->
        <div v-if="activeModal === 'START'" class="modal-backdrop">
            <div class="modal center">
                <div class="icon play"></div>
                <h3>{{ selectedWO.materialName }}</h3>
                <p>작업을 시작하시겠습니까?</p>
                <small>라인: {{ selectedWO.lineName }}</small>

                <div class="actions">
                    <button class="btn ghost" @click="closeModal">취소</button>
                    <button class="btn primary" @click="start(selectedWO)">시작</button>
                </div>
            </div>
        </div>

        <!-- ===================== -->
        <!-- PAUSE MODAL -->
        <!-- ===================== -->
        <div v-if="activeModal === 'PAUSE'" class="modal-backdrop">
            <div class="modal center">
                <div class="icon pause"></div>
                <h3>작업을 잠시 중단할까요?</h3>
                <p>식사·휴식·설비 점검 시 사용하세요.</p>

                <div class="actions">
                    <button class="btn ghost" @click="closeModal">취소</button>
                    <button class="btn primary" @click="pause(selectedWO)">일시정지</button>
                </div>
            </div>
        </div>

        <!-- ===================== -->
        <!-- END CONFIRM MODAL -->
        <!-- ===================== -->
        <div v-if="activeModal === 'END_CONFIRM'" class="modal-backdrop">
            <div class="modal center">
                <div class="icon stop"></div>
                <h3>작업을 종료하시겠습니까?</h3>
                <p>종료 후 실적 등록 화면으로 이동합니다.</p>

                <div class="actions">
                    <button class="btn ghost" @click="closeModal">취소</button>
                    <button class="btn danger" @click="activeModal = 'RESULT'">종료</button>
                </div>
            </div>
        </div>

        <!-- ===================== -->
        <!-- RESULT MODAL -->
        <!-- ===================== -->
        <div v-if="activeModal === 'RESULT'" class="modal-backdrop">
            <div class="modal large">
                <header class="modal-header">
                    <h3>생산 실적 등록</h3>
                    <button @click="closeModal">✕</button>
                </header>

                <div class="info-box">
                    <div>작업지시번호: {{ selectedWO.woCode }}</div>
                    <div>
                        품목: {{ selectedWO.materialName }}
                        ({{ selectedWO.materialCode }})
                    </div>
                </div>

                <div class="form-grid">
                    <div>
                        <label>양품 수량</label>
                        <input type="number" v-model.number="endForm.goodQuantity" />
                    </div>

                    <div>
                        <label class="danger">불량 수량</label>
                        <input type="number" v-model.number="endForm.defectiveQuantity" />
                    </div>

                    <div>
                        <label>작업 시작</label>
                        <input type="time" v-model="endForm.startTime" />
                    </div>

                    <div>
                        <label>작업 종료</label>
                        <input type="time" v-model="endForm.endTime" />
                    </div>

                    <div class="full">
                        <label>비고</label>
                        <textarea v-model="endForm.note" />
                    </div>
                </div>

                <div class="actions">
                    <button class="btn ghost" @click="closeModal">취소</button>
                    <button class="btn primary" @click="end">등록 완료</button>
                </div>
            </div>
        </div>

        <!-- ===================== -->
        <!-- HISTORY DRAWER -->
        <!-- ===================== -->
        <div v-if="activeModal === 'HISTORY'" class="drawer-backdrop">
            <div class="drawer">
                <header>
                    <h3>작업 로그</h3>
                    <button @click="closeModal">✕</button>
                </header>

                <ul>
                    <li v-for="h in historyList" :key="h.id">
                        <strong>{{ h.action }}</strong>
                        <span>{{ h.createdAt }}</span>
                        <p>{{ h.note || '-' }}</p>
                    </li>
                </ul>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    getWorkOrdersByDate,
    startWorkOrder,
    pauseWorkOrder,
    resumeWorkOrder,
    endWorkOrder,
    getWorkOrderHistory
} from '@/api/production/workOrder.js'

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const list = ref([])
const timers = ref({})

const activeModal = ref(null)
const selectedWO = ref(null)
const historyList = ref([])

const endForm = ref({
    goodQuantity: 0,
    defectiveQuantity: 0,
    startTime: '09:00',
    endTime: '18:00',
    note: ''
})

const fetchList = async () => {
    const { data } = await getWorkOrdersByDate(selectedDate.value)
    list.value = data
}

const lineGroups = computed(() => {
    const map = {}
    list.value.forEach(wo => {
        if (!map[wo.lineId]) {
            map[wo.lineId] = {
                lineId: wo.lineId,
                lineName: wo.lineName,
                items: []
            }
        }
        map[wo.lineId].items.push(wo)
    })
    return Object.values(map)
})

const statusLabel = (s) => ({
    WO_READY: '대기',
    WO_RUN: '진행중',
    WO_PAUSE: '일시정지',
    WO_DONE: '완료'
}[s])

const openModal = async (type, wo) => {
    selectedWO.value = wo
    activeModal.value = type

    if (type === 'HISTORY') {
        const { data } = await getWorkOrderHistory(wo.woId)
        historyList.value = data
    }
}

const closeModal = () => {
    activeModal.value = null
    selectedWO.value = null
}

const start = async (wo) => {
    await startWorkOrder(wo.woId)
    closeModal()
    fetchList()
}

const pause = async (wo) => {
    await pauseWorkOrder(wo.woId)
    closeModal()
    fetchList()
}

const resume = async (wo) => {
    await resumeWorkOrder(wo.woId)
    fetchList()
}

const end = async () => {
    await endWorkOrder(selectedWO.value.woId, {
        ...endForm.value,
        startTime: `${selectedDate.value} ${endForm.value.startTime}:00`,
        endTime: `${selectedDate.value} ${endForm.value.endTime}:00`
    })
    closeModal()
    fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
/* =========================
       Base / Tokens
    ========================= */
.wo-page {
    --bg: #f6f7fb;
    --card: #ffffff;
    --text: #111827;
    --muted: #6b7280;
    --muted2: #9ca3af;

    --line: #e5e7eb;
    --line2: #eef2f7;

    --brand: #4C4CDD;
    /* SERO 톤 */
    --brand-2: #2f2fb8;
    --danger: #ef4444;
    --warning: #f59e0b;
    --success: #22c55e;

    --shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
    --shadow2: 0 2px 10px rgba(17, 24, 39, 0.06);

    background: var(--bg);
    padding: 22px 22px 40px;
    border-radius: 12px;
    min-height: calc(100vh - 80px);
    color: var(--text);
    box-sizing: border-box;
}

/* =========================
       Header
    ========================= */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 18px;
}

.page-title {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 4px 0;
}

.page-desc {
    margin: 0;
    font-size: 13px;
    color: var(--muted);
}

.page-header input[type="date"] {
    height: 34px;
    padding: 0 12px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: #fff;
    color: var(--text);
    font-size: 13px;
    box-shadow: 0 1px 0 rgba(17, 24, 39, 0.02);
}

.page-header input[type="date"]:focus {
    outline: none;
    border-color: rgba(76, 76, 221, 0.55);
    box-shadow: 0 0 0 4px rgba(76, 76, 221, 0.12);
}

/* =========================
       Line Section (Card-like)
    ========================= */
.line-section {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 12px;
    box-shadow: var(--shadow2);
    padding: 14px 14px 6px;
    margin-bottom: 16px;
}

.line-title {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 10px 0;
    padding: 8px 10px;
    background: #f3f4f6;
    border: 1px solid var(--line);
    border-radius: 10px;
}

/* =========================
       Table
    ========================= */
.wo-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid var(--line);
    background: #fff;
}

.wo-table thead th {
    background: #f9fafb;
    color: #374151;
    font-weight: 700;
    font-size: 12.5px;
    padding: 12px 12px;
    border-bottom: 1px solid var(--line);
    text-align: center;
    white-space: nowrap;
}

.wo-table tbody td {
    font-size: 13px;
    padding: 12px 12px;
    border-bottom: 1px solid var(--line2);
    text-align: center;
    vertical-align: middle;
    color: #111827;
}

.wo-table tbody tr:last-child td {
    border-bottom: none;
}

.wo-table tbody tr:hover td {
    background: #fbfbff;
}

/* Table rounded corners */
.wo-table thead th:first-child {
    border-top-left-radius: 12px;
}

.wo-table thead th:last-child {
    border-top-right-radius: 12px;
}

.wo-table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 12px;
}

.wo-table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 12px;
}

/* =========================
       Code cell
    ========================= */
.code {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
}

.code .primary {
    font-weight: 700;
    color: #111827;
    line-height: 1.15;
}

.code .secondary {
    font-size: 11.5px;
    color: var(--muted);
    line-height: 1.15;
}

/* =========================
       Status chip (like screenshot)
    ========================= */
.status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid var(--line);
    background: #f9fafb;
    color: #374151;
}

/* You can tune these per your code colors */
.status.WO_READY {
    background: #f3f4f6;
    color: #6b7280;
    border-color: #e5e7eb;
}

.status.WO_RUN {
    background: rgba(34, 197, 94, 0.12);
    color: #15803d;
    border-color: rgba(34, 197, 94, 0.25);
}

.status.WO_PAUSE {
    background: rgba(245, 158, 11, 0.14);
    color: #b45309;
    border-color: rgba(245, 158, 11, 0.28);
}

.status.WO_DONE {
    background: rgba(148, 163, 184, 0.18);
    color: #475569;
    border-color: rgba(148, 163, 184, 0.35);
}

/* =========================
       Timer
    ========================= */
.timer {
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
}

/* DONE text */
.muted {
    color: var(--muted2);
    font-size: 12px;
    font-weight: 700;
}

/* =========================
       Controls (icon buttons like screenshot)
    ========================= */
.controls {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.ctrl-btn {
    width: 44px;
    height: 28px;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 800;
    font-size: 12px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 0 rgba(17, 24, 39, 0.05);
    transition: transform .06s ease, filter .12s ease, opacity .12s ease;
}

.ctrl-btn:active {
    transform: translateY(1px);
}

.ctrl-btn.play {
    background: var(--brand);
    color: #fff;
}

.ctrl-btn.play:hover {
    filter: brightness(0.95);
}

.ctrl-btn.pause {
    background: #fbbf24;
    color: #111827;
}

.ctrl-btn.pause:hover {
    filter: brightness(0.97);
}

.ctrl-btn.stop {
    background: #ef4444;
    color: #fff;
}

.ctrl-btn.stop:hover {
    filter: brightness(0.95);
}

/* log button (icon only) */
.log-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: #fff;
    cursor: pointer;
    transition: background .12s ease, border-color .12s ease, transform .06s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
}

.log-btn:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.log-btn:active {
    transform: translateY(1px);
}

/* =========================
       Modal Backdrop + Base
    ========================= */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.38);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 22px;
    z-index: 50;
}

.modal {
    background: #fff;
    border-radius: 14px;
    border: 1px solid rgba(229, 231, 235, 0.9);
    box-shadow: var(--shadow);
    width: 360px;
    max-width: 100%;
    overflow: hidden;
}

.modal.center {
    padding: 22px 22px 18px;
    text-align: center;
}

.modal.large {
    width: 640px;
    max-width: 100%;
    padding: 0;
}

/* icon circle */
.icon {
    width: 58px;
    height: 58px;
    border-radius: 999px;
    margin: 2px auto 14px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon.play {
    background: rgba(34, 197, 94, 0.14);
}

.icon.pause {
    background: rgba(245, 158, 11, 0.14);
}

.icon.stop {
    background: rgba(239, 68, 68, 0.14);
}

/* modal headings/text */
.modal.center h3 {
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.02em;
}

.modal.center p {
    margin: 0 0 10px;
    font-size: 13px;
    color: var(--muted);
}

.modal.center small {
    display: block;
    margin-top: 2px;
    color: var(--muted2);
    font-size: 12px;
}

/* =========================
       Modal Header (blue bar like screenshot)
    ========================= */
.modal-header {
    background: var(--brand);
    color: #fff;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: -0.02em;
}

.modal-header button {
    border: none;
    background: transparent;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.9;
}

.modal-header button:hover {
    opacity: 1;
}

/* =========================
       Info box in Result Modal
    ========================= */
.info-box {
    margin: 14px 14px 0;
    padding: 12px 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: #f9fafb;
    font-size: 13px;
    color: #111827;
    display: grid;
    gap: 6px;
}

/* =========================
       Form Grid in Result Modal
    ========================= */
.form-grid {
    margin: 14px 14px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.form-grid .full {
    grid-column: 1 / -1;
}

.form-grid label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 800;
    color: #374151;
}

.form-grid label.danger {
    color: var(--danger);
}

.form-grid input,
.form-grid textarea {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px 10px;
    font-size: 13px;
    background: #fff;
    box-sizing: border-box;
}

.form-grid input:focus,
.form-grid textarea:focus {
    outline: none;
    border-color: rgba(76, 76, 221, 0.55);
    box-shadow: 0 0 0 4px rgba(76, 76, 221, 0.12);
}

.form-grid textarea {
    min-height: 88px;
    resize: vertical;
}

/* =========================
       Common Actions / Buttons
    ========================= */
.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 14px 16px;
}

.modal.center .actions {
    justify-content: center;
    padding: 14px 0 0;
}

.btn {
    height: 34px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: #fff;
    color: #111827;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: transform .06s ease, background .12s ease, border-color .12s ease;
}

.btn:active {
    transform: translateY(1px);
}

.btn.ghost {
    background: #f3f4f6;
    border-color: #e5e7eb;
    color: #374151;
}

.btn.ghost:hover {
    background: #eceef2;
}

.btn.primary {
    background: var(--brand);
    border-color: var(--brand);
    color: #fff;
}

.btn.primary:hover {
    background: var(--brand-2);
    border-color: var(--brand-2);
}

.btn.danger {
    background: var(--danger);
    border-color: var(--danger);
    color: #fff;
}

.btn.danger:hover {
    filter: brightness(0.95);
}

/* =========================
       Drawer (History) like screenshot side panel
    ========================= */
.drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.28);
    z-index: 60;
}

.drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100%;
    width: 340px;
    max-width: 90vw;
    background: #fff;
    border-left: 1px solid var(--line);
    box-shadow: -10px 0 30px rgba(17, 24, 39, 0.12);
    display: flex;
    flex-direction: column;
}

.drawer header {
    padding: 14px 14px;
    border-bottom: 1px solid var(--line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fbfbff;
}

.drawer header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 900;
}

.drawer header button {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: #fff;
    cursor: pointer;
}

.drawer header button:hover {
    background: #f9fafb;
}

.drawer ul {
    list-style: none;
    margin: 0;
    padding: 14px;
    overflow: auto;
}

.drawer li {
    border: 1px solid var(--line);
    background: #fff;
    border-radius: 12px;
    padding: 12px 12px;
    margin-bottom: 10px;
    box-shadow: 0 1px 0 rgba(17, 24, 39, 0.02);
}

.drawer li strong {
    display: inline-block;
    font-size: 12.5px;
    font-weight: 900;
    color: #111827;
    margin-bottom: 6px;
}

.drawer li span {
    display: block;
    font-size: 11.5px;
    color: var(--muted);
    margin-bottom: 6px;
}

.drawer li p {
    margin: 0;
    font-size: 12.5px;
    color: #374151;
    line-height: 1.4;
}

/* =========================
       Responsive
    ========================= */
@media (max-width: 980px) {
    .wo-page {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .modal.large {
        width: 100%;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
