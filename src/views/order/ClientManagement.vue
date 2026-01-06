<template>
    <div class="client-management-page">
        <div class="page-header">
            <div>
                <h1 class="page-title">고객사 관리</h1>
                <p class="page-description">고객사 정보 및 거래 내역을 조회합니다.</p>
            </div>
        </div>

        <div class="content-wrapper">
            <div class="table-container">
                <table class="client-table">
                    <thead>
                        <tr>
                            <th class="col-no">No</th>
                            <th class="col-company">회사명</th>
                            <th class="col-address">주소</th>
                            <th class="col-manager">담당자</th>
                            <th class="col-contact">연락처</th>
                            <th class="col-credit">여신한도</th>
                            <th class="col-unpaid">미수금</th>
                            <th class="col-available">주문가능금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(client, index) in clients"
                            :key="client.id"
                            @click="goToDetail(client.id)"
                            class="clickable-row"
                        >
                            <td class="col-no text-center">{{ index + 1 }}</td>
                            <td class="col-company">
                                <span class="company-name">{{ client.companyName }}</span>
                            </td>
                            <td class="col-address">{{ client.address || '-' }}</td>
                            <td class="col-manager text-center">{{ client.managerName || '-' }}</td>
                            <td class="col-contact text-center">{{ client.managerContact || '-' }}</td>
                            <td class="col-credit text-right">{{ formatNumber(client.creditLimit) }}</td>
                            <td class="col-unpaid text-right">{{ formatNumber(client.receivables) }}</td>
                            <td class="col-available text-right">
                                <span class="available-amount" :class="{ warning: client.unpaidAmount < 0 }">
                                    {{ formatNumber(client.unpaidAmount) }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="clients.length === 0" class="no-data">
                    등록된 고객사가 없습니다.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClientList } from '@/api/client/client'

const router = useRouter()
const clients = ref([])

const loadClients = async () => {
    try {
        clients.value = await getClientList()
    } catch (error) {
        console.error('고객사 목록 조회 실패:', error)
        alert('고객사 목록을 불러오는데 실패했습니다.')
    }
}

const formatNumber = (value) => {
    if (value == null) return '-'
    return value.toLocaleString('ko-KR')
}

const goToDetail = (clientId) => {
    router.push(`/order/clients/${clientId}`)
}

onMounted(() => {
    loadClients()
})
</script>

<style scoped>
.client-management-page {
    padding: 24px;
    background: #f9fafb;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 24px;
}

.page-title {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}

.content-wrapper {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table-container {
    overflow-x: auto;
}

.client-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.client-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.client-table th {
    padding: 12px 16px;
    text-align: center;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
}

.client-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: all 0.15s;
}

.client-table tbody tr.clickable-row {
    cursor: pointer;
}

.client-table tbody tr.clickable-row:hover {
    background: #f0f4ff;
    transform: scale(1.001);
}

.client-table td {
    padding: 16px 16px;
    color: #111827;
}

/* 컬럼 너비 및 정렬 */
th.col-no,
td.col-no {
    width: 60px;
    text-align: center !important;
}

th.col-company,
td.col-company {
    width: 180px;
    text-align: left !important;
}

th.col-address,
td.col-address {
    width: 200px;
    text-align: left !important;
}

th.col-manager,
td.col-manager {
    width: 100px;
    text-align: center !important;
}

th.col-contact,
td.col-contact {
    width: 150px;
    text-align: center !important;
}

th.col-credit,
td.col-credit,
th.col-unpaid,
td.col-unpaid,
th.col-available,
td.col-available {
    width: 140px;
    text-align: right !important;
}


/* 텍스트 정렬 */
.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

/* 회사명 스타일 */
.company-name {
    font-weight: 600;
    color: #4C4CDD;
}

/* 주문가능금액 경고 */
.available-amount {
    font-weight: 600;
}

.available-amount.warning {
    color: #dc2626;
}


/* 빈 데이터 */
.no-data {
    padding: 60px 20px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
}
</style>
