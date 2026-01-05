<template>
    <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">
                    {{ codeType ? '공통코드 타입 수정' : '공통코드 타입 생성' }}
                </h2>
                <button class="modal-close" @click="closeModal">✕</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label required">타입 코드</label>
                    <input
                        v-model="formData.code"
                        type="text"
                        class="form-input"
                        placeholder="예: DEPT"
                        :disabled="!!codeType"
                        maxlength="50"
                    />
                    <p class="form-hint">타입 코드는 생성 후 수정할 수 없습니다.</p>
                </div>

                <div class="form-group">
                    <label class="form-label required">타입명</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="form-input"
                        placeholder="예: 부서"
                        maxlength="50"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">설명</label>
                    <textarea
                        v-model="formData.description"
                        class="form-textarea"
                        placeholder="예: 부서 구분 코드"
                        rows="3"
                        maxlength="255"
                    ></textarea>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-cancel" @click="closeModal">취소</button>
                <button class="btn btn-primary" @click="handleSave">저장</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    visible: Boolean,
    codeType: Object
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
    code: '',
    name: '',
    description: ''
})

// codeType이 변경될 때 폼 데이터 초기화
watch(() => props.codeType, (newValue) => {
    if (newValue) {
        formData.value = {
            code: newValue.code || '',
            name: newValue.name || '',
            description: newValue.description || ''
        }
    } else {
        formData.value = {
            code: '',
            name: '',
            description: ''
        }
    }
}, { immediate: true })

const closeModal = () => {
    emit('close')
}

const handleSave = () => {
    // 유효성 검사
    if (!formData.value.code || !formData.value.code.trim()) {
        alert('타입 코드를 입력해주세요.')
        return
    }

    if (!formData.value.name || !formData.value.name.trim()) {
        alert('타입명을 입력해주세요.')
        return
    }

    // 수정 시에는 code 제외
    const data = props.codeType
        ? {
            name: formData.value.name.trim(),
            description: formData.value.description?.trim() || null
        }
        : {
            code: formData.value.code.trim(),
            name: formData.value.name.trim(),
            description: formData.value.description?.trim() || null
        }

    emit('save', data)
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
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #9ca3af;
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

.modal-close:hover {
    background: #f3f4f6;
    color: #111827;
}

.modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
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
    content: ' *';
    color: #dc2626;
}

.form-input,
.form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: #4C4CDD;
}

.form-input:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
}

.form-hint {
    margin-top: 6px;
    font-size: 12px;
    color: #6b7280;
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn {
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
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
    background: #3d3dc4;
}
</style>
