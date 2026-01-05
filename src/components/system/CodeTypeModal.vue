<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">{{ isEditMode ? '코드 그룹 수정' : '코드 그룹 등록' }}</h2>
                <button class="close-btn" @click="close">×</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label required">그룹 코드</label>
                    <input
                        v-model="formData.code"
                        type="text"
                        class="form-input"
                        placeholder="예: MT (Material Type)"
                        :disabled="isEditMode"
                        maxlength="20"
                    />
                    <p class="help-text">그룹 코드는 한 번 작성하면 수정이 불가능 합니다.</p>
                </div>

                <div class="form-group">
                    <label class="form-label required">그룹명</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="form-input"
                        placeholder="예: 자재 유형"
                        maxlength="100"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">설명</label>
                    <textarea
                        v-model="formData.description"
                        class="form-textarea"
                        placeholder="코드 그룹에 대한 설명을 입력하세요"
                        rows="3"
                        maxlength="500"
                    />
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-cancel" @click="close">취소</button>
                <button class="btn btn-primary" @click="handleSubmit">
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
    codeType: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'submit'])

const isEditMode = ref(false)
const formData = ref({
    code: '',
    name: '',
    description: ''
})

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.codeType) {
            isEditMode.value = true
            formData.value = {
                code: props.codeType.code,
                name: props.codeType.name,
                description: props.codeType.description || ''
            }
        } else {
            isEditMode.value = false
            formData.value = {
                code: '',
                name: '',
                description: ''
            }
        }
    }
})

const close = () => {
    emit('close')
}

const handleSubmit = () => {
    if (!formData.value.code || !formData.value.name) {
        alert('필수 항목을 입력해주세요.')
        return
    }

    // 코드 형식 검증 (영문 대문자, 언더스코어만)
    if (!isEditMode.value && !/^[A-Z_]+$/.test(formData.value.code)) {
        alert('그룹 코드는 한 번 작성하면 수정이 불가능 합니다.')
        return
    }

    emit('submit', { ...formData.value })
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
.form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    transition: border-color 0.15s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: #4C4CDD;
}

.form-input:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
}

.help-text {
    margin-top: 6px;
    font-size: 12px;
    color: #6b7280;
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
