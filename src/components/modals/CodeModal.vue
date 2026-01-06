<template>
    <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">
                    {{ code ? '공통코드 수정' : '공통코드 생성' }}
                </h2>
                <button class="modal-close" @click="closeModal">✕</button>
            </div>

            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label required">타입 코드</label>
                    <input
                        v-model="formData.typeCode"
                        type="text"
                        class="form-input"
                        disabled
                    />
                </div>

                <div class="form-group">
                    <label class="form-label required">코드</label>
                    <input
                        v-model="formData.code"
                        type="text"
                        class="form-input"
                        placeholder="예: DEPT_HR"
                        :disabled="!!code"
                        maxlength="50"
                    />
                    <p class="form-hint">코드는 생성 후 수정할 수 없습니다.</p>
                </div>

                <div class="form-group">
                    <label class="form-label required">코드명</label>
                    <input
                        v-model="formData.name"
                        type="text"
                        class="form-input"
                        placeholder="예: 인사팀"
                        maxlength="100"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">설명</label>
                    <input
                        v-model="formData.description"
                        type="text"
                        class="form-input"
                        placeholder="예: Human Resources Department"
                        maxlength="255"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label">상위 코드</label>
                    <input
                        v-model="formData.parentCode"
                        type="text"
                        class="form-input"
                        placeholder="예: DEPT_MGT (선택사항)"
                        maxlength="50"
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

                <div class="form-group">
                    <label class="form-label required">사용 여부</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input
                                v-model="formData.isUsed"
                                type="radio"
                                :value="true"
                            />
                            <span>사용</span>
                        </label>
                        <label class="radio-label">
                            <input
                                v-model="formData.isUsed"
                                type="radio"
                                :value="false"
                            />
                            <span>미사용</span>
                        </label>
                    </div>
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
    code: Object,
    typeCode: String
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
    typeCode: '',
    code: '',
    name: '',
    description: '',
    parentCode: '',
    sortOrder: 0,
    isUsed: true
})

// code 또는 typeCode가 변경될 때 폼 데이터 초기화
watch([() => props.code, () => props.typeCode], ([newCode, newTypeCode]) => {
    if (newCode) {
        // 수정 모드
        formData.value = {
            typeCode: newTypeCode || '',
            code: newCode.code || '',
            name: newCode.name || '',
            description: newCode.codeNameEng || '',
            parentCode: newCode.ref1 || '',
            sortOrder: newCode.sortOrder || 0,
            isUsed: newCode.isUsed === 'Y'
        }
    } else {
        // 생성 모드
        formData.value = {
            typeCode: newTypeCode || '',
            code: '',
            name: '',
            description: '',
            parentCode: '',
            sortOrder: 0,
            isUsed: true
        }
    }
}, { immediate: true })

const closeModal = () => {
    emit('close')
}

const handleSave = () => {
    // 유효성 검사
    if (!formData.value.typeCode || !formData.value.typeCode.trim()) {
        alert('타입 코드를 선택해주세요.')
        return
    }

    if (!formData.value.code || !formData.value.code.trim()) {
        alert('코드를 입력해주세요.')
        return
    }

    if (!formData.value.name || !formData.value.name.trim()) {
        alert('코드명을 입력해주세요.')
        return
    }

    if (formData.value.sortOrder == null || formData.value.sortOrder < 0) {
        alert('정렬 순서를 입력해주세요.')
        return
    }

    // 데이터 준비
    const data = props.code
        ? {
            // 수정 시
            name: formData.value.name.trim(),
            description: formData.value.description?.trim() || null,
            parentCode: formData.value.parentCode?.trim() || null,
            sortOrder: formData.value.sortOrder,
            isUsed: formData.value.isUsed
        }
        : {
            // 생성 시
            typeCode: formData.value.typeCode.trim(),
            code: formData.value.code.trim(),
            name: formData.value.name.trim(),
            description: formData.value.description?.trim() || null,
            parentCode: formData.value.parentCode?.trim() || null,
            sortOrder: formData.value.sortOrder,
            isUsed: formData.value.isUsed
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
    max-width: 600px;
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

.form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    transition: border-color 0.2s;
}

.form-input:focus {
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

.radio-group {
    display: flex;
    gap: 16px;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #374151;
}

.radio-label input[type="radio"] {
    cursor: pointer;
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
