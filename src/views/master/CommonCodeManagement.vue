<template>
    <div class="common-code-page">
        <div class="page-header">
            <div>
                <h1 class="page-title">공통 코드 관리</h1>
                <p class="page-description">시스템 전반에서 사용하는 표준 코드를 통합하여 관리합니다.</p>
            </div>
        </div>

        <div class="content-wrapper">
            <!-- 좌측: 코드 그룹 목록 -->
            <div class="code-group-panel">
                <div class="panel-header">
                    <h2 class="panel-title">코드 그룹</h2>
                    <div class="search-box">
                        <input
                            v-model="searchKeyword"
                            type="text"
                            placeholder="그룹 코드 또는 명칭 검색"
                            @input="filterCodeTypes"
                        />
                    </div>
                </div>

                <div class="code-type-list">
                    <div
                        v-for="codeType in filteredCodeTypes"
                        :key="codeType.code"
                        class="code-type-item"
                        :class="{ active: selectedCodeType === codeType.code }"
                        @click="selectCodeType(codeType.code)"
                    >
                        <div class="code-type-code">{{ codeType.code }}</div>
                        <div class="code-type-info">
                            <div class="code-type-name">{{ codeType.name }}</div>
                            <div class="code-type-desc">{{ codeType.description }}</div>
                        </div>
                        <div class="usage-indicator" :class="{ active: selectedCodeType === codeType.code }">
                            <span>●</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 우측: 상세 코드 목록 -->
            <div class="code-detail-panel">
                <div class="panel-header">
                    <div class="header-left">
                        <h2 class="panel-title">상세 코드</h2>
                        <span v-if="selectedCodeTypeName" class="selected-type-badge">
                            {{ selectedCodeTypeName }} ({{ selectedCodeType }})
                        </span>
                    </div>
                </div>

                <div v-if="!selectedCodeType" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>좌측에서 코드 그룹을 선택해주세요</p>
                </div>

                <div v-else class="code-detail-content">
                    <table class="code-detail-table">
                        <thead>
                            <tr>
                                <th class="col-no">No</th>
                                <th class="col-code">상세 코드</th>
                                <th class="col-name">코드명</th>
                                <th class="col-eng">설명</th>
                                <th class="col-ref">참조값</th>
                                <th class="col-used">사용</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(code, index) in codeDetails" :key="code.code">
                                <td class="col-no text-center">{{ index + 1 }}</td>
                                <td class="col-code">
                                    <span class="code-badge">{{ code.code }}</span>
                                </td>
                                <td class="col-name">{{ code.name }}</td>
                                <td class="col-eng">{{ code.codeNameEng }}</td>
                                <td class="col-ref text-center">{{ code.ref1 || '-' }}</td>
                                <td class="col-used text-center">
                                    {{ code.isUsed }}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="codeDetails.length === 0" class="no-data">
                        해당 코드 타입에 등록된 코드가 없습니다.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllCodeTypes, getCodeDetailsByType } from '@/api/system/commonCode'

// 상태
const codeTypes = ref([])
const filteredCodeTypes = ref([])
const codeDetails = ref([])
const selectedCodeType = ref(null)
const searchKeyword = ref('')

// 선택된 코드 타입명
const selectedCodeTypeName = computed(() => {
    const found = codeTypes.value.find(ct => ct.code === selectedCodeType.value)
    return found ? found.name : ''
})

// 코드 타입 목록 조회
const fetchCodeTypes = async () => {
    try {
        codeTypes.value = await getAllCodeTypes()
        filteredCodeTypes.value = codeTypes.value
    } catch (error) {
        console.error('코드 타입 조회 실패:', error)
        alert('코드 타입 목록을 불러오는데 실패했습니다.')
    }
}

// 코드 타입 필터링
const filterCodeTypes = () => {
    if (!searchKeyword.value) {
        filteredCodeTypes.value = codeTypes.value
        return
    }

    const keyword = searchKeyword.value.toLowerCase()
    filteredCodeTypes.value = codeTypes.value.filter(ct =>
        ct.code.toLowerCase().includes(keyword) ||
        ct.name.toLowerCase().includes(keyword) ||
        (ct.description && ct.description.toLowerCase().includes(keyword))
    )
}

// 코드 타입 선택
const selectCodeType = async (typeCode) => {
    selectedCodeType.value = typeCode
    await fetchCodeDetails(typeCode)
}

// 상세 코드 목록 조회
const fetchCodeDetails = async (typeCode) => {
    try {
        codeDetails.value = await getCodeDetailsByType(typeCode)
    } catch (error) {
        console.error('코드 상세 조회 실패:', error)
        alert('코드 상세 목록을 불러오는데 실패했습니다.')
    }
}

// 초기 데이터 로드
onMounted(async () => {
    await fetchCodeTypes()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.common-code-page {
    padding: 5px;
    width: 100%;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans KR', sans-serif;
}

.common-code-page * {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans KR', sans-serif !important;
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

/* ===== 컨텐츠 래퍼 ===== */
.content-wrapper {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 20px;
    height: calc(100vh - 180px);
}

/* ===== 좌측 코드 그룹 패널 ===== */
.code-group-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.code-group-panel .panel-header {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.panel-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 12px;
}

.search-box input {
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #111827;
}

.search-box input:focus {
    outline: none;
    border-color: #4C4CDD;
}

.search-box input::placeholder {
    color: #9ca3af;
}

.code-type-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.code-type-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 4px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
}

.code-type-item:hover {
    background: #f9fafb;
}

.code-type-item.active {
    background: #eff6ff;
    border-color: #4C4CDD;
}

.code-type-code {
    flex-shrink: 0;
    width: 140px;
    font-size: 13px;
    font-weight: 600;
    color: #4C4CDD;
}

.code-type-info {
    flex: 1;
    min-width: 0;
}

.code-type-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin-bottom: 3px;
}

.code-type-desc {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.usage-indicator {
    flex-shrink: 0;
    margin-left: 8px;
}

.usage-indicator span {
    font-size: 8px;
    color: #d1d5db;
}

.usage-indicator.active span {
    color: #10b981;
}

/* ===== 우측 상세 코드 패널 ===== */
.code-detail-panel {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.code-detail-panel .panel-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.selected-type-badge {
    padding: 6px 12px;
    background: #eff6ff;
    color: #4C4CDD;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #9ca3af;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
}

.empty-state p {
    font-size: 14px;
    color: #6b7280;
}

.code-detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

/* ===== 테이블 ===== */
.code-detail-table {
    width: 100%;
    border-collapse: collapse;
}

.code-detail-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.code-detail-table th {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    text-align: left;
}

.code-detail-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
}

.code-detail-table tbody tr:hover {
    background: #f9fafb;
}

/* ===== 테이블 컬럼 너비 ===== */
.col-no { width: 60px; }
.col-code { width: 160px; }
.col-name { width: 200px; }
.col-eng { min-width: 220px; }
.col-ref { width: 120px; }
.col-order { width: 80px; }
.col-used { width: 80px; }

.text-center {
    text-align: center;
}

/* ===== 뱃지 ===== */
.code-badge {
    display: inline-block;
    padding: 4px 10px;
    background: #f3f4f6;
    color: #374151;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.usage-badge {
    display: inline-block;
    min-width: 28px;
    padding: 4px 8px;
    text-align: center;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.usage-badge.active {
    background: #d1fae5;
    color: #065f46;
}

.usage-badge.inactive {
    background: #fee2e2;
    color: #991b1b;
}

/* ===== 빈 데이터 ===== */
.no-data {
    padding: 60px 20px;
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
}

/* ===== 스크롤바 스타일 ===== */
.code-type-list::-webkit-scrollbar,
.code-detail-content::-webkit-scrollbar {
    width: 6px;
}

.code-type-list::-webkit-scrollbar-track,
.code-detail-content::-webkit-scrollbar-track {
    background: #f9fafb;
}

.code-type-list::-webkit-scrollbar-thumb,
.code-detail-content::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
}

.code-type-list::-webkit-scrollbar-thumb:hover,
.code-detail-content::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
}
</style>
