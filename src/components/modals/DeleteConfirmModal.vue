<template>
    <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
            <div class="modal-header">
                <div class="header-icon warning">⚠️</div>
                <h2 class="modal-title">{{ title || '삭제 확인' }}</h2>
            </div>

            <div class="modal-body">
                <p class="message">{{ message }}</p>

                <div v-if="warnings && warnings.length > 0" class="warnings">
                    <p class="warnings-title">⚠️ 주의사항:</p>
                    <ul class="warnings-list">
                        <li v-for="(warning, index) in warnings" :key="index">
                            {{ warning }}
                        </li>
                    </ul>
                </div>

                <p class="confirm-text">정말로 삭제하시겠습니까?</p>
            </div>

            <div class="modal-footer">
                <button class="btn btn-cancel" @click="closeModal">취소</button>
                <button class="btn btn-danger" @click="handleConfirm">삭제</button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    visible: Boolean,
    title: String,
    message: String,
    warnings: Array
})

const emit = defineEmits(['close', 'confirm'])

const closeModal = () => {
    emit('close')
}

const handleConfirm = () => {
    emit('confirm')
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
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.header-icon {
    font-size: 48px;
}

.modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    text-align: center;
}

.modal-body {
    padding: 24px;
}

.message {
    font-size: 15px;
    color: #374151;
    line-height: 1.6;
    margin-bottom: 20px;
}

.warnings {
    background: #fef3c7;
    border: 1px solid #fbbf24;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
}

.warnings-title {
    font-size: 14px;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 12px;
}

.warnings-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.warnings-list li {
    font-size: 13px;
    color: #78350f;
    line-height: 1.6;
    padding-left: 20px;
    position: relative;
    margin-bottom: 6px;
}

.warnings-list li:before {
    content: "•";
    position: absolute;
    left: 8px;
    font-weight: bold;
}

.warnings-list li:last-child {
    margin-bottom: 0;
}

.confirm-text {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    text-align: center;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn {
    padding: 10px 24px;
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

.btn-danger {
    background: #dc2626;
    color: white;
}

.btn-danger:hover {
    background: #b91c1c;
}
</style>
