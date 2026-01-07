<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">단가 변경 이력</h2>
                <button class="close-btn" @click="close">×</button>
            </div>

            <div class="modal-body">
                <div class="item-info">
                    <div class="info-row">
                        <span class="label">품목코드</span>
                        <span class="value">{{ item?.itemCode }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">품목명</span>
                        <span class="value">{{ item?.itemName }}</span>
                    </div>
                </div>

                <div class="history-list">
                    <div v-if="loading" class="flex h-screen items-center justify-center bg-slate-50">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
                    </div>

                    <div v-else-if="!priceHistory || priceHistory.length === 0" class="no-data">
                        단가 변경 이력이 없습니다.
                    </div>

                    <div v-else class="history-items">
                        <div
                            v-for="(history, index) in priceHistory"
                            :key="history.id"
                            class="history-item"
                        >
                            <div class="history-header">
                                <span class="history-number">#{{ priceHistory.length - index }}</span>
                                <span class="history-date">{{ history.createdAt }}</span>
                            </div>
                            <div class="history-content">
                                <div class="price-info">
                                    <div class="price-row">
                                        <span class="price-label">기본 단가</span>
                                        <span class="price-value">{{ formatNumber(history.unitPrice) }} 원</span>
                                    </div>
                                    <div class="price-row">
                                        <span class="price-label">계약 단가</span>
                                        <span class="price-value contract">{{ formatNumber(history.contractPrice) }} 원</span>
                                    </div>
                                </div>
                                <div class="reason-box">
                                    <div class="reason-label">변경 사유</div>
                                    <div class="reason-text">{{ history.reason }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-close" @click="close">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getClientItemPriceHistory } from '@/api/client/client'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    clientId: {
        type: Number,
        required: true
    },
    item: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close'])

const priceHistory = ref([])
const loading = ref(false)

watch(() => props.isOpen, async (newVal) => {
    if (newVal && props.item) {
        await loadPriceHistory()
    }
})

const loadPriceHistory = async () => {
    try {
        loading.value = true
        priceHistory.value = await getClientItemPriceHistory(props.clientId, props.item.id)
    } catch (error) {
        console.error('가격 이력 조회 실패:', error)
        alert('가격 이력을 불러오는데 실패했습니다.')
    } finally {
        loading.value = false
    }
}

const formatNumber = (value) => {
    if (value == null) return '-'
    return value.toLocaleString('ko-KR')
}

const close = () => {
    emit('close')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
}

.close-btn {
    background: none;
    border: none;
    font-size: 32px;
    color: #9ca3af;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.15s;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #111827;
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.item-info {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    gap: 24px;
}

.item-info .info-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-info .label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
}

.item-info .value {
    font-size: 14px;
    color: #111827;
    font-weight: 500;
}

.history-list {
    min-height: 200px;
}

.loading,
.no-data {
    text-align: center;
    padding: 40px 20px;
    color: #6b7280;
    font-size: 14px;
}

.history-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.history-item {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.15s;
}

.history-item:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.history-number {
    font-size: 13px;
    font-weight: 600;
    color: #4C4CDD;
}

.history-date {
    font-size: 12px;
    color: #6b7280;
}

.history-content {
    padding: 16px;
}

.price-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
}

.price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-label {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
}

.price-value {
    font-size: 14px;
    color: #111827;
    font-weight: 500;
}

.price-value.contract {
    color: #4C4CDD;
    font-weight: 600;
}

.reason-box {
    background: #f9fafb;
    border-radius: 6px;
    padding: 12px;
}

.reason-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 6px;
}

.reason-text {
    font-size: 13px;
    color: #111827;
    line-height: 1.5;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
}

.btn {
    padding: 8px 18px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
}

.btn-close {
    background: #f3f4f6;
    color: #374151;
}

.btn-close:hover {
    background: #e5e7eb;
}
</style>
