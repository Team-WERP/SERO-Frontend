<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
            <!-- 모달 헤더 -->
            <div class="modal-header">
                <h2>납품서 생성</h2>
                <button class="btn-close" @click="closeModal">
                    <i class="icon-close">✕</i>
                </button>
            </div>

            <!-- 모달 컨텐츠 -->
            <div class="modal-content">
                <!-- 납품 수량 입력 -->
                <div class="section">
                    <h3 class="section-title">재고 확인</h3>
                    <p class="section-description">*AUn 기준</p>

                    <div class="table-container">
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th>품목코드</th>
                                    <th>품목명</th>
                                    <th>가용재고</th>
                                    <th>주문수량</th>
                                    <th>미출고수량</th>
                                    <th>신규출고요청</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in items" :key="index">
                                    <td>{{ item.itemCode }}</td>
                                    <td>{{ item.itemName }}</td>
                                    <td class="text-right">{{ formatNumber(item.availableStock) }}</td>
                                    <td class="text-right">{{ formatNumber(item.orderQuantity) }}</td>
                                    <td class="text-right" :class="{'text-warning': item.unshippedQuantity > 0}">
                                        {{ formatNumber(item.unshippedQuantity) }}
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            class="quantity-input"
                                            v-model.number="item.requestQuantity"
                                            :max="item.unshippedQuantity"
                                            min="0"
                                            @input="validateQuantity(item)"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p class="help-text">*미출고수량 = 주문수량 - 출고완료 - 출고한도</p>
                </div>

                <!-- 납품/배송 정보 -->
                <div class="section">
                    <h3 class="section-title">납품/배송 정보</h3>

                    <div class="form-grid">
                        <div class="form-item">
                            <label class="required">납기일시</label>
                            <input
                                type="datetime-local"
                                v-model="formData.shippedAt"
                                required
                            />
                        </div>

                        <div class="form-item">
                            <label>납품처</label>
                            <input
                                type="text"
                                :value="orderInfo.companyName"
                                readonly
                                class="readonly-input"
                            />
                        </div>

                        <div class="form-item full-width">
                            <label>상세 주소</label>
                            <input
                                type="text"
                                :value="orderInfo.address"
                                readonly
                                class="readonly-input"
                            />
                        </div>

                        <div class="form-item">
                            <label>수령 담당자명</label>
                            <input
                                type="text"
                                :value="orderInfo.recipientName"
                                readonly
                                class="readonly-input"
                            />
                        </div>

                        <div class="form-item">
                            <label>연락처</label>
                            <input
                                type="text"
                                :value="orderInfo.recipientContact"
                                readonly
                                class="readonly-input"
                            />
                        </div>

                        <div class="form-item full-width">
                            <label>특이사항</label>
                            <textarea
                                v-model="formData.note"
                                rows="3"
                                placeholder="특이사항을 입력하세요"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
                <button class="btn-cancel" @click="closeModal">취소</button>
                <button class="btn-submit" @click="handleSubmit" :disabled="isSubmitting">
                    {{ isSubmitting ? '생성 중...' : '납품서 생성' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    orderInfo: {
        type: Object,
        required: true
    },
    orderItems: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['close', 'submit'])

const isSubmitting = ref(false)

// 품목 데이터 (신규출고요청 수량 포함)
const items = ref([])

// 폼 데이터
const formData = ref({
    shippedAt: '',
    note: ''
})

// props.orderItems 변경 시 items 초기화
watch(() => props.orderItems, (newItems) => {
    if (newItems && newItems.length > 0) {
        items.value = newItems.map(item => ({
            ...item,
            requestQuantity: item.unshippedQuantity || 0
        }))
    }
}, { immediate: true })

// 수량 검증
const validateQuantity = (item) => {
    if (item.requestQuantity > item.unshippedQuantity) {
        item.requestQuantity = item.unshippedQuantity
    }
    if (item.requestQuantity < 0) {
        item.requestQuantity = 0
    }
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (!value && value !== 0) return '-'
    return value.toLocaleString()
}

// 모달 닫기
const closeModal = () => {
    if (!isSubmitting.value) {
        emit('close')
    }
}

// 제출
const handleSubmit = async () => {
    // 유효성 검사
    if (!formData.value.shippedAt) {
        alert('납기일시를 입력해주세요.')
        return
    }

    // 신규출고요청 수량이 있는 품목만 필터링
    const requestItems = items.value
        .filter(item => item.requestQuantity > 0)
        .map(item => ({
            soItemId: item.soItemId,
            doQuantity: item.requestQuantity
        }))

    if (requestItems.length === 0) {
        alert('신규출고요청 수량을 입력해주세요.')
        return
    }

    const requestData = {
        soId: props.orderInfo.soId,
        shippedAt: formData.value.shippedAt,
        note: formData.value.note,
        items: requestItems
    }

    isSubmitting.value = true

    try {
        await emit('submit', requestData)
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped>
/* ===== 모달 오버레이 ===== */
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

.modal-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

/* ===== 모달 헤더 ===== */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 30px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.btn-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-close:hover {
    background: #f3f4f6;
    color: #111827;
}

/* ===== 모달 컨텐츠 ===== */
.modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
}

.section {
    margin-bottom: 30px;
}

.section:last-child {
    margin-bottom: 0;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 6px;
    padding-left: 12px;
    border-left: 4px solid #4C4CDD;
}

.section-description {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 16px;
}

/* ===== 테이블 ===== */
.table-container {
    overflow-x: auto;
    margin-bottom: 12px;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #e5e7eb;
}

.items-table thead {
    background: #f9fafb;
}

.items-table th {
    padding: 12px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
}

.items-table td {
    padding: 12px;
    font-size: 14px;
    color: #111827;
    border-bottom: 1px solid #e5e7eb;
}

.text-right {
    text-align: right;
}

.text-warning {
    color: #dc2626;
    font-weight: 600;
}

.quantity-input {
    width: 100%;
    max-width: 120px;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    text-align: right;
}

.quantity-input:focus {
    outline: none;
    border-color: #4C4CDD;
}

.help-text {
    font-size: 12px;
    color: #6b7280;
}

/* ===== 폼 ===== */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-item.full-width {
    grid-column: 1 / -1;
}

.form-item label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.form-item label.required::after {
    content: ' *';
    color: #dc2626;
}

.form-item input,
.form-item textarea {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
}

.form-item input:focus,
.form-item textarea:focus {
    outline: none;
    border-color: #4C4CDD;
}

.readonly-input {
    background: #f9fafb;
    color: #6b7280;
}

.form-item textarea {
    resize: vertical;
    font-family: inherit;
}

/* ===== 모달 푸터 ===== */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 30px;
    border-top: 1px solid #e5e7eb;
}

.btn-cancel {
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

.btn-cancel:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.btn-submit {
    padding: 10px 24px;
    background: #4C4CDD;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
    background: #3d3dbb;
}

.btn-submit:disabled {
    background: #9ca3af;
    cursor: not-allowed;
}
</style>
