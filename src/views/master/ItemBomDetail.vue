<template>
    <div class="material-detail-page">
        <!-- 브레드크럼 네비게이션 -->
        <nav class="breadcrumb">
            <router-link to="/master/bom" class="breadcrumb-link">
                자재 BOM 관리
            </router-link>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">{{ material?.materialCode || '자재 상세' }}</span>
        </nav>

        <!-- 상단 헤더 -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title-section">
                    <h1 class="page-title">{{ material?.name || '자재명 로딩 중...' }}</h1>
                    <span v-if="material?.status" :class="getStatusClass(material.status)" class="status-badge-large">
                        {{ getStatusLabel(material.status) }}
                    </span>
                </div>
                <p class="page-subtitle">
                    자재 코드: {{ material?.materialCode || '-' }} |
                    자재 유형: {{ material ? getMaterialTypeLabel(material.type) : '-' }}
                </p>
            </div>
        </div>

        <div v-if="isLoading" class="loading-container">
            <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
        </div>

        <div v-else-if="material" class="content-wrapper">
            <!-- 제품 정보 섹션 -->
            <div class="info-section">
                <h3 class="section-title">제품 정보</h3>
                <div class="info-content">
                    <!-- 이미지 영역 -->
                    <div class="image-container">
                        <div class="image-wrapper">
                            <img
                                :src="material.imageUrl || defaultImage"
                                :alt="material.name"
                                class="product-image"
                            />
                            <div v-if="!material.imageUrl" class="image-overlay">
                                <span class="overlay-text">이미지 준비 중</span>
                            </div>
                        </div>
                    </div>

                    <!-- 전체 정보 영역 (이미지 우측) -->
                    <div class="info-details-wrapper">
                        <!-- 기본 정보 -->
                        <div class="info-grid">
                            
                            <div class="info-item">
                                <span class="label">등록자</span>
                                <span class="value">{{ material.manager?.name || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">등록일</span>
                                <span class="value">{{ formatDate(material.createdAt) }}</span>
                            </div>
                            
                            <div class="info-item">
                                <span class="label">규격</span>
                                <span class="value">{{ material.spec || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">변환 비율</span>
                                <span class="value">{{ material.conversionRate ? `1:${material.conversionRate}` : '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">작업 단위 (AUn)</span>
                                <span class="value">{{ material.operationUnit || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">기본 단위 (BUn)</span>
                                <span class="value">{{ material.baseUnit || '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">사이클 타임</span>
                                <span class="value">{{ material.cycleTime ? `${material.cycleTime}초` : '-' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">생산 소요 시간</span>
                                <span class="value">{{ formatCycleTimeMinutes(material.cycleTime) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">최소 주문 수량</span>
                                <span class="value">{{ formatNumber(material.moq) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">안전 재고</span>
                                <span class="value">{{ formatNumber(material.safetyStock) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">단가</span>
                                <span class="value">{{ formatCurrency(material.unitPrice) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">구성 자재 수</span>
                                <span class="value">{{ material.rawMaterialCount || 0 }}개</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BOM 구성 자재 목록 섹션 -->
            <div class="bom-section">
                <div class="bom-header">
                    <h3 class="section-title">BOM 구성 자재 목록</h3>
                </div>

                <div v-if="material.type === 'MAT_FG'">
                    <table v-if="material.bomList && material.bomList.length > 0" class="bom-table">
                        <thead>
                            <tr>
                                <th style="width: 9%; text-align:center; padding-left: 40px;">No</th>
                                <th style="width: 18%;">자재코드</th>
                                <th style="width: 23%;">자재명</th>
                                <th style="width: 23%;">규격</th>
                                <th style="width: 12%; text-align:center;">(BUn)<br/>단위</th>
                                <th style="width: 15%; text-align:right; padding-right: 80px;">소요량</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(bom, index) in material.bomList" :key="bom.id">
                                <td class="text-center" style="padding-left: 40px;">{{ index + 1 }}</td>
                                <td>{{ bom.rawMaterial?.materialCode || '-' }}</td>
                                <td>{{ bom.rawMaterial?.name || '-' }}</td>
                                <td>{{ bom.rawMaterial?.spec || '-' }}</td>
                                <td class="text-center">{{ bom.rawMaterial?.baseUnit || '-' }}</td>
                                <td class="text-right" style="padding-right: 80px;">{{ formatNumber(bom.requirement) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-else class="empty-bom-message">
                        <p>※ 해당 품목에 대한 자재 참고 모달이 업데이트되지 않았습니다. 작동은 우측 품목 이미지로도 가능합니다.</p>
                    </div>
                </div>
                <div v-else class="empty-bom-message">
                    <p>원부자재는 BOM 구성이 없습니다.</p>
                </div>
            </div>
        </div>

        <div v-else class="no-data-message">
            <p>자재 정보를 불러올 수 없습니다.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMaterialDetail } from '@/api/material/material.js'
import defaultImage from '@/assets/새로이새로미.png'

const route = useRoute()

const isLoading = ref(true)
const material = ref(null)

// 자재 상세 조회
const fetchMaterialDetail = async () => {
    try {
        isLoading.value = true
        const materialId = route.params.id
        const result = await getMaterialDetail(materialId)
        material.value = result
    } catch (error) {
        console.error('자재 상세 조회 실패:', error)
        if (error.response?.status !== 401) {
            alert('자재 정보를 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
    }
}

// 날짜 포맷팅
const formatDate = (value) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '-').replace(/ /g, '').slice(0, -1)
}

// 사이클타임 포맷팅 (분)
const formatCycleTimeMinutes = (seconds) => {
    if (!seconds) return '-'
    const minutes = Math.floor(seconds / 60)
    return minutes === 0 ? '1분 미만' : `${minutes}분`
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (value === null || value === undefined) return '-'
    return value.toLocaleString()
}

// 금액 포맷팅
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    return '₩' + value.toLocaleString()
}

// 자재 유형 라벨
const getMaterialTypeLabel = (type) => {
    const labels = {
        MAT_FG: '완제품',
        MAT_RM: '원부자재'
    }
    return labels[type] || type || '-'
}

// 상태 클래스
const getStatusClass = (status) => {
    const classes = {
        MAT_NORMAL: 'status-badge status-normal',
        MAT_STOP_PREP: 'status-badge status-stop-prep',
        MAT_STOP: 'status-badge status-stop',
        MAT_DISCONTINUED: 'status-badge status-discontinued'
    }
    return classes[status] || 'status-badge'
}

// 상태 라벨
const getStatusLabel = (status) => {
    const labels = {
        MAT_NORMAL: '정상',
        MAT_STOP_PREP: '판매 중단 예정',
        MAT_STOP: '판매 중단',
        MAT_DISCONTINUED: '단종'
    }
    return labels[status] || status || '-'
}

// 초기 로드
onMounted(() => {
    fetchMaterialDetail()
})
</script>

<style scoped>
.material-detail-page {
    padding: 24px;
    width: 100%;
    background: #F9FAFB;
    min-height: 100vh;
}

/* ===== 브레드크럼 ===== */
.breadcrumb {
    margin-bottom: 12px;
    color: #6b7280;
    font-size: 14px;
}

.breadcrumb-link {
    font-weight: 500;
    color: #4C4CDD;
    text-decoration: none;
    transition: all 0.2s;
}

.breadcrumb-link:hover {
    text-decoration: underline;
}

.breadcrumb-separator {
    margin: 0 8px;
    color: #9ca3af;
}

.breadcrumb-current {
    font-weight: 400;
    color: #6b7280;
}

/* ===== 헤더 ===== */
.page-header {
    margin-bottom: 24px;
}

.header-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.header-title-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-title {
    font-size: 30px;
    font-weight: 700;
    color: #000000;
    margin: 0;
}

.page-subtitle {
    font-size: 14px;
    font-weight: 500;
    color: #898989;
}

.status-badge-large {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
}

/* ===== 로딩 ===== */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

/* ===== 컨텐츠 ===== */
.content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* ===== 정보 섹션 ===== */
.info-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 20px;
}

.info-content {
    display: flex;
    gap: 24px;
}

/* ===== 이미지 영역 ===== */
.image-container {
    flex-shrink: 0;
    width: 280px;
}

.image-wrapper {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.overlay-text {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.5px;
}

/* ===== 전체 정보 영역 (이미지 우측) ===== */
.info-details-wrapper {
    flex: 1;
    min-width: 0;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;
}

.info-item:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.info-item .label {
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.info-item .value {
    font-size: 14px;
    color: #111827;
    font-weight: 600;
    word-break: break-word;
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 8px 0;
}

.stat-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 6px;
}

.stat-value {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

/* ===== BOM 섹션 ===== */
.bom-section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
}

.bom-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.help-text {
    font-size: 12px;
    color: #6b7280;
}

.add-btn-small {
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 6px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.add-btn-small:hover {
    background: #3d3dbb;
}

/* ===== BOM 테이블 ===== */
.bom-table {
    width: 100%;
    border-collapse: collapse;
}

.bom-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.bom-table th {
    padding: 12px 24px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    text-align: left;
}

.bom-table td {
    padding: 12px 24px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
}

.bom-table tbody tr:hover {
    background: #f9fafb;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.delete-btn-small {
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 12px;
    color: #dc2626;
    cursor: pointer;
    transition: all 0.2s;
}

.delete-btn-small:hover {
    background: #fee2e2;
    border-color: #dc2626;
}

.empty-bom-message {
    padding: 60px 20px;
    text-align: center;
    color: #6b7280;
    font-size: 14px;
    background: #f9fafb;
    border-radius: 8px;
}

.no-data-message {
    padding: 100px 20px;
    text-align: center;
    color: #9ca3af;
    font-size: 16px;
}

/* ===== 상태 뱃지 ===== */
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
</style>
