<template>
    <div class="gi-create-page">
        <div class="header-actions">
            <button @click="goBack" class="back-btn">← 목록으로 돌아가기</button>
            <button @click="submitGoodsIssue" :disabled="!formData.warehouseId || submitting" class="submit-btn">
                {{ submitting ? '등록 중...' : '등록' }}
            </button>
        </div>

        <h1 class="page-title">출고지시</h1>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
                <div>로딩 중...</div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="error-state">
                <div class="error-message">{{ error }}</div>
                <button @click="goBack" class="back-btn">목록으로 돌아가기</button>
            </div>

            <!-- Form -->
            <div v-else class="form-container">
                <!-- 출고지시 번호 & 동특 시 생성 -->
                <div class="info-row">
                    <div class="info-item">
                        <label>출고지시 번호</label>
                        <span class="value">등록 시 생성</span>
                    </div>
                    <div class="info-item">
                        <label>납품서 번호</label>
                        <span class="value">{{ deliveryOrder.doCode }}</span>
                    </div>
                </div>

                <!-- 납품서 정보 -->
                <section class="section">
                    <h2 class="section-title">납품서 정보</h2>
                    <table class="info-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>품목코드</th>
                                <th>품목명</th>
                                <th>규격</th>
                                <th>수량</th>
                                <th>단위</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in deliveryOrder.items" :key="index">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.itemCode || '-' }}</td>
                                <td>{{ item.itemName }}</td>
                                <td>{{ item.spec || '-' }}</td>
                                <td class="text-right">{{ item.quantity?.toLocaleString() }}</td>
                                <td>{{ item.unit || '-' }}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="4">총 수량</td>
                                <td class="text-right">{{ totalQuantity }}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <!-- 출고창고 & 특이사항 -->
                <section class="section">
                    <div class="form-grid">
                        <div class="form-field">
                            <label>출고창고 <span class="required">*</span></label>
                            <select v-model="formData.warehouseId" class="select-input">
                                <option value="">창고 선택</option>
                                <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">
                                    {{ warehouse.warehouseName }}
                                </option>
                            </select>
                        </div>

                        <div class="form-field full-width">
                            <label>특이사항</label>
                            <textarea
                                v-model="formData.note"
                                rows="3"
                                class="textarea-input"
                                placeholder="특이사항을 입력하세요"
                            ></textarea>
                        </div>
                    </div>
                </section>
            </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDODetail } from '@/api/shipping/deliveryOrder.js'
import { createGI } from '@/api/shipping/goodsIssue.js'
import { getWarehouses } from '@/api/warehouse/warehouse.js'

const router = useRouter()
const route = useRoute()

const deliveryOrder = ref({
    doCode: '',
    items: []
})
const warehouses = ref([])
const formData = ref({
    doCode: '',
    warehouseId: '',
    note: ''
})
const loading = ref(false)
const error = ref(null)
const submitting = ref(false)

const totalQuantity = computed(() => {
    return deliveryOrder.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

const fetchDeliveryOrderDetail = async (doCode) => {
    try {
        const data = await getDODetail(doCode)
        deliveryOrder.value = data
        formData.value.doCode = data.doCode
    } catch (err) {
        console.error('납품서 조회 실패:', err)
        error.value = '납품서 정보를 불러오는데 실패했습니다.'
        throw err
    }
}

const fetchWarehouses = async () => {
    try {
        warehouses.value = await getWarehouses()
    } catch (err) {
        console.error('창고 목록 조회 실패:', err)
        error.value = '창고 목록을 불러오는데 실패했습니다.'
        throw err
    }
}

const submitGoodsIssue = async () => {
    if (!formData.value.warehouseId) {
        alert('출고 창고를 선택해주세요.')
        return
    }

    if (!confirm('출고지시를 등록하시겠습니까?')) {
        return
    }

    submitting.value = true

    try {
        const response = await createGI({
            doCode: formData.value.doCode,
            warehouseId: formData.value.warehouseId,
            note: formData.value.note || null
        })

        alert(response.message || '출고지시가 등록되었습니다.')

        // 생성된 출고지시 상세 페이지로 이동
        if (response.id) {
            router.push(`/warehouse/goods-issues/${response.id}`)
        } else {
            router.push('/warehouse/goods-issues')
        }
    } catch (err) {
        console.error('출고지시 등록 실패:', err)
        const errorMessage = err.response?.data?.message || '출고지시 등록에 실패했습니다.'
        alert(errorMessage)
    } finally {
        submitting.value = false
    }
}

const goBack = () => {
    router.push('/warehouse/goods-issues')
}

onMounted(async () => {
    const doCode = route.params.doCode

    if (!doCode) {
        error.value = '납품서 번호가 제공되지 않았습니다.'
        return
    }

    loading.value = true
    try {
        await Promise.all([
            fetchDeliveryOrderDetail(doCode),
            fetchWarehouses()
        ])
    } catch (err) {
        // Error already set in individual functions
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.gi-create-page {
    padding: 5px;
    width: 100%;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.back-btn {
    background: none;
    border: none;
    color: #6b7280;
    font-size: 14px;
    cursor: pointer;
    padding: 8px 12px;
}

.back-btn:hover {
    color: #374151;
}

.submit-btn {
    background: #4C4CDD;
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
    background: #3d3dbb;
}

.submit-btn:disabled {
    background: #d1d5db;
    cursor: not-allowed;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 24px;
}

/* 로딩 & 에러 */
.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #6b7280;
}

.error-message {
    color: #dc2626;
    margin-bottom: 16px;
}

/* 폼 */
.form-container {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #e5e7eb;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-item label {
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
}

.info-item .value {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
}

/* 섹션 */
.section {
    margin-bottom: 32px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e5e7eb;
}

/* 테이블 */
.info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
}

.info-table th,
.info-table td {
    padding: 12px 16px;
    text-align: left;
    border: 1px solid #e5e7eb;
    font-size: 14px;
}

.info-table th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
}

.info-table td {
    color: #111827;
}

.info-table .text-right {
    text-align: right;
}

.info-table .total-row {
    background: #f9fafb;
    font-weight: 600;
}

/* 폼 그리드 */
.form-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-field.full-width {
    width: 100%;
}

.form-field label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.required {
    color: #dc2626;
}

.select-input {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    background: white;
    width: 300px;
}

.textarea-input {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
    resize: vertical;
    font-family: inherit;
    width: 100%;
}

.select-input:focus,
.textarea-input:focus {
    outline: none;
    border-color: #4C4CDD;
    box-shadow: 0 0 0 3px rgba(76, 76, 221, 0.1);
}
</style>
