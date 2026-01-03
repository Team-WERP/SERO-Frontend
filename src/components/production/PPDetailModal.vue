<template>
    <div class="modal-backdrop" @click.self="emit('close')">
        <div class="modal">

            <!-- PP DETAIL -->
            <div class="pp-section" v-if="detail">
                <div class="modal-top">
                    <div class="modal-title">🗓️ {{ detail.ppCode }}</div>
                    <button class="close-btn" @click="emit('close')">✕</button>
                </div>

                <div class="pp-grid">
                    <div class="k">기간</div>
                    <div class="v">
                        {{ detail.startDate }} ~ {{ detail.endDate }}
                    </div>

                    <div class="k">계획 수량</div>
                    <div class="v">
                        {{ formatNumber(detail.productionQuantity) }} {{ detail.unit }}
                    </div>

                    <div class="k">생산 라인</div>
                    <div class="v">{{ detail.productionLineName }}</div>
                </div>
            </div>

            <!-- PR SUMMARY -->
            <div class="pr-summary" v-if="detail">
                <div class="section-title">관련 생산요청</div>

                <div class="pr-grid">
                    <div class="k">생산요청 번호</div>
                    <div class="v">
                        <div class="pr-link" @click="goPR">{{ detail.prCode }}</div>
                    </div>

                    <div class="k">품목</div>
                    <div class="v">{{ detail.itemName }}</div>

                    <div class="k">요청 수량</div>
                    <div class="v">
                        {{ formatNumber(detail.requestedQuantity) }} {{ detail.unit }}
                    </div>

                    <div class="k">납기 기한</div>
                    <div class="v">{{ detail.dueAt }}</div>
                </div>
            </div>



        </div>
    </div>
</template>


<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProductionPlanDetail } from '@/api/production/productionPlan'

const emit = defineEmits(['close'])
const router = useRouter()

const props = defineProps({
    ppId: {
        type: Number,
        required: true
    }
})

const detail = ref(null)

const loadDetail = async () => {
    if (!props.ppId) return
    detail.value = await getProductionPlanDetail(props.ppId)
}

const formatNumber = (v) => {
    if (v == null) return '-'
    return Number(v).toLocaleString()
}

const goPR = () => {
    if (!detail.value?.prId) return

    const route = router.resolve({
        path: `/production/requests/${detail.value.prId}`,
        params: { prId: detail.value.prId }

    })

    window.open(route.href, '_blank')
}

watch(() => props.ppId, loadDetail, { immediate: true })
</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: rgba(17, 24, 39, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
}

/* Modal */
.modal {
    width: 520px;
    max-width: 100%;
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
    padding: 18px 20px;
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

.close-btn {
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
}

/* Body */
.modal-body {
    font-size: 14px;
    color: #374151;
}

.row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.row span {
    color: #6b7280;
    font-weight: 600;
}

.row strong {
    font-weight: 700;
}

.pr-summary {
    margin-top: 22px;
    margin-bottom: 14px;
}

.pr-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.pr-code {
    font-size: 6px;
    font-weight: 700;
    color: #111827;
}

.pr-link {
    font-weight: 400;
    color: #4c4cdd;
    background: none;
    border: none;
    cursor: pointer;
}

.pr-link:hover {
    text-decoration: underline;
}

.pr-grid,
.pp-grid {
    display: grid;
    grid-template-columns: 120px 1fr;
    row-gap: 8px;
    align-items: center;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #374151;
}

.k {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
}

.v {
    font-size: 14px;
    font-weight: 400;
    color: #111827;
}

/* Modal Top Header */
.modal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.modal-title {
    font-size: 18px;
    font-weight: 800;
    color: #111827;
}

.close-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: #f3f4f6;
    color: #374151;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
}

.close-btn:hover {
    background: #e5e7eb;
}
</style>
