<template>
  <div v-if="order" class="min-h-screen bg-[#F9FAFB] p-6 font-sans">
    <nav class="mb-2 text-sm text-gray-500">
      <router-link to="/order/management" class="font-medium text-[#4C4CDD] hover:underline">
        주문 관리
      </router-link>
      <span class="mx-2 text-gray-400">›</span>
      <span class="font-normal">{{ order.orderCode }}</span>
    </nav>

    <div class="mb-6 flex flex-col justify-between gap-6 md:flex-row md:items-start">
      <div class="title-left">
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-bold text-black">{{ order.orderCode }}</h1>
          <span :class="getStatusBadgeClass(order.status)" class="rounded-full px-3 py-1 text-sm font-bold">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>
        <div class="mt-2 text-sm font-medium text-[#898989]">
          고객사: {{ order.clientName }} | 
          담당자: 
          <span :class="{ 'text-red-500 font-bold': !order.managerName }">
            {{ order.managerName || '담당자 배정 필요' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div v-for="(step, idx) in steps" :key="idx" class="relative flex items-center gap-3">
          <div class="flex flex-col items-center">
            <div :class="getStepDotClass(idx)" 
                 class="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white transition-colors">
              {{ idx + 1 }}
            </div>
            <span class="mt-1 text-[11px] font-medium text-gray-900">{{ step }}</span>
            <span class="text-[10px] text-gray-400">{{ getStepDate(idx) }}</span>
          </div>
          <div v-if="idx !== steps.length - 1" class="mb-6 h-[2px] w-12 bg-gray-300"></div>
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-white p-6 border border-gray-200">
      <div class="relative mb-6 flex gap-6">
        <button @click="activeTab = 'ORDER'" 
                :class="activeTab === 'ORDER' ? 'font-bold text-black border-b-4 border-[#4C4CDD]' : 'text-gray-500 hover:text-black'"
                class="pb-3 text-lg transition-all">
          주문 관리
        </button>
        <button @click="activeTab = 'PRODUCTION'" 
                :class="activeTab === 'PRODUCTION' ? 'font-bold text-black border-b-4 border-[#4C4CDD]' : 'text-gray-500 hover:text-black'"
                class="pb-3 text-lg transition-all">
          생산/납품/출고 관리
        </button>
        <div class="absolute bottom-0 h-[1px] w-full bg-gray-200"></div>
      </div>

      <div v-if="activeTab === 'ORDER'">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="rounded-xl border border-gray-200 p-5 bg-white min-h-[220px]">
            <h3 class="mb-4 text-lg font-bold text-[#4C4CDD]">기본 주문 정보</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500 font-bold">주문번호</span><span class="text-black">{{ order.orderCode }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 font-bold">주문일</span><span class="text-black">{{ order.orderedAt }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 font-bold">납기일</span><span class="text-black">{{ order.shippedAt }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 font-bold">비고</span><span class="max-w-[150px] text-right text-black">{{ order.note || '-' }}</span></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 p-5 bg-white min-h-[220px]">
            <h3 class="mb-4 text-lg font-bold text-[#4C4CDD]">고객사 정보</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500 font-bold">고객사명</span><span class="text-black">{{ order.clientName }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 font-bold">담당자명</span><span class="text-black">{{ order.clientManagerName }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 font-bold">연락처</span><span class="text-black">{{ order.clientManagerContact }}</span></div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 p-5 bg-white min-h-[220px]">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-[#4C4CDD]">여신 정보</h3>
              <span class="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-600 border border-green-200">✓ 주문 가능</span>
            </div>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between"><span class="text-gray-500 ">여신 한도</span><span class="text-black">₩ {{ formatPrice(order.creditLimit) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 ">주문 가능 금액</span><span class="text-black">₩ {{ formatPrice(order.availablePrice) }}</span></div>
              <div class="flex justify-between"><span class="text-gray-500 ">이번 주문 금액</span><span class="text-black font-bold">₩ {{ formatPrice(order.totalPrice) }}</span></div>
              <div class="flex justify-between border-t pt-2 mt-2"><span class="text-gray-500">주문 반영 후 가능 금액</span><span class="text-green-600 font-bold">₩ {{ formatPrice(order.remainingAmount) }}</span></div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-bold text-[#4C4CDD]">주문 품목 정보</h3>
            <button class="rounded-lg border border-[#4C4CDD] px-3 py-1 text-sm font-bold text-[#4C4CDD] hover:bg-[#F0F0FF]">
              주문서 인쇄
            </button>
          </div>
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 font-bold text-center">
                <tr>
                  <th class="px-4 py-3 border-b">No</th>
                  <th class="px-4 py-3 border-b">품목코드</th>
                  <th class="px-4 py-3 border-b">품목명</th>
                  <th class="px-4 py-3 border-b">규격</th>
                  <th class="px-4 py-3 border-b text-center">수량</th>
                  <th class="px-4 py-3 border-b text-center">가용재고</th>
                  <th class="px-4 py-3 border-b text-center">생산필요량</th>
                  <th class="px-4 py-3 border-b">단가</th>
                  <th class="px-4 py-3 border-b">금액</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in order.items" :key="item.id" class="text-center">
                  <td class="px-4 py-4 text-gray-400 text-xs">{{ idx + 1 }}</td>
                  <td class="px-4 py-4">{{ item.itemCode }}</td>
                  <td class="px-4 py-4 text-gray-900">{{ item.itemName }}</td>
                  <td class="px-4 py-4 text-gray-600">{{ item.spec }}</td>
                  <td class="px-4 py-4 text-center">{{ item.quantity }}</td>
                  <td class="px-4 py-4 text-center">{{ item.availableStock }}</td>
                  <td class="px-4 py-4 text-center text-red-600 font-medium">{{ item.productionRequest }}</td>
                  <td class="px-4 py-4 ">{{ formatPrice(item.unitPrice) }}</td>
                  <td class="px-4 py-4 ">{{ formatPrice(item.totalPrice) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <h3 class="mb-4 text-lg font-bold text-[#4C4CDD]">주문 결재 진행 상황</h3>
        <div class="flex h-50 flex-col items-center justify-center rounded-xl bg-[#F9FAFB] border border-dashed border-gray-300">
          <img src="@/assets/새로이새로미.png" alt="No Approval" class="mb-4 h-24 w-auto opacity-40" />
          <p class="text-gray-400 font-medium">진행 중인 결재 건이 없습니다.</p>
        </div>
      </div>



      <div v-if="activeTab === 'PRODUCTION'">
        <div class="mb-8">
          <div class="flex justify-between items-end mb-3">
            <div>
              <h3 class="text-lg font-bold text-[#4C4CDD]">생산 · 납품 · 출고 현황</h3>
              <p class="text-[11px] text-gray-400 mt-1">
                * 최신 변동 이력 기준
              </p>
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm mb-5">
            <table class="w-full text-left text-sm min-w-[1000px]">
              <thead class="bg-gray-50 text-gray-500 font-bold text-center">
                <tr>
                  <th class="px-2 py-3 border-b">No</th>
                  <th class="px-2 py-3 border-b">품목코드</th>
                  <th class="px-2 py-3 border-b">품목명</th>
                  <th class="px-2 py-3 border-b">주문수량</th>
                  <th class="px-2 py-3 border-b">가용재고</th>
                  <th class="px-2 py-3 border-b">생산요청</th>
                  <th class="px-2 py-3 border-b">생산입고</th>
                  <th class="px-2 py-3 border-b">기납품수량</th>
                  <th class="px-2 py-3 border-b">출고지시</th>
                  <th class="px-2 py-3 border-b">출고완료</th>
                  <th class="px-2 py-3 border-b">배송완료</th>
                  <th class="px-2 py-3 border-b">이력조회</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(hItem, idx) in itemHistory?.items" :key="hItem.itemId" class="text-center hover:bg-gray-50">
                  <td class="px-2 py-4 text-gray-400 text-xs">{{ idx + 1 }}</td>
                  <td class="px-2 py-4">{{ hItem.item.itemCode }}</td>
                  <td class="px-2 py-4 text-gray-900">{{ hItem.item.itemName }}</td>
                  <td class="px-2 py-4 font-medium">{{ formatPrice(hItem.item.quantity) }}</td>
                  <td class="px-2 py-4 font-medium">{{ formatPrice(hItem.item.availableStock) }}</td>
                  <td class="px-2 py-4">{{ formatPrice(hItem.prQuantity) }}</td>
                  <td class="px-2 py-4">{{ formatPrice(hItem.piQuantity) }}</td>
                  <td class="px-2 py-4">{{ formatPrice(hItem.doQuantity) }}</td>
                  <td class="px-2 py-4">{{ formatPrice(hItem.giQuantity) }}</td>
                  <td class="px-2 py-4">{{ formatPrice(hItem.shippedQuantity) }}</td>
                  <td class="px-2 py-4">{{ formatPrice(hItem.completedQuantity) }}</td>
                  <td class="px-2 py-4">
                    <button @click="openHistoryModal(hItem.itemId, hItem.item.itemName)" 
                            class="text-[11px] text-gray-400 underline hover:text-black">
                      이력 조회
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex gap-2 justify-end mb-5">
            <button class="rounded-lg bg-[#4C4CDD] px-4 py-2 text-sm font-bold text-white hover:bg-[#3b3bbb]">생산 설정</button>
            <button class="rounded-lg bg-[#4C4CDD] px-4 py-2 text-sm font-bold text-white hover:bg-[#3b3bbb]">납품 설정</button>
          </div>

          <div class="space-y-8">
            <section v-for="section in docSections" :key="section.title">
              <h3 class="mb-3 text-lg font-bold text-[#4C4CDD]">{{ section.title }}</h3>
              <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table class="w-full text-left text-sm text-center">
                  <thead class="bg-gray-50 text-gray-500 font-bold">
                    <tr>
                      <th class="px-4 py-3 border-b">No</th>
                      <th class="px-4 py-3 border-b">요청번호</th>
                      <th class="px-4 py-3 border-b">품목명</th>
                      <th class="px-4 py-3 border-b">상태</th>
                      <th class="px-4 py-3 border-b">작성일</th>
                      <th class="px-4 py-3 border-b">문서</th>
                      <th class="px-4 py-3 border-b">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="section.data.length === 0">
                      <td colspan="7" class="py-12 text-center text-gray-400 font-medium">
                        등록된 문서가 없습니다.
                      </td>
                    </tr>
                    <tr v-for="(doc, dIdx) in section.data" :key="doc.code" class="border-b last:border-0">
                      <td class="px-4 py-4">{{ dIdx + 1 }}</td>
                      <td class="px-4 py-4 font-medium text-[#4C4CDD]">{{ doc.code }}</td>
                      <td class="px-4 py-4">{{ doc.itemName }}</td>
                      <td class="px-4 py-4">
                        <span :class="section.statusClass">{{ doc.status }}</span>
                      </td>
                      <td class="px-4 py-4 text-gray-500">{{ doc.date }}</td>
                      <td class="px-4 py-4">
                        <button class="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">미리보기</button>
                      </td>
                      <td class="px-4 py-4 flex justify-center gap-1">
                        <button class="rounded border border-gray-300 px-2 py-1 text-xs">수정</button>
                        <button class="rounded bg-[#4C4CDD] px-2 py-1 text-xs text-white">바로가기</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div v-if="order.status === 'ORD_RED' && activeTab === 'ORDER'" class="flex justify-end mt-5">
          <button @click="openAssignmentModal" 
                  class="rounded-lg px-3 py-2 text-sm font-bold text-[#fff] bg-[#4C4CDD] hover:bg-[#4c4cddba]">
              담당자 배정
        </button>
      </div>
      
      <ManagerAssignmentModal 
        v-if="isModalOpen" 
        :departmentData="deptEmployees"
        @close="isModalOpen = false"
        @confirm="onConfirmAssignment"
      />
    </div>

    <div v-if="isHistoryModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b p-5">
          <h3 class="text-xl font-bold text-gray-900">
            <span class="text-[#4C4CDD]">{{ selectedItemName }}</span> 변동 이력
          </h3>
          <button @click="isHistoryModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <table class="w-full text-center text-sm">
              <thead class="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th class="px-3 py-3 border-b">가용재고</th>
                  <th class="px-3 py-3 border-b">생산요청</th>
                  <th class="px-3 py-3 border-b">생산입고</th>
                  <th class="px-3 py-3 border-b">기납품수량</th>
                  <th class="px-3 py-3 border-b">출고지시</th>
                  <th class="px-3 py-3 border-b">출고완료</th>
                  <th class="px-3 py-3 border-b">배송완료</th>
                  <th class="px-3 py-3 border-b">이력 생성일시</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="historyDetails.length === 0">
                  <td colspan="8" class="py-12">
                    <div class="flex flex-col items-center justify-center">
                      <img 
                        src="@/assets/새로이새로미.png" 
                        alt="No Data" 
                        class="mb-4 h-16 w-auto opacity-40" 
                      />
                      <p class="text-gray-400 font-medium">변동 이력 데이터가 없습니다.</p>
                    </div>
                  </td>
                </tr>
                <tr v-for="h in historyDetails" :key="h.historyId">
                  <td class="px-3 py-4 font-medium">{{ formatPrice(h.item.availableStock) }}</td>
                  <td class="px-3 py-4">{{ formatPrice(h.prQuantity) }}</td>
                  <td class="px-3 py-4">{{ formatPrice(h.piQuantity) }}</td>
                  <td class="px-3 py-4">{{ formatPrice(h.doQuantity) }}</td>
                  <td class="px-3 py-4">{{ formatPrice(h.giQuantity) }}</td>
                  <td class="px-3 py-4">{{ formatPrice(h.shippedQuantity) }}</td>
                  <td class="px-3 py-4">{{ formatPrice(h.completedQuantity) }}</td>
                  <td class="px-3 py-4 text-xs text-gray-500">{{ h.createdAt || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex justify-end p-5 border-t">
          <button @click="isHistoryModalOpen = false" class="rounded-lg bg-gray-100 px-6 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSODetail, assignManager, getOrderItemsHistory, getItemHistory } from '@/api/order/salesOrder';
import { getEmployees } from '@/api/employee/employee';
import ManagerAssignmentModal from './ManagerAssignmentModal.vue';

const route = useRoute();
const activeTab = ref('ORDER');
const order = ref(null);
const itemHistory = ref(null);
const isModalOpen = ref(false);
const deptEmployees = ref([]);

const isHistoryModalOpen = ref(false);
const selectedItemName = ref('');
const historyDetails = ref([]);


const steps = ['접수/검토', '주문 결재', '생산/출고', '배송 완료'];

const currentStepIndex = computed(() => {
    const status = order.value?.status;
    if (!status) return -1;
    if (['ORD_RED', 'ORD_RVW'].includes(status)) return 0;
    if (status.includes('APPR')) return 1;
    if (['ORD_WORK_REQ', 'ORD_PRO', 'ORD_SHIP_READY', 'ORD_SHIPPING'].includes(status)) return 2;
    if (status === 'ORD_DONE') return 3;
    return -1;
});

const getStepDotClass = (idx) => {
    const cur = currentStepIndex.value;
    if (cur === -1) return 'bg-[#CBD5E0]';
    if (cur === 3) return 'bg-[#0FBA81]';
    if (idx < cur) return 'bg-[#0FBA81]'; 
    if (idx === cur) return 'bg-[#4C4CDD]';
    return 'bg-[#CBD5E0]';
};

const getStepDate = (idx) => {
    if (idx === 0) return order.value?.orderedAt?.slice(0, 10);
    return '-';
};

const fetchDetail = async () => {
    try {
        const data = await getSODetail(route.params.orderId);
        order.value = data;
    } catch (err) {
        console.error('상세 정보 조회 실패:', err);
    }
};

const fetchHistory = async () => {
  try {
    const data = await getOrderItemsHistory(route.params.orderId);
    itemHistory.value = data;
  } catch (err) {
    console.error('이력 조회 실패:', err);
  }
};

const openHistoryModal = async (itemId, itemName) => {
  if (!itemId) return;

  selectedItemName.value = itemName;
  historyDetails.value = [];

  try {
    const data = await getItemHistory(route.params.orderId, itemId);
    historyDetails.value = data.items || [];
    isHistoryModalOpen.value = true;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      historyDetails.value = []; 
      isHistoryModalOpen.value = true;
    } else {
      console.error('이력 상세 조회 중 오류 발생:', err);
      alert('이력 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }
};

watch(activeTab, (newTab) => {
  if (newTab === 'PRODUCTION') {
    fetchHistory();
  }
});

const openAssignmentModal = async () => {
  try {
    const response = await getEmployees('DEPT_SAL');
    deptEmployees.value = Array.isArray(response[0]) ? response[0] : response; 
    isModalOpen.value = true;
  } catch (error) {
    console.error('데이터 로드 실패:', error);
  }
};

const onConfirmAssignment = async (employee) => {
    try {
        await assignManager(route.params.orderId, employee.id);
        alert(`담당자가 ${employee.name}(으)로 배정되었습니다.`);
        isModalOpen.value = false;
        await fetchDetail(); 
    } catch (error) {
        console.error('담당자 배정 중 오류 발생:', error);
        alert('담당자 배정에 실패했습니다. 다시 시도해주세요.');
    }
};

const formatPrice = (p) => p ? new Intl.NumberFormat('ko-KR').format(p) : '0';

const getStatusBadgeClass = (s) => {
  const styles = {
    'ORD_RED': 'bg-[#FFFBEB] text-[#B4540A]',
    'ORD_RVW': 'bg-[#FFFBEB] text-[#B4540A]',
    'ORD_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]',
    'ORD_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]',
    'ORD_WORK_REQ': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_PRO': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_SHIP_READY': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_SHIPPING': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_DONE': 'bg-[#F3F4F6] text-[#000000]',
    'ORD_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]',
    'ORD_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'
  };
  return styles[s] || 'bg-gray-100 text-gray-600';
};

const getStatusLabel = (s) => {
    const map = { 
        'ORD_RED': '접수대기', 'ORD_RVW': '주문검토', 'ORD_APPR_PEND': '주문결재중', 
        'ORD_APPR_DONE': '결재승인', 'ORD_PRO': '생산중', 'ORD_SHIP_READY': '배송중', 'ORD_SHIPPING': '출고중', 
        'ORD_DONE': '배송완료', 'ORD_CANCEL': '주문취소' 
    };
    return map[s] || s;
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped>
.font-sans {
  font-family: 'Pretendard', sans-serif;
}

::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background: #E2E8F0;
  border-radius: 10px;
}
</style>