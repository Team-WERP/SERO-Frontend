<template>
    <div class="bom-page">
        <div class="page-header">
            <div>
                <h1 class="page-title">자재·BOM 관리</h1>
                <p class="page-description">
                    자재 정보 및 BOM 구성을 조회하고 관리합니다.
                </p>
            </div>
        </div>

        <div class="search-section">
            <h2 class="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span class="w-1 h-5 bg-indigo-600 rounded-full"></span>
                필터 및 검색
            </h2>
            <div class="filter-row">
                <div class="filter-item">
                    <label>자재 유형</label>
                    <select v-model="materialType">
                        <option value="">전체</option>
                        <option value="MAT_FG">완제품</option>
                        <option value="MAT_RM">원부자재</option>
                    </select>
                </div>

                <div class="filter-item">
                    <label>상태</label>
                    <select v-model="status">
                        <option value="">전체</option>
                        <option value="MAT_NORMAL">정상</option>
                        <option value="MAT_STOP_PREP">판매 중단 예정</option>
                        <option value="MAT_STOP">판매 중단</option>
                        <option value="MAT_DISCONTINUED">단종</option>
                    </select>
                </div>

                <div class="filter-item keyword">
                    <label>품목별 검색</label>
                    <input
                        type="text"
                        v-model="searchKeyword"
                        placeholder="품목 코드 또는 품목명"
                        @keyup.enter="fetchMaterialList"
                    />
                </div>

                <div class="button-group">
                    <button class="search-btn" @click="fetchMaterialList">검색</button>
                </div>
            </div>
        </div>

        <div class="items-section">
            <div v-if="isLoading" class="flex h-screen items-center justify-center bg-slate-50">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4C4CDD]"></div>
            </div>

            
            <div class="section-header">
                총 <span class="text-indigo-600 font-bold mx-1">{{ materialList.length}}</span>건

            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">No</th>
                        <th style="width: 180px;">품목 코드</th>
                        <th style="width: 220px;">품명</th>
                        <th style="width: 200px;">규격</th>
                        <th style="width: 140px;">생산 소요 시간(분)</th>
                        <th style="width: 120px;">안전재고(AUn)</th>
                        <th style="width: 120px;">단가(₩)</th>
                        <th style="width: 110px;">구성 자재 수</th>
                        <th style="width: 100px;">상태</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(material, index) in materialList" :key="material.id" @click="goDetail(material.id)" class="clickable-row">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div class="code-with-badge justify-center">
                                <span :class="getMaterialTypeClass(material.type)">
                                    {{ getMaterialTypeLabel(material.type) }}
                                </span>
                                <span class="material-code">{{ material.materialCode }}</span>
                            </div>
                        </td>
                        <td class="material-name" :title="material.name">{{ material.name }}</td>
                        <td>{{ material.spec || '-' }}</td>
                        <td>{{ formatCycleTime(material.cycleTime) }}</td>
                        <td>{{ formatNumber(material.safetyStock) }}</td>
                        <td>{{ formatNumber(material.unitPrice) }}</td>
                        <td>{{ material.type === 'MAT_RM' ? '-' : (material.rawMaterialCount || 0) }}</td>
                        <td>
                            <span :class="getStatusClass(material.status)">
                                {{ getStatusLabel(material.status) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="!isLoading && materialList.length === 0">
                        <td colspan="9" class="empty-message">
                            조회된 자재가 없습니다.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getMaterialList } from '@/api/material/material.js'

const router = useRouter()

const materialType = ref('')
const status = ref('')
const searchKeyword = ref('')
const materialList = ref([])
const isLoading = ref(true)

const fetchMaterialList = async () => {
    try {
        isLoading.value = true
        const params = {}
        if (materialType.value) params.type = materialType.value
        if (status.value) params.status = status.value
        if (searchKeyword.value) params.keyword = searchKeyword.value

        const result = await getMaterialList(params)

        if (Array.isArray(result)) {
            materialList.value = [...result].sort((a, b) => {
                if (a.type === 'MAT_FG' && b.type !== 'MAT_FG') return -1
                if (a.type !== 'MAT_FG' && b.type === 'MAT_FG') return 1
                return 0
            })
        } else {
            materialList.value = []
        }
    } catch (error) {
        console.error('자재 목록 조회 실패:', error)
        if (error.response?.status !== 401) alert('자재 목록을 불러오는데 실패했습니다.')
    } finally {
        isLoading.value = false
    }
}

const goDetail = (materialId) => {
    router.push(`/master/bom/${materialId}`)
}

const formatCycleTime = (seconds) => {
    if (!seconds || seconds === 0) return '-'
    const minutes = Math.floor(seconds / 60)
    return minutes === 0 ? '1분 미만' : `${minutes}`
}

const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    return value.toLocaleString()
}

const getStatusClass = (status) => ({
    MAT_NORMAL: 'status-badge status-normal',
    MAT_STOP_PREP: 'status-badge status-stop-prep',
    MAT_STOP: 'status-badge status-stop',
    MAT_DISCONTINUED: 'status-badge status-discontinued'
}[status] || 'status-badge')

const getStatusLabel = (status) => ({
    MAT_NORMAL: '정상',
    MAT_STOP_PREP: '예정',
    MAT_STOP: '중단',
    MAT_DISCONTINUED: '단종'
}[status] || status)

const getMaterialTypeClass = (type) => ({
    MAT_FG: 'type-badge type-fg',
    MAT_RM: 'type-badge type-rm'
}[type] || 'type-badge')

const getMaterialTypeLabel = (type) => ({
    MAT_FG: '완제품',
    MAT_RM: '원부자재'
}[type] || type)

watch([materialType, status], () => {
    fetchMaterialList()
})

onMounted(() => {
    fetchMaterialList()
})
</script>

<style scoped>
.bom-page {
    padding: 5px;
    width: 100%;
}

.page-header {
    margin-bottom: 20px;
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

.search-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
}

.filter-row {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: small;
    color: #374151;
}

.filter-item label {
    font-weight: 600;
}

.filter-item input[type="text"],
.filter-item select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: small;
    background: #ffffff;
    min-width: 140px;
}

.filter-item.keyword {
    flex: 1;
    min-width: 250px;
}

.button-group {
    display: flex;
    gap: 8px;
    margin-top: 18px;
}

.search-btn {
    height: 36px;
    padding: 0 24px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: small;
    font-weight: 600;
    cursor: pointer;
}

.items-section {
    position: relative;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(4px);
}

.section-header {
    margin-bottom: 12px;
}

/* 테이블 가운데 정렬 핵심 스타일 */
.items-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; /* 너비 고정 */
}

.items-table th {
    padding: 12px 8px;
    font-size: small;
    font-weight: 600;
    color: #374151;
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
    text-align: center; /* 헤더 가운데 정렬 */
}

.items-table td {
    padding: 16px 8px;
    border-bottom: 1px solid #e5e7eb;
    font-size: small;
    color: #111827;
    text-align: center; /* 바디 가운데 정렬 */
    vertical-align: middle;
}

.items-table tbody tr.clickable-row:hover {
    background: #f9fafb;
    cursor: pointer;
}

/* 뱃지 및 배지 정렬 */
.status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}

.status-normal { background: #dcfce7; color: #166534; }
.status-stop-prep { background: #fef3c7; color: #92400e; }
.status-stop { background: #fee2e2; color: #991b1b; }
.status-discontinued { background: #f3f4f6; color: #374151; }

.code-with-badge {
    display: flex;
    align-items: center;
    gap: 8px;
}

.justify-center {
    justify-content: center;
}

.material-code {
    color: #4C4CDD;
    font-weight: 600;
}

.type-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 700;
}

.type-fg { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.type-rm { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }

.material-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-message {
    padding: 60px 0 !important;
    color: #9ca3af;
    font-size: small;
    text-align: center;
}
</style>