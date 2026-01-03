<template>
    <div v-if="loading" class="flex h-screen items-center justify-center bg-slate-50">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  
    <div v-else class="min-h-screen bg-[#f8fafc]">
      <header class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-[32px] font-bold text-slate-800">대시보드</h1>
          <p class="text-slate-500 text-sm mt-1">최근 1년 내의 주문 현황과 진행 상태를 한 눈에 확인하세요.</p>
        </div>
        <div class="text-right">
          <button class="bg-[#4C4CDD] text-white px-4 py-2 rounded font-bold text-sm 0 hover:bg-[#4c4cddc9] transition-all mb-2" @click="goToCreateOrder()">
            + 신규 주문등록
          </button>
        </div>
      </header>
  
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div v-for="stat in statCards" :key="stat.title" class="bg-white p-6 rounded-2xl border border-slate-200">
          <p class="text-slate-500 text-sm font-medium mb-2">{{ stat.title }}</p>
          <div class="flex items-baseline gap-1">
            <span :class="['text-3xl font-bold', stat.colorClass]">{{ stat.value }}</span>
            <span class="text-lg font-bold text-slate-400">건</span>
          </div>
        </div>
      </div>
  
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-5 bg-[#4C4CDD] rounded-full"></span>
              <h3 class="font-bold text-slate-800">주문 진행 현황</h3>
            </div>
            <span class="text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded">단위: 건</span>
          </div>
          <div class="h-[300px] flex items-center justify-center">
            <Doughnut :data="chartData" :options="chartOptions" />
          </div>
        </div>
  
        <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200">
          <div class="flex justify-between items-center mb-6 border-b pb-4">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-5 bg-[#4C4CDD] rounded-full"></span>
              <h3 class="font-bold text-slate-800">공지 & 시스템 알림</h3>
            </div>
            <button class="text-xs text-slate-400 hover:underline">더 보기</button>
          </div>
          <div v-if="dashboardData.notices.length > 0" class="space-y-4">
            <div v-for="notice in dashboardData.notices" :key="notice.id" class="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
               <div class="flex items-center gap-2 mb-1">
                 <span v-if="notice.isEmergency" class="bg-rose-100 text-rose-600 text-[10px] font-bold px-1.5 py-0.5 rounded">중요</span>
                 <h4 class="text-sm font-semibold text-slate-700 truncate">{{ notice.title }}</h4>
               </div>
            </div>
          </div>
          <div v-else class="h-[240px] flex flex-col items-center justify-center text-slate-400">
            <img src="@/assets/새로이새로미.png" alt="No Approval" class="mb-4 h-24 w-auto opacity-40" /> 
            <span class="text-sm">등록된 공지사항이 없습니다.</span>
          </div>
        </div>
  
        <div class="lg:col-span-12 bg-white p-6 rounded-2xl border border-slate-200 -sm">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-5 bg-[#4C4CDD] rounded-full"></span>
              <h3 class="font-bold text-slate-800">최근 주문 내역</h3>
            </div>
            <button class="text-[13px] text-[#4C4CDD] hover:underline" @click="goToList()">전체 보기</button>
          </div>
  
          <div class="overflow-x-auto">
            <table class="w-full text-centerborder-collapse">
              <thead>
                <tr class="bg-slate-50 text-slate-500 text-[13px] font-bold border-y border-slate-100 uppercase tracking-wider">
                  <th class="p-4">주문번호</th>
                  <th class="p-4">대표 품목</th>
                  <th class="p-4 text-center">총 수량</th>
                  <th class="p-4">납기 요청일</th>
                  <th class="p-4 text-center">진행 상태</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-center text-[13px]">
                <tr v-for="order in dashboardData.orderList" :key="order.orderId" class="hover:bg-slate-50 transition-colors" @click="goToDetail(order.orderId)">
                  <td class="p-4">{{ order.soCode }}</td>
                  <td class="p-4 text-center">
                    <div class="flex items-baseline justify-center gap-2">
                        <div>
                        {{ order.mainItemName }}
                        </div>
                        <div 
                            v-if="order.totalItemCount > 1">
                            외 {{ order.totalItemCount - 1 }}건
                        </div>
                    </div>
                  </td>
                  <td class="p-4">{{ order.totalQuantity.toLocaleString() }}</td>
                  <td class="p-4 ">{{ order.shippedAt.split(' ')[0] }}</td>
                  <td class="p-4">
                    <span :class="['px-3 py-1 rounded-full text-[11px] font-bold', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { getClientDashboard } from '@/api/client/clientDashboard';
  import { Doughnut } from 'vue-chartjs';
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import { useRouter } from 'vue-router';
  
  ChartJS.register(ArcElement, Tooltip, Legend);
  
  const router = useRouter();
  const loading = ref(true);
  const dashboardData = ref({
    stats: {},
    notices: [],
    orderList: []
  });
  
  onMounted(async () => {
    try {
      const data = await getClientDashboard();
      dashboardData.value = data;
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      loading.value = false;
    }
  });
  
  const statCards = computed(() => {
    const { stats } = dashboardData.value;
    return [
      { title: '납기 임박 (7일 이내)', value: stats.nearDeadlineCount || 0, colorClass: 'text-rose-600' },
      { title: '접수 대기', value: stats.pendingCount || 0, colorClass: 'text-amber-500' },
      { title: '진행 중', value: stats.inProgressCount || 0, colorClass: 'text-blue-600' },
      { title: '완료', value: stats.doneCount || 0, colorClass: 'text-emerald-600' }
    ];
  });

  const getStatusLabel = (status) => {
    const map = { 'CLI_SO_RED': '접수대기', 'CLI_SO_ING': '진행중', 'CLI_SO_SHIPPING': '배송중', 'CLI_SO_DONE': '완료', 'CLI_SO_CANCEL': '취소' };
    return map[status] || status;
  };
  
  const getStatusClass = (status) => {
    const base = 'border ';
    const map = {
      'CLI_SO_RED': 'bg-amber-50 text-amber-600 border-amber-200',
      'CLI_SO_ING': 'bg-blue-50 text-blue-600 border-blue-200',
      'CLI_SO_SHIPPING': 'bg-indigo-50 text-indigo-600 border-indigo-200',
      'CLI_SO_DONE': 'bg-emerald-50 text-emerald-600 border-emerald-200',
      'CLI_SO_CANCEL': 'bg-rose-50 text-rose-600 border-rose-200'
    };
    return base + (map[status] || 'bg-gray-50 text-gray-600 border-gray-200');
  };

  const goToCreateOrder = () => router.push(`/client-portal/order-create`);
  const goToList = () => router.push(`/client-portal/orders`);
  const goToDetail = (orderId) => router.push(`/client-portal/orders/${orderId}`);

  
  const chartData = computed(() => ({
    labels: ['접수대기', '진행중', '완료'],
    datasets: [{
      data: [
        dashboardData.value.stats.pendingCount,
        dashboardData.value.stats.inProgressCount,
        dashboardData.value.stats.doneCount
      ],
      backgroundColor: ['#f59e0b', '#2563eb', '#10b981'],
      hoverOffset: 4
    }]
  }));
  
  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: { size: 12 },
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              return {
                text: `${label}`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].backgroundColor[i],
                lineWidth: 0,
                hidden: false,
                index: i
              };
            });
          }
          return [];
        }
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw || 0;
          return ` ${label}: ${value}건`; 
        }
      }
    }
  },

  cutout: '60%' 
};
  </script>
  
