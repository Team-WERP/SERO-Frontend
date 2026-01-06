<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">거래 품목 관리</h2>
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
                    <div class="info-row">
                        <span class="label">규격</span>
                        <span class="value">{{ item?.spec || '-' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">기본단가</span>
                        <span class="value">{{ formatNumber(item?.unitPrice) }} 원</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label required">고객사 단가</label>
                    <input
                        v-model.number="formData.contractPrice"
                        type="number"
                        class="form-input"
                        placeholder="고객사 단가를 입력하세요"
                        min="0"
                    />
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-delete" @click="handleDelete">삭제</button>
                <div class="action-buttons">
                    <button class="btn btn-cancel" @click="close">취소</button>
                    <button class="btn btn-primary" @click="handleSubmit">수정</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { updateClientItem, deleteClientItem } from '@/api/client/client'

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

const emit = defineEmits(['close', 'saved'])

const formData = ref({
    contractPrice: 0
})

watch(() => props.isOpen, (newVal) => {
    if (newVal && props.item) {
        // 모달이 열릴 때 현재 단가로 초기화
        formData.value = {
            contractPrice: props.item.contractPrice || 0
        }
    }
})

const formatNumber = (value) => {
    if (value == null) return '-'
    return value.toLocaleString('ko-KR')
}

const close = () => {
    emit('close')
}

const handleSubmit = async () => {
    if (formData.value.contractPrice < 0) {
        alert('고객사 단가는 0 이상이어야 합니다.')
        return
    }

    if (!confirm('고객사 단가를 수정하시겠습니까?')) {
        return
    }

    try {
        await updateClientItem(props.clientId, props.item.id, formData.value)
        alert('고객사 단가가 수정되었습니다.')
        emit('saved')
    } catch (error) {
        console.error('거래 품목 수정 실패:', error)
        alert('거래 품목 수정에 실패했습니다.')
    }
}

const handleDelete = async () => {
    if (!confirm(`${props.item?.itemName} 품목을 삭제하시겠습니까?`)) {
        return
    }

    try {
        await deleteClientItem(props.clientId, props.item.id)
        alert('거래 품목이 삭제되었습니다.')
        emit('saved')
    } catch (error) {
        console.error('거래 품목 삭제 실패:', error)
        alert('거래 품목 삭제에 실패했습니다.')
    }
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
    max-width: 500px;
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
    max-height: 60vh;
    overflow-y: auto;
}

.item-info {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
}

.item-info .info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.item-info .info-row:last-child {
    margin-bottom: 0;
}

.item-info .label {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
}

.item-info .value {
    font-size: 14px;
    color: #111827;
    font-weight: 500;
}

.form-group {
    margin-bottom: 0;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.form-label.required::after {
    content: '*';
    color: #ef4444;
    margin-left: 4px;
}

.form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    transition: border-color 0.15s;
}

.form-input:focus {
    outline: none;
    border-color: #4C4CDD;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-buttons {
    display: flex;
    gap: 10px;
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

.btn-cancel {
    background: #f3f4f6;
    color: #374151;
}

.btn-cancel:hover {
    background: #e5e7eb;
}

.btn-primary {
    background: #4C4CDD;
    color: white;
}

.btn-primary:hover {
    background: #3d3dbb;
}

.btn-delete {
    background: #ef4444;
    color: white;
}

.btn-delete:hover {
    background: #dc2626;
}
</style>
