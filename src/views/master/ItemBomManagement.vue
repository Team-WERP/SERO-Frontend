<template>
    <div class="bom-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div>
                <h1 class="page-title">자재·BOM 관리</h1>
                <p class="page-description">
                    자재 정보 및 BOM 구성을 조회하고 관리합니다.
                </p>
            </div>
        </div>

        <!-- 필터 및 검색 -->
        <div class="search-section">
            <h2 class="filter-title">필터 및 검색</h2>
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

        <!-- 자재 목록 -->
        <div class="items-section">
            <div
                v-if="isLoading"
                class="loading-overlay"
            >
                <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                    </path>
                </svg>
            </div>
            <div class="section-header">
                <span class="total-count">총 {{ materialList.length }}건</span>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th style="width: 60px; text-align:center;">No</th>
                        <th style="width: 180px; text-align:left; padding-left: 12px;">품목 코드</th>
                        <th style="width: 220px; text-align:left; padding-left: 12px;">품명</th>
                        <th style="width: 250px; text-align:left; padding-left: 12px;">규격</th>
                        <th style="width: 140px; text-align:right; padding-right: 12px;">생산 소요 시간(분)</th>
                        <th style="width: 120px; text-align:right; padding-right: 12px;">안전재고(AUn)</th>
                        <th style="width: 120px; text-align:right; padding-right: 12px;">단가(₩)</th>
                        <th style="width: 110px; text-align:center;">구성 자재 수</th>
                        <th style="width: 100px; text-align:center;">상태</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(material, index) in materialList" :key="material.id" @click="goDetail(material.id)" class="clickable-row">
                        <td style="text-align:center; padding-left: 12px; padding-right: 12px;">{{ index + 1 }}</td>
                        <td style="text-align:left; padding-left: 12px;">
                            <div class="code-with-badge">
                                <span :class="getMaterialTypeClass(material.type)">
                                    {{ getMaterialTypeLabel(material.type) }}
                                </span>
                                <span class="material-code">{{ material.materialCode }}</span>
                            </div>
                        </td>
                        <td class="material-name" style="text-align:left; padding-left: 12px;" :title="material.name">{{ material.name }}</td>
                        <td style="text-align:left; padding-left: 12px;">{{ material.spec || '-' }}</td>
                        <td style="text-align:right; padding-right: 12px;">{{ formatCycleTime(material.cycleTime) }}</td>
                        <td style="text-align:right; padding-right: 12px;">{{ formatNumber(material.safetyStock) }}</td>
                        <td style="text-align:right; padding-right: 12px;">{{ formatNumber(material.unitPrice) }}</td>
                        <td style="text-align:center; padding-left: 12px; padding-right: 12px;">{{ material.type === 'MAT_RM' ? '-' : (material.rawMaterialCount || 0) }}</td>
                        <td style="text-align:center; padding-left: 12px; padding-right: 12px;">
                            <span :class="getStatusClass(material.status)">
                                {{ getStatusLabel(material.status) }}
                            </span>
                        </td>
                    </tr>

                    <tr v-if="!isLoading && materialList.length === 0">
                        <td colspan="9" class="text-center empty-message">
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

// 필터 상태
const materialType = ref('')
const status = ref('')
const searchKeyword = ref('')
const materialList = ref([])
const isLoading = ref(true)

// 자재 목록 조회
const fetchMaterialList = async () => {
    try {
        isLoading.value = true
        const params = {}

        // 자재 유형 필터
        if (materialType.value) {
            params.type = materialType.value
        }

        // 상태 필터
        if (status.value) {
            params.status = status.value
        }

        if (searchKeyword.value) params.keyword = searchKeyword.value

        const result = await getMaterialList(params)

        if (Array.isArray(result)) {
            // 완제품(MAT_FG)이 상단에 오도록 정렬
            materialList.value = [...result].sort((a, b) => {
                if (a.type === 'MAT_FG' && b.type !== 'MAT_FG') return -1
                if (a.type !== 'MAT_FG' && b.type === 'MAT_FG') return 1
                return 0
            })
        } else {
            console.error('예상치 못한 응답 형식:', result)
            materialList.value = []
        }
    } catch (error) {
        console.error('자재 목록 조회 실패:', error)

        if (error.response?.status !== 401) {
            alert('자재 목록을 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
    }
}

// 자재 상세 페이지 이동
const goDetail = (materialId) => {
    router.push(`/master/bom/${materialId}`)
}

// 사이클타임 포맷팅 (초 -> 분)
const formatCycleTime = (seconds) => {
    if (!seconds || seconds === 0) return '-'
    const minutes = Math.floor(seconds / 60)
    return minutes === 0 ? '1분 미만' : `${minutes}`
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    return value.toLocaleString()
}

// 상태 클래스 매핑
const getStatusClass = (status) => ({
    MAT_NORMAL: 'status-badge status-normal',
    MAT_STOP_PREP: 'status-badge status-stop-prep',
    MAT_STOP: 'status-badge status-stop',
    MAT_DISCONTINUED: 'status-badge status-discontinued'
}[status] || 'status-badge')

// 상태 라벨 매핑
const getStatusLabel = (status) => ({
    MAT_NORMAL: '정상',
    MAT_STOP_PREP: '판매 중단 예정',
    MAT_STOP: '판매 중단',
    MAT_DISCONTINUED: '단종'
}[status] || status)

// 자재 유형 클래스 매핑
const getMaterialTypeClass = (type) => ({
    MAT_FG: 'type-badge type-fg',
    MAT_RM: 'type-badge type-rm'
}[type] || 'type-badge')

// 자재 유형 라벨 매핑
const getMaterialTypeLabel = (type) => ({
    MAT_FG: '완제품',
    MAT_RM: '원부자재'
}[type] || type)

// 필터 변경 시 자동 검색
watch([materialType, status], () => {
    fetchMaterialList()
})

// 초기 로드
onMounted(() => {
    fetchMaterialList()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.bom-page {
    padding: 5px;
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
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
}

.page-description {
    font-size: 14px;
    color: #6b7280;
}

/* ===== 검색 / 필터 ===== */
.filter-title {
    font-size: 20px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 10px;
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
    font-size: 13px;
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
    font-size: 13px;
    background: #ffffff;
    min-width: 140px;
}

.filter-item input[type="text"]:focus,
.filter-item select:focus {
    outline: none;
    border-color: #4C4CDD;
}

.filter-item.keyword {
    flex: 1;
    min-width: 250px;
}

/* ===== 버튼 그룹 ===== */
.button-group {
    display: flex;
    gap: 8px;
    align-self: flex-end;
    margin-top: 18px;
}

.search-btn {
    height: 36px;
    padding: 0 24px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
}

.search-btn:hover {
    background: #3d3dbb;
}

/* ===== 리스트 섹션 ===== */
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.total-count {
    font-size: 14px;
    color: #6b7280;
}

.add-btn {
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.add-btn:hover {
    background: #3d3dbb;
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
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: left;
}

.items-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
}

.items-table tbody tr.clickable-row {
    cursor: pointer;
}

.items-table tbody tr.clickable-row:hover {
    background: #f9fafb;
}

/* ===== 공통 정렬 ===== */
.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

/* ===== 뱃지 ===== */
.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-normal {
    background: #dcfce7;
    color: #166534;
}

.status-stop-prep {
    background: #fef3c7;
    color: #92400e;
}

.status-stop {
    background: #fee2e2;
    color: #991b1b;
}

.status-discontinued {
    background: #f3f4f6;
    color: #374151;
}

/* ===== 자재 유형 배지 ===== */
.code-with-badge {
    display: flex;
    align-items: center;
    gap: 10px;
}

.material-code {
    color: #4C4CDD;
    font-weight: 600;
    font-size: 14px;
}

.type-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.type-fg {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
}

.type-rm {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
}

/* ===== 링크 ===== */
.link {
    color: #4C4CDD;
    font-weight: 600;
}

/* ===== 자재명 ===== */
.material-name {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-message {
    padding: 60px 0;
    color: #9ca3af;
    font-size: 14px;
}
</style>
