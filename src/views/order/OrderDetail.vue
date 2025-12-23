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

    <div class="rounded-xl bg-white p-6  border border-gray-200">
      <div class="relative mb-6 flex gap-6">
        <button @click="activeTab = 'ORDER'" 
                :class="activeTab === 'ORDER' ? 'font-bold text-black border-b-4 border-[#4C4CDD]' : 'text-gray-500 hover:text-black'"
                class="pb-3 text-lg transition-all">
          주문 관리
        </button>
        <button @click="activeTab = 'PRODUCTION'" 
                :class="activeTab === 'PRODUCTION' ? 'font-bold text-black border-b-4 border-[#4C4CDD]' : 'text-gray-500 hover:text-black'"
                class="pb-3 text-lg transition-all">
          생산/출고 관리
        </button>
        <div class="absolute bottom-0 h-[1px] w-full bg-gray-200"></div>
      </div>

      <div v-if="activeTab === 'ORDER'">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="rounded-xl border border-gray-200 p-5 bg-white min-h-[220px]">
            <h3 class="mb-4 text-lg font-bold text-[#4C4CDD]">기본 주문 정보</h3>
            <div class="space-y-3 text-sm">
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
              <tfoot class="bg-gray-50 font-medium border-t">
                <tr>
                  <!-- No ~ 규격 (1~4) -->
                  <td colspan="4" class="px-4 py-4"></td>

                  <!-- 수량 (5번째, tbody와 동일하게 center) -->
                  <td class="px-4 py-4 text-center font-bold">
                    {{ order.totalQuantity }}
                  </td>

                  <!-- 가용재고 ~ 단가 (6~8) -->
                  <td colspan="3" class="px-4 py-4"></td>

                  <!-- 금액 (9번째) -->
                  <td class="px-4 py-4 text-center text-black text-base font-bold">
                    ₩ {{ formatPrice(order.totalPrice) }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <h3 class="mb-4 text-lg font-bold text-[#4C4CDD]">주문 결재 진행 상황</h3>
        <div class="flex h-64 flex-col items-center justify-center rounded-xl bg-[#F9FAFB] border border-dashed border-gray-300">
          <img src="@/assets/새로이새로미.png" alt="No Approval" class="mb-4 h-24 w-auto opacity-40" />
          <p class="text-gray-400 font-medium">진행 중인 결재 건이 없습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getSODetail } from '@/api/order/salesOrder';

const route = useRoute();
const activeTab = ref('ORDER');
const order = ref(null);

const steps = ['접수/검토', '주문 결재', '생산/출고', '배송 완료'];

const currentStepIndex = computed(() => {
    const status = order.value.status;
    
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

onMounted(fetchDetail);
</script>

<style scoped>
.font-sans {
  font-family: 'Pretendard', sans-serif;
}
</style>