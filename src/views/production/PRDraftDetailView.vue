<template>
    <div class="draft-page">
        <nav class="breadcrumb">
            <span class="link" @click="router.push('/production/requests')">
                생산요청 목록
            </span>
            <span class="separator">›</span>
            <span>임시저장 상세</span>
        </nav>

        <h1>생산요청 임시저장 상세</h1>

        <div class="content-card">

            <h2>기본 정보</h2>
            <div class="meta-box">
                <div>
                    <span class="label">주문번호</span>
                    <span class="value">{{ soCode }}</span>
                </div>

                <div>
                    <span class="label">고객사</span>
                    <span class="value">{{ clientName }}</span>
                </div>
            </div>

            <section>
                <label>납기일</label>
                <input type="date" v-model="dueAt" @change="isDirty = true" />

                <label>사유</label>
                <textarea v-model="reason" @input="isDirty = true" />
            </section>

            <h2>품목 정보</h2>
            <table>
                <thead>
                    <tr>
                        <th>품목명</th>
                        <th>주문수량</th>
                        <th>가용재고</th>
                        <th>필요수량</th>
                        <th>생산요청수량</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="i in items" :key="i.soItemId">
                        <td>{{ i.itemName }}</td>
                        <td>{{ i.orderQuantity }}</td>
                        <td>{{ i.availableStock }}</td>
                        <td>{{ i.requiredQuantity }}</td>
                        <td>
                            <input type="number" v-model.number="i.requestedQuantity"
                                @change="() => { normalize(i); isDirty = true }"
                                :class="{ over: i.requestedQuantity > i.requiredQuantity }" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="footer">
                <!-- 왼쪽 그룹 -->
                <div class="footer-left">
                    <span class="total">총 수량: {{ totalQuantity }}</span>
                    <span class="save-status">
                        <span v-if="isDirty" class="saving">저장 중...</span>
                        <span v-else class="saved">임시저장됨</span>
                    </span>
                </div>

                <!-- 오른쪽 그룹 -->
                <div class="action-buttons">
                    <button @click="router.push('/production/requests')">
                        취소
                    </button>
                    <button :disabled="totalQuantity === 0" @click="confirmRequest">
                        생산요청 확정
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    getPRDraftDetail,
    updatePRDraft,
    requestProduction
} from '@/api/production/productionRequest'

const route = useRoute()
const router = useRouter()
const prId = Number(route.params.prId)

const soCode = ref('')
const clientName = ref('')
const dueAt = ref('')
const reason = ref('')
const items = ref([])
const isDirty = ref(false)

onMounted(async () => {
    const res = await getPRDraftDetail(prId)

    console.log(res)
    soCode.value = res.soCode
    clientName.value = res.clientName

    dueAt.value = res.dueAt?.slice(0, 10)
    reason.value = res.reason
    items.value = res.items.map(i => ({ ...i }))
})


const totalQuantity = computed(() =>
    items.value.reduce((s, i) => s + (i.requestedQuantity || 0), 0)
)

const normalize = (i) => {
    if (i.requestedQuantity < 0) {
        i.requestedQuantity = 0
    }
}

const debounce = (fn, delay = 800) => {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            fn(...args)
        }, delay)
    }
}

watch(
    [dueAt, reason, items],
    debounce(async () => {
        if (!isDirty.value) return

        await updatePRDraft(prId, {
            dueAt: dueAt.value,
            reason: reason.value,
            items: items.value.map(i => ({
                soItemId: i.soItemId,
                quantity: i.requestedQuantity
            }))
        })

        isDirty.value = false
    }, 800),
    { deep: true }
)


const confirmRequest = async () => {
    if (!confirm('생산요청을 확정하시겠습니까?')) return

    if (isDirty.value) {
        await updatePRDraft(prId, {
            dueAt: dueAt.value,
            reason: reason.value,
            items: items.value.map(i => ({
                soItemId: i.soItemId,
                quantity: i.requestedQuantity
            }))
        })
        isDirty.value = false
    }

    await requestProduction(prId)
    router.push(`/production/requests/${prId}`)
}
</script>

<style scoped>
/* ===== 페이지 ===== */
.draft-page {
    max-width: 1100px;
    margin: 0 auto;
}

.draft-page h1 {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 24px;
    color: #111827;
}

h2 {
    font-size: 17px;
    font-weight: 550;
    margin-bottom: 12px;
    color: #111827;
}

/* ===== 콘텐츠 카드 ===== */
.content-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}


/* ===== 기본 정보 영역 ===== */

section {
    background: #ffffff;
    /* border: 1px solid #e5e7eb; */
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;

    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 16px 20px;
    align-items: center;
}

section label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

section input[type="date"],
section textarea {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

section textarea {
    resize: vertical;
    min-height: 80px;
}

/* ===== 테이블 ===== */
table {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
}

thead {
    background: #f9fafb;
}

th {
    padding: 12px 14px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
}

td {
    padding: 12px 14px;
    font-size: 14px;
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
    color: #111827;
}

tbody tr:hover {
    background: #f9fafb;
}

/* 숫자 정렬 */
td:nth-child(2),
td:nth-child(3),
td:nth-child(4),
td:nth-child(5) {
    text-align: center;
}

/* 입력 */
td input[type="number"] {
    width: 100px;
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    text-align: center;
}

td input[type="number"]:focus {
    outline: none;
    border-color: #4C4CDD;
}

/* ===== 하단 액션 영역 ===== */
.footer {
    margin-top: 20px;
    padding: 16px 20px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.footer-left .total {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
}

.save-status {
    font-size: 13px;
    font-weight: 500;
}

/* ===== 하단 버튼 그룹 ===== */
.action-buttons {
    display: flex;
    gap: 8px;
}


/* 버튼 */
.footer button {
    padding: 10px 18px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
}

.footer button:first-of-type {
    background: #ffffff;
    border: 1px solid #d1d5db;
    color: #374151;
}

.footer button:first-of-type:hover {
    background: #f9fafb;
}

.footer button:last-of-type {
    background: #4C4CDD;
    border: none;
    color: #ffffff;
    margin-left: 8px;
}

.footer button:last-of-type:hover {
    background: #3d3dbb;
}

.footer button:disabled {
    background: #c7c7f7;
    cursor: not-allowed;
}

/* ===== 브레드크럼 ===== */
.breadcrumb {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
}

.breadcrumb .link {
    color: #4C4CDD;
    cursor: pointer;
    font-weight: 500;
}

.breadcrumb .link:hover {
    text-decoration: underline;
}

.breadcrumb .separator {
    margin: 0 6px;
    color: #9ca3af;
}

/* 필요수량 초과 경고 */
td input.over {
    border-color: #dc2626;
    background: #fee2e2;
}

/* ===== 상단 메타 정보 ===== */
.meta-box {
    display: flex;
    gap: 40px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
}

.meta-box .label {
    font-size: 12px;
    color: #6b7280;
    margin-right: 8px;
}

.meta-box .value {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

.save-status .saving {
    color: #9ca3af;
}

.save-status .saved {
    color: #16a34a;
}
</style>