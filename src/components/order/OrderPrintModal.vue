<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div class="relative w-full max-w-[900px] h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-xl font-bold text-gray-900">주문서 미리보기</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
        <div
          ref="printArea"
          id="printable-area"
          class="w-[210mm] min-h-[297mm] bg-white p-[15mm] text-black shadow-lg"
        >          
          <h1 class="text-4xl font-medium text-center tracking-[15px] mb-12 border-b-[2px] border-black pb-4">주 문 서</h1>

          <div class="grid grid-cols-2 gap-0 border-t border-l border-black mb-8" style="display: flex;">
            <div class="border-r border-b border-black" style="flex: 1;">
              <div class="bg-gray-100 p-2 font-bold border-b border-black text-center">발주처</div>
                <table class="w-full text-sm">
                  <tbody> <tr><td class="w-24 bg-gray-50 p-2 border-r border-black font-bold text-center">회사명</td><td class="p-2">{{ order.clientName }}</td></tr>
                    <tr class="border-t border-black"><td class="bg-gray-50 p-2 border-r border-black font-bold text-center">담당자</td><td class="p-2">{{ order.clientManagerName }}</td></tr>
                    <tr class="border-t border-black"><td class="bg-gray-50 p-2 border-r border-black font-bold text-center">연락처</td><td class="p-2">{{ order.clientManagerContact }}</td></tr>
                    <tr class="border-t border-black"><td class="bg-gray-50 p-2 border-r border-black font-bold text-center">주소</td><td class="p-2 leading-tight">{{ order.clientAddress || '-' }}</td></tr>
                  </tbody> </table>
              </div>

            <div class="border-r border-b border-black" style="flex: 1;">
              <div class="bg-gray-100 p-2 font-bold border-b border-black text-center">수주처</div>
                <table class="w-full text-sm">
                  <tbody> <tr><td class="w-24 bg-gray-50 p-2 border-r border-black font-bold text-center">회사명</td><td class="p-2">새로</td></tr>
                    <tr class="border-t border-black"><td class="bg-gray-50 p-2 border-r border-black font-bold text-center">담당자</td><td class="p-2">{{ order.managerName || '-' }}</td></tr>
                    <tr class="border-t border-black"><td class="bg-gray-50 p-2 border-r border-black font-bold text-center">연락처</td><td class="p-2">010-4444-5555</td></tr>
                    <tr class="border-t border-black"><td class="bg-gray-50 p-2 border-r border-black font-bold text-center">주소</td><td class="p-2 leading-tight">서울시 동작구 보라매로 87</td></tr>
                  </tbody> 
                </table>
              </div>
          </div>

          <div class="border-t border-l border-black mb-8 text-sm" style="display: grid; grid-template-columns: repeat(4, 1fr);">
            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">주문 번호</div>
            <div class="p-2 border-r border-b border-black">{{ order.orderCode }}</div>
            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">주문 일자</div>
            <div class="p-2 border-r border-b border-black">{{ order.orderedAt?.slice(0, 10) }}</div>
            
            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">납기 일자</div>
            <div class="p-2 border-r border-b border-black" style="grid-column: span 3;">{{ order.shippedAt?.slice(0, 10) }}</div>
            
            <div class="bg-gray-100 p-2 font-bold border-r border-b border-black text-center">비고</div>
            <div class="p-2 border-r border-b border-black" style="grid-column: span 3;">{{ order.note || '-' }}</div>
          </div>

          <h3 class="text-lg font-bold mb-2">주문 품목 정보</h3>
          <table class="w-full border-t border-l border-black text-xs text-center mb-8">
            <thead class="bg-gray-100 font-bold">
              <tr>
                <th class="border-r border-b border-black p-2 w-10">No</th>
                <th class="border-r border-b border-black p-2 w-24">품목 코드</th>
                <th class="border-r border-b border-black p-2">품목명</th>
                <th class="border-r border-b border-black p-2 w-24">규격</th>
                <th class="border-r border-b border-black p-2 w-16">수량</th>
                <th class="border-r border-b border-black p-2 w-14">단위</th>
                <th class="border-r border-b border-black p-2 w-24">단가(원)</th>
                <th class="border-r border-b border-black p-2 w-28">금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in order.items" :key="idx">
                <td class="border-r border-b border-black p-2">{{ idx + 1 }}</td>
                <td class="border-r border-b border-black p-2">{{ item.itemCode }}</td>
                <td class="border-r border-b border-black p-2 text-left px-3">{{ item.itemName }}</td>
                <td class="border-r border-b border-black p-2">{{ item.spec || '-' }}</td>
                <td class="border-r border-b border-black p-2">{{ formatNumber(item.quantity) }}</td>
                <td class="border-r border-b border-black p-2">{{ item.unit }}</td>
                <td class="border-r border-b border-black p-2 text-right">{{ formatNumber(item.unitPrice) }}</td>
                <td class="border-r border-b border-black p-2 text-right">{{ formatNumber(item.totalPrice) }}</td>
              </tr>
              <tr class="bg-gray-100 font-medium">
                <td colspan="4" class="border-r border-b border-black p-2">합계</td>
                <td class="border-r border-b border-black p-2">{{ formatNumber(totalQuantity) }}</td>
                <td colspan="2" class="border-r border-b border-black p-2"></td>
                <td class="border-r border-b border-black p-2 text-right">{{ formatNumber(order.totalPrice) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="border-t border-l border-black text-sm font-medium" style="display: grid; grid-template-columns: repeat(4, 1fr);">
            <div class="bg-gray-100 p-3 border-r border-b border-black font-bold text-center">총 수량</div>
            <div class="p-3 border-r border-b border-black text-center">{{ formatNumber(totalQuantity) }}</div>
            <div class="bg-gray-100 p-3 border-r border-b font-bold border-black text-center">공급가액</div>
            <div class="p-3 border-r border-b border-black text-right">{{ formatNumber(order.totalPrice) }} 원</div>
            
            <div class="bg-gray-100 p-4 border-r border-b border-black text-center flex items-center justify-center">총 합계 금액</div>
            <div class="p-4 border-r border-b font-bold border-black text-right" style="grid-column: span 3;">
              {{ formatNumber(order.totalPrice) }} 원
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
        <button @click="handlePrint" class="px-8 py-2 rounded-lg bg-[#4C4CDD] font-bold text-white hover:bg-[#3b3bbb] shadow-md transition-all active:scale-95">
          인쇄
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  order: Object
});

const emit = defineEmits(['close']);
const printArea = ref(null);

const formatNumber = (n) => new Intl.NumberFormat('ko-KR').format(n || 0);

const totalQuantity = computed(() => 
  props.order.items.reduce((sum, item) => sum + item.quantity, 0)
);

const handlePrint = () => {
  const printAreaElement = document.getElementById('printable-area');
  const printContent = printAreaElement.outerHTML;
  
  const printWindow = window.open('', '_blank', 'width=900,height=900');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>주문서 인쇄</title>
        <script src="https://cdn.tailwindcss.com"><\/script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');
          
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background-color: white;
            font-family: 'Noto Sans KR', sans-serif;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          /* 인쇄 창 자체의 스크롤바 숨김 */
          body { overflow: auto; }
          #printable-area {
            box-shadow: none !important;
            margin: 0 auto !important;
          }
        </style>
      </head>
      <body>
        ${printContent}
        <script>
          function startPrint() {
            // Tailwind 스타일 엔진이 가동될 시간을 충분히 줌
            setTimeout(() => {
              window.print();
              window.close();
            }, 800);
          }

          if (window.tailwind) {
             startPrint();
          } else {
             window.onload = startPrint;
          }
        <\/script>
      </body>
    </html>
  `);

  printWindow.document.close();
};
</script>

<style scoped>
#printable-area {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>