<template>
    <div class="gi-detail-page">
        <!-- 상단 헤더 -->
        <div class="page-header">
            <div class="breadcrumb">
                <router-link to="/warehouse/goods-issues">출고지시관리</router-link>
                <span>&gt;</span>
                <span>출고지시상세</span>
            </div>

            <div class="header-content">
                <div class="left-section">
                    <div class="title-row">
                        <h1 class="gi-code">{{ giDetail.giCode }}</h1>
                        <span :class="getStatusClass(giDetail.status)">
                            {{ getStatusLabel(giDetail.status) }}
                        </span>
                    </div>
                    <div class="user-info">
                        <span>지시자: <strong>{{ giDetail.drafterName || '-' }}</strong></span>
                        <span class="divider">|</span>
                        <span>담당자: <strong>{{ giDetail.managerName || '미배정' }}</strong></span>
                    </div>
                </div>

                <!-- 프로그레스 바 -->
                <div class="right-section">
                    <div class="progress-bar">
                        <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
                            <div class="step-circle">1</div>
                            <div class="step-label">출고지시 결재</div>
                        </div>
                        <div class="step-line" :class="{ active: currentStep > 1 }"></div>

                        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
                            <div class="step-circle">2</div>
                            <div class="step-label">출고 완료</div>
                        </div>
                        <div class="step-line" :class="{ active: currentStep > 2 }"></div>

                        <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
                            <div class="step-circle">3</div>
                            <div class="step-label">배송 중</div>
                        </div>
                        <div class="step-line" :class="{ active: currentStep > 3 }"></div>

                        <div class="step" :class="{ active: currentStep >= 4, completed: currentStep === 4 }">
                            <div class="step-circle">4</div>
                            <div class="step-label">배송 완료</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 탭 메뉴 -->
        <div class="tab-menu">
            <button
                :class="{ active: activeTab === 'issue' }"
                @click="activeTab = 'issue'"
            >
                출고지시 관리
            </button>
            <button
                :class="{ active: activeTab === 'delivery' }"
                @click="activeTab = 'delivery'"
            >
                배송 관리
            </button>
        </div>

        <!-- 출고지시 관리 탭 -->
        <div v-if="activeTab === 'issue'" class="tab-content">
            <!-- 정보 카드 영역 -->
            <div class="info-cards">
                <!-- 기본 출고지시 정보 -->
                <div class="info-card">
                    <h3 class="card-title">기본 출고지시 정보</h3>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="label">출고지시번호</span>
                            <span class="value">{{ giDetail.giCode }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">출고지시일시</span>
                            <span class="value">{{ formatDateTime(giDetail.createdAt) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">출고예정일시</span>
                            <span class="value">{{ formatDateTime(giDetail.scheduledAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- 배송지 정보 -->
                <div class="info-card">
                    <h3 class="card-title">배송지 정보</h3>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="label">납품처</span>
                            <span class="value">{{ giDetail.companyName || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">상세 주소</span>
                            <span class="value">{{ giDetail.address || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">수령인 이름</span>
                            <span class="value">{{ giDetail.recipientName || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">수령인 연락처</span>
                            <span class="value">{{ giDetail.recipientContact || '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- 관련 주문 정보 -->
                <div class="info-card">
                    <h3 class="card-title">관련 주문 정보</h3>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="label">주문번호</span>
                            <span class="value link" @click="goToOrder(giDetail.soCode)">
                                {{ giDetail.soCode }}
                            </span>
                        </div>
                        <div class="info-row">
                            <span class="label">고객사명</span>
                            <span class="value">{{ giDetail.clientName || '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">납기일시</span>
                            <span class="value">{{ formatDateTime(giDetail.shippedAt) }}</span>
                        </div>
                    </div>
                    <router-link :to="`/orders/${giDetail.soCode}`" class="view-order-link">
                        주문상세 바로가기 →
                    </router-link>
                </div>
            </div>

            <!-- 출고지시 품목 정보 -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">출고지시 품목 정보</h2>
                    <button
                        class="export-btn"
                        :disabled="giDetail.status !== 'GI_APPR_DONE'"
                        @click="handleGoodsIssue"
                    >
                        출고 지시
                    </button>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 180px;">No</th>
                            <th style="width: 140px;">품목코드</th>
                            <th style="width: 200px;">품목명</th>
                            <th style="width: 180px;">규격</th>
                            <th style="width: 140px;">출고지시수량(A/In)</th>
                            <th style="width: 140px;">출고지시수량(B/Un)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in giDetail.items" :key="index">
                            <td>{{ item.giItemCode }}</td>
                            <td>{{ item.itemCode }}</td>
                            <td>{{ item.itemName }}</td>
                            <td>{{ item.spec || '-' }}</td>
                            <td>{{ formatNumber(item.quantityAUn) }} {{ item.unit }}</td>
                            <td>{{ formatNumber(item.quantityBUn) }} {{ item.unit }}</td>
                        </tr>
                    </tbody>
                    <tfoot v-if="giDetail.items && giDetail.items.length > 0">
                        <tr>
                            <td colspan="4"><strong>합계</strong></td>
                            <td><strong>{{ totalQuantity }}</strong></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- 특이사항 -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">특이사항</h2>
                    <div class="button-group">
                        <button class="btn-secondary">난포서 인쇄</button>
                        <button class="btn-secondary">출고지시서 인쇄</button>
                    </div>
                </div>
                <div class="notes-box">
                    <p>{{ giDetail.note || '-' }}</p>
                </div>
            </div>

            <!-- 출고 지시 결재 진행 상황 -->
            <div class="section">
                <h2 class="section-title">출고 지시 결재 진행 상황</h2>
                <div class="approval-status">
                    <div class="empty-state">
                        <img src="@/assets/새로이새로미.png" alt="결재 없음" class="empty-icon" />
                        <p class="empty-message">진행 중인 결재가 없습니다.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 배송 관리 탭 -->
        <div v-if="activeTab === 'delivery'" class="tab-content">
            <div class="empty-state">
                <p>배송 관리 기능은 준비 중입니다.</p>
            </div>
        </div>

        <!-- 하단 고정 버튼 -->
        <div class="fixed-footer">
            <button
                v-if="canAssignManager && !giDetail.managerName"
                class="btn-primary"
                @click="assignManager"
            >
                담당자 배정
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getGIDetail, assignGIManager, completeGI } from '@/api/shipping/goodsIssue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 권한 체크
const canAssignManager = computed(() => {
    return userStore.hasAuthority('AC_WHS')
})

// 탭 상태
const activeTab = ref('issue')

// 출고지시 상세 데이터
const giDetail = ref({
    giCode: '',
    status: '',
    drafterName: '',
    managerName: '',
    createdAt: '',
    scheduledAt: '',
    companyName: '',
    address: '',
    recipientName: '',
    recipientContact: '',
    soCode: '',
    clientName: '',
    shippedAt: '',
    warehouseName: '',
    note: '',
    approvalCode: '',
    items: []
})

// 현재 단계 계산 (프로그레스 바)
const currentStep = computed(() => {
    const status = giDetail.value.status
    if (status === 'GI_RVW' || status === 'GI_APPR_PEND') return 1
    if (status === 'GI_APPR_DONE' || status === 'GI_ISSUED') return 2
    if (status === 'GI_SHIP_ING') return 3
    if (status === 'GI_SHIP_DONE') return 4
    return 1
})

// 총 수량 계산
const totalQuantity = computed(() => {
    if (!giDetail.value.items || giDetail.value.items.length === 0) return 0
    const total = giDetail.value.items.reduce((sum, item) => sum + (item.quantityAUn || 0), 0)
    return formatNumber(total)
})

// 출고지시 상세 조회
const fetchGIDetail = async () => {
    try {
        const giCode = route.params.giCode
        const response = await getGIDetail(giCode)
        giDetail.value = response
    } catch (error) {
        console.error('출고지시 상세 조회 실패:', error)
        if (error.response?.status === 404) {
            alert('존재하지 않는 출고지시입니다.')
            router.push('/warehouse/goods-issues')
        } else if (error.response?.status !== 401) {
            alert('출고지시 상세를 불러오는데 실패했습니다.')
        }
    }
}

// 담당자 배정
const assignManager = async () => {
    if (!confirm('담당자로 배정하시겠습니까?')) return

    try {
        await assignGIManager(giDetail.value.giCode)
        alert('담당자로 배정되었습니다.')
        fetchGIDetail() // 새로고침
    } catch (error) {
        console.error('담당자 배정 실패:', error)
        alert(error.response?.data?.message || '담당자 배정에 실패했습니다.')
    }
}

// 주문 상세 페이지로 이동
const goToOrder = (soCode) => {
    if (soCode) {
        router.push(`/orders/${soCode}`)
    }
}

// 출고 지시 처리
const handleGoodsIssue = async () => {
    if (giDetail.value.status !== 'GI_APPR_DONE') {
        alert('결재가 완료된 후에 출고 지시를 진행할 수 있습니다.')
        return
    }

    if (!confirm('출고 지시를 진행하시겠습니까?')) return

    try {
        await completeGI(giDetail.value.giCode)
        alert('출고 지시가 완료되었습니다.')
        fetchGIDetail() // 새로고침
    } catch (error) {
        console.error('출고 지시 실패:', error)
        alert(error.response?.data?.message || '출고 지시에 실패했습니다.')
    }
}

// 날짜 포맷팅
const formatDateTime = (value) => {
    if (!value) return '-'
    return value.replace('T', ' ').substring(0, 16)
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (!value && value !== 0) return '-'
    return value.toLocaleString()
}

// 상태 클래스
const getStatusClass = (status) => ({
    GI_RVW: 'status-badge status-review',
    GI_APPR_PEND: 'status-badge status-pending',
    GI_APPR_DONE: 'status-badge status-approved',
    GI_APPR_RJCT: 'status-badge status-reject',
    GI_ISSUED: 'status-badge status-issued',
    GI_SHIP_ING: 'status-badge status-progress',
    GI_SHIP_DONE: 'status-badge status-complete',
    GI_CANCEL: 'status-badge status-cancel'
}[status] || 'status-badge')

// 상태 라벨
const getStatusLabel = (status) => ({
    GI_RVW: '검토중',
    GI_APPR_PEND: '결재중',
    GI_APPR_DONE: '결재완료',
    GI_APPR_RJCT: '결재반려',
    GI_ISSUED: '출고완료',
    GI_SHIP_ING: '배송중',
    GI_SHIP_DONE: '배송완료',
    GI_CANCEL: '취소'
}[status] || status)

// 초기 로드
onMounted(() => {
    fetchGIDetail()
})
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.gi-detail-page {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 100px;
}

/* ===== 상단 헤더 ===== */
.page-header {
    margin-bottom: 24px;
}

.breadcrumb {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 12px;
}

.breadcrumb a {
    color: #4C4CDD;
    text-decoration: none;
}

.breadcrumb a:hover {
    text-decoration: underline;
}

.breadcrumb span {
    margin: 0 8px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 40px;
}

.left-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.right-section {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.gi-code {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.user-info {
    font-size: 14px;
    color: #6b7280;
}

.user-info strong {
    color: #111827;
}

.divider {
    margin: 0 8px;
}

/* ===== 상태 뱃지 ===== */
.status-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
}

.status-review {
    background: #fff7ed;
    color: #c2410c;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-approved {
    background: #e0f2fe;
    color: #0369a1;
}

.status-reject {
    background: #fee2e2;
    color: #991b1b;
}

.status-issued {
    background: #dcfce7;
    color: #166534;
}

.status-progress {
    background: #ede9fe;
    color: #5b21b6;
}

.status-complete {
    background: #e0e7ff;
    color: #3730a3;
}

.status-cancel {
    background: #f3f4f6;
    color: #374151;
}

/* ===== 프로그레스 바 ===== */
.progress-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 24px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.step-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    transition: all 0.3s;
}

.step.active .step-circle {
    background: #4C4CDD;
    color: #ffffff;
}

.step.completed .step-circle {
    background: #10b981;
    color: #ffffff;
}

.step-label {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
}

.step.active .step-label {
    color: #111827;
    font-weight: 600;
}

.step-line {
    width: 60px;
    height: 2px;
    background: #e5e7eb;
    margin: 0 12px;
    margin-bottom: 24px;
    transition: all 0.3s;
}

.step-line.active {
    background: #4C4CDD;
}

/* ===== 탭 메뉴 ===== */
.tab-menu {
    display: flex;
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 24px;
}

.tab-menu button {
    padding: 14px 24px;
    background: none;
    border: none;
    font-size: 15px;
    font-weight: 600;
    color: #6b7280;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
}

.tab-menu button:hover {
    color: #111827;
}

.tab-menu button.active {
    color: #4C4CDD;
}

.tab-menu button.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #4C4CDD;
}

/* ===== 정보 카드 영역 ===== */
.info-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 32px;
}

.info-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
}

.card-title {
    font-size: 16px;
    font-weight: 700;
    color: #4C4CDD;
    margin: 0 0 16px 0;
}

.card-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.info-row .label {
    color: #6b7280;
    font-weight: 500;
}

.info-row .value {
    color: #111827;
    font-weight: 600;
    text-align: right;
}

.info-row .value.link {
    color: #4C4CDD;
    cursor: pointer;
    text-decoration: underline;
}

.view-order-link {
    display: block;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    color: #4C4CDD;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    text-align: right;
}

.view-order-link:hover {
    text-decoration: underline;
}

/* ===== 섹션 ===== */
.section {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 24px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
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
    text-align: center;
    vertical-align: middle;
}

.items-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #111827;
    text-align: center;
    vertical-align: middle;
}

.items-table tfoot td {
    padding: 14px 16px;
    background: #f9fafb;
    border-top: 2px solid #e5e7eb;
    font-size: 14px;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

/* ===== 특이사항 ===== */
.notes-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 16px;
    min-height: 80px;
}

.notes-box p {
    margin: 0;
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
}

/* ===== 결재 상태 ===== */
.approval-status {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.empty-state {
    text-align: center;
    padding: 40px;
}

.empty-icon {
    width: 120px;
    height: 120px;
    margin-bottom: 16px;
    opacity: 0.7;
}

.empty-message {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
}

/* ===== 버튼 ===== */
.button-group {
    display: flex;
    gap: 8px;
}

.btn-secondary {
    padding: 8px 16px;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.export-btn {
    padding: 8px 16px;
    background: #4C4CDD;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.export-btn:hover:not(:disabled) {
    background: #3d3dbb;
}

.export-btn:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
}

/* ===== 고정 하단 버튼 ===== */
.fixed-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 1px solid #e5e7eb;
    padding: 16px 24px;
    display: flex;
    justify-content: flex-end;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    z-index: 100;
}

.btn-primary {
    padding: 12px 32px;
    background: #4C4CDD;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: #3d3dbb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 76, 221, 0.3);
}
</style>
