<template>
    <div class="do-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div class="header-left">
                <h1 class="page-title">납품서 관리</h1>
                <p class="page-description">
                    확정된 납품서를 조회합니다.
                </p>
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 mb-8">
            <h2 class="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
                필터 및 검색
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end text-sm">
                
                <div class="lg:col-span-2">
                <label class="block mb-2 text-gray-600 text-sm font-semibold uppercase tracking-wide">납품일</label>
                <div class="flex items-center gap-2">
                    <input 
                    type="date" 
                    v-model="startDate" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white"
                    />
                    <span class="text-gray-400 font-bold">~</span>
                    <input 
                    type="date" 
                    v-model="endDate" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white"
                    />
                </div>
                </div>

                <div>
                <label class="block mb-2 text-gray-600 text-sm font-semibold uppercase tracking-wide">상태</label>
                <select 
                    v-model="selectedStatus" 
                    @change="fetchDOList"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all bg-white cursor-pointer"
                >
                    <option value="">전체</option>
                    <option v-for="s in statusFilters" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
                </div>

                <div>
                <label class="block mb-2 text-gray-600 font-semibold text-sm uppercase tracking-wide">납품서번호</label>
                <input 
                    type="text" 
                    v-model="searchKeyword" 
                    placeholder="DO-xxxx" 
                    @keyup.enter="fetchDOList"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-600 outline-none transition-all"
                />
                </div>

                <div>
                <label class="block mb-2 text-gray-600 text-sm font-semibold uppercase tracking-wide">작성자 필터</label>
                <button
                    @click="toggleMyDO"
                    :class="[
                    'w-full py-2 px-2 rounded-lg font-bold text-sm transition-all border outline-none whitespace-nowrap',
                    showOnlyMyDO 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                    ]"
                >
                    {{ showOnlyMyDO ? '내 납품서 보기' : '전체 목록 보기' }}
                </button>
                </div>

                <div class="flex gap-2">
                <button @click="fetchDOList" class="flex-1 bg-indigo-700 text-white px-3 py-2 rounded-lg font-bold hover:bg-indigo-800 transition-all text-sm whitespace-nowrap">
                    검색
                </button>
                <button @click="resetFilters" class="flex-1 bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-bold hover:bg-gray-200 border border-gray-300 transition-all text-sm whitespace-nowrap">
                    초기화
                </button>
                </div>
            </div>
        </div>

        <!-- 납품서 목록 -->
        <div class="items-section">
            <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
            </div>
            <div class="section-header">
                총 <span class="text-indigo-600 font-bold mx-1">{{ doList.length }}</span>건

            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px;">No</th>
                        <th style="width: 160px;">납품서 번호</th>
                        <th style="width: 160px;">수주 번호</th>
                        <th style="width: 200px;">고객사</th>
                        <th style="width: 200px;">품목명</th>
                        <th style="width: 120px;">담당자</th>
                        <th style="width: 130px;">생성일</th>
                        <th style="width: 130px;">납품일</th>
                        <th style="width: 120px;">상태</th>
                    </tr>
                </thead>

                <tbody class="text-center">
                    <tr v-for="(dorder, index) in doList" :key="dorder.doId" class="clickable-row" @click="viewDetail(dorder.doCode)">
                        <td>{{ index + 1 }}</td>

                        <td class="link">
                            {{ dorder.doCode }}
                        </td>

                        <td>{{ dorder.soCode }}</td>
                        <td>{{ dorder.companyName }}</td>
                        <td>
                            <div class="flex items-center justify-center gap-1">
                                <span>{{ dorder.itemName }}</span>
                                <span v-if="dorder.itemCount > 1" class="shrink-0 text-slate-500 text-xs">
                                    외 {{ dorder.itemCount - 1 }}건
                                </span>
                            </div>
                        </td>
                        <td>{{ dorder.managerName || '-' }}</td>
                        <td>{{ dorder.createdAt?.slice(0, 10) }}</td>
                        <td>{{ dorder.shippedAt?.slice(0, 10) }}</td>
                        <td class="text-center">
                            <span :class="['status-badge', getStatusClass(dorder.status)]">
                                {{ getStatusLabel(dorder.status) }}
                            </span>
                        </td>
                    </tr>

                    <!-- 데이터 없을 때 -->
                    <tr v-if="!isLoading && doList.length === 0">
                        <td colspan="9" class="no-data">조회된 납품서가 없습니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 납품서 미리보기 모달 -->
        <DeliveryOrderPreviewModal
            :is-open="isPreviewModalOpen"
            :delivery-order="selectedDO"
            @close="closePreviewModal"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { getDODetail } from '@/api/shipping/deliveryOrder'
import DeliveryOrderPreviewModal from '@/components/modals/DeliveryOrderPreviewModal.vue'
import axios from '@/api/axios'

const userStore = useUserStore()

// 날짜 필터
const startDate = ref('')
const endDate = ref('')

// 상태 필터
const selectedStatus = ref('')
const statusFilters = [
    { value: 'DO_BEFORE_GI', label: '출고지시 전' },
    { value: 'DO_AFTER_GI', label: '출고지시 완료' }
]

// 검색
const searchKeyword = ref('')
const showOnlyMyDO = ref(false) // 내가 작성한 납품서만 조회

// 납품서 목록
const doList = ref([])

// 로딩 상태
const isLoading = ref(true)

// 미리보기 모달
const isPreviewModalOpen = ref(false)
const selectedDO = ref({
    doCode: '',
    createdAt: '',
    recipient: '',
    companyName: '',
    ceoName: '',
    businessNo: '',
    companyContact: '',
    address: '',
    businessType: '',
    businessItem: '',
    totalAmount: 0,
    shippedAt: '',
    deliveryLocation: '',
    note: '',
    items: []
})

// 필터 초기화
const resetFilters = () => {
    startDate.value = ''
    endDate.value = ''
    selectedStatus.value = ''
    searchKeyword.value = ''
    showOnlyMyDO.value = false
    fetchDOList()
}

// 내가 작성한 납품서 토글
const toggleMyDO = async () => {
    // 이미 활성화된 상태면 비활성화
    if (showOnlyMyDO.value) {
        showOnlyMyDO.value = false
        await fetchDOList()
        return
    }

    // 비활성화 상태에서 활성화 시도
    const previousValue = showOnlyMyDO.value
    showOnlyMyDO.value = true

    // fetchDOList를 호출하여 필터링
    await fetchDOList()

    // 내가 작성한 납품서가 없으면 버튼 상태 되돌리기
    if (!doList.value || doList.value.length === 0) {
        alert('작성한 납품서가 없습니다.')
        showOnlyMyDO.value = previousValue
        // 전체 목록 다시 조회
        await fetchDOList()
    }
}

// 납품서 목록 조회
const fetchDOList = async () => {
    try {
        isLoading.value = true
        const params = {}

        // 날짜 필터는 둘 다 있어야 적용
        if (startDate.value && endDate.value) {
            params.startDate = startDate.value
            params.endDate = endDate.value
        }

        if (selectedStatus.value) params.status = selectedStatus.value
        if (searchKeyword.value) params.doCode = searchKeyword.value

        // 내가 작성한 납품서만 조회
        if (showOnlyMyDO.value) {
            params.drafterId = userStore.user?.id
        }

        const response = await axios.get('/delivery-orders', { params })
        doList.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.error('납품서 목록 조회 실패:', error)
        // 401 에러가 아닌 경우에만 alert 표시
        if (error.response?.status !== 401) {
            alert('납품서 목록을 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
    }
}

// 납품서 상세보기 (미리보기 모달)
const viewDetail = async (doCode) => {
    try {
        const response = await getDODetail(doCode)
        selectedDO.value = response
        isPreviewModalOpen.value = true
    } catch (error) {
        console.error('납품서 상세 조회 실패:', error)
        alert('납품서 정보를 불러오는데 실패했습니다.')
    }
}

// 미리보기 모달 닫기
const closePreviewModal = () => {
    isPreviewModalOpen.value = false
}

// 상태 라벨
const getStatusLabel = (status) => {
    const statusMap = {
        'DO_BEFORE_GI': '출고지시 전',
        'DO_AFTER_GI': '출고지시 완료'
    }
    return statusMap[status] || status
}

// 상태 클래스
const getStatusClass = (status) => {
    const classMap = {
        'DO_BEFORE_GI': 'pending',
        'DO_AFTER_GI': 'completed'
    }
    return classMap[status] || 'pending'
}

// 초기화
onMounted(() => {
    // 날짜 필터 없이 전체 납품서 조회
    fetchDOList()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.do-page {
    padding: 8px;
    width: 100%;
}

/* ===== 헤더 ===== */
.page-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.page-title {
    font-size: 30px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}


/* ===== 리스트 섹션 ===== */
.items-section {
    position: relative;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.section-header {
    margin-bottom: 12px;
    font-size: small;
}

/* ===== 테이블 ===== */
.items-table {
    width: 100%;
    border-collapse: collapse;
}

.items-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.items-table th {
    padding: 12px 16px;
    font-size: small;
    font-weight: 600;
    color: #374151;
    text-align: center;
}

.items-table td {
    border-bottom: 1px solid #e5e7eb;
    font-size: small;
    color: black;
    padding: 16px 12px;
}

.items-table tbody tr:hover {
    background: #f9fafb;
}

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

/* ===== 공통 정렬 ===== */
.text-center {
    text-align: center;
}

/* ===== 링크 ===== */
.link {
    color: #4C4CDD;
    cursor: pointer;
    font-weight: 600;
}

.link:hover {
    text-decoration: underline;
}

/* ===== 품목명 ===== */
.item-name {
    display: flex;
    align-items: center;
}


/* ===== 상태 뱃지 ===== */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge.pending {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.in-progress {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.completed {
    background: #d1fae5;
    color: #065f46;
}

.no-data {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
    font-size: 14px;
}

/* ===== 작성자 필터 버튼 ===== */
.filter-item .my-do-btn {
    height: 36px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: small;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;
    min-width: 140px;
    background: #ffffff;
    color: #374151;
}

.filter-item .my-do-btn:hover {
    border-color: #9ca3af;
    background: #f9fafb;
}

.filter-item .my-do-btn.active {
    background: #4C4CDD;
    color: #ffffff;
    border-color: #4C4CDD;
}

.filter-item .my-do-btn.active:hover {
    background: #3d3dbb;
    border-color: #3d3dbb;
}
</style>
