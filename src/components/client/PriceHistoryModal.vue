<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <!-- 모달 헤더 -->
            <div class="modal-header">
                <h2 class="modal-title">단가 변동 이력</h2>
                <button class="close-btn" @click="closeModal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>

            <!-- 품목 정보 -->
            <div class="item-info" v-if="itemInfo">
                <div class="info-row">
                    <span class="info-label">품목명</span>
                    <span class="info-value">{{ itemInfo.itemName }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">품목코드</span>
                    <span class="info-value">{{ itemInfo.itemCode }}</span>
                </div>
            </div>

            <!-- 이력 테이블 -->
            <div class="history-section">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>변경일시</th>
                            <th>단가</th>
                            <th>계약단가</th>
                            <th>변경사유</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="history in priceHistory" :key="history.id">
                            <td>{{ formatDate(history.createdAt) }}</td>
                            <td class="text-right">{{ formatPrice(history.unitPrice) }}</td>
                            <td class="text-right">{{ formatPrice(history.contractPrice) }}</td>
                            <td>{{ history.reason || '-' }}</td>
                            <td class="text-center">
                                <span :class="getStatusClass(history.status)">
                                    {{ getStatusLabel(history.status) }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="priceHistory.length === 0 && !loading">
                            <td colspan="5" class="text-center empty-message">
                                단가 변동 이력이 없습니다.
                            </td>
                        </tr>
                        <tr v-if="loading">
                            <td colspan="5" class="text-center loading-message">
                                로딩 중...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
                <button class="btn-close" @click="closeModal">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getPriceHistory } from '@/api/client/clientItem'
import { useUserStore } from '@/stores/user'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    itemId: {
        type: Number,
        default: null
    },
    itemInfo: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])

const userStore = useUserStore()
const priceHistory = ref([])
const loading = ref(false)

// 모달이 열릴 때 데이터 로드
watch(() => props.isOpen, async (newVal) => {
    if (newVal && props.itemId) {
        await loadPriceHistory()
    }
})

// 단가 이력 조회
const loadPriceHistory = async () => {
    try {
        loading.value = true
        const clientId = userStore.clientId
        priceHistory.value = await getPriceHistory(clientId, props.itemId)
    } catch (error) {
        console.error('단가 이력 조회 실패:', error)
        priceHistory.value = []
    } finally {
        loading.value = false
    }
}

// 모달 닫기
const closeModal = () => {
    emit('close')
}

// 날짜 포맷팅
const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

const formatPrice = (price) => {
    return price ? `${price.toLocaleString()}원` : '-'
}

const getStatusClass = (status) => {
    const statusClasses = {
        'TRADE_NORMAL': 'status-badge status-active',
        'TRADE_STOP_PREP': 'status-badge status-inactive',
        'TRADE_STOP': 'status-badge status-discontinued'
    }
    return statusClasses[status] || 'status-badge'
}

const getStatusLabel = (status) => {
    const statusLabels = {
        'TRADE_NORMAL': '정상',
        'TRADE_STOP_PREP': '거래 중단 예정',
        'TRADE_STOP': '거래 중단'
    }
    return statusLabels[status] || status
}
</script>

<style scoped>
/* 모달 오버레이 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* 모달 콘텐츠 */
.modal-content {
    background: #ffffff;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* 모달 헤더 */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #111827;
}

/* 품목 정보 */
.item-info {
    padding: 20px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.info-row {
    display: flex;
    margin-bottom: 8px;
}

.info-row:last-child {
    margin-bottom: 0;
}

.info-label {
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    width: 100px;
}

.info-value {
    font-size: 14px;
    color: #111827;
}

/* 이력 섹션 */
.history-section {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

/* 테이블 */
.history-table {
    width: 100%;
    border-collapse: collapse;
}

.history-table thead {
    background: #f9fafb;
    position: sticky;
    top: 0;
}

.history-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
}

.history-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
}

.history-table tbody tr:hover {
    background: #f9fafb;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.empty-message,
.loading-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}

/* 상태 뱃지 */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-active {
    background: #dcfce7;
    color: #166534;
}

.status-inactive {
    background: #fef3c7;
    color: #92400e;
}

.status-discontinued {
    background: #fee2e2;
    color: #991b1b;
}

/* 모달 푸터 */
.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
}

.btn-close {
    padding: 10px 24px;
    background: #6b7280;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-close:hover {
    background: #4b5563;
}
</style>
