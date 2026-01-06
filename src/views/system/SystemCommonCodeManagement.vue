<template>
    <div class="common-code-page">
        <div class="page-header">
            <div>
                <h1 class="page-title">공통 코드 관리</h1>
                <p class="page-description">시스템 전반에서 사용하는 공통 코드를 관리합니다.</p>
            </div>
        </div>

        <div class="content-wrapper">
            <!-- 좌측: 코드 그룹 목록 -->
            <div class="code-group-panel">
                <div class="panel-header">
                    <div class="header-top">
                        <h2 class="panel-title">코드 그룹</h2>
                        <button class="btn-add" @click="openCodeTypeModal(null)" title="코드 그룹 추가">
                            +
                        </button>
                    </div>
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
                    >
                        <div class="code-type-content" @click="selectCodeType(codeType.code)">
                            <div class="code-type-code">{{ codeType.code }}</div>
                            <div class="code-type-info">
                                <div class="code-type-name">{{ codeType.name }}</div>
                                <div class="code-type-desc">{{ codeType.description }}</div>
                            </div>
                            <div class="usage-indicator" :class="{ active: selectedCodeType === codeType.code }">
                                <span>●</span>
                            </div>
                        </div>
                        <div class="code-type-actions">
                            <button
                                class="action-btn edit-btn"
                                @click.stop="openCodeTypeModal(codeType)"
                                title="수정"
                            >
                                ✎
                            </button>
                            <button
                                class="action-btn delete-btn"
                                @click.stop="deleteCodeTypeConfirm(codeType)"
                                title="삭제"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 우측: 공통 코드 목록 -->
            <div class="code-detail-panel">
                <div class="panel-header">
                    <div class="header-left">
                        <h2 class="panel-title">공통 코드</h2>
                        <span v-if="selectedCodeTypeName" class="selected-type-badge">
                            {{ selectedCodeTypeName }} ({{ selectedCodeType }})
                        </span>
                    </div>
                    <button
                        v-if="selectedCodeType"
                        class="btn-add-code"
                        @click="openCodeDetailModal(null)"
                    >
                        + 코드 추가
                    </button>
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
                                <th class="col-code">코드</th>
                                <th class="col-name">코드명</th>
                                <th class="col-eng">영문명</th>
                                <th class="col-ref">참조값</th>
                                <th class="col-order">순서</th>
                                <th class="col-used">사용</th>
                                <th class="col-actions">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(code, index) in codeDetails" :key="code.code">
                                <td class="col-no text-center">{{ index + 1 }}</td>
                                <td class="col-code">
                                    <span class="code-badge">{{ code.code }}</span>
                                </td>
                                <td class="col-name">{{ code.name }}</td>
                                <td class="col-eng">{{ code.codeNameEng || '-' }}</td>
                                <td class="col-ref text-center">{{ code.ref1 || '-' }}</td>
                                <td class="col-order text-center">{{ code.sortOrder }}</td>
                                <td class="col-used text-center">
                                    <span class="usage-badge" :class="{ active: code.isUsed === 'Y' }">
                                        {{ code.isUsed }}
                                    </span>
                                </td>
                                <td class="col-actions text-center">
                                    <button
                                        class="table-action-btn edit-btn"
                                        @click="openCodeDetailModal(code)"
                                        title="수정"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        class="table-action-btn delete-btn"
                                        @click="deleteCodeConfirm(code)"
                                        title="삭제"
                                    >
                                        ×
                                    </button>
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

        <!-- 모달: 코드 타입 등록/수정 -->
        <CodeTypeModal
            :is-open="codeTypeModal.isOpen"
            :code-type="codeTypeModal.data"
            @close="closeCodeTypeModal"
            @submit="handleCodeTypeSubmit"
        />

        <!-- 모달: 공통코드 등록/수정 -->
        <CodeDetailModal
            :is-open="codeDetailModal.isOpen"
            :code-type-code="selectedCodeType"
            :code="codeDetailModal.data"
            @close="closeCodeDetailModal"
            @submit="handleCodeDetailSubmit"
        />

        <!-- 다이얼로그: 삭제 확인 -->
        <ConfirmDialog
            :is-open="confirmDialog.isOpen"
            :title="confirmDialog.title"
            :message="confirmDialog.message"
            :confirm-text="confirmDialog.confirmText"
            :type="confirmDialog.type"
            @close="closeConfirmDialog"
            @confirm="confirmDialog.onConfirm"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    getAllCodeTypes,
    getCodeDetailsByType,
    createCodeType,
    updateCodeType,
    deleteCodeType,
    createCode,
    updateCode,
    deleteCode
} from '@/api/system/commonCode'
import CodeTypeModal from '@/components/system/CodeTypeModal.vue'
import CodeDetailModal from '@/components/system/CodeDetailModal.vue'
import ConfirmDialog from '@/components/system/ConfirmDialog.vue'

// 기본 상태
const codeTypes = ref([])
const filteredCodeTypes = ref([])
const codeDetails = ref([])
const selectedCodeType = ref(null)
const searchKeyword = ref('')

// 모달 상태
const codeTypeModal = ref({
    isOpen: false,
    data: null
})

const codeDetailModal = ref({
    isOpen: false,
    data: null
})

const confirmDialog = ref({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
    type: 'warning',
    onConfirm: () => {}
})

// 선택된 코드 타입명
const selectedCodeTypeName = computed(() => {
    const found = codeTypes.value.find(ct => ct.code === selectedCodeType.value)
    return found ? found.name : ''
})

// ==================== 데이터 조회 ====================

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

// 공통 코드 목록 조회
const fetchCodeDetails = async (typeCode) => {
    try {
        codeDetails.value = await getCodeDetailsByType(typeCode)
    } catch (error) {
        console.error('공통 코드 조회 실패:', error)
        alert('공통 코드 목록을 불러오는데 실패했습니다.')
    }
}

// ==================== 코드 타입 관리 ====================

// 코드 타입 모달 열기
const openCodeTypeModal = (codeType) => {
    codeTypeModal.value = {
        isOpen: true,
        data: codeType
    }
}

// 코드 타입 모달 닫기
const closeCodeTypeModal = () => {
    codeTypeModal.value = {
        isOpen: false,
        data: null
    }
}

// 코드 타입 등록/수정 처리
const handleCodeTypeSubmit = async (data) => {
    try {
        if (codeTypeModal.value.data) {
            // 수정
            await updateCodeType(data.code, {
                name: data.name,
                description: data.description
            })
            alert('코드 그룹이 수정되었습니다.')
        } else {
            // 등록
            await createCodeType(data)
            alert('코드 그룹이 등록되었습니다.')
        }
        closeCodeTypeModal()
        await fetchCodeTypes()
    } catch (error) {
        console.error('코드 타입 저장 실패:', error)
        alert(error.response?.data?.message || '코드 그룹 저장에 실패했습니다.')
    }
}

// 코드 타입 삭제 확인
const deleteCodeTypeConfirm = async (codeType) => {
    try {
        // 하위 공통코드 확인
        const codes = await getCodeDetailsByType(codeType.code)

        if (codes && codes.length > 0) {
            alert(`${codeType.name} (${codeType.code}) 그룹에 ${codes.length}개의 하위 코드가 존재합니다.\n하위 코드를 모두 삭제한 후 다시 시도해주세요.`)
            return
        }

        // 하위 코드가 없으면 삭제 확인 다이얼로그 표시
        confirmDialog.value = {
            isOpen: true,
            title: '코드 그룹 삭제',
            message: `${codeType.name} (${codeType.code}) 그룹을 삭제하시겠습니까?\n\n⚠️ 사용 중인 코드를 삭제하면 시스템 오류가 발생할 수 있습니다.`,
            confirmText: '삭제',
            type: 'danger',
            onConfirm: () => handleDeleteCodeType(codeType.code)
        }
    } catch (error) {
        console.error('하위 코드 확인 실패:', error)
        alert('하위 코드 확인 중 오류가 발생했습니다.')
    }
}

// 코드 타입 삭제 처리
const handleDeleteCodeType = async (code) => {
    try {
        await deleteCodeType(code)
        alert('코드 그룹이 삭제되었습니다.')
        closeConfirmDialog()

        // 삭제된 타입이 선택되어 있었다면 초기화
        if (selectedCodeType.value === code) {
            selectedCodeType.value = null
            codeDetails.value = []
        }

        await fetchCodeTypes()
    } catch (error) {
        console.error('코드 타입 삭제 실패:', error)
        alert(error.response?.data?.message || '코드 그룹 삭제에 실패했습니다.')
    }
}

// ==================== 공통코드 관리 ====================

// 공통코드 모달 열기
const openCodeDetailModal = (code) => {
    codeDetailModal.value = {
        isOpen: true,
        data: code
    }
}

// 공통코드 모달 닫기
const closeCodeDetailModal = () => {
    codeDetailModal.value = {
        isOpen: false,
        data: null
    }
}

// 공통코드 등록/수정 처리
const handleCodeDetailSubmit = async (data) => {
    try {
        if (codeDetailModal.value.data) {
            // 수정 - description 필드로 영문명 전송
            await updateCode(data.code, {
                name: data.name,
                description: data.description,
                sortOrder: data.sortOrder,
                isUsed: data.isUsed
            })
            alert('공통코드가 수정되었습니다.')
        } else {
            // 등록
            await createCode(data)
            alert('공통코드가 등록되었습니다.')
        }
        closeCodeDetailModal()
        await fetchCodeDetails(selectedCodeType.value)
    } catch (error) {
        console.error('공통코드 저장 실패:', error)
        alert(error.response?.data?.message || '공통코드 저장에 실패했습니다.')
    }
}

// 공통코드 삭제 확인
const deleteCodeConfirm = (code) => {
    confirmDialog.value = {
        isOpen: true,
        title: '공통코드 삭제',
        message: `${code.name} (${code.code}) 코드를 삭제하시겠습니까?\n\n⚠️ 사용 중인 코드를 삭제하면 시스템 오류가 발생할 수 있습니다.`,
        confirmText: '삭제',
        type: 'danger',
        onConfirm: () => handleDeleteCode(code.code)
    }
}

// 공통코드 삭제 처리
const handleDeleteCode = async (code) => {
    try {
        await deleteCode(code)
        alert('공통코드가 삭제되었습니다.')
        closeConfirmDialog()
        await fetchCodeDetails(selectedCodeType.value)
    } catch (error) {
        console.error('공통코드 삭제 실패:', error)
        alert(error.response?.data?.message || '공통코드 삭제에 실패했습니다.')
    }
}

// ==================== 다이얼로그 ====================

// 확인 다이얼로그 닫기
const closeConfirmDialog = () => {
    confirmDialog.value = {
        isOpen: false,
        title: '',
        message: '',
        confirmText: '확인',
        type: 'warning',
        onConfirm: () => {}
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

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.panel-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
}

.btn-add {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #4C4CDD;
    color: white;
    border: none;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-add:hover {
    background: #3d3dbb;
    transform: scale(1.05);
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
    flex-direction: column;
    margin-bottom: 4px;
    border-radius: 6px;
    transition: all 0.15s;
    border: 1px solid transparent;
    overflow: hidden;
}

.code-type-item:hover {
    background: #f9fafb;
}

.code-type-item.active {
    background: #eff6ff;
    border-color: #4C4CDD;
}

.code-type-content {
    display: flex;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    flex: 1;
}

.code-type-actions {
    display: none;
    padding: 8px 12px;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
    gap: 8px;
    justify-content: flex-end;
    flex-direction: row;
}

.code-type-item:hover .code-type-actions {
    display: flex;
}

.action-btn {
    padding: 4px 10px;
    border-radius: 4px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
    background: white;
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn:hover {
    transform: scale(1.1);
}

.edit-btn:hover {
    background: #dbeafe;
}

.delete-btn:hover {
    background: #fee2e2;
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

/* ===== 우측 공통 코드 패널 ===== */
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

.btn-add-code {
    padding: 8px 16px;
    background: #4C4CDD;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.btn-add-code:hover {
    background: #3d3dbb;
    transform: translateY(-1px);
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
.col-code { width: 140px; }
.col-name { width: 180px; }
.col-eng { min-width: 200px; }
.col-ref { width: 100px; }
.col-order { width: 80px; }
.col-used { width: 80px; }
.col-actions { width: 100px; }

.text-center {
    text-align: center;
}

.table-action-btn {
    padding: 4px 8px;
    border: none;
    background: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
    margin: 0 2px;
}

.table-action-btn:hover {
    transform: scale(1.2);
}

.table-action-btn.edit-btn:hover {
    background: #dbeafe;
}

.table-action-btn.delete-btn:hover {
    background: #fee2e2;
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
    font-size: 12px;
    font-weight: 600;
    color: #111827;
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
