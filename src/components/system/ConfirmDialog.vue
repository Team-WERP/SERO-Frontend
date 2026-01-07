<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <div class="dialog-container">
            <div class="dialog-icon-wrapper" :class="iconClass">
                <span class="dialog-icon">{{ icon }}</span>
            </div>

            <h3 class="dialog-title">{{ title }}</h3>
            <p class="dialog-message">{{ message }}</p>

            <div class="dialog-footer">
                <button class="btn btn-cancel" @click="close">취소</button>
                <button class="btn btn-danger" @click="confirm">{{ confirmText }}</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        default: '확인'
    },
    message: {
        type: String,
        default: '정말 진행하시겠습니까?'
    },
    confirmText: {
        type: String,
        default: '확인'
    },
    type: {
        type: String,
        default: 'warning', // warning, danger, info
        validator: (value) => ['warning', 'danger', 'info'].includes(value)
    }
})

const emit = defineEmits(['close', 'confirm'])

const iconClass = computed(() => {
    const classMap = {
        warning: 'icon-warning',
        danger: 'icon-danger',
        info: 'icon-info'
    }
    return classMap[props.type]
})

const icon = computed(() => {
    const iconMap = {
        warning: '⚠',
        danger: '⚠',
        info: 'ℹ'
    }
    return iconMap[props.type]
})

const close = () => {
    emit('close')
}

const confirm = () => {
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
    justify-content: center;
    align-items: center;
    z-index: 1100;
}

.dialog-container {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    padding: 32px 24px 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: dialogSlideIn 0.2s ease-out;
    text-align: center;
}

@keyframes dialogSlideIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.dialog-icon-wrapper {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dialog-icon-wrapper.icon-warning {
    background: #fef3c7;
}

.dialog-icon-wrapper.icon-danger {
    background: #fee2e2;
}

.dialog-icon-wrapper.icon-info {
    background: #dbeafe;
}

.dialog-icon {
    font-size: 32px;
}

.dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 12px;
}

.dialog-message {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 24px;
    white-space: pre-line;
    word-break: keep-all;
}

.dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.btn {
    flex: 1;
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

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}
</style>
