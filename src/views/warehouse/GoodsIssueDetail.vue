<template>
    <div class="gi-detail-page">
        <!-- 로딩 스피너 -->
        <div v-if="isLoading"
            class="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z">
                </path>
            </svg>
        </div>

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

                        <div class="step" :class="{ active: currentStep >= 2, completed: currentStep >= 2 }">
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
            <button :class="{ active: activeTab === 'issue' }" @click="activeTab = 'issue'">
                출고지시 관리
            </button>
            <button :class="{ active: activeTab === 'delivery' }" @click="activeTab = 'delivery'">
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
                            <span class="value link" @click="goToOrder">
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
                    <div class="view-order-link" @click="goToOrder">
                        주문상세 바로가기 →
                    </div>
                </div>
            </div>

            <!-- 출고지시 품목 정보 -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">출고지시 품목 정보</h2>
                    <button class="export-btn" :disabled="giDetail.status !== 'GI_APPR_DONE'" @click="handleGoodsIssue">
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
                        <button class="btn-secondary" @click="openDeliveryOrderPreview">납품서 인쇄</button>

                        <!-- 출고지시서 인쇄 버튼 (담당자 배정 후 표시) -->
                        <button v-if="giDetail.managerName" class="btn-secondary" @click="openGIPreview">
                            출고지시서 인쇄
                        </button>
                        <span v-else class="text-gray-400" style="padding: 8px 16px; font-size: 14px;">
                            담당자 배정 후 출고지시서 인쇄 가능
                        </span>
                    </div>
                </div>
                <div class="notes-box">
                    <p>{{ giDetail.note || '-' }}</p>
                </div>
            </div>

            <!-- 출고 지시 결재 진행 상황 -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">출고 지시 결재 진행 상황</h2>
                    <router-link v-if="giDetail.approvalId" :to="`/approval/${giDetail.approvalId}`"
                        class="view-approval-link">
                        결재 바로가기 →
                    </router-link>
                </div>

                <!-- 결재가 없는 경우 -->
                <div v-if="!giDetail.approvalId" class="approval-status">
                    <div class="empty-state">
                        <img src="@/assets/새로이새로미.png" alt="결재 없음" class="empty-icon" />
                        <p class="empty-message">진행 중인 결재가 없습니다.</p>
                    </div>
                </div>

                <!-- 결재가 있는 경우 -->
                <div v-else class="approval-progress">
                    <!-- 결재 진행 상황 헤더 -->
                    <div class="approval-flow">
                        <!-- 기안 단계 -->
                        <div class="flow-step">
                            <div class="flow-circle completed">기안</div>
                            <div class="flow-info">
                                <div class="flow-label">{{ giDetail.managerName || '기안' }} · {{
                                    giDetail.managerDepartment || '-' }}</div>
                            </div>
                        </div>

                        <!-- 결재 단계들 (동적) -->
                        <template v-for="(line, index) in sortedApprovalLines" :key="index">
                            <div class="flow-arrow">→</div>
                            <div class="flow-step">
                                <div class="flow-circle" :class="{
                                    completed: line.status === 'ALS_APPR',
                                    active: line.status === 'ALS_RVW'
                                }">
                                    {{ getLineTypeLabel(line.lineType) }}
                                </div>
                                <div class="flow-info">
                                    <div class="flow-label">{{ line.approverName }} · {{ line.approverDepartment }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- 결재선 상세 테이블 -->
                    <table class="approval-table">
                        <thead>
                            <tr>
                                <th style="width: 80px;">구분</th>
                                <th style="width: 120px;">이름</th>
                                <th style="width: 150px;">직급/직책</th>
                                <th style="width: 180px;">소속</th>
                                <th style="width: 100px;">상태</th>
                                <th style="width: 180px;">결재일</th>
                                <th>비고</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- 기안자 (담당자) -->
                            <tr>
                                <td><span class="badge-sm green">기안</span></td>
                                <td>{{ giDetail.managerName || '-' }}</td>
                                <td>{{ formatRole(giDetail.managerRank, giDetail.managerPosition) }}</td>
                                <td>{{ giDetail.managerDepartment || '-' }}</td>
                                <td><span class="status-text approved">상신</span></td>
                                <td>{{ formatDateTime(giDetail.createdAt) }}</td>
                                <td>-</td>
                            </tr>

                            <!-- 결재선 목록 -->
                            <tr v-for="(line, index) in sortedApprovalLines" :key="index">
                                <td>
                                    <span :class="['badge-sm', getApprovalBadgeClass(line.status)]">
                                        {{ getLineTypeLabel(line.lineType) }}
                                    </span>
                                </td>
                                <td>{{ line.approverName || '-' }}</td>
                                <td>{{ formatRole(line.approverRank, line.approverPosition) }}</td>
                                <td>{{ line.approverDepartment || '-' }}</td>
                                <td>
                                    <span :class="['status-text', getApprovalStatusClass(line.status)]">
                                        {{ getApprovalStatusLabel(line.status) }}
                                    </span>
                                </td>
                                <td>{{ formatDateTime(line.processedAt) }}</td>
                                <td>{{ line.note || '-' }}</td>
                            </tr>

                            <!-- 결재선이 없을 경우 -->
                            <tr v-if="sortedApprovalLines.length === 0">
                                <td colspan="7" style="text-align: center; color: #9ca3af; padding: 20px;">
                                    결재선 정보가 없습니다.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 배송 관리 탭 -->
        <div v-if="activeTab === 'delivery'" class="tab-content">
            <!-- 출고 정보 -->
            <div class="section">
                <h3 class="card-title">출고 정보</h3>
                <div class="delivery-info-box">
                    <div class="delivery-info-row">
                        <span class="label">주문 번호</span>
                        <span class="value">{{ giDetail.soCode || '-' }}</span>
                    </div>
                    <div class="delivery-info-row">
                        <span class="label">고객사</span>
                        <span class="value">{{ giDetail.companyName || '-' }}</span>
                    </div>
                    <div class="delivery-info-row">
                        <span class="label">배송 상태</span>
                        <span class="value">
                            <span :class="getDeliveryStatusClass(giDetail.status)">
                                {{ getDeliveryStatusText(giDetail.status) }}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- 배송 현황 -->
            <div class="section">
                <h3 class="card-title">배송 현황</h3>
                <div class="delivery-timeline">
                    <!-- 출고 완료 -->
                    <div class="timeline-item" :class="{ active: deliveryStep >= 1, completed: deliveryStep > 1 }">
                        <div class="timeline-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z" />
                            </svg>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">출고 완료</div>
                            <div class="timeline-date">{{ formatDateTime(giDetail.shippedAt) }}</div>
                            <div class="timeline-detail">출고지시가 완료되어 배송 준비가 시작되었습니다.</div>
                        </div>
                    </div>

                    <!-- 배송 중 -->
                    <div class="timeline-item" :class="{ active: deliveryStep >= 2, completed: deliveryStep > 2 }">
                        <div class="timeline-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
                            </svg>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">배송중</div>
                            <div class="timeline-date">{{ giDetail.status === 'GI_SHIP_ING' || giDetail.status ===
                                'GI_SHIP_DONE' ? '배송 진행 중' : '대기' }}</div>
                            <div class="timeline-detail"
                                v-if="giDetail.status === 'GI_SHIP_ING' || giDetail.status === 'GI_SHIP_DONE'">
                                상품이 배송 중입니다.
                            </div>
                        </div>
                    </div>

                    <!-- 도착 완료 -->
                    <div class="timeline-item" :class="{ active: deliveryStep >= 3, completed: deliveryStep === 3 }">
                        <div class="timeline-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">도착 완료</div>
                            <div class="timeline-date">{{ giDetail.status === 'GI_SHIP_DONE' ? '배송 완료' : '대기' }}</div>
                            <div class="timeline-detail" v-if="giDetail.status === 'GI_SHIP_DONE'">
                                고객에게 성공적으로 배송되었습니다.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 하단 고정 버튼 (담당자 배정 모달이 열렸을 때는 숨김) -->
        <div v-if="!isManagerModalOpen" class="fixed-footer">
            <!-- 담당자 미배정 시: 담당자 배정 버튼 -->
            <button v-if="showAssignManagerButton" class="btn-primary-large" @click="assignManager">
                담당자 배정
            </button>

            <!-- 담당자 배정 완료 & 결재 미요청 시: 결재 요청 버튼 -->
            <button v-if="showApprovalRequestButton" class="btn-primary-large" @click="goToCreateApproval">
                결재 상신하기
            </button>
        </div>

        <!-- 납품서 미리보기 모달 -->
        <DeliveryOrderPreviewModal :is-open="isDeliveryOrderModalOpen" :delivery-order="deliveryOrderData"
            @close="closeDeliveryOrderPreview" />

        <!-- 출고지시서 미리보기 모달 -->
        <GoodsIssuePreviewModal :is-open="isGoodsIssueModalOpen" :goods-issue="giDetail" @close="closeGIPreview" />

        <!-- 담당자 배정 모달 -->
        <ManagerAssignmentModal v-if="isManagerModalOpen" :departmentData="deptEmployees"
            @close="isManagerModalOpen = false" @confirm="onConfirmAssignment" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getGIDetail, assignGIManager, completeGI } from '@/api/shipping/goodsIssue'
import { getDODetail } from '@/api/shipping/deliveryOrder'
import { getEmployees } from '@/api/employee/employee'
import DeliveryOrderPreviewModal from '@/components/modals/DeliveryOrderPreviewModal.vue'
import GoodsIssuePreviewModal from '@/components/modals/GoodsIssuePreviewModal.vue'
import ManagerAssignmentModal from '@/views/order/ManagerAssignmentModal.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 권한 체크
const canAssignManager = computed(() => {
    return userStore.hasAuthority('AC_WHS')
})

// 담당자 배정 버튼 표시 여부
const showAssignManagerButton = computed(() => {
    const result = canAssignManager.value &&
        !giDetail.value.managerName &&
        giDetail.value.status === 'GI_RVW'

    console.log('showAssignManagerButton:', {
        canAssignManager: canAssignManager.value,
        managerName: giDetail.value.managerName,
        managerNameType: typeof giDetail.value.managerName,
        notManagerName: !giDetail.value.managerName,
        status: giDetail.value.status,
        result: result
    })

    return result
})

// 결재 요청 버튼 표시 여부
const showApprovalRequestButton = computed(() => {
    const currentUserId = userStore.user?.id
    const isManager = giDetail.value.managerId === currentUserId

    const result = giDetail.value.managerName &&
        giDetail.value.status === 'GI_RVW' &&
        !giDetail.value.approvalId &&
        isManager

    console.log('showApprovalRequestButton:', {
        currentUserId: currentUserId,
        managerId: giDetail.value.managerId,
        isManager: isManager,
        managerName: giDetail.value.managerName,
        status: giDetail.value.status,
        approvalId: giDetail.value.approvalId,
        result: result
    })

    return result
})

// 탭 상태
const activeTab = ref('issue')

// 배송 단계 계산 (타임라인용)
const deliveryStep = computed(() => {
    const status = giDetail.value.status
    if (status === 'GI_ISSUED' || status === 'GI_SHIP_ISSUED') return 1
    if (status === 'GI_SHIP_ING') return 2
    if (status === 'GI_SHIP_DONE') return 3
    return 0
})

// 배송 상태 텍스트
const getDeliveryStatusText = (status) => {
    const statusMap = {
        'GI_ISSUED': '출고 완료',
        'GI_SHIP_ISSUED': '출고 완료',
        'GI_SHIP_ING': '배송 중',
        'GI_SHIP_DONE': '배송 완료'
    }
    return statusMap[status] || '-'
}

// 배송 상태 클래스
const getDeliveryStatusClass = (status) => {
    if (status === 'GI_SHIP_DONE') return 'delivery-status-badge delivery-completed'
    if (status === 'GI_SHIP_ING') return 'delivery-status-badge delivery-shipping'
    if (status === 'GI_ISSUED' || status === 'GI_SHIP_ISSUED') return 'delivery-status-badge delivery-issued'
    return 'delivery-status-badge'
}

// 납품서 미리보기 모달 상태
const isDeliveryOrderModalOpen = ref(false)

// 출고지시서 미리보기 모달 상태
const isGoodsIssueModalOpen = ref(false)

// 담당자 배정 모달 상태
const isManagerModalOpen = ref(false)

// 직원 목록 데이터
const deptEmployees = ref([])

// 로딩 상태
const isLoading = ref(true)

// 납품서 데이터 (실제 API에서 가져온 데이터)
const deliveryOrderData = ref({
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

// 납품서 상세 조회
const fetchDeliveryOrderDetail = async (doCode) => {
    try {
        const response = await getDODetail(doCode)
        deliveryOrderData.value = response
        console.log('납품서 상세 조회 성공:', response)
    } catch (error) {
        console.error('납품서 상세 조회 실패:', error)
        alert('납품서 정보를 불러오는데 실패했습니다.')
    }
}

// 납품서 미리보기 모달 핸들러
const openDeliveryOrderPreview = async () => {
    console.log('납품서 미리보기 열기 시도:', {
        giCode: giDetail.value.giCode,
        doCode: giDetail.value.doCode,
        hasDoCode: !!giDetail.value.doCode
    })

    if (!giDetail.value.doCode) {
        console.error('doCode가 없습니다. giDetail:', giDetail.value)
        alert('납품서 정보가 없습니다.\n출고지시와 연결된 납품서가 없는 것 같습니다.')
        return
    }

    // 납품서 데이터 조회
    await fetchDeliveryOrderDetail(giDetail.value.doCode)

    // 모달 열기
    isDeliveryOrderModalOpen.value = true
}

const closeDeliveryOrderPreview = () => {
    isDeliveryOrderModalOpen.value = false
}

// 출고지시서 미리보기 핸들러
const openGIPreview = () => {
    console.log('출고지시서 미리보기 열기:', {
        giCode: giDetail.value.giCode,
        status: giDetail.value.status
    })
    isGoodsIssueModalOpen.value = true
}

const closeGIPreview = () => {
    isGoodsIssueModalOpen.value = false
}

// 출고지시 상세 데이터
const giDetail = ref({
    giCode: '',
    giUrl: '', // PDF URL 추가
    status: '',
    drafterName: '',
    managerName: '',
    managerId: null, // 담당자 ID 추가
    createdAt: '',
    scheduledAt: '',
    companyName: '',
    address: '',
    recipientName: '',
    recipientContact: '',
    soId: null,
    soCode: '',
    doCode: '',
    clientName: '',
    shippedAt: '',
    warehouseName: '',
    note: '',
    approvalCode: '',
    approvalId: null,
    items: [],
    approvalLines: []
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

// 결재선 정렬 (sequence 기준)
const sortedApprovalLines = computed(() => {
    if (!giDetail.value.approvalLines || giDetail.value.approvalLines.length === 0) return []
    return [...giDetail.value.approvalLines].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
})


// 결재 구분 라벨
const getLineTypeLabel = (lineType) => {
    const labels = {
        'AT_APPR': '결재',
        'AT_RVW': '협조'
    }
    return labels[lineType] || '결재'
}

// 결재 상태 라벨
const getApprovalStatusLabel = (status) => {
    const labels = {
        'ALS_APPR': '승인',
        'ALS_RVW': '검토중',
        'ALS_PEND': '대기',
        'ALS_RJCT': '반려'
    }
    return labels[status] || '-'
}

// 결재 상태 CSS 클래스
const getApprovalStatusClass = (status) => {
    if (status === 'ALS_APPR') return 'approved'
    if (status === 'ALS_RVW') return 'pending'
    if (status === 'ALS_PEND') return 'pending'
    if (status === 'ALS_RJCT') return 'rejected'
    return ''
}

// 결재 뱃지 CSS 클래스
const getApprovalBadgeClass = (status) => {
    if (status === 'ALS_APPR') return 'green'
    return ''
}

// 직급/직책 포맷팅
const formatRole = (rank, position) => {
    if (!rank && !position) return '-'
    if (rank && position) return `${rank}/${position}`
    return rank || position
}

// 날짜 시간 포맷팅
const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    if (typeof dateTime === 'string') {
        // ISO 8601 형식 처리 (YYYY-MM-DDTHH:mm:ss)
        if (dateTime.includes('T')) {
            return dateTime.replace('T', ' ').substring(0, 16)
        }
        // 이미 포맷된 형태라면 그대로 반환
        return dateTime
    }
    return '-'
}

// 출고지시 상세 조회
const fetchGIDetail = async () => {
    try {
        isLoading.value = true
        const id = route.params.id
        console.log('Route params:', route.params)
        console.log('GI ID:', id)

        if (!id) {
            console.error('ID is undefined!')
            alert('출고지시 ID가 없습니다.')
            router.push('/warehouse/goods-issues')
            return
        }

        const response = await getGIDetail(id)
        giDetail.value = response

        // 디버깅: 담당자 배정 관련 정보 출력
        console.log('GI Detail:', {
            giCode: giDetail.value.giCode,
            doCode: giDetail.value.doCode,
            status: giDetail.value.status,
            managerName: giDetail.value.managerName,
            approvalId: giDetail.value.approvalId,
            canAssignManager: canAssignManager.value,
            buttonShouldShow: canAssignManager.value && !giDetail.value.managerName && giDetail.value.status === 'GI_RVW'
        })
    } catch (error) {
        console.error('출고지시 상세 조회 실패:', error)
        if (error.response?.status === 404) {
            alert('존재하지 않는 출고지시입니다.')
            router.push('/warehouse/goods-issues')
        } else if (error.response?.status !== 401) {
            alert('출고지시 상세를 불러오는데 실패했습니다.')
        }
    } finally {
        isLoading.value = false
    }
}

// 직원 목록 조회 (물류부만 필터링)
const fetchEmployees = async () => {
    try {
        const response = await getEmployees()
        // 물류부(DEPT_WHS) 소속 직원만 필터링
        deptEmployees.value = response
            .filter(dept => dept.deptCode === 'DEPT_WHS')
            .map(dept => ({
                ...dept,
                teams: dept.teams || []
            }))
    } catch (error) {
        console.error('직원 목록 조회 실패:', error)
        alert('직원 목록을 불러오는데 실패했습니다.')
    }
}

// 담당자 배정 모달 열기
const assignManager = async () => {
    await fetchEmployees()
    isManagerModalOpen.value = true
}

// 담당자 배정 확정
const onConfirmAssignment = async (employee) => {
    try {
        await assignGIManager(giDetail.value.giCode, employee.id)
        alert(`담당자가 ${employee.name}(으)로 배정되었습니다.`)
        isManagerModalOpen.value = false
        await fetchGIDetail()
    } catch (error) {
        console.error('담당자 배정 실패:', error)
        alert(error.response?.data?.message || '담당자 배정에 실패했습니다.')
    }
}

// 결재 상신 페이지로 이동
const goToCreateApproval = () => {
    const routeData = router.resolve({
        path: '/approval/create',
        query: {
            refDocType: 'gi',
            refDocId: giDetail.value.giId
        }
    })

    window.open(routeData.href, '_blank')
}

// 주문 상세 페이지로 이동
const goToOrder = async () => {
    if (giDetail.value.soId) {
        isLoading.value = true
        // DOM 업데이트를 기다린 후 페이지 전환
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 200))
        router.push(`/order/management/${giDetail.value.soId}`)
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

// 라우트 파라미터 변경 감지 (같은 컴포넌트에서 다른 출고지시로 이동할 때)
watch(
    () => route.params.giCode,
    (newGiCode, oldGiCode) => {
        if (newGiCode && newGiCode !== oldGiCode) {
            // 탭을 기본값으로 리셋
            activeTab.value = 'issue'
            // 데이터 다시 로드
            fetchGIDetail()
        }
    }
)
</script>

<style scoped>
/* ===== 페이지 전체 ===== */
.gi-detail-page {
    position: relative;
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

.view-approval-link {
    font-size: 13px;
    color: #4C4CDD;
    text-decoration: none;
    font-weight: 600;
}

.view-approval-link:hover {
    text-decoration: underline;
}

/* ===== 결재 진행 상황 ===== */
.approval-progress {
    padding: 20px 0;
}

/* 결재 플로우 */
.approval-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 20px;
}

.flow-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.flow-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    border: 3px solid #e5e7eb;
    transition: all 0.3s;
}

.flow-circle.completed {
    background: #d1fae5;
    color: #065f46;
    border-color: #10b981;
}

.flow-circle.active {
    background: #dbeafe;
    color: #1e40af;
    border-color: #3b82f6;
}

.flow-info {
    text-align: center;
}

.flow-label {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
}

.flow-arrow {
    font-size: 24px;
    color: #d1d5db;
    margin: 0 20px;
    margin-bottom: 30px;
}

/* 결재 테이블 */
.approval-table {
    width: 100%;
    border-collapse: collapse;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
}

.approval-table thead {
    background: #f9fafb;
}

.approval-table th {
    padding: 12px 16px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
}

.approval-table td {
    padding: 14px 16px;
    text-align: center;
    font-size: 14px;
    color: #111827;
    border-bottom: 1px solid #f3f4f6;
}

.approval-table tbody tr:hover {
    background: #f9fafb;
}

.approval-table tbody tr:last-child td {
    border-bottom: none;
}

.badge-sm {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: #f3f4f6;
    color: #6b7280;
}

.badge-sm.green {
    background: #d1fae5;
    color: #065f46;
}

.status-text {
    font-weight: 600;
    font-size: 13px;
}

.status-text.approved {
    color: #10b981;
}

.status-text.pending {
    color: #f59e0b;
}

.status-text.rejected {
    color: #ef4444;
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
    padding: 20px 40px;
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

.btn-primary-large {
    padding: 14px 48px;
    background: #4C4CDD;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary-large:hover {
    background: #3d3dbb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 76, 221, 0.3);
}

/* ===== 배송 관리 탭 스타일 ===== */
.delivery-info-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.delivery-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
}

.delivery-info-row .label {
    color: #6b7280;
    font-weight: 500;
}

.delivery-info-row .value {
    color: #111827;
    font-weight: 600;
}

/* 배송 상태 뱃지 */
.delivery-status-badge {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
}

.delivery-issued {
    background: #dcfce7;
    color: #166534;
}

.delivery-shipping {
    background: #dbeafe;
    color: #1e40af;
}

.delivery-completed {
    background: #d1fae5;
    color: #065f46;
}

/* 배송 타임라인 */
.delivery-timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.timeline-item {
    display: flex;
    gap: 16px;
    padding: 20px 0;
    position: relative;
    opacity: 0.4;
}

.timeline-item.active {
    opacity: 1;
}

.timeline-item.completed {
    opacity: 0.7;
}

.timeline-item:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 60px;
    bottom: -20px;
    width: 2px;
    background: #e5e7eb;
}

.timeline-item.active:not(:last-child)::before,
.timeline-item.completed:not(:last-child)::before {
    background: #10b981;
}

.timeline-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 1;
}

.timeline-icon svg {
    width: 20px;
    height: 20px;
}

.timeline-item.active .timeline-icon {
    background: #dbeafe;
    color: #3b82f6;
}

.timeline-item.completed .timeline-icon {
    background: #d1fae5;
    color: #10b981;
}

.timeline-content {
    flex: 1;
    padding-top: 4px;
}

.timeline-title {
    font-size: 16px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
}

.timeline-date {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 8px;
}

.timeline-detail {
    font-size: 14px;
    color: #374151;
    line-height: 1.5;
}

/* 이력 정보 */
.history-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    min-height: 150px;
}

.empty-history {
    text-align: center;
    padding: 40px 20px;
    color: #9ca3af;
}

.empty-history p {
    margin: 0;
    font-size: 14px;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.history-item {
    display: flex;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.history-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.history-time {
    font-size: 13px;
    color: #6b7280;
    font-weight: 500;
    white-space: nowrap;
    min-width: 140px;
}

.history-content {
    flex: 1;
}

.history-status {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
}

.history-detail {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
}

/* 반응형 */
@media (max-width: 768px) {
    .delivery-timeline {
        padding-left: 8px;
    }

    .timeline-item {
        gap: 12px;
    }

    .timeline-icon {
        width: 36px;
        height: 36px;
    }

    .timeline-icon svg {
        width: 18px;
        height: 18px;
    }

    .history-item {
        flex-direction: column;
        gap: 8px;
    }

    .history-time {
        min-width: auto;
    }
}
</style>
