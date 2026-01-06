<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">{{ isEditMode ? '공통 코드 수정' : '공통 코드 등록' }}</h2>
                <button class="close-btn" @click="close">×</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label required">그룹 코드</label>
                    <input
                        v-model="formData.codeTypeCode"
                        type="text"
                        class="form-input"
                        disabled
                    />
                </div>

                <div class="form-group">
                    <label class="form-label required">공통 코드</label>
                    <input
                        v-model="formData.code"
                        type="text"
                        class="form-input"
                        placeholder="예: MAT_FG (Finished Goods)"
                        :disabled="isEditMode"
                        maxlength="50"
                    />
                    <p v-if="!isEditMode" class="help-text">영문 대문자, 숫자, 언더스코어(_)만 사용 가능합니다</p>
                    <p v-else class="help-text warning">공통 코드는 한 번 등록하면 수정이 불가능합니다</p>
                </div>

                <div class="form-group">
                    <label class="form-label required">코드명</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="form-input"
                        placeholder="예: 완제품"
                        maxlength="100"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">영문명</label>
                    <input
                        v-model="formData.codeNameEng"
                        type="text"
                        class="form-input"
                        placeholder="예: Finished Goods"
                        maxlength="100"
                    />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">참조값</label>
                        <input
                            v-model="formData.ref1"
                            type="text"
                            class="form-input"
                            placeholder="참조값 입력 (선택)"
                            maxlength="100"
                        />
                    </div>

                    <div class="form-group">
                        <label class="form-label required">정렬 순서</label>
                        <input
                            v-model.number="formData.sortOrder"
                            type="number"
                            class="form-input"
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input v-model="formData.isUsed" type="checkbox" class="checkbox-input" />
                        <span class="checkbox-text">사용 여부</span>
                    </label>
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
    codeTypeCode: {
        type: String,
        required: true
    },
    code: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['close', 'submit'])

const isEditMode = ref(false)
const formData = ref({
    codeTypeCode: '',
    code: '',
    name: '',
    codeNameEng: '',
    ref1: '',
    sortOrder: 0,
    isUsed: true
})

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        if (props.code) {
            isEditMode.value = true
            formData.value = {
                codeTypeCode: props.code.codeTypeCode || props.codeTypeCode,
                code: props.code.code,
                name: props.code.name,
                codeNameEng: props.code.codeNameEng || '',
                ref1: props.code.ref1 || '',
                sortOrder: props.code.sortOrder || 0,
                isUsed: props.code.isUsed === 'Y' || props.code.isUsed === true
            }
        } else {
            isEditMode.value = false
            formData.value = {
                codeTypeCode: props.codeTypeCode,
                code: '',
                name: '',
                codeNameEng: '',
                ref1: '',
                sortOrder: 0,
                isUsed: true
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

    // 코드 형식 검증 (영문 대문자, 숫자, 언더스코어)
    if (!isEditMode.value && !/^[A-Z0-9_]+$/.test(formData.value.code)) {
        alert('공통 코드는 한번 등록하면 수정이 불가능 합니다.')
        return
    }

    // typeCode를 codeTypeCode로 변환하고 제출
    const submitData = {
        typeCode: formData.value.codeTypeCode,
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.codeNameEng,
        sortOrder: formData.value.sortOrder,
        isUsed: formData.value.isUsed // boolean 그대로 전송
    }

    emit('submit', submitData)
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
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

.form-input:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

.help-text {
    margin-top: 6px;
    font-size: 12px;
    color: #6b7280;
}

.help-text.warning {
    color: #dc2626;
    font-weight: 500;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-input {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    cursor: pointer;
}

.checkbox-text {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
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
