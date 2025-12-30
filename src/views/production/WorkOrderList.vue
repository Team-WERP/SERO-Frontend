<template>
    <div class="pr-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">작업지시 생성</h1>
                <p class="page-description">
                    생산계획을 기준으로 일자별 작업지시를 생성합니다.
                </p>
            </div>

            <div class="date-box">
                <small v-if="isNotToday" class="date-hint">
                    ※ 작업지시는 당일만 생성 가능합니다
                </small>

                <div class="date-controls">
                    <button class="date-btn" @click="setToday">오늘</button>
                    <button class="date-btn" @click="moveDate(-1)">◀</button>
                    <input type="date" v-model="selectedDate" @change="fetchDailyPreview" class="date-input" />
                    <button class="date-btn" @click="moveDate(1)">▶</button>
                </div>
            </div>

        </div>

        <!-- 라인별 섹션 -->
        <div v-for="group in lineGroups" :key="group.lineId" class="line-section">

            <div class="line-header">
                <div class="line-title">{{ group.lineName }}</div>

                <div class="action-buttons" style="display: flex; gap: 8px;">
                    <button class="btn" @click="onPrint(group)">
                        작업지시서 인쇄
                    </button>

                    <button class="btn primary" :disabled="group.hasWorkOrder || isNotToday"
                        @click="openCreateModal(group)">
                        작업지시 생성
                    </button>
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>품목</th>
                        <th>생산계획</th>
                        <th>오늘 계획 수량</th>
                        <th>작업지시 수량</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in group.items" :key="row.ppId">
                        <td>
                            <div class="item-name">{{ row.materialName }}</div>
                            <div class="item-code">{{ row.materialCode }}</div>
                        </td>
                        <td>{{ row.ppCode }}</td>
                        <td>
                            {{ formatQuantity(row.dailyPlannedQuantity) }}
                            <span class="unit">{{ row.baseUnit }}</span>
                        </td>
                        <td>
                            {{ formatQuantity(row.woPlannedQuantity) }}
                            <span class="unit">{{ row.baseUnit }}</span>
                        </td>


                    </tr>

                    <tr class="line-total-row">
                        <td colspan="3"></td>
                        <td>{{ formatQuantity(group.totalRecommended) }}</td>
                    </tr>
                </tbody>

            </table>

        </div>


        <!-- 작업지시 생성 모달 -->
        <div v-if="showModal" class="modal-backdrop">
            <div class="modal">
                <h3 class="modal-title">작업지시 생성</h3>

                <div class="modal-sub">
                    {{ selectedGroup.lineName }}
                </div>

                <!-- 작업일자 -->
                <div class="modal-info">
                    <div>
                        <span class="label">작업일자</span>
                        <span class="value">{{ selectedDate }}</span>
                    </div>
                </div>

                <!-- 생산계획별 수량 -->
                <div class="pp-quantity-section">
                    <span class="label">생산계획별 작업 수량</span>

                    <table class="pp-quantity-table">
                        <thead>
                            <tr>
                                <th>생산계획</th>
                                <th>오늘 계획 수량</th>
                                <th>실제 작업지시 수량</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pp in selectedGroup.items" :key="pp.ppId">
                                <td>{{ pp.ppCode }}</td>
                                <td>
                                    {{ formatQuantity(pp.dailyPlannedQuantity) }} {{ pp.baseUnit }}
                                </td>
                                <td>
                                    <input type="number" class="qty-input" v-model.number="pp.workQuantity" min="0"
                                        @input="recalculateTotal" />
                                    {{ pp.baseUnit }}
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>


                <div class="modal-metrics">
                    <div>
                        <span class="label">라인 일일 CAPA</span>
                        <span class="value">
                            {{ formatQuantity(selectedGroup.dailyCapacity) }}
                        </span>
                    </div>

                    <div>
                        <span class="label">총 작업지시 수량</span>
                        <span class="value" :class="{
                            danger: createQuantity + selectedGroup.totalWoPlanned > selectedGroup.dailyCapacity
                        }">
                            {{ formatQuantity(createQuantity) }}
                        </span>
                    </div>
                </div>


                <div class="modal-actions">
                    <button class="btn" @click="showModal = false">
                        취소
                    </button>
                    <button class="btn primary"
                        :disabled="createQuantity <= 0 || createQuantity > selectedGroup.dailyCapacity"
                        @click="createWorkOrder">
                        작업지시 생성
                    </button>

                </div>
            </div>
        </div>
    </div>

    <div v-if="showPrintModal" class="print-modal-backdrop">
        <div class="print-modal">
            <div class="print-modal-header">
                <span>작업지시서 미리보기</span>
                <button class="close-btn" @click="showPrintModal = false">✕</button>
            </div>
            <div class="print-modal-body">
                <div class="print-area">
                    <WODocument :group="printData" :workDate="selectedDate" />
                </div>
            </div>
            <div class="print-modal-footer">
                <button class="btn primary" @click="handlePrint">
                    출력하기
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDailyPlanPreview } from '@/api/production/productionPlan.js'
import { createWorkOrder as createWorkOrderApi } from '@/api/production/workOrder.js'
import WODocument from '@/components/production/WODocument.vue'

const getKSTDateString = (date = new Date()) => {
    const kstOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(date.getTime() + kstOffset)
    return kstDate.toISOString().slice(0, 10)
}

const selectedDate = ref(getKSTDateString())
const plans = ref([])

const showModal = ref(false)
const createQuantity = ref(0)
const recommendedQuantity = ref(0)
const selectedGroup = ref(null)

const today = getKSTDateString()

const isNotToday = computed(() => selectedDate.value !== today)

const setToday = () => {
    selectedDate.value = today
    fetchDailyPreview()
}

const moveDate = (diff) => {
    const d = new Date(selectedDate.value + 'T00:00:00')
    d.setDate(d.getDate() + diff)
    selectedDate.value = getKSTDateString(d)
    fetchDailyPreview()
}

const lineGroups = computed(() => {
    const map = {}

    plans.value.forEach(row => {
        if (!map[row.lineId]) {
            map[row.lineId] = {
                lineId: row.lineId,
                lineName: row.lineName,
                dailyCapacity: row.dailyCapacity,
                hasWorkOrder: false,
                items: [],
                totalWoPlanned: 0
            }
        }

        map[row.lineId].items.push(row)
        map[row.lineId].totalWoPlanned += row.woPlannedQuantity

        if (row.hasWorkOrder) {
            map[row.lineId].hasWorkOrder = true
        }
    })

    return Object.values(map)
})


const fetchDailyPreview = async () => {
    plans.value = await getDailyPlanPreview(selectedDate.value)
}

const openCreateModal = (group) => {
    selectedGroup.value = {
        ...group,
        items: group.items.map(pp => ({
            ...pp,
            workQuantity: pp.recommendedQuantity // 기본값
        }))
    }

    recommendedQuantity.value = selectedGroup.value.items.reduce(
        (sum, r) => sum + r.workQuantity,
        0
    )

    createQuantity.value = recommendedQuantity.value
    showModal.value = true
}


const createWorkOrder = async () => {
    if (!selectedGroup.value) return

    await createWorkOrderApi({
        lineId: selectedGroup.value.lineId,
        workDate: selectedDate.value,
        items: selectedGroup.value.items.map(pp => ({
            ppId: pp.ppId,
            quantity: pp.workQuantity
        }))
    })

    showModal.value = false
    await fetchDailyPreview()
}



const formatQuantity = (v) =>
    v != null ? v.toLocaleString() : '-'

onMounted(fetchDailyPreview)

const showPrintModal = ref(false)
const printData = ref(null)

const onPrint = (group) => {
    printData.value = group
    showPrintModal.value = true
}

const handlePrint = () => {
    window.print();
    showPrintModal.value = false
};

const recalculateTotal = () => {
    const total = selectedGroup.value.items.reduce(
        (sum, pp) => sum + (pp.workQuantity || 0),
        0
    )

    createQuantity.value = total
}


</script>


<style scoped>
.pr-page {
    padding: 5px;
}

/* 헤더 */
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

.page-description {
    font-size: 14px;
    color: #6b7280;
}

.date-box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13px;
}

/* 테이블 */
.items-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

.items-table th,
.items-table td {
    padding: 12px 16px;
    font-size: 14px;
    vertical-align: middle;
}

.items-table th {
    text-align: center;
    background: #f9fafb;
}

.items-table td:nth-child(1) {
    text-align: center;
}

.items-table td:nth-child(n+2) {
    text-align: center;
}

.line-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 32px;
    box-sizing: border-box;
}

/* 코드 영역 */
.code .primary {
    font-weight: 600;
}

.code .secondary {
    font-size: 12px;
    color: #6b7280;
}

/* 진행률 */
.progress-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
}

.progress-bar-bg {
    width: 100px;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
}

.progress-bar {
    height: 100%;
    background: #4C4CDD;
    border-radius: 4px;
}

.progress-text {
    font-size: 12px;
}

/* 버튼 */
.btn {
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    cursor: pointer;
}

.btn.primary {
    background: #4C4CDD;
    color: #ffffff;
    border-color: #4C4CDD;
}

.btn.primary:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    border-color: #9ca3af;
}

/* 모달 */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: #ffffff;
    padding: 24px;
    width: 520px;
    max-width: 90vw;
    border-radius: 8px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
}

.empty-message {
    padding: 60px 0;
    color: #9ca3af;
}

/* 모달 상세 */
.modal-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
}

.modal-sub {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 16px;
}

.modal-info,
.modal-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}

.modal-info .label,
.modal-metrics .label {
    font-size: 12px;
    color: #6b7280;
    margin-right: 10px;
}

.modal-info .value,
.modal-metrics .value {
    font-size: 14px;
    font-weight: 600;
}

.modal-metrics .highlight {
    color: #4C4CDD;
}

.modal-input {
    margin-bottom: 16px;
}

.modal-input label {
    display: block;
    font-size: 13px;
    margin-bottom: 6px;
}

.modal-input input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.modal-input .hint {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #9ca3af;
}

.pp-quantity-section {
    margin-bottom: 16px;
}

.pp-quantity-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.pp-quantity-table th,
.pp-quantity-table td {
    padding: 8px 6px;
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
}

.pp-quantity-table th {
    background: #f9fafb;
    font-weight: 600;
}

.qty-input {
    width: 70px;
    padding: 4px 6px;
    font-size: 13px;
    text-align: right;
    border: 1px solid #d1d5db;
    border-radius: 4px;
}

.value.danger {
    color: #dc2626;
    font-weight: 700;
}

.date-controls {
    display: flex;
    align-items: center;
    gap: 6px;
}

.date-input {
    padding: 6px 10px;
    font-size: 13px;
    border: 1px solid #d1d5db;
    background: #ffffff;
}

.date-btn {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    cursor: pointer;
}

.date-btn:hover {
    background: #e5e7eb;
}

.date-hint {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #9ca3af;
    text-align: end;

}

.line-section {
    margin-bottom: 40px;
}

.line-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #111827;
}

.main-row {
    background: #ffffff;
}

.sub-row td {
    text-align: center;
}

.line-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.line-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 32px;
}

.items-table td {
    text-align: center;
}

.line-total-row {
    background: #f9fafb;
    font-weight: 600;
    border-top: 2px solid #e5e7eb;
}

.line-total-row td {
    text-align: center;
}

.print-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.print-modal {
    background: #fff;
    width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

.print-modal-body {
    overflow: auto;
    padding: 16px;
}

.print-modal-header {
    padding: 12px 16px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
}

.print-modal-footer {
    padding: 12px 16px;
    border-top: 1px solid #ddd;
    border-bottom: none;
    display: flex;
    justify-content: flex-end;
}

.close-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
}

@media print {

    body * {
        visibility: hidden;
    }

    .print-modal-backdrop,
    .print-modal-backdrop *,
    .print-area,
    .print-area * {
        visibility: visible;
    }

    .print-modal-backdrop {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
    }

    .print-modal {
        box-shadow: none;
        width: 100%;
    }

    .print-modal-header,
    .print-modal-footer {
        display: none !important;
    }

    .print-modal-body {
        padding: 0 !important;
        background: white !important;
    }
}
</style>
