<template>
    <div class="delivery-management-page">
        <!-- 헤더 -->
        <div class="page-header">
            <h1 class="logo">SERO DELIVERY</h1>
            <div class="user-section">
                <div class="user-info">
                    <div class="user-avatar">
                        <span>{{ userInitial }}</span>
                    </div>
                    <div class="user-details">
                        <span class="user-name">{{ userName }}</span>
                        <span class="user-position">{{ userRole }}<span v-if="userPosition"> · {{ userPosition }}</span></span>
                    </div>
                </div>
                <button class="logout-btn" @click="handleLogout">로그아웃</button>
            </div>
        </div>

        <!-- 배송 목록 -->
        <div class="delivery-list">
            <div
                v-for="delivery in deliveries"
                :key="delivery.id"
                class="delivery-card"
                :class="getCardClass(delivery.status)"
            >
                <div class="card-header">
                    <span class="status-badge" :class="getStatusBadgeClass(delivery.status)">
                        {{ getStatusText(delivery.status) }}
                    </span>
                </div>

                <div class="card-body">
                    <div class="delivery-header">
                        <h3 class="delivery-location">{{ delivery.deliveryLocation }}</h3>
                        <span class="gi-code">{{ delivery.giCode }}</span>
                    </div>
                    <div class="delivery-details">
                        <div class="detail-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            <span>{{ delivery.address }}</span>
                        </div>
                        <div v-if="delivery.deliveryNote" class="detail-item note-item">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                            <span class="note-text">{{ delivery.deliveryNote }}</span>
                        </div>
                    </div>
                </div>

                <div class="card-footer">
                    <div class="client-info">
                        <span class="client-name">{{ delivery.clientName }}</span>
                    </div>
                    <div class="contact-info">
                        <span class="contact-label">수령인: {{ delivery.recipientName }}</span>
                        <div class="contact-actions">
                            <a :href="`tel:${delivery.recipientContact}`" class="icon-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                </svg>
                            </a>
                            <button class="icon-btn" @click="openMap(delivery)">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- 상태별 버튼 -->
                    <button
                        v-if="delivery.status === 'GI_ISSUED' || delivery.status === 'GI_SHIP_ISSUED'"
                        class="action-btn start-btn"
                        @click="handleStartDelivery(delivery)"
                    >
                        배송 시작
                    </button>
                    <button
                        v-else-if="delivery.status === 'GI_SHIP_ING'"
                        class="action-btn complete-btn"
                        @click="handleCompleteDelivery(delivery)"
                    >
                        배송 완료
                    </button>
                    <div v-else-if="delivery.status === 'GI_SHIP_DONE'" class="completed-badge">
                        ✓ 배송 완료됨
                    </div>
                </div>
            </div>

            <!-- 배송 목록이 없을 때 -->
            <div v-if="deliveries.length === 0 && !loading" class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="empty-icon">
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                </svg>
                <p>배송할 항목이 없습니다.</p>
            </div>
        </div>

        <!-- 지도 모달 -->
        <div v-if="showMapModal" class="modal-overlay" @click="closeMap">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>{{ selectedDelivery?.deliveryLocation }}</h3>
                    <button class="close-btn" @click="closeMap">✕</button>
                </div>
                <div class="modal-body">
                    <div class="map-placeholder">
                        <p>🗺️ 지도 연동 예정</p>
                        <p class="address-text">{{ selectedDelivery?.address }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getGoodsIssueList, startDelivery, completeDelivery } from '@/api/delivery'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const deliveries = ref([])
const loading = ref(false)
const showMapModal = ref(false)
const selectedDelivery = ref(null)

// 로그인 확인 및 토큰에서 사용자 정보 로드
const initializeUser = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
        router.push('/delivery/login')
        return
    }

    // 토큰이 있으면 userStore 초기화
    if (!userStore.isAuthenticated) {
        userStore.setFromToken(token)
    }
}

// 사용자 정보
const userName = computed(() => {
    // localStorage의 name을 우선 사용
    const storedName = localStorage.getItem('name')
    if (storedName) return storedName

    // userStore.user에서 이름 찾기
    if (userStore.user?.name) return userStore.user.name

    // 기본값
    return '사용자'
})
const userRole = computed(() => userStore.userRoleLabel || '사용자')
const userPosition = computed(() => userStore.userPosition || '')
const userInitial = computed(() => {
    const name = userName.value
    return name.charAt(0).toUpperCase()
})

// 로그아웃
const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('name')
        userStore.logout()
        // 완전히 새로고침하면서 로그인 페이지로 이동
        window.location.href = '/delivery/login'
    }
}

// 배송 목록 조회
const loadDeliveries = async () => {
    loading.value = true
    try {
        console.log('=== 배송 목록 조회 시작 ===')

        // 모든 출고지시 조회 (필터링 없음)
        const result = await getGoodsIssueList({})

        console.log('API 응답:', result)
        console.log('응답 타입:', typeof result)
        console.log('응답 개수:', result?.length)
        console.log('응답이 배열인가?:', Array.isArray(result))

        if (!result) {
            console.error('API 응답이 null/undefined')
            deliveries.value = []
            return
        }

        if (!Array.isArray(result)) {
            console.error('API 응답이 배열이 아님:', result)
            deliveries.value = []
            return
        }

        // 배송 관련 상태만 필터링 (GI_ISSUED, GI_SHIP_ISSUED, GI_SHIP_ING, GI_SHIP_DONE)
        const deliveryStatuses = ['GI_ISSUED', 'GI_SHIP_ISSUED', 'GI_SHIP_ING', 'GI_SHIP_DONE']
        const filteredResult = result.filter(item => deliveryStatuses.includes(item.status))

        // API 응답을 배송 관리에 맞게 변환
        deliveries.value = filteredResult.map((item, index) => {
            console.log(`항목 ${index + 1}:`, item)

            // 품목명 포맷: "대표품목" 또는 "대표품목 외 N건"
            let locationText = item.itemName || '배송지'
            if (item.itemCount > 1) {
                locationText += ` 외 ${item.itemCount - 1}건`
            }

            return {
                id: item.id,
                giCode: item.giCode,
                soCode: item.soCode,
                doCode: item.doCode,
                status: item.status,
                deliveryLocation: locationText,
                address: item.clientAddress || '주소 정보 없음',
                clientName: item.clientName || '고객사 정보 없음',
                recipientName: item.recipientName || '담당자 정보 없음',
                recipientContact: item.recipientContact || '010-0000-0000',
                deliveryNote: item.deliveryNote,
                shippedAt: item.shippedAt
            }
        })

        console.log('변환된 배송 목록:', deliveries.value)
        console.log('변환된 배송 개수:', deliveries.value.length)
        console.log('=== 배송 목록 조회 완료 ===')
    } catch (error) {
        console.error('배송 목록 조회 실패:', error)
        console.error('에러 상세:', error.response?.data)
        console.error('에러 상태:', error.response?.status)
        alert('배송 목록을 불러오는데 실패했습니다.')
    } finally {
        loading.value = false
    }
}

// 배송 시작
const handleStartDelivery = async (delivery) => {
    if (!confirm(`${delivery.deliveryLocation} 배송을 시작하시겠습니까?`)) {
        return
    }

    try {
        await startDelivery(delivery.giCode)
        alert('배송이 시작되었습니다.')
        await loadDeliveries() // 목록 새로고침
    } catch (error) {
        console.error('배송 시작 실패:', error)
        alert('배송 시작에 실패했습니다.')
    }
}

// 배송 완료
const handleCompleteDelivery = async (delivery) => {
    if (!confirm(`${delivery.deliveryLocation} 배송을 완료 처리하시겠습니까?`)) {
        return
    }

    try {
        await completeDelivery(delivery.giCode)
        alert('배송이 완료되었습니다.')
        await loadDeliveries() // 목록 새로고침
    } catch (error) {
        console.error('배송 완료 실패:', error)
        alert('배송 완료 처리에 실패했습니다.')
    }
}

// 지도 열기
const openMap = (delivery) => {
    selectedDelivery.value = delivery
    showMapModal.value = true
}

// 지도 닫기
const closeMap = () => {
    showMapModal.value = false
    selectedDelivery.value = null
}

// 상태 텍스트
const getStatusText = (status) => {
    const statusMap = {
        'GI_ISSUED': '배송대기',
        'GI_SHIP_ISSUED': '배송중',
        'GI_SHIP_ING': '배송중',
        'GI_SHIP_DONE': '배송완료'
    }
    return statusMap[status] || status
}

// 카드 클래스
const getCardClass = (status) => {
    if (status === 'GI_SHIP_DONE') return 'card-completed'
    if (status === 'GI_SHIP_ING') return 'card-shipping'
    if (status === 'GI_ISSUED') return 'card-waiting'
    return 'card-issued'
}

// 상태 뱃지 클래스
const getStatusBadgeClass = (status) => {
    if (status === 'GI_SHIP_DONE') return 'badge-completed'
    if (status === 'GI_SHIP_ING') return 'badge-shipping'
    if (status === 'GI_ISSUED') return 'badge-waiting'
    return 'badge-issued'
}

// 초기 로드
onMounted(() => {
    initializeUser()
    loadDeliveries()
})
</script>

<style scoped>
.delivery-management-page {
    min-height: 100vh;
    background: #f3f4f6;
    padding-bottom: 20px;
}

/* 헤더 */
.page-header {
    background: #4C4CDD;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    letter-spacing: 2px;
}

/* 사용자 섹션 */
.user-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ffffff;
    color: #4C4CDD;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.user-name {
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
}

.user-position {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 400;
}

.logout-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.logout-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
}

/* 배송 목록 */
.delivery-list {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 배송 카드 */
.delivery-card {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
}

.delivery-card:active {
    transform: scale(0.98);
}

.card-waiting {
    border-left: 4px solid #8b5cf6;
}

.card-issued {
    border-left: 4px solid #fbbf24;
}

.card-shipping {
    border-left: 4px solid #3b82f6;
}

.card-completed {
    border-left: 4px solid #10b981;
    opacity: 0.8;
}

.card-header {
    padding: 12px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.badge-waiting {
    background: #ede9fe;
    color: #5b21b6;
}

.badge-issued {
    background: #fef3c7;
    color: #92400e;
}

.badge-shipping {
    background: #dbeafe;
    color: #1e40af;
}

.badge-completed {
    background: #d1fae5;
    color: #065f46;
}

.card-body {
    padding: 16px;
}

.delivery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.delivery-location {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.gi-code {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    background: #f3f4f6;
    padding: 4px 8px;
    border-radius: 4px;
}

.delivery-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 14px;
}

.detail-item .icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.note-item {
    background: #fef3c7;
    padding: 8px;
    border-radius: 6px;
    border-left: 3px solid #f59e0b;
}

.note-text {
    color: #92400e;
    font-weight: 500;
}

.card-footer {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.client-info {
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
}

.client-name {
    font-size: 15px;
    font-weight: 700;
    color: #4C4CDD;
}

.contact-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.contact-label {
    font-size: 14px;
    color: #374151;
    font-weight: 500;
}

.contact-actions {
    display: flex;
    gap: 8px;
}

.icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    color: #4C4CDD;
}

.icon-btn:hover {
    background: #f3f4f6;
    border-color: #4C4CDD;
}

.icon-btn svg {
    width: 20px;
    height: 20px;
}

.action-btn {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.start-btn {
    background: #4C4CDD;
    color: #ffffff;
}

.start-btn:hover {
    background: #3d3dbb;
}

.complete-btn {
    background: #10b981;
    color: #ffffff;
}

.complete-btn:hover {
    background: #059669;
}

.completed-badge {
    text-align: center;
    padding: 14px;
    background: #d1fae5;
    color: #065f46;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
}

/* 빈 상태 */
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
}

.empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    opacity: 0.5;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
}

/* 모달 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
}

.modal-content {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 20px;
    color: #6b7280;
}

.close-btn:hover {
    background: #e5e7eb;
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
}

.map-placeholder {
    background: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 60px 20px;
    text-align: center;
}

.map-placeholder p {
    margin: 8px 0;
    color: #6b7280;
}

.address-text {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
}

/* 반응형 */
@media (max-width: 480px) {
    .page-header {
        padding: 16px;
        flex-wrap: wrap;
        gap: 12px;
    }

    .logo {
        font-size: 20px;
    }

    .user-section {
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }

    .user-details {
        display: none;
    }

    .user-avatar {
        width: 36px;
        height: 36px;
        font-size: 15px;
    }

    .logout-btn {
        padding: 6px 12px;
        font-size: 12px;
    }
}

@media (min-width: 768px) {
    .delivery-list {
        max-width: 800px;
        margin: 0 auto;
    }
}
</style>
