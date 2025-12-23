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
                <label>작업일자</label>
                <input type="date" v-model="selectedDate" @change="fetchDailyPreview" />
            </div>
        </div>

        <!-- 목록 -->
        <div class="items-section">
            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 140px;">라인</th>
                        <th style="width: 200px;">품목</th>
                        <th style="width: 220px;">PR / PP</th>
                        <th style="width: 100px;">계획수량</th>
                        <th style="width: 100px;">누적실적</th>
                        <th style="width: 180px;">진행률</th>
                        <th style="width: 100px;">잔여</th>
                        <th style="width: 120px; text-align:center;">작업지시</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="row in plans" :key="row.ppId">
                        <td>{{ row.lineName || '미지정' }}</td>

                        <td>
                            <div class="code">
                                <div class="primary">{{ row.materialName }}</div>
                                <div class="secondary">{{ row.materialCode }}</div>
                            </div>
                        </td>


                        <td>
                            <div class="code">
                                <div class="primary">{{ row.prCode }}</div>
                                <div class="secondary">{{ row.ppCode }}</div>
                            </div>
                        </td>

                        <td>
                            {{ formatQuantity(row.plannedQuantity) }}
                        </td>

                        <td>
                            {{ formatQuantity(row.totalProducedQty) }}
                        </td>

                        <td>
                            <div class="progress-wrap">
                                <div class="progress-bar-bg">
                                    <div class="progress-bar" :style="{ width: row.progressRate + '%' }" />
                                </div>
                                <span class="progress-text">
                                    {{ row.progressRate }}%
                                </span>
                            </div>
                        </td>

                        <td>
                            {{ formatQuantity(row.remainingQuantity) }}
                        </td>

                        <td class="text-center">
                            <button v-if="row.remainingQuantity === 0" class="btn disabled" disabled>
                                완료
                            </button>

                            <button v-else-if="row.todayWorkQuantity > 0" class="btn disabled" disabled>
                                생성됨
                            </button>

                            <button v-else class="btn primary" @click="openCreateModal(row)">
                                생성
                            </button>
                        </td>
                    </tr>

                    <tr v-if="plans.length === 0">
                        <td colspan="7" class="empty-message text-center">
                            해당 날짜에 생성할 생산계획이 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 작업지시 생성 모달 -->
        <div v-if="showModal" class="modal-backdrop">
            <div class="modal">
                <h3>작업지시 생성</h3>

                <p class="modal-desc">
                    {{ selectedRow.lineName }} / {{ selectedRow.ppCode }}
                </p>

                <label>생성 수량</label>
                <input type="number" v-model.number="createQuantity" :max="selectedRow.remainingQuantity" />

                <div class="modal-actions">
                    <button class="btn" @click="showModal = false">
                        취소
                    </button>
                    <button class="btn primary" @click="createWorkOrder">
                        확정
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDailyPlanPreview } from '@/api/production/productionPlan.js'

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const plans = ref([])

const showModal = ref(false)
const selectedRow = ref(null)
const createQuantity = ref(0)

const fetchDailyPreview = async () => {
    plans.value = await getDailyPlanPreview(selectedDate.value)
}

const openCreateModal = (row) => {
    selectedRow.value = row
    createQuantity.value = row.remainingQuantity
    showModal.value = true
}

const createWorkOrder = async () => {
    // 다음 단계에서 API 연결
    showModal.value = false
    fetchDailyPreview()
}

const formatQuantity = (v) =>
    v != null ? v.toLocaleString() : '-'

onMounted(fetchDailyPreview)
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
}

.items-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.items-table th,
.items-table td {
    padding: 12px 16px;
    font-size: 14px;
    text-align: center;
    vertical-align: middle;
}

.items-table tbody tr:hover {
    background: #f9fafb;
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

.btn.disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
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
    width: 320px;
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
</style>
