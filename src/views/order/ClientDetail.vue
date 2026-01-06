<template>
    <div class="client-detail-page">
        <div class="page-header">
            <div class="breadcrumb">
                <span class="breadcrumb-item" @click="goBack">고객사 관리</span>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item active">고객사 상세</span>
            </div>
            <h1 class="page-title">{{ client?.companyName }}</h1>
        </div>

        <div v-if="loading" class="loading">로딩 중...</div>

        <div v-else-if="client" class="content-wrapper">
            <!-- 3단 레이아웃 -->
            <div class="three-columns">
                <!-- 좌측: 고객사 기본 정보 -->
                <div class="info-card">
                    <h2 class="card-title">고객사 기본 정보</h2>
                    <div class="info-list">
                        <div class="info-row">
                            <span class="label">상호명</span>
                            <span class="value">{{ client.companyName || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">주소</span>
                            <span class="value">{{ getMainAddress() }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">업태/종목</span>
                            <span class="value">{{ client.businessType || '-' }} / {{ client.businessItem || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">사업자등록번호</span>
                            <span class="value">{{ client.businessNumber || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">대표 전화</span>
                            <span class="value">{{ client.phoneNumber || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">대표자</span>
                            <span class="value">{{ client.ceoName || '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- 중앙: 고객사 담당자 정보 -->
                <div class="info-card">
                    <h2 class="card-title">고객사 담당자 정보</h2>
                    <div class="info-list">
                        <div class="info-row">
                            <span class="label">담당자명</span>
                            <span class="value">{{ client.managerName || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">담당자 연락처</span>
                            <span class="value">{{ client.managerContact || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">담당자 이메일</span>
                            <span class="value">{{ client.managerEmail || '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- 우측: 여신 정보 -->
                <div class="info-card">
                    <h2 class="card-title">
                        여신 정보
                        <span class="check-badge" v-if="client.unpaidAmount >= 0">주문 가능</span>
                    </h2>
                    <div class="info-list">
                        <div class="info-row">
                            <span class="label">여신 한도</span>
                            <span class="value amount">{{ formatNumber(client.creditLimit) }} 원</span>
                        </div>
                        <div class="info-row">
                            <span class="label">미수금</span>
                            <span class="value amount">{{ formatNumber(client.receivables) }} 원</span>
                        </div>
                        <div class="info-row">
                            <span class="label">주문 가능 금액</span>
                            <span class="value amount available" :class="{ warning: client.unpaidAmount < 0 }">
                                {{ formatNumber(client.unpaidAmount) }} 원
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 거래 품목 정보 -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">
                        거래 품목 정보
                        <span class="item-count">총 {{ client.items?.length || 0 }}건</span>
                    </h2>
                    <button class="btn-add" @click="openItemModal">+ 품목 추가</button>
                </div>

                <div class="table-container">
                    <table class="item-table">
                        <thead>
                            <tr>
                                <th class="col-no">No</th>
                                <th class="col-code">품목코드</th>
                                <th class="col-name">품목명</th>
                                <th class="col-spec">규격</th>
                                <th class="col-price">기본단가</th>
                                <th class="col-contract">고객사 단가</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(item, index) in client.items"
                                :key="item.id"
                                @click="openPriceModal(item)"
                                class="clickable-row"
                            >
                                <td class="col-no">{{ index + 1 }}</td>
                                <td class="col-code">{{ item.itemCode }}</td>
                                <td class="col-name">{{ item.itemName }}</td>
                                <td class="col-spec">{{ item.spec || '-' }}</td>
                                <td class="col-price">{{ formatNumber(item.unitPrice) }}</td>
                                <td class="col-contract">{{ formatNumber(item.contractPrice) }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="!client.items || client.items.length === 0" class="no-data">
                        등록된 거래 품목이 없습니다.
                    </div>
                </div>
            </div>
        </div>

        <!-- 품목 추가 모달 -->
        <ClientItemModal
            :is-open="isItemModalOpen"
            :client-id="clientId"
            :existing-item-ids="existingItemIds"
            @close="closeItemModal"
            @saved="handleItemSaved"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getClientDetail } from '@/api/client/client'
import ClientItemModal from './ClientItemModal.vue'

const router = useRouter()
const route = useRoute()
const clientId = computed(() => parseInt(route.params.clientId))

const client = ref(null)
const loading = ref(true)
const isItemModalOpen = ref(false)

// 이미 등록된 품목 ID 목록 (모달에서 제외용)
const existingItemIds = computed(() => {
    return client.value?.items?.map(item => item.itemId) || []
})

const loadClientDetail = async () => {
    try {
        loading.value = true
        client.value = await getClientDetail(clientId.value)
    } catch (error) {
        console.error('고객사 상세 조회 실패:', error)
        alert('고객사 정보를 불러오는데 실패했습니다.')
    } finally {
        loading.value = false
    }
}

const getMainAddress = () => {
    if (!client.value?.addresses || client.value.addresses.length === 0) return '-'
    const mainAddress = client.value.addresses.find(addr => addr.isDefault)
    return mainAddress?.address || client.value.addresses[0]?.address || '-'
}

const formatNumber = (value) => {
    if (value == null) return '-'
    return value.toLocaleString('ko-KR')
}

const goBack = () => {
    router.push('/order/clients')
}

const openItemModal = () => {
    isItemModalOpen.value = true
}

const closeItemModal = () => {
    isItemModalOpen.value = false
}

const handleItemSaved = () => {
    closeItemModal()
    loadClientDetail()
}

const openPriceModal = (item) => {
    // TODO: 단가 수정 모달 구현
    alert(`단가 수정 기능은 추후 구현 예정입니다.\n품목: ${item.itemName}`)
}

onMounted(() => {
    loadClientDetail()
})
</script>

<style scoped>
.client-detail-page {
    padding: 24px;
    background: #f9fafb;
    min-height: 100vh;
}

.page-header {
    margin-bottom: 20px;
}

.breadcrumb {
    font-size: 12px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.breadcrumb-item {
    color: #6b7280;
    cursor: pointer;
    transition: color 0.15s;
}

.breadcrumb-item:hover {
    color: #4C4CDD;
}

.breadcrumb-item.active {
    color: #111827;
    font-weight: 500;
    cursor: default;
}

.breadcrumb-item.active:hover {
    color: #111827;
}

.breadcrumb-separator {
    color: #d1d5db;
    font-size: 13px;
}

.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.loading {
    text-align: center;
    padding: 60px 20px;
    color: #6b7280;
    font-size: 14px;
}

.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 3단 레이아웃 */
.three-columns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.info-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-title {
    font-size: 15px;
    font-weight: 700;
    color: #4C4CDD;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.check-badge {
    padding: 3px 8px;
    background: #dcfce7;
    color: #166534;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-row .label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    line-height: 1.3;
}

.info-row .value {
    font-size: 14px;
    color: #111827;
    line-height: 1.4;
}

.info-row .value.amount {
    font-size: 15px;
    font-weight: 600;
}

.info-row .value.amount.available {
    color: #4C4CDD;
}

.info-row .value.warning {
    color: #dc2626;
}

/* 거래 품목 섹션 */
.section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 10px;
}

.item-count {
    padding: 3px 10px;
    background: #f3f4f6;
    color: #6b7280;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
}

.btn-add {
    padding: 10px 20px;
    background: #4C4CDD;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-add:hover {
    background: #3d3dbb;
}

.table-container {
    overflow-x: auto;
}

.item-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.item-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.item-table th {
    padding: 12px 16px;
    text-align: center;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
}

.item-table tbody tr {
    border-bottom: 1px solid #e5e7eb;
    transition: all 0.15s;
}

.item-table tbody tr.clickable-row {
    cursor: pointer;
}

.item-table tbody tr.clickable-row:hover {
    background: #f0f4ff;
}

.item-table td {
    padding: 12px 16px;
    color: #111827;
}

th.col-no,
td.col-no {
    width: 50px;
    text-align: center !important;
}

th.col-code,
td.col-code {
    width: 140px;
    text-align: left !important;
}

th.col-name,
td.col-name {
    width: 280px;
    text-align: left !important;
}

th.col-spec,
td.col-spec {
    width: 220px;
    text-align: left !important;
}

th.col-price,
td.col-price,
th.col-contract,
td.col-contract {
    width: 140px;
    text-align: right !important;
}

.no-data {
    padding: 60px 20px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
}
</style>
