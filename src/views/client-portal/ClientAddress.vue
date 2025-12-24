<template>
    <div class="client-address-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <div class="breadcrumb">고객포털 > 배송지관리</div>
                <h1 class="page-title">배송지 관리</h1>
                <p class="page-description">납품할 배송지 정보를 조회 및 관리할 수 있습니다.</p>
            </div>
        </div>

        <!-- 검색 영역 -->
        <div class="search-section">
            <div class="search-row">
                <input
                    v-model="searchKeyword"
                    type="text"
                    placeholder="예: 평택 제2공장 / 박명수"
                    class="search-input"
                    @keyup.enter="searchAddresses"
                />
                <button class="search-btn" @click="searchAddresses">검색</button>
                <button class="add-btn" @click="openAddModal">+ 신규 배송지 등록</button>
            </div>
        </div>

        <!-- 배송지 목록 -->
        <div class="addresses-section">
            <div class="section-header">
                <h2 class="section-title">배송지 목록</h2>
            </div>

            <table class="addresses-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align: center;">No</th>
                        <th style="width: 200px;">배송지명</th>
                        <th style="width: auto;">상세 주소</th>
                        <th style="width: 120px;">수령 담당자명</th>
                        <th style="width: 150px;">연락처</th>
                        <th style="width: 120px; text-align: center;">비고</th>
                        <th style="width: 150px; text-align: center;">관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(address, index) in addresses" :key="address.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ address.name }}</td>
                        <td>{{ address.address }}</td>
                        <td>{{ address.recipientName }}</td>
                        <td>{{ address.recipientContact }}</td>
                        <td class="text-center">
                            <span v-if="address.isDefault || address.default" class="status-badge status-default">
                                기본 배송지
                            </span>
                            <!-- 디버깅: {{ address }} -->
                        </td>
                        <td class="text-center">
                            <div class="action-buttons">
                                <button class="action-btn edit-btn" @click="openEditModal(address)">
                                    수정
                                </button>
                                <button
                                    class="action-btn delete-btn"
                                    @click="deleteAddress(address.id)"
                                >
                                    삭제
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="addresses.length === 0">
                        <td colspan="7" class="text-center empty-message">
                            등록된 배송지가 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 배송지 등록/수정 모달 -->
        <ClientAddressModal
            :is-open="isModalOpen"
            :address-data="selectedAddress"
            @close="closeModal"
            @submit="handleSubmit"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import {
    getClientAddresses,
    createClientAddress,
    updateClientAddress,
    deleteClientAddress as deleteAddressAPI
} from '@/api/clientAddress'
import ClientAddressModal from '@/components/client/ClientAddressModal.vue'

const userStore = useUserStore()

const searchKeyword = ref('')
const addresses = ref([])
const allAddresses = ref([])

// 모달 관련
const isModalOpen = ref(false)
const selectedAddress = ref(null)

// 데이터 조회
const loadAddresses = async () => {
    try {
        const clientId = userStore.getClientId || 1
        allAddresses.value = await getClientAddresses(clientId)
        console.log('조회된 배송지 목록:', allAddresses.value)
        searchAddresses()
    } catch (error) {
        console.error('배송지 조회 실패:', error)
        allAddresses.value = []
        addresses.value = []
    }
}

// 검색 (프론트엔드 필터링)
const searchAddresses = () => {
    if (!searchKeyword.value.trim()) {
        addresses.value = allAddresses.value
        return
    }

    const keyword = searchKeyword.value.toLowerCase()
    addresses.value = allAddresses.value.filter(addr =>
        addr.name?.toLowerCase().includes(keyword) ||
        addr.address?.toLowerCase().includes(keyword) ||
        addr.recipientName?.toLowerCase().includes(keyword) ||
        addr.recipientContact?.toLowerCase().includes(keyword)
    )
}

// 신규 등록 모달 열기
const openAddModal = () => {
    selectedAddress.value = null
    isModalOpen.value = true
}

// 수정 모달 열기
const openEditModal = (address) => {
    selectedAddress.value = { ...address }
    isModalOpen.value = true
}

// 모달 닫기
const closeModal = () => {
    isModalOpen.value = false
    selectedAddress.value = null
}

// 배송지 등록/수정 처리
const handleSubmit = async (formData) => {
    try {
        const clientId = userStore.getClientId || 1

        console.log('전송할 데이터:', formData)
        console.log('클라이언트 ID:', clientId)

        if (formData.id) {
            // 수정
            await updateClientAddress(clientId, formData.id, formData)
            alert('배송지가 수정되었습니다.')
        } else {
            // 신규 등록
            await createClientAddress(clientId, formData)
            alert('배송지가 등록되었습니다.')
        }

        closeModal()
        loadAddresses()
    } catch (error) {
        console.error('배송지 저장 실패:', error)
        console.error('에러 응답:', error.response?.data)
        console.error('에러 상태:', error.response?.status)

        // 백엔드 에러 메시지 표시
        const errorMessage = error.response?.data?.message || '배송지 저장에 실패했습니다.'
        alert(errorMessage)
    }
}


// 배송지 삭제
const deleteAddress = async (addressId) => {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) {
        return
    }

    try {
        const clientId = userStore.getClientId || 1
        await deleteAddressAPI(clientId, addressId)
        alert('배송지가 삭제되었습니다.')
        loadAddresses()
    } catch (error) {
        console.error('배송지 삭제 실패:', error)
        alert('배송지 삭제에 실패했습니다.')
    }
}

// 초기 로드
onMounted(() => {
    loadAddresses()
})
</script>

<style scoped>
.client-address-page {
    padding: 5px;
    width: 100%;
}

/* 페이지 헤더 */
.page-header {
    margin-bottom: 32px;
}

.breadcrumb {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 8px;
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

/* 검색 영역 */
.search-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.search-row {
    display: flex;
    gap: 12px;
}

.search-input {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
}

.search-input:focus {
    outline: none;
    border-color: #4C4CDD;
}

.search-btn,
.add-btn {
    padding: 10px 24px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.search-btn {
    background: #4C4CDD;
    color: #ffffff;
}

.search-btn:hover {
    background: #3d3dbb;
}

.add-btn {
    background: #10b981;
    color: #ffffff;
}

.add-btn:hover {
    background: #059669;
}

/* 배송지 목록 영역 */
.addresses-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

/* 테이블 */
.addresses-table {
    width: 100%;
    border-collapse: collapse;
}

.addresses-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.addresses-table th {
    padding: 12px 16px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.addresses-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
    vertical-align: middle;
}

.addresses-table tbody tr:hover {
    background: #f9fafb;
}

.text-center {
    text-align: center;
}

/* 상태 뱃지 */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-default {
    background: #dbeafe;
    color: #1e40af;
}

/* 액션 버튼 */
.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
}

.action-btn {
    padding: 8px 20px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    min-width: 60px;
}

.edit-btn {
    background: #4C4CDD;
    color: #ffffff;
}

.edit-btn:hover {
    background: #3d3dbb;
}

.delete-btn {
    background: #ef4444;
    color: #ffffff;
}

.delete-btn:hover {
    background: #dc2626;
}

/* 빈 메시지 */
.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}
</style>
