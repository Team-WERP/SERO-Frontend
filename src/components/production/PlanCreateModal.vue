<!-- src/components/production/PlanCreateModal.vue -->
<template>
    <div class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal">
            <div class="modal-title">생산 일정 설정</div>

            <div v-if="loading" class="loading">불러오는 중...</div>

            <template v-else>
                <!-- info card -->
                <div class="info-card">
                    <div class="info-grid">
                        <div class="k">품목명</div>
                        <div class="v strong">{{ info.itemName || '-' }}</div>

                        <div class="k">생산 라인</div>
                        <div class="v link">
                            <select v-model="form.lineId" class="select">
                                <option disabled value="">라인 선택</option>
                                <option v-for="l in lines" :key="l.lineId" :value="l.lineId">
                                    {{ l.lineName }}
                                </option>
                            </select>
                        </div>

                        <div class="k">생산 수량</div>
                        <div class="v">
                            <input class="input" type="number" min="1" v-model.number="form.productionQuantity" />
                            <span class="unit">ea</span>
                        </div>

                        <div class="k">라인 일일 Capa</div>
                        <div class="v strong">{{ formatNumber(selectedLine?.dailyCapa) }} ea/일</div>
                    </div>
                </div>

                <!-- dates -->
                <div class="date-row">
                    <div class="date-col">
                        <div class="date-label">시작일</div>
                        <input class="date-input" type="date" v-model="form.startDate" />
                    </div>

                    <div class="date-col">
                        <div class="date-label">종료일</div>
                        <input class="date-input" type="date" v-model="form.endDate" />
                    </div>
                </div>

                <!-- validation box (like screenshot) -->
                <div class="validate-box" :class="{ ok: validation.ok, bad: !validation.ok }">
                    <div class="validate-icon">
                        {{ validation.ok ? '✓' : '!' }}
                    </div>
                    <div class="validate-text">
                        {{ validation.message }}
                    </div>
                </div>

                <!-- actions -->
                <div class="actions">
                    <button class="btn ghost" @click="$emit('close')">취소</button>
                    <button class="btn primary" :disabled="!canSubmit" @click="submit">
                        계획 등록
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
    getProductionLines,
    getPRItemPlanning,
    validatePlan,
    createPlan
} from '@/api/production/productionPlan'

const props = defineProps({
    prItemId: { type: Number, required: true },
    month: { type: String, required: true } // 'YYYY-MM' (화면에서 사용)
})

const emit = defineEmits(['close', 'created'])

const loading = ref(true)
const info = ref({})
const lines = ref([])

const form = reactive({
    lineId: '',
    startDate: '',
    endDate: '',
    productionQuantity: null
})



const validation = reactive({
    ok: false,
    message: '라인/기간/수량을 입력해주세요.'
})

const selectedLine = computed(() => {
    const id = Number(form.lineId)
    return lines.value.find(l => l.lineId === id) || null
})

const days = computed(() => {
    if (!form.startDate || !form.endDate) return 0
    const s = new Date(form.startDate)
    const e = new Date(form.endDate)
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0
    if (s > e) return -1
    const diff = Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1
    return diff
})

const canSubmit = computed(() => {
    return (
        validation.ok &&
        form.lineId &&
        form.startDate &&
        form.endDate &&
        form.productionQuantity > 0
    )
})

/**
 * UI용 “일일 생산량” 계산(참고 정보)
 * - 실제 최종 판단은 서버 validate 결과를 신뢰
 */
const dailyQty = computed(() => {
    if (!form.productionQuantity || days.value <= 0) return null
    return Math.ceil(Number(form.productionQuantity) / days.value)
})

/**
 * debounced validate
 */
let timer = null
const runValidate = async () => {
    // 기본 입력 체크
    if (!form.lineId || !form.startDate || !form.endDate || !form.productionQuantity) {
        validation.ok = false
        validation.message = '라인/기간/수량을 입력해주세요.'
        return
    }
    if (days.value === -1) {
        validation.ok = false
        validation.message = '시작일이 종료일보다 이후입니다.'
        return
    }

    // UI 선검증(참고)
    const capa = selectedLine.value?.dailyCapa
    const dq = dailyQty.value
    if (capa != null && dq != null) {
        // 메시지는 서버 검증 전에 먼저 업데이트(UX)
        if (dq <= capa) {
            validation.ok = true
            validation.message = `일일 생산량 ${formatNumber(dq)}ea (Capa 이내)`
        } else {
            validation.ok = false
            validation.message = `일일 생산량 ${formatNumber(dq)}ea (Capa 초과)`
        }
    }

    // 서버 validate (정답)
    try {
        await validatePlan({
            prItemId: props.prItemId,
            productionLineId: Number(form.lineId),
            startDate: form.startDate,
            endDate: form.endDate,
            productionQuantity: Number(form.productionQuantity)
        })

        // 서버 통과 기준으로 ok 확정
        validation.ok = true
        const dq2 = dailyQty.value
        validation.message = dq2 != null
            ? `일일 생산량 ${formatNumber(dq2)}ea (Capa 이내)`
            : '검증 통과'
    } catch (e) {
        validation.ok = false
        validation.message =
            e?.response?.data?.message ||
            e?.message ||
            '검증에 실패했습니다.'
    }
}

watch(
    () => [form.lineId, form.startDate, form.endDate, form.productionQuantity],
    () => {
        clearTimeout(timer)
        timer = setTimeout(runValidate, 180)
    }
)

const submit = async () => {
    try {
        await createPlan({
            prItemId: props.prItemId,
            productionLineId: Number(form.lineId),
            startDate: form.startDate,
            endDate: form.endDate,
            productionQuantity: Number(form.productionQuantity)
        })
        emit('created')
    } catch (e) {
        validation.ok = false
        validation.message =
            e?.response?.data?.message ||
            e?.message ||
            '계획 등록에 실패했습니다.'
    }
}

onMounted(async () => {
    loading.value = true

    // 1) planning info (품목명/요청수량 등)
    // - 백엔드에서 내려주는 DTO에 맞춰 아래 매핑만 조정하면 됨
    const planning = await getPRItemPlanning(props.prItemId)
    info.value = {
        itemName: planning.itemName || planning.materialName || planning.mainItemName || '-'
    }

    // 2) lines
    lines.value = await getProductionLines()

    // 3) default inputs
    // 월의 1일 ~ 말일 기본 세팅(사용자 편의)
    const [y, m] = props.month.split('-')
    const last = new Date(Number(y), Number(m), 0).getDate()
    form.startDate = `${y}-${m}-01`
    form.endDate = `${y}-${m}-${String(last).padStart(2, '0')}`

    // 수량 기본값: planning에 있으면 세팅
    form.productionQuantity =
        planning.requestedQuantity ||
        planning.productionQuantity ||
        null

    // 라인 자동 선택(첫번째)
    if (lines.value.length > 0) {
        form.lineId = lines.value[0].lineId
    }

    loading.value = false
    await runValidate()
})

const formatNumber = (v) => (v != null ? Number(v).toLocaleString() : '-')
</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgba(17, 24, 39, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

/* Modal */
.modal {
    width: 680px;
    max-width: 100%;
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
    padding: 18px 20px;
}

/* Title */
.modal-title {
    font-size: 18px;
    /* ↓ 28 */
    font-weight: 700;
    /* ↓ 900 */
    color: #111827;
    margin-bottom: 12px;
}

/* Loading */
.loading {
    padding: 16px;
    font-size: 13px;
    color: #6b7280;
}

/* Info card */
.info-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px 14px;
    background: #f9fafb;
    margin-bottom: 14px;
}

.info-grid {
    display: grid;
    grid-template-columns: 120px 1fr;
    row-gap: 10px;
    align-items: center;
}

/* Labels */
.k {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
}

/* Values */
.v {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 8px;
}

.v.strong {
    font-weight: 700;
}

.v.link {
    font-size: 13px;
}

/* Inputs */
.select,
.input {
    height: 34px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    background: #fff;
}

.input {
    width: 120px;
}

.unit {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
}

/* Dates */
.date-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
}

.date-label {
    font-size: 12px;
    /* ↓ 18 */
    font-weight: 600;
    /* ↓ 900 */
    color: #374151;
    margin-bottom: 4px;
}

.date-input {
    width: 100%;
    height: 36px;
    /* ↓ 44 */
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
}

/* Validation */
.validate-box {
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px solid transparent;
    margin-bottom: 14px;
    font-size: 13px;
}

.validate-box.ok {
    background: #ecfdf5;
    border-color: rgba(16, 185, 129, 0.25);
    color: #047857;
}

.validate-box.bad {
    background: #fef2f2;
    border-color: rgba(239, 68, 68, 0.25);
    color: #991b1b;
}

.validate-icon {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.7);
}

.validate-text {
    font-size: 13px;
    font-weight: 600;
}

/* Actions */
.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    height: 34px;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
}

.btn.ghost {
    background: #fff;
    border-color: #d1d5db;
    color: #374151;
}

.btn.primary {
    background: #4c4cdd;
    border-color: #4c4cdd;
    color: #fff;
}

.btn.primary:disabled {
    background: #c7c7f7;
    border-color: #c7c7f7;
    cursor: not-allowed;
}
</style>
