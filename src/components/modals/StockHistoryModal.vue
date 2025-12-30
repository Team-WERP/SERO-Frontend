<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
            <!-- 모달 헤더 -->
            <div class="modal-header">
                <h2>재고 상세 조회</h2>
                <button class="btn-close" @click="closeModal">
                    <i class="icon-close">✕</i>
                </button>
            </div>

            <!-- 모달 내용 -->
            <div class="modal-content">
                <div v-if="stockDetail">
                    <!-- 창고 정보 -->
                    <div class="info-section">
                        <h3 class="section-title">창고 정보</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">창고명</span>
                                <span class="value">{{ stockDetail.warehouse?.name || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">주소</span>
                                <span class="value">{{ stockDetail.warehouse?.address || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">창고 유형</span>
                                <span class="value">{{ getWarehouseTypeLabel(stockDetail.warehouse?.type) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 자재 정보 -->
                    <div class="info-section">
                        <h3 class="section-title">자재 정보</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">자재명</span>
                                <span class="value">{{ stockDetail.material?.name || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">자재코드</span>
                                <span class="value">{{ stockDetail.material?.materialCode || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">규격</span>
                                <span class="value">{{ stockDetail.material?.spec || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">자재 유형</span>
                                <span class="value">{{ getMaterialTypeLabel(stockDetail.material?.type) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">단위</span>
                                <span class="value">{{ stockDetail.material?.baseUnit || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">단가</span>
                                <span class="value">{{ formatCurrency(stockDetail.material?.unitPrice) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 재고 정보 -->
                    <div class="info-section">
                        <h3 class="section-title">재고 현황</h3>
                        <div class="stock-summary">
                            <div class="stock-card">
                                <div class="stock-label">안전재고</div>
                                <div class="stock-value">{{ formatNumber(stockDetail.safetyStock) }}</div>
                            </div>
                            <div class="stock-card">
                                <div class="stock-label">현재재고</div>
                                <div class="stock-value current">{{ formatNumber(stockDetail.currentStock) }}</div>
                            </div>
                            <div class="stock-card">
                                <div class="stock-label">가용재고</div>
                                <div class="stock-value available">{{ formatNumber(stockDetail.availableStock) }}</div>
                            </div>
                            <div class="stock-card">
                                <div class="stock-label">재고상태</div>
                                <div class="stock-value">
                                    <span :class="getStockStatusClass(stockDetail.stockStatus)">
                                        {{ getStockStatusLabel(stockDetail.stockStatus) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 재고 변동 이력 -->
                    <div class="info-section">
                        <h3 class="section-title">재고 변동 이력</h3>
                        <div v-if="stockDetail.stockHistory && stockDetail.stockHistory.length > 0" class="history-table-container">
                            <table class="history-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">No</th>
                                        <th style="width: 100px;">변동 유형</th>
                                        <th style="width: 200px;">사유</th>
                                        <th style="width: 100px; text-align:right;">변동 수량</th>
                                        <th style="width: 100px; text-align:right;">변동 후 재고</th>
                                        <th style="width: 150px;">변동 일시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(history, index) in stockDetail.stockHistory" :key="history.id">
                                        <td class="text-center">{{ index + 1 }}</td>
                                        <td>
                                            <span :class="getHistoryTypeClass(history.type)">
                                                {{ history.type }}
                                            </span>
                                        </td>
                                        <td>{{ history.reason || '-' }}</td>
                                        <td class="text-right" :class="getQuantityClass(history.changedQuantity)">
                                            {{ formatQuantityChange(history.changedQuantity) }}
                                        </td>
                                        <td class="text-right">{{ formatNumber(history.currentStock) }}</td>
                                        <td>{{ formatDateTime(history.createdAt) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-else class="empty-history">
                            재고 변동 이력이 없습니다.
                        </div>
                    </div>
                </div>

                <div v-else class="no-data">
                    데이터를 불러올 수 없습니다.
                </div>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
                <button class="btn-secondary" @click="closeModal">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    stockDetail: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])

// 모달 닫기
const closeModal = () => {
    emit('close')
}

// 창고 유형 라벨
const getWarehouseTypeLabel = (type) => ({
    WHS_WH: '창고',
    WHS_STORE: '매장'
}[type] || type || '-')

// 자재 유형 라벨
const getMaterialTypeLabel = (type) => ({
    MAT_FG: '완제품',
    MAT_RM: '원자재'
}[type] || type || '-')

// 재고 상태 클래스
const getStockStatusClass = (status) => ({
    NORMAL: 'status-badge status-normal',
    LOW: 'status-badge status-low',
    OUT_OF_STOCK: 'status-badge status-out'
}[status] || 'status-badge')

// 재고 상태 라벨
const getStockStatusLabel = (status) => ({
    NORMAL: '정상',
    LOW: '부족',
    OUT_OF_STOCK: '품절'
}[status] || status || '-')

// 변동 유형 클래스
const getHistoryTypeClass = (type) => {
    if (type === '입고') return 'type-badge type-in'
    if (type === '출고') return 'type-badge type-out'
    return 'type-badge'
}

// 수량 변동 클래스
const getQuantityClass = (quantity) => {
    if (quantity > 0) return 'quantity-increase'
    if (quantity < 0) return 'quantity-decrease'
    return ''
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    return value.toLocaleString()
}

// 금액 포맷팅
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    return '₩' + value.toLocaleString()
}

// 수량 변동 포맷팅
const formatQuantityChange = (value) => {
    if (value === null || value === undefined) return '-'
    if (value > 0) return '+' + value.toLocaleString()
    return value.toLocaleString()
}

// 날짜 포맷팅
const formatDateTime = (value) => {
    if (!value) return '-'
    const dateStr = value.replace('T', ' ').substring(0, 16)
    return dateStr
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.modal-container {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 1000px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    background: #e5e7eb;
}

.icon-close {
    font-size: 20px;
    color: #6b7280;
    font-style: normal;
}

.modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
    background: #f9fafb;
}

.info-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 16px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.info-item .label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.info-item .value {
    font-size: 14px;
    color: #111827;
    font-weight: 600;
}

.stock-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.stock-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
}

.stock-label {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
}

.stock-value {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
}

.stock-value.current {
    color: #4C4CDD;
}

.stock-value.available {
    color: #059669;
}

.history-table-container {
    overflow-x: auto;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
}

.history-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.history-table th {
    padding: 12px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-align: left;
}

.history-table td {
    padding: 12px 16px;
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

.type-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.type-in {
    background: #dcfce7;
    color: #166534;
}

.type-out {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-normal {
    background: #dcfce7;
    color: #166534;
}

.status-low {
    background: #fef3c7;
    color: #92400e;
}

.status-out {
    background: #fee2e2;
    color: #991b1b;
}

.quantity-increase {
    color: #059669;
    font-weight: 600;
}

.quantity-decrease {
    color: #dc2626;
    font-weight: 600;
}

.empty-history {
    text-align: center;
    padding: 40px;
    color: #9ca3af;
    font-size: 14px;
}

.no-data {
    text-align: center;
    padding: 60px;
    color: #9ca3af;
    font-size: 14px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 20px 30px;
    border-top: 1px solid #e5e7eb;
}

.btn-secondary {
    padding: 10px 24px;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

/* 스크롤바 스타일링 */
.modal-content::-webkit-scrollbar {
    width: 8px;
}

.modal-content::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.modal-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
