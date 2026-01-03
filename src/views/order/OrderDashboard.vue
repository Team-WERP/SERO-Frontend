<template>
    <div v-if="loading" class="flex h-screen items-center justify-center bg-slate-50">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  
    <div v-else class="min-h-screen bg-[#f8fafc] font-sans p-8">
      <header class="mb-8">
        <h1 class="text-[32px] font-bold">주문 대시보드</h1>
        <p class="text-slate-500 text-sm mt-1">실시간 수주 현황 및 납기 일정을 한 번에 확인합니다.</p>
      </header>
  
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="미확인 주문" :value="mainData.stats.pendingOrderCount" unit="건"/>
        <StatCard title="이번달 주문" :value="mainData.stats.totalOrderCount" unit="건" :diff="mainData.stats.orderCountDiff " unit2="건"/>
        <StatCard title="이번달 주문 금액" :value="formatPrice(mainData.stats.newOrderAmount)" :diff="mainData.stats.amountDiffRate" unit2="%"/>
        <StatCard title="목표 달성률" :value="mainData.stats.goalAchieveRate" unit="%"/>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div class="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-5 bg-[#4C4CDD] rounded-full"></span>
                    <h3 class="font-bold text-[15px]">월별 수주 실적 및 목표 비교</h3>
                </div>
                <button class="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal size="18" />
                </button>
            </div>
          <div class="h-[320px]">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-4 bg-[#4C4CDD] rounded-full"></span>
                    <h3 class="font-bold text-slate-800 text-[16px]">거래처별 TOP 5 수주액</h3>
                    <span class="text-[11px] text-slate-400 ml-1">이달 기준</span>
                </div>
                <div class="text-slate-300">
                    <MoreHorizontal size="18" />
                </div>
            </div>
            <div class="h-[320px] flex items-center justify-center">
                <Doughnut :data="doughnutData" :options="doughnutOptions" />
            </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div class="lg:col-span-12 bg-white p-8 rounded-2xl border border-slate-200">
            <div class="flex items-center gap-2 mb-4">
                <span class="w-2 h-5 bg-[#4C4CDD] rounded-full"></span>
                <h3 class="font-bold text-[15px]">납기 임박/지연 주문</h3>
            </div>

          <div class="overflow-x-auto border border-slate-100 rounded-xl">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-[13px] text-slate-500 text-center">
                  <th class="p-4 uppercase w-16">No</th>
                  <th class="p-4  uppercase">주문번호</th>
                  <th class="p-4 uppercase">고객사</th>
                  <th class="p-4 uppercase">납기일</th>
                  <th class="p-4 uppercase">상태</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-center text-[13px]">
                <tr v-for="(order, index) in mainData.urgentOrders" :key="order.orderId"
                    @click="openOrderModal(order)"
                    class="group hover:bg-blue-50/50 cursor-pointer transition-colors">
                  <td class="p-4 text-slate-400">{{ index + 1 }}</td>
                  <td class="p-4 ">{{ order.orderCode }}</td>
                  <td class="p-4">{{ order.clientName }}</td>
                  <td class="p-4">
                    {{ order.shippedAt }} 
                    <span :class="['ml-2 font-bold', order.dday.includes('+') ? 'text-red-500' : 'text-orange-500']">
                      ({{ order.dday }})
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <span :class="['inline-flex justify-center items-center w-24 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm', 
                                  order.dday.includes('+') ? 'bg-red-500 text-white border-red-600' : 'bg-orange-400 text-white border-orange-500']">
                      {{ order.dday.includes('+') ? '납기 지연' : '납기 임박' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="mainData.urgentOrders.length === 0">
                  <td colspan="5" class="p-20 text-center text-slate-300 text-sm italic">임박하거나 지연된 주문이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200">
          <CalendarWidget 
            :events="calendarData" 
            v-model:selected-date="selectedDate" 
            @change-month="handleMonthChange"
          />
        </div>
  
        <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200">
          
            <div class="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
            <div class="flex items-center gap-2">
                <span class="w-2 h-4 bg-[#4C4CDD] rounded-full"></span>
                <h3 class="font-bold text-[15px]">
                {{ format(selectedDate, 'yyyy-MM-dd') }} 납기 일정
                </h3>
            </div>

                <span class="text-[#4C4CDD] font-bold text-[15px]">
                    {{ selectedDayOrders.length }}건
                </span>
            </div>
          <div class="space-y-5 overflow-y-auto max-h-[600px] pr-2">
            <div v-for="order in selectedDayOrders" :key="order.orderId" 
                 @click="openOrderModal(order)"
                 class="flex gap-4 cursor-pointer hover:bg-slate-50 p-4 rounded-lg transition-colors items-center"> 
              
              <div class="text-[12px] font-bold text-blue-600 bg-blue-50 h-fit px-2 py-1 rounded">
                {{ order.shippedTime }}
              </div>
  
              <div class="flex-1 flex justify-between items-center gap-2"> 
                <div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ order.orderCode }}</div>
                  <div class="text-sm font-bold text-slate-800">{{ order.clientName }}</div>
                </div>
                <div :class="['text-[12px] px-2 py-0.5 rounded font-bold shrink-0', getStatusBadgeClass(order.status)]">
                  {{ statusLabelMap[order.status] || order.status }}
                </div>
              </div>
            </div>
  
            <div v-if="selectedDayOrders.length === 0" class="text-center py-20 text-slate-300 text-sm italic font-light">
              해당 날짜에 등록된 납기 일정이 없습니다.
            </div>
          </div>
        </div>
      </div>
  
      <GoalStatModal v-if="showGoalModal" :data="mainData.monthlyGoal" @close="showGoalModal = false" />
      
      <div v-if="showOrderModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div class="bg-white p-8 rounded-2xl max-w-md w-full">
              <h2 class="text-xl font-bold mb-4">주문 상세 정보</h2>
              <pre class="text-xs bg-slate-50 p-4 rounded mb-4">{{ selectedOrderDetails }}</pre>
              <button @click="showOrderModal = false" class="w-full py-2 bg-slate-800 text-white rounded-xl">닫기</button>
          </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { getDashboard, getDashboardCalendar } from  '@/api/order/salesOrder';
  import { format } from 'date-fns';
  import { Bar, Doughnut } from 'vue-chartjs';
  import { 
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, DoughnutController
  } from 'chart.js';
  import { useRouter } from 'vue-router';

  
  // 컴포넌트 등록
  import StatCard from '@/components/order/StatCard.vue';
  import CalendarWidget from '@/components/order/CalendarWidget.vue';
  import GoalStatModal from '@/components/order/GoalStatModal.vue';
  
  ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, DoughnutController);

  const loading = ref(true);
  const mainData = ref(null);
  const calendarData = ref([]);
  const selectedDate = ref(new Date(2026, 0, 5));
  const showGoalModal = ref(false);
  const showOrderModal = ref(false);
  const selectedOrderDetails = ref(null);
  const router = useRouter();
  
  onMounted(async () => {
    try {
      const params = { year: 2026, month: 1 };
      const [dashRes, calRes] = await Promise.all([
        getDashboard(params),
        getDashboardCalendar(params)
      ]);
      mainData.value = dashRes;
      calendarData.value = calRes;
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      loading.value = false;
    }
  });
  
  const handleMonthChange = async ({ year, month }) => {
    calendarData.value = await getDashboardCalendar({ year, month });
  };
  
  const openOrderModal = (order) => {
    router.push(`/order/management/${order.orderId}`);

  };
  
  const selectedDayOrders = computed(() => {
    const dateStr = format(selectedDate.value, 'yyyy-MM-dd');
    const day = calendarData.value.find(d => d.date === dateStr);
    return day ? day.dailyOrders : [];
  });
  
  const formatPrice = (val) => `₩${(val / 1000000).toFixed(1)}M`;
  
  const chartData = computed(() => ({
    labels: mainData.value?.monthlyGoal.map(g => `${g.goalMonth}월`) || [],
    datasets: [
      { label: '목표액', data: mainData.value?.monthlyGoal.map(g => g.goalAmount), backgroundColor: '#e2e8f0', borderRadius: 4 },
      { label: '수주실적', data: mainData.value?.monthlyGoal.map(g => g.actualAmount), backgroundColor: '#4C4CDD', borderRadius: 4 }
    ]
  }));
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top', align: 'end' } }
  };
  
  const statusLabelMap = { 
    'ORD_RED': '접수대기', 'ORD_RVW': '주문검토', 'ORD_APPR_PEND': '주문결재중', 
    'ORD_APPR_DONE': '결재승인', 'ORD_PRO': '생산중', 
    'ORD_PARTIAL_ING': '부분처리중', 'ORD_SHIPPING': '출고/배송중', 'ORD_DONE': '배송완료', 
    'ORD_APPR_RJCT': '결재반려', 'ORD_CANCEL': '주문취소' 
  };
  
  const getStatusBadgeClass = (s) => {
    const styles = {
      'ORD_RED': 'bg-[#FFFBEB] text-[#B4540A]',
      'ORD_RVW': 'bg-[#FFFBEB] text-[#B4540A]',
      'ORD_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]',
      'ORD_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]',
      'ORD_PRO': 'bg-[#F0F6FF] text-[#1E4ED8]',
      'ORD_PARTIAL_ING': 'bg-[#F0F6FF] text-[#1E4ED8]',
      'ORD_SHIPPING': 'bg-[#F0F6FF] text-[#1E4ED8]',
      'ORD_DONE': 'bg-[#F3F4F6] text-[#000000]',
      'ORD_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]',
      'ORD_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'
    };
    const baseStyle = 'inline-flex justify-center items-center w-20 px-2 py-0.5 rounded text-[10px] font-bold border border-transparent transition-colors';
    
    return `${baseStyle} ${styles[s] || 'bg-gray-100 text-gray-600'}`;
  };

  const doughnutData = computed(() => ({
  labels: mainData.value?.topClients.map(c => c.clientName) || [],
  datasets: [
    {
      data: mainData.value?.topClients.map(c => c.totalAmount) || [],
      backgroundColor: [
        '#4c67dd', 
        '#6379db', 
        '#758cf0', 
        '#7c91eb', 
        '#9daced'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }
  ]
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right', 
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
        font: { size: 12 }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => ` ${context.label}` 
      }
    }
  },
  cutout: '70%' 
};
  </script>