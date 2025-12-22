<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-content">
            <!-- Header -->
            <div class="modal-header">
                <h3>{{ isEditMode ? '배송지 수정' : '배송지 등록' }}</h3>
                <button class="close-btn" @click="handleClose">×</button>
            </div>

            <!-- Content -->
            <div class="modal-body">
                <form @submit.prevent="handleSubmit">
                    <div class="form-section">
                        <label for="addressName">
                            배송지명 <span class="required">*</span>
                        </label>
                        <input
                            id="addressName"
                            v-model="formData.addressName"
                            type="text"
                            placeholder="배송지명을 입력하세요"
                            required
                        />
                    </div>

                    <div class="form-section">
                        <label for="address">
                            상세 주소 <span class="required">*</span>
                        </label>
                        <input
                            id="address"
                            v-model="formData.address"
                            type="text"
                            placeholder="예: 경기도 평택시 산업로 456 1234호"
                            required
                        />
                    </div>

                    <div class="form-section">
                        <label for="recipientName">
                            수령 담당자명 <span class="required">*</span>
                        </label>
                        <input
                            id="recipientName"
                            v-model="formData.recipientName"
                            type="text"
                            placeholder="담당자명을 입력하세요"
                            required
                        />
                    </div>

                    <div class="form-section">
                        <label for="phone">
                            연락처 <span class="required">*</span>
                        </label>
                        <input
                            id="phone"
                            v-model="formData.phone"
                            type="tel"
                            placeholder="예: 031-555-8888"
                            required
                        />
                    </div>

                    <div class="form-section checkbox-section">
                        <label>
                            <input
                                v-model="formData.isDefault"
                                type="checkbox"
                            />
                            <span>기본 배송지로 설정</span>
                        </label>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div class="modal-footer">
                <button type="button" class="btn-ghost" @click="handleClose">
                    취소
                </button>
                <button type="button" class="btn-primary" @click="handleSubmit">
                    {{ isEditMode ? '수정' : '등록' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    addressData: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
    addressName: '',
    address: '',
    recipientName: '',
    phone: '',
    isDefault: false
})

const isEditMode = ref(false)

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.addressData) {
            // 수정 모드
            isEditMode.value = true
            formData.value = {
                id: props.addressData.id,
                addressName: props.addressData.addressName || '',
                address: props.addressData.address || '',
                recipientName: props.addressData.recipientName || '',
                phone: props.addressData.phone || '',
                isDefault: props.addressData.isDefault || false
            }
        } else {
            // 신규 등록 모드
            isEditMode.value = false
            formData.value = {
                addressName: '',
                address: '',
                recipientName: '',
                phone: '',
                isDefault: false
            }
        }
    }
})

const handleClose = () => {
    emit('close')
}

const handleSubmit = () => {
    // 유효성 검사
    if (!formData.value.addressName || !formData.value.address ||
        !formData.value.recipientName || !formData.value.phone) {
        alert('필수 항목을 모두 입력해주세요.')
        return
    }

    emit('submit', formData.value)
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 28px;
    color: #6b7280;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #111827;
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.form-section {
    margin-bottom: 20px;
}

.form-section label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.form-section .required {
    color: #ef4444;
}

.form-section input[type="text"],
.form-section input[type="tel"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.form-section input:focus {
    border-color: #4C4CDD;
}

.checkbox-section {
    margin-top: 24px;
}

.checkbox-section label {
    display: flex;
    align-items: center;
    font-weight: 400;
    cursor: pointer;
}

.checkbox-section input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    cursor: pointer;
}

.checkbox-section span {
    font-size: 14px;
    color: #374151;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
}

.btn-ghost,
.btn-primary {
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.btn-ghost {
    background: #fff;
    border-color: #d1d5db;
    color: #374151;
}

.btn-ghost:hover {
    background: #f9fafb;
}

.btn-primary {
    background: #4C4CDD;
    color: #ffffff;
}

.btn-primary:hover {
    background: #3d3dbb;
}
</style>
