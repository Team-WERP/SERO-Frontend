<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">거래 품목 등록</h2>
                <button class="close-btn" @click="close">×</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label required">품목 선택</label>
                    <select v-model="formData.itemId" class="form-select">
                        <option :value="null">품목을 선택하세요</option>
                        <option v-for="item in filteredMaterials" :key="item.id" :value="item.id">
                            {{ item.materialCode }} - {{ item.name }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label required">계약 단가</label>
                    <input
                        v-model.number="formData.contractPrice"
                        type="number"
                        class="form-input"
                        placeholder="계약 단가를 입력하세요"
                        min="0"
                    />
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-cancel" @click="close">취소</button>
                <button class="btn btn-primary" @click="handleSubmit">등록</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { createClientItem } from '@/api/client/client'
import { getMaterialList } from '@/api/material/material'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    clientId: {
        type: Number,
        required: true
    },
    existingItemIds: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['close', 'saved'])

const materials = ref([])
const formData = ref({
    itemId: null,
    contractPrice: 0
})

// 이미 등록된 품목을 제외한 품목 목록
const filteredMaterials = computed(() => {
    return materials.value.filter(item => !props.existingItemIds.includes(item.id))
})

watch(() => props.isOpen, async (newVal) => {
    if (newVal) {
        // 모달이 열릴 때 품목 목록 조회
        try {
            materials.value = await getMaterialList({})
        } catch (error) {
            console.error('품목 목록 조회 실패:', error)
        }

        // 폼 초기화
        formData.value = {
            itemId: null,
            contractPrice: 0
        }
    }
})

const close = () => {
    emit('close')
}

const handleSubmit = async () => {
    if (!formData.value.itemId) {
        alert('품목을 선택해주세요.')
        return
    }

    if (formData.value.contractPrice < 0) {
        alert('계약 단가는 0 이상이어야 합니다.')
        return
    }

    try {
        await createClientItem(props.clientId, formData.value)
        alert('거래 품목이 등록되었습니다.')
        emit('saved')
    } catch (error) {
        console.error('거래 품목 등록 실패:', error)
        alert('거래 품목 등록에 실패했습니다.')
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

.form-group {
    margin-bottom: 20px;
}

.form-group:last-child {
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

.form-input,
.form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    transition: border-color 0.15s;
}

.form-input:focus,
.form-select:focus {
    outline: none;
    border-color: #4C4CDD;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
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
</style>
