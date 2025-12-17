<template>
    <div class="client-item-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <div class="breadcrumb">고객포털 > 거래품목조회</div>
                <h1 class="page-title">거래 품목 조회</h1>
                <p class="page-description">현재 거래 중인 품목의 단가 이력을 확인할 수 있습니다.</p>
            </div>
        </div>

        <!-- 검색 영역 -->
        <div class="search-section">
            <div class="search-row">
                <input
                    type="text"
                    v-model="searchKeyword"
                    placeholder="예: MOTOR-001 / 모터코어 A"
                    class="search-input"
                />
                <button class="search-btn" @click="searchItems">검색</button>
            </div>
            <div class="filter-group">
                <span class="filter-label">거래 상태</span>
                <button
                    v-for="filter in filters"
                    :key="filter.value"
                    :class="['filter-btn', { active: selectedFilter === filter.value }]"
                    @click="selectedFilter = filter.value"
                >
                    {{ filter.label }}
                </button>
            </div>
        </div>

        <!-- 거래 품목 목록 -->
        <div class="items-section">
            <div class="section-header">
                <h2 class="section-title">거래 품목 목록</h2>
                <span class="item-count">(최소 주문 수량)</span>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 50px; text-align: center;"></th>
                        <th style="width: 150px;">품목코드</th>
                        <th style="width: auto;">품목명</th>
                        <th style="width: 150px;">규격</th>
                        <th style="width: 80px; text-align: center;">단위</th>
                        <th style="width: 120px; text-align: right;">거래단가</th>
                        <th style="width: 80px; text-align: center;">MOQ</th>
                        <th style="width: 130px; text-align: center;">거래상태</th>
                        <th style="width: 100px; text-align: center;">관리</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in items" :key="item.id">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ item.itemCode }}</td>
                        <td>{{ item.itemName }}</td>
                        <td>{{ item.spec }}</td>
                        <td>{{ item.unit }}</td>
                        <td class="text-right">{{ formatPrice(item.contractPrice) }}</td>
                        <td class="text-center">{{ item.moq }}</td>
                        <td class="text-center">
                            <span :class="getStatusClass(item.status)">
                                {{ getStatusLabel(item.status) }}
                            </span>
                        </td>
                        <td class="text-center">
                            <button class="link-btn" @click="viewPriceHistory(item.id)">
                                단가 이력
                            </button>
                        </td>
                    </tr>
                    <tr v-if="items.length === 0">
                        <td colspan="9" class="text-center empty-message">
                            조회된 거래 품목이 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 단가 이력 모달 -->
        <PriceHistoryModal
            :is-open="isModalOpen"
            :item-id="selectedItemId"
            :item-info="selectedItemInfo"
            @close="closeModal"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { getClientItems } from '@/api/clientItem'
import PriceHistoryModal from '@/components/client/PriceHistoryModal.vue'

const userStore = useUserStore()

const searchKeyword = ref('')
const selectedFilter = ref('')
const items = ref([])

// 모달 관련
const isModalOpen = ref(false)
const selectedItemId = ref(null)
const selectedItemInfo = ref(null)

// 필터 옵션
const filters = [
    { label: '전체', value: '' },
    { label: '정상', value: 'TRADE_NORMAL' },
    { label: '거래 중단 예정', value: 'TRADE_STOP_PREP' },
    { label: '거래 중단', value: 'TRADE_STOP' }
]

// 데이터 조회
const searchItems = async () => {
    try {
        // 로그인한 사용자의 고객사 ID (임시로 1 사용, 실제로는 userStore에서 가져옴)
        const clientId = userStore.getClientId || 1

        const params = {}
        if (searchKeyword.value) params.keyword = searchKeyword.value
        if (selectedFilter.value) params.status = selectedFilter.value

        items.value = await getClientItems(clientId, params)
    } catch (error) {
        console.error('품목 조회 실패:', error)
        items.value = []
    }
}

// 가격 포맷팅
const formatPrice = (price) => {
    return price ? `${price.toLocaleString()}원` : '-'
}

// 상태 클래스
const getStatusClass = (status) => {
    const statusClasses = {
        'TRADE_NORMAL': 'status-badge status-active',
        'TRADE_STOP_PREP': 'status-badge status-inactive',
        'TRADE_STOP': 'status-badge status-discontinued'
    }
    return statusClasses[status] || 'status-badge'
}

// 상태 라벨
const getStatusLabel = (status) => {
    const statusLabels = {
        'TRADE_NORMAL': '정상',
        'TRADE_STOP_PREP': '거래 중단 예정',
        'TRADE_STOP': '거래 중단'
    }
    return statusLabels[status] || status
}

// 단가 이력 조회
const viewPriceHistory = (itemId) => {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
        selectedItemId.value = itemId
        selectedItemInfo.value = {
            itemName: item.itemName,
            itemCode: item.itemCode
        }
        isModalOpen.value = true
    }
}

// 모달 닫기
const closeModal = () => {
    isModalOpen.value = false
    selectedItemId.value = null
    selectedItemInfo.value = null
}

// 초기 로드
onMounted(() => {
    searchItems()
})
</script>

<style scoped>
.client-item-page {
    padding: 24px;
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
    margin-bottom: 16px;
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

.search-btn {
    padding: 10px 24px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
}

.search-btn:hover {
    background: #3d3dbb;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.filter-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-right: 8px;
}

.filter-btn {
    padding: 6px 14px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    border-color: #4C4CDD;
    color: #4C4CDD;
}

.filter-btn.active {
    background: #4C4CDD;
    color: #ffffff;
    border-color: #4C4CDD;
}

/* 품목 목록 영역 */
.items-section {
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

.item-count {
    font-size: 14px;
    color: #6b7280;
}

/* 테이블 */
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
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.items-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
    vertical-align: middle;
}

.items-table tbody tr:hover {
    background: #f9fafb;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

/* 상태 뱃지 */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-active {
    background: #dcfce7;
    color: #166534;
}

.status-inactive {
    background: #fef3c7;
    color: #92400e;
}

.status-discontinued {
    background: #fee2e2;
    color: #991b1b;
}

/* 링크 버튼 */
.link-btn {
    background: none;
    border: none;
    color: #4C4CDD;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
}

.link-btn:hover {
    color: #3d3dbb;
}

/* 빈 메시지 */
.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}
</style>
