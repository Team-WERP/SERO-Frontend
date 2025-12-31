<template>
    <div class="delivery-tracking-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div class="breadcrumb">[물류팀] - 배송추적 주체</div>
            <h1 class="page-title">배송 추적 (Shipment Tracking)</h1>
            <p class="page-description">주문 번호를 입력하여 현재 물품 상태를 확인하세요.</p>
        </div>

        <!-- 검색 영역 -->
        <div class="search-section">
            <input
                v-model="searchCode"
                type="text"
                placeholder="ORD-20251211-01"
                class="search-input"
                @keyup.enter="searchDelivery"
            />
            <button class="search-btn" @click="searchDelivery">조회</button>
        </div>

        <!-- 배송 정보 영역 -->
        <div v-if="deliveryInfo" class="delivery-info-section">
            <h2 class="product-title">{{ deliveryInfo.itemName }}</h2>

            <!-- 주문 정보 -->
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">주문 번호</span>
                    <span class="info-value">{{ deliveryInfo.soCode }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">고객사</span>
                    <span class="info-value">{{ deliveryInfo.companyName }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">주문 일자</span>
                    <span class="info-value">{{ deliveryInfo.createdAt }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">현재 상태</span>
                    <span class="status-badge" :class="getStatusClass(deliveryInfo.status)">
                        {{ getStatusText(deliveryInfo.status) }}
                    </span>
                </div>
            </div>

            <!-- 배송 진행 상태 -->
            <div class="tracking-timeline">
                <div class="timeline-step" :class="{ active: isStepActive(1), completed: isStepCompleted(1) }">
                    <div class="step-icon">
                        <svg v-if="isStepCompleted(1)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                        </svg>
                    </div>
                    <div class="step-info">
                        <div class="step-title">출고 완료</div>
                        <div class="step-date">{{ deliveryInfo.departedAt || '예정 중' }}</div>
                    </div>
                </div>

                <div class="timeline-line" :class="{ active: isStepActive(2) }"></div>

                <div class="timeline-step" :class="{ active: isStepActive(2), completed: isStepCompleted(2) }">
                    <div class="step-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm1.5-9H17V12h4.46L19.5 9.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.1.9-2 2-2h14v4h3z"/>
                        </svg>
                    </div>
                    <div class="step-info">
                        <div class="step-title">배송중</div>
                        <div class="step-date">{{ isStepActive(2) ? '이동 중' : '예정' }}</div>
                    </div>
                </div>

                <div class="timeline-line" :class="{ active: isStepActive(3) }"></div>

                <div class="timeline-step" :class="{ active: isStepActive(3), completed: isStepCompleted(3) }">
                    <div class="step-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                    <div class="step-info">
                        <div class="step-title">도착 완료</div>
                        <div class="step-date">{{ deliveryInfo.arrivedAt || '고객사 수령 대기' }}</div>
                    </div>
                </div>
            </div>

            <!-- 상세 히스토리 -->
            <div v-if="deliveryInfo.history && deliveryInfo.history.length > 0" class="history-section">
                <h3 class="history-title">📦 상세 현황</h3>
                <div class="history-list">
                    <div
                        v-for="(item, index) in deliveryInfo.history"
                        :key="index"
                        class="history-item"
                    >
                        <div class="history-time">{{ item.timestamp }}</div>
                        <div class="history-content">{{ item.message }}</div>
                    </div>
                </div>
            </div>

            <!-- 기본 히스토리 (API에서 history가 없을 경우) -->
            <div v-else class="history-section">
                <h3 class="history-title">📦 상세 현황</h3>
                <div class="history-list">
                    <div class="history-item" v-if="deliveryInfo.arrivedAt">
                        <div class="history-time">{{ deliveryInfo.arrivedAt }}</div>
                        <div class="history-content">수령 완료(담당자: {{ deliveryInfo.managerName || '고객사' }})</div>
                    </div>
                    <div class="history-item" v-if="deliveryInfo.departedAt && deliveryInfo.status === 'GI_SHIP_ING'">
                        <div class="history-time">현재</div>
                        <div class="history-content">배송 중</div>
                    </div>
                    <div class="history-item" v-if="deliveryInfo.departedAt">
                        <div class="history-time">{{ deliveryInfo.departedAt }}</div>
                        <div class="history-content">출고 시작 완료(담당자: {{ deliveryInfo.managerName || '-' }})</div>
                    </div>
                    <div class="history-item">
                        <div class="history-time">{{ deliveryInfo.createdAt }}</div>
                        <div class="history-content">출고지시 접수 완료(담당자: {{ deliveryInfo.requesterName || '-' }})</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 검색 결과가 없을 때 -->
        <div v-else-if="searched && !deliveryInfo" class="empty-state">
            <p>검색 결과가 없습니다.</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { getGoodsIssueList } from '@/api/delivery'

const searchCode = ref('')
const deliveryInfo = ref(null)
const searched = ref(false)

const searchDelivery = async () => {
    if (!searchCode.value.trim()) {
        alert('주문 번호 또는 출고지시 번호를 입력해주세요.')
        return
    }

    try {
        searched.value = true
        // 출고지시 목록에서 검색
        const result = await getGoodsIssueList({
            soCode: searchCode.value.trim()
        })

        if (result && result.length > 0) {
            deliveryInfo.value = result[0]
        } else {
            deliveryInfo.value = null
        }
    } catch (error) {
        console.error('배송 조회 실패:', error)
        deliveryInfo.value = null
        alert('배송 정보를 조회하는데 실패했습니다.')
    }
}

const getStatusText = (status) => {
    const statusMap = {
        'GI_RVW': '검토중',
        'GI_APR': '승인완료',
        'GI_SHIP_ISSUED': '출고완료',
        'GI_SHIP_ING': '배송중',
        'GI_SHIP_DONE': '도착완료'
    }
    return statusMap[status] || status
}

const getStatusClass = (status) => {
    if (status === 'GI_SHIP_DONE') return 'status-completed'
    if (status === 'GI_SHIP_ING') return 'status-shipping'
    if (status === 'GI_SHIP_ISSUED') return 'status-issued'
    return 'status-pending'
}

const isStepActive = (step) => {
    if (!deliveryInfo.value) return false
    const status = deliveryInfo.value.status

    if (step === 1) return ['GI_SHIP_ISSUED', 'GI_SHIP_ING', 'GI_SHIP_DONE'].includes(status)
    if (step === 2) return ['GI_SHIP_ING', 'GI_SHIP_DONE'].includes(status)
    if (step === 3) return status === 'GI_SHIP_DONE'
    return false
}

const isStepCompleted = (step) => {
    if (!deliveryInfo.value) return false
    const status = deliveryInfo.value.status

    if (step === 1) return ['GI_SHIP_ING', 'GI_SHIP_DONE'].includes(status)
    if (step === 2) return status === 'GI_SHIP_DONE'
    if (step === 3) return status === 'GI_SHIP_DONE'
    return false
}
</script>

<style scoped>
.delivery-tracking-page {
    padding: 5px;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

/* 페이지 헤더 */
.page-header {
    margin-bottom: 32px;
}

.breadcrumb {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}

/* 검색 영역 */
.search-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    display: flex;
    gap: 12px;
}

.search-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 15px;
}

.search-input:focus {
    outline: none;
    border-color: #4C4CDD;
}

.search-btn {
    padding: 12px 32px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.search-btn:hover {
    background: #3d3dbb;
}

/* 배송 정보 영역 */
.delivery-info-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 32px;
}

.product-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 24px;
}

/* 정보 그리드 */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 40px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.info-value {
    font-size: 15px;
    color: #111827;
    font-weight: 600;
}

/* 상태 뱃지 */
.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    width: fit-content;
}

.status-completed {
    background: #d1fae5;
    color: #065f46;
}

.status-shipping {
    background: #dbeafe;
    color: #1e40af;
}

.status-issued {
    background: #fef3c7;
    color: #92400e;
}

.status-pending {
    background: #f3f4f6;
    color: #374151;
}

/* 타임라인 */
.tracking-timeline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 40px;
    padding: 0 20px;
}

.timeline-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;
}

.step-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #f3f4f6;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
}

.step-icon svg {
    width: 32px;
    height: 32px;
}

.timeline-step.active .step-icon,
.timeline-step.completed .step-icon {
    background: #4C4CDD;
    color: #ffffff;
}

.step-info {
    text-align: center;
}

.step-title {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
}

.timeline-step.active .step-title,
.timeline-step.completed .step-title {
    color: #4C4CDD;
}

.step-date {
    font-size: 12px;
    color: #6b7280;
}

.timeline-line {
    flex: 1;
    height: 3px;
    background: #e5e7eb;
    margin: 0 16px;
    position: relative;
    top: -30px;
}

.timeline-line.active {
    background: #4C4CDD;
}

/* 히스토리 */
.history-section {
    border-top: 1px solid #e5e7eb;
    padding-top: 24px;
}

.history-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 16px;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    display: flex;
    gap: 16px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
}

.history-time {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    min-width: 140px;
}

.history-content {
    font-size: 14px;
    color: #111827;
}

/* 빈 상태 */
.empty-state {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 60px;
    text-align: center;
    color: #9ca3af;
    font-size: 15px;
}

/* 반응형 */
@media (max-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr;
    }

    .tracking-timeline {
        padding: 0;
    }

    .step-icon {
        width: 50px;
        height: 50px;
    }

    .step-icon svg {
        width: 24px;
        height: 24px;
    }

    .timeline-line {
        margin: 0 8px;
    }

    .step-title {
        font-size: 12px;
    }

    .step-date {
        font-size: 11px;
    }
}
</style>
