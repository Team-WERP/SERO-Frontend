<template>
    <div class="min-h-screen bg-gray-50 p-8 font-sans">
      <header class="mb-8">
        <router-link to="/order/list" class="text-sm text-gray-500 hover:underline">‹ 목록으로 돌아가기</router-link>
        <h1 class="text-[32px] font-bold text-gray-900 mt-2">주문 등록</h1>
      </header>
  
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-3 space-y-8">
          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <span class="w-1 h-5 bg-[#4C4CDD] rounded-full"></span> 주문 기본 정보
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-[13px] font-medium text-gray-700 mb-1">귀사 PO 정보</label>
                <input v-model="form.poNumber" type="text" placeholder="PO-1329845" class="w-full border text-[13px] rounded-lg p-2.5 border-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label class="block text-[13px] font-medium text-gray-700 mb-1">
                    납기 요청 일시 <span class="text-red-500">*</span>
                </label>
                <input 
                    v-model="form.requestDate" 
                    type="datetime-local" 
                    class="w-full border rounded-lg p-2.5 text-[13px] border-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
            </div>
          </section>
  
          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold flex items-center gap-2">
                <span class="w-1 h-5 bg-[#4C4CDD] rounded-full"></span> 주문 품목
              </h2>
              <button @click="isHistoryModalOpen = true" class="text-[15px] border border-[#4C4CDD] text-[#4C4CDD] px-3 py-1.5 rounded-lg hover:bg-gray-50 font-semibold">최근 주문이력 조회</button>
            </div>
            
            <div class="overflow-x-auto border border-gray-400 rounded-xl mb-4">
              <table class="w-full text-sm text-center">
                <thead class="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-3">No</th>
                    <th class="px-4 py-3">품목코드</th>
                    <th class="px-4 py-3 text-left">품목명</th>
                    <th class="px-4 py-3">규격</th>
                    <th class="px-4 py-3 w-32">수량</th>
                    <th class="px-4 py-3">단위</th>
                    <th class="px-4 py-3">단가</th>
                    <th class="px-4 py-3">금액</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-400">
                  <tr v-if="selectedItems.length === 0">
                    <td colspan="9" class="py-12 text-gray-400">등록된 품목이 없습니다. [품목 추가]를 눌러 선택해주세요.</td>
                  </tr>
                  <tr v-for="(item, idx) in selectedItems" :key="item.id">
                    <td class="px-4 py-4 text-gray-400">{{ idx + 1 }}</td>
                    <td class="px-4 py-4 font-medium">{{ item.itemCode }}</td>
                    <td class="px-4 py-4 text-left font-medium">{{ item.itemName }}</td>
                    <td class="px-4 py-4 text-gray-500 text-xs">{{ item.spec }}</td>
                    <td class="px-4 py-4">
                      <input 
                        v-model.number="item.quantity" 
                        type="number" 
                        class="w-full border rounded p-1 text-center"
                        :class="item.quantity < item.moq ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-400'"
                      />
                      <p v-if="item.quantity < item.moq" class="text-[10px] text-red-500 mt-1 font-bold">
                        최소 주문 수량: {{ item.moq }}
                      </p>
                    </td>
                    <td class="px-4 py-4">{{ item.unit }}</td>
                    <td class="px-4 py-4 text-right">{{ formatNumber(item.contractPrice) }}</td>
                    <td class="px-4 py-4 text-right font-semibold">{{ formatNumber(item.contractPrice * item.quantity) }}</td>
                    <td class="px-4 py-4">
                      <button @click="removeItem(idx)" class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg text-xs">삭제</button>
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="selectedItems.length > 0" class="bg-gray-50 font-bold border-t-2 border-gray-100">
                  <tr class="text-center font-semibold">
                    <td colspan="4" class="px-4 py-3 text-right text-gray-700">총 합계</td>
                    <td class="px-4 py-3"> {{ totalQuantity }} </td>
                    <td colspan="2" class="px-4 py-3"></td>
                    <td class="px-4 py-3 text-right"> ₩ {{ formatNumber(totalAmount) }}</td>
                    <td class="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="flex gap-2">
              <button @click="isItemModalOpen = true" class="bg-[#4C4CDD] text-white px-5 py-2 rounded-lg font-bold text-[15px] hover:bg-indigo-700">품목 추가</button>
              <button class="border border-[#4C4CDD] text-[#4C4CDD] px-5 py-2 rounded-lg font-bold hover:bg-indigo-50">납기 가능 여부 조회</button>
            </div>
          </section>
  
          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <span class="w-1 h-5 text-[#4C4CDD] rounded-full"></span> 납품/배송 정보
            </h2>
            <div class="space-y-4">
                <div class="flex items-center gap-4">
                    <label class="w-32 text-[13px] font-bold text-gray-700">납품지 <span class="text-red-500">*</span></label>
                        <select 
                            v-model="selectedAddrId" 
                            @change="onAddressChange" 
                            class="flex-1 border text-[13px] rounded-lg p-2.5 border-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option v-for="addr in allAddresses" :key="addr.id" :value="addr.id">{{ addr.name }}</option>
                            <option :value="null">직접 입력</option>
                        </select>
                </div>
              <div class="flex items-center gap-4">
                <label class="w-32 text-[13px] font-bold text-gray-700">상세 주소 <span class="text-red-500">*</span></label>
                <input v-model="form.address" type="text" class="flex-1 border border-gray-400 text-[13px] rounded-lg p-2.5 outline-none bg-gray-50" readonly />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex items-center gap-4">
                  <label class="w-32 text-[13px] font-bold text-gray-700">수령 담당자명 <span class="text-red-500">*</span></label>
                  <input v-model="form.recipientName" type="text" class="flex-1 border text-[13px] border-gray-400 rounded-lg p-2.5 outline-none" />
                </div>
                <div class="flex items-center gap-4">
                  <label class="w-32 text-[13px] font-bold text-gray-700">연락처 <span class="text-red-500">*</span></label>
                  <input v-model="form.recipientContact" type="text" class="flex-1 border text-[13px] border-gray-400 rounded-lg p-2.5 outline-none" />
                </div>
              </div>
            </div>
          </section>
  
          <section class="bg-white p-6 rounded-xl border border-gray-200">
            <h2 class="text-[15px] font-bold mb-4">특이사항</h2>
            <textarea v-model="form.note" placeholder="추가 요청사항을 입력해주세요" class="w-full border border-gray-400 text-[13px] rounded-xl p-4 h-24 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
          </section>
        </div>
  
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-4">
            <div class="bg-white p-6 rounded-2xl border border-gray-200">
              <h3 class="text-lg font-bold mb-6 text-gray-800">주문 요약</h3>
              <div class="space-y-4 text-sm mb-8 border-b pb-6">
                <div class="flex justify-between text-gray-500">
                  <span>총 품목 수</span>
                  <span class="text-gray-900 font-semibold">{{ selectedItems.length }} 개</span>
                </div>
                <div class="flex justify-between text-gray-500">
                  <span>총 수량</span>
                  <span class="text-gray-900 font-semibold">{{ totalQuantity }}</span>
                </div>
              </div>
              
              <div class="mb-8">
                <div class="flex justify-between items-end font-semibold">
                  <span class="text-base text-gray-900">최종 결제 금액</span>
                  <span class="text-lg font-bold text-[#4C4CDD]">₩ {{ formatNumber(totalAmount) }}</span>
                </div>
              </div>
  
              <div class="space-y-4 border-t pt-6 text-[13px]">
                <div>
                  <p class="text-[12px] text-gray-400 mb-1 font-medium">납품처</p>
                  <p class="font-semibold text-gray-800">
                    {{ currentAddressName }}<br />
                    {{ form.address }}
                  </p>                
                </div>
                <div>
                  <p class="text-[12px] text-gray-400 mb-1 font-medium">수령인</p>
                  <p class="font-semibold text-gray-800">{{ form.recipientName }} / {{ form.recipientContact }}</p>
                </div>
              </div>
            </div>
            <button 
              @click="handleSubmit" 
              class="w-full bg-[#4C4CDD] text-white py-3 rounded-xl font-bold text-[15px] hover:bg-indigo-700 shadow-md transition-all active:scale-[0.98]"
            >
              주문서 제출하기
            </button>
          </div>
        </div>
      </div>
  
      <ItemSearchModal v-if="isItemModalOpen" @close="isItemModalOpen = false" @select="addItems" />
      <OrderHistoryModal  v-if="isHistoryModalOpen" @close="isHistoryModalOpen = false" @load="applyOrderCopyInfo" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { getClientAddresses } from '@/api/client/clientAddress';
  import { createClientOrder, getOrderCopyInfo } from '@/api/order/salesOrder';
  import ItemSearchModal from '@/components/order/ItemSearchModal.vue';
  import OrderHistoryModal from '@/components/order/OrderHistoryModal.vue';
  
  const router = useRouter();
  const userStore = useUserStore();
  const clientId = userStore.getClientId || 1;
  
  const isItemModalOpen = ref(false);
  const isHistoryModalOpen = ref(false);
  const allAddresses = ref([]);
  const selectedAddrId = ref(null);
  const selectedItems = ref([]);
  
  const form = ref({
    poNumber: '',
    requestDate: '',
    address: '',
    recipientName: '',
    recipientContact: '',
    note: ''
  });
  

  onMounted(async () => {
    const addresses = await getClientAddresses(clientId);
    allAddresses.value = addresses;
  
    const defaultAddr = addresses.find(a => a.default) || addresses[0];
    if (defaultAddr) {
      selectedAddrId.value = defaultAddr.id;
      updateFormAddress(defaultAddr);
    }
  });
  
  const updateFormAddress = (addr) => {
    form.value.address = addr.address;
    form.value.recipientName = addr.recipientName;
    form.value.recipientContact = addr.recipientContact;
  };
  
  const onAddressChange = () => {
    const addr = allAddresses.value.find(a => a.id === selectedAddrId.value);
    if (addr) updateFormAddress(addr);
  };
  
  const currentAddressName = computed(() => {
    return allAddresses.value.find(a => a.id === selectedAddrId.value)?.name;
  });
  
  const totalQuantity = computed(() => selectedItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0));
  const totalAmount = computed(() => selectedItems.value.reduce((sum, item) => sum + (item.contractPrice * (item.quantity || 0)), 0));
  
  const addItems = (items) => {
    items.forEach(newItem => {
      const exists = selectedItems.value.find(i => i.id === newItem.id);
      if (!exists) {
        selectedItems.value.push({ ...newItem, quantity: newItem.moq || 1 });
      }
    });
    isItemModalOpen.value = false;
  };
  
  const removeItem = (idx) => selectedItems.value.splice(idx, 1);
  const formatNumber = (val) => new Intl.NumberFormat().format(val);

  const applyOrderCopyInfo = async (orderId) => {
    try {
            const copyData = await getOrderCopyInfo(orderId);
            
            form.value.address = copyData.address;
            form.value.recipientName = copyData.recipientName;
            form.value.recipientContact = copyData.recipientContact;
            form.value.note = copyData.note || '';

            const addrMatch = allAddresses.value.find(a => a.address === copyData.address);
            if (addrMatch) {
            selectedAddrId.value = addrMatch.id;
            } else {
            selectedAddrId.value = null;
            }

    
            selectedItems.value = copyData.items.map(item => ({
                id: item.id, 
                itemCode: item.itemCode,
                itemName: item.itemName,
                spec: item.spec,
                quantity: item.quantity,
                unit: item.unit,
                contractPrice: item.unitPrice,
                moq:1
            }));

            isHistoryModalOpen.value = false;
            alert('이전 주문 정보를 성공적으로 불러왔습니다.');
        } catch (error) {
            console.error('정보 불러오기 실패:', error);
            alert('정보를 불러오는 중 오류가 발생했습니다.');
        }
    };
  
  const handleSubmit = async () => {
    const invalidItem = selectedItems.value.find(item => item.quantity < item.moq);
    if (invalidItem) {
      alert(`[${invalidItem.itemName}]의 수량이 최소 주문 수량(${invalidItem.moq})보다 적습니다.`);
      return;
    }
  
    if (!form.value.requestDate || selectedItems.value.length === 0) {
      alert('납기 요청일과 품목은 필수 입력 사항입니다.');
      return;
    }
  
    const formattedDate = form.value.requestDate.replace('T', ' ');

    const orderPayload = {
      shippedAt: formattedDate,
      poCode: form.value.poNumber,
      items: selectedItems.value.map(item => ({
        id: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        spec: item.spec,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.contractPrice,
        totalPrice: item.contractPrice * item.quantity
      })),
      shippingName: currentAddressName.value,
      address: form.value.address,
      recipientName: form.value.recipientName,
      recipientContact: form.value.recipientContact,
      note: form.value.note
    };
  
    try {
      await createClientOrder(orderPayload);
      alert('주문이 성공적으로 등록되었습니다.');
      router.push('/order/list');
    } catch (error) {
      console.error('주문 등록 실패:', error);
      alert('주문 등록 중 오류가 발생했습니다.');
    }
  };
  </script>