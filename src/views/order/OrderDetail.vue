<template>
  <div v-if="order" class="min-h-screen bg-[#F9FAFB] p-6 font-sans">
    <nav class="mb-2 text-gray-500">
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
          <span :class="getOrderStatusBadgeClass(order.status)" class="rounded-full px-3 py-1 text-sm font-bold">
            {{ getOrderStatusLabel(order.status) }}
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
            <button @click="openPrintModal" class="rounded-lg border border-[#4C4CDD] px-3 py-1 text-sm font-bold text-[#4C4CDD] hover:bg-[#F0F0FF]">
              주문서 인쇄
            </button>
            <OrderPrintModal v-if="isPrintModalOpen" :order="order" @close="isPrintModalOpen = false" />
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

        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-[#4C4CDD]">주문 결재 진행 상황</h3>
          </div>

          <div class="relative rounded-xl border border-gray-200 bg-white min-h-[300px] overflow-hidden">
            <div v-if="isApprovalLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <svg class="animate-spin h-10 w-10 text-[#4C4CDD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>

            <template v-if="approvalData">
              <div class="flex items-center justify-center gap-4 py-12 px-6 bg-white border-b border-gray-50">
  <div class="flex flex-col items-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5] text-sm font-bold text-[#238869] mb-3 ">
      기안
    </div>
    <div class="text-sm font-bold text-gray-900">{{ approvalData.drafterName }}</div>
    <div class="text-[11px] text-gray-500 text-center leading-tight">
      {{ getPositionLabel(approvalData.drafterPositionCode) }} / {{ approvalData.drafterDepartment }}
    </div>
  </div>
  
  <div v-for="(appr, index) in approvalData.approvers" :key="appr.approvalLineId" class="flex items-center">
    <div :class="[
      'h-[3px] w-30 mx-4 mb-10 transition-colors duration-300', 
      (index === 0 || approvalData.approvers[index - 1].status === 'ALS_APPR') 
        ? 'bg-[#D1FAE5]' 
        : 'bg-gray-200'
    ]"></div>
    
    <div class="flex flex-col items-center">
      <div :class="[ 
        'flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold mb-3 transition-all',
        appr.status === 'ALS_APPR' ? 'bg-[#D1FAE5] text-[#238869] border-[#A7F3D0]' : 
        appr.status === 'ALS_RVW' ? 'bg-[#DBEAFE] text-[#3223DD] border-[#BFDBFE]' : 
        'bg-gray-100 text-gray-400 border-gray-200'
      ]">
        {{ getLineTypeLabel(appr.lineType) }}
      </div>
      <div class="text-sm font-bold text-gray-900">{{ appr.approverName }}</div>
      <div class="text-[11px] text-gray-500 text-center leading-tight">
        {{ getPositionLabel(appr.approverPositionCode) }} / {{ appr.approverDepartment }}
      </div>
    </div>
  </div>
</div>

              <div class="overflow-x-auto m-6">
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                  <table class="w-full text-[13px] text-center table-fixed border-collapse">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="w-20 px-2 py-3 text-gray-600 font-bold">구분</th>
                        <th class="w-24 px-2 py-3 text-gray-600 font-bold">이름</th>
                        <th class="w-32 px-2 py-3 text-gray-600 font-bold">직위/직책</th>
                        <th class="w-40 px-2 py-3 text-gray-600 font-bold">소속</th>
                        <th class="w-24 px-2 py-3 text-gray-600 font-bold">상태</th>
                        <th class="w-44 px-2 py-3 text-gray-600 font-bold">결재일</th>
                        <th class="w-64 px-4 py-3 text-gray-600 font-bold">비고</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      <tr class="hover:bg-gray-50 transition-colors text-center">
                        <td class="py-4">기안</td>
                        <td class="py-4">{{ approvalData.drafterName }}</td>
                        <td class="py-4">{{ getPositionLabel(approvalData.drafterPositionCode) }}</td>
                        <td class="py-4">{{ approvalData.drafterDepartment }}</td>
                        <td class="py-4 text-[#10B981]">승인</td>
                        <td class="py-4">{{ approvalData.draftedAt }}</td>
                        <td class="px-4 py-4 text-gray-400">-</td>
                      </tr>
                      <tr v-for="appr in approvalData.approvers" :key="appr.approvalLineId" class="hover:bg-gray-50 transition-colors text-center">
                        <td class="py-4">{{ getLineTypeLabel(appr.lineType) }}</td>
                        <td class="py-4">{{ appr.approverName }}</td>
                        <td class="py-4">{{ getPositionLabel(appr.approverPositionCode) }}</td>
                        <td class="py-4">{{ appr.approverDepartment }}</td>
                        <td :class="getLineStatusClass(appr.status)" class="py-4">
                          {{ getLineStatusLabel(appr.status) }}
                        </td>
                        <td class="py-4">{{ appr.processedAt || '-' }}</td>
                        <td class="px-4 py-4 truncate text-gray-400" :title="appr.note">
                          {{ appr.note || '-' }}
                        </td>
                      </tr> 
                    </tbody>
                  </table>
                </div>
                <div class="flex justify-end mt-4">
                  <router-link 
                    v-if="!['ORD_RED', 'ORD_RVW'].includes(order.status)"
                    :to="`/approval/${approvalData.approvalId}`"
                    class="text-[13px] font-bold text-[#4C4CDD] hover:underline flex items-center gap-1"
                  >
                    결재 바로가기 <span class="text-lg">→</span>
                  </router-link>
                </div>
              </div>
            </template>

            <div v-else-if="!isApprovalLoading" class="flex flex-col items-center justify-center py-16 px-4">
              <img src="@/assets/새로이새로미.png" alt="No Approval" class="mb-4 h-24 w-auto opacity-40" />
              <p class="text-gray-400 font-medium mb-6">진행 중인 결재 건이 없습니다.</p>
              <button 
                v-if="order.status === 'ORD_RVW' && order.managerId == userStore.user?.id"
                @click="goToCreateApproval"
                class="rounded-lg bg-[#4C4CDD] px-8 py-2.5 text-sm font-bold text-white hover:bg-[#3b3bbb] shadow-md transition-all active:scale-95"
              >
                결재 상신하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'PRODUCTION'" class="relative min-h-[500px]">    
        <div v-if="isLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px] transition-all">
          <div class="flex flex-col items-center gap-3">
            <svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          </div>
        </div>
        <div class="mb-8">
          <div class="flex justify-between items-end mb-3">
            <div>
              <h3 class="text-lg font-bold text-[#4C4CDD]">생산 · 납품 · 출고 현황</h3>
              <p class="text-[11px] text-gray-400 mt-1">* 최신 변동 이력 기준</p>
            </div>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white mb-5">
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
                    <button @click="openHistoryModal(hItem.itemId, hItem.item.itemName)" class="text-[13px] underline hover:text-gray-700">이력 조회</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex gap-2 justify-end mb-5">
            <template v-if="canCreateDeliveryOrProduction">
              <button @click="openPRModal" class="rounded-lg bg-[#4C4CDD] px-4 py-2 text-sm font-bold text-white hover:bg-[#3b3bbb]">생산 설정</button>
              <button @click="openDOModal" class="rounded-lg bg-[#4C4CDD] px-4 py-2 text-sm font-bold text-white hover:bg-[#3b3bbb]">납품 설정</button>
            </template>
          </div>

          <ProductionRequestModal 
            v-if="isPRModalOpen"
            :soId="Number(route.params.orderId)"
            :items="order.items"
            :isUpdate="isPRUpdateMode"
            :initialData="prInitialData"
            @close="isPRModalOpen = false"
            @submit="handlePRDraftSubmit"
          />

          <DeliveryOrderModal
            v-if="isDOModalOpen"
            :soId="Number(route.params.orderId)"
            :items="order.items"
            :historyItems="itemHistory?.items"
            @close="isDOModalOpen = false"
            @submit="handleDOSubmit"
          />


          <div class="space-y-8">
            <section v-for="section in docSections" :key="section.title">
              <h3 class="mb-3 text-lg font-bold text-[#4C4CDD]">{{ section.title }}</h3>
              <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table class="w-full text-sm text-center table-fixed">
                  <thead class="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                    <tr>
                      <th class="py-3 w-[6%]">No</th>
                      <th class="py-3 w-[18%]">요청번호</th>
                      <th class="py-3 w-[18%]">품목명</th> 
                      <th class="py-3 w-[14%]">상태</th>
                      <th class="py-3 w-[14%]">작성일</th>
                      <th class="py-3 w-[12%]">문서</th>
                      <th class="py-3 w-[12%]">액션</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="section.data.length === 0">
                      <td colspan="7" class="py-12 text-center text-gray-400 font-medium">등록된 문서가 없습니다.</td>
                    </tr>
                    <tr v-for="(doc, dIdx) in section.data" :key="dIdx" class="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                      <td class="py-4 text-gray-400">{{ dIdx + 1 }}</td>
                      <td class="py-4 font-medium truncate px-2">{{ doc[section.codeField] }}</td>
                      <td class="py-4 truncate">
                        {{ doc[section.nameField] }}
                        <span v-if="(doc.itemTypeCount || doc.itemCount) > 1" class="text-gray-400 text-xs ml-1">
                          외 {{ (doc.itemTypeCount || doc.itemCount) - 1 }}건
                        </span>
                      </td>
                      <td class="py-4">
                        <span :class="section.badgeFn(doc.status)" class="rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
                          {{ section.labelFn(doc.status) }}
                        </span>
                      </td>
                      <td class="py-4 text-gray-600">{{ doc[section.dateField] }}</td>
                      <td class="py-4 text-center">
                        <button 
                          v-if="!(section.type === 'PRODUCTION' && doc.status === 'PR_TMP')" 
                          @click="openDocument(doc)" 
                          class="text-gray-400 hover:text-[#4C4CDD] transition-all"
                          title="문서 보기"
                        >
                          <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </button>
                        <span v-else class="text-gray-300">-</span>
                      </td>
                      <td class="py-4 text-center">
                        <div class="flex justify-center items-center gap-1.5 px-2">
                          <button v-if="section.title === '생산 요청 문서' && doc.status === 'PR_TMP'" @click="openEditPRModal(doc.prId)" class="rounded border border-gray-300 px-2 py-1 text-[11px] font-bold text-gray-600 hover:bg-gray-50 whitespace-nowrap">수정</button>
                          <router-link :to="getLinkPath(section.type, doc)" class="h-7 flex items-center justify-center rounded bg-[#4C4CDD] px-2.5 text-[11px] font-bold text-white hover:bg-[#3b3bbb] whitespace-nowrap">바로가기</router-link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
  
        <div class="flex justify-end mt-8">
          <button 
            v-if="order && ['ORD_RVW', 'ORD_APPR_RJCT'].includes(order.status) && order.managerId === userStore.user?.id"
            @click="isCancelModalOpen = true"
            class="px-6 py-2.5 rounded-lg border border-red-200 bg-red-50 text-sm font-bold text-red-600 hover:bg-red-100"
          >
            주문 취소
          </button>
        </div>

        <CancelOrderModal 
          v-if="isCancelModalOpen"
          :is-submitting="isCancelling"
          @close="isCancelModalOpen = false"
          @confirm="handleCancelConfirm"
        />
      <button 
        v-if="order && order.status === 'ORD_RED'"
        @click="openAssignmentModal" 
        class="px-6 py-2 text-sm font-bold rounded-lg bg-[#4C4CDD] text-white hover:bg-[#3b3bbb] shadow-md transition-all active:scale-95"
      >
        담당자 배정
      </button>
    </div>
      
      <ManagerAssignmentModal v-if="isModalOpen" :departmentData="deptEmployees" @close="isModalOpen = false" @confirm="onConfirmAssignment" />
    </div>

    <div v-if="isHistoryModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b p-5">
          <h3 class="text-xl font-bold text-gray-900"><span class="text-[#4C4CDD]">{{ selectedItemName }}</span> 변동 이력</h3>
          <button @click="isHistoryModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div class="p-6">
          <div class="overflow-hidden rounded-xl border border-gray-200">
            <div class="max-h-[500px] overflow-y-auto">
              <table class="w-full text-center text-sm">
                <thead class="bg-gray-50 text-gray-500 font-bold sticky top-0">
                  <tr>
                    <th class="px-3 py-3 border-b bg-gray-50">가용재고</th>
                    <th class="px-3 py-3 border-b bg-gray-50">생산요청</th>
                    <th class="px-3 py-3 border-b bg-gray-50">생산입고</th>
                    <th class="px-3 py-3 border-b bg-gray-50">기납품수량</th>
                    <th class="px-3 py-3 border-b bg-gray-50">출고지시</th>
                    <th class="px-3 py-3 border-b bg-gray-50">출고완료</th>
                    <th class="px-3 py-3 border-b bg-gray-50">배송완료</th>
                    <th class="px-3 py-3 border-b bg-gray-50">이력 생성일시</th>
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
import { useRoute,useRouter } from 'vue-router';
import ProductionRequestModal from '@/components/order/ProductionRequestModal.vue';
import DeliveryOrderModal from '@/components/order/DeliveryOrderModal.vue';
import CancelOrderModal from './CancelOrderModal.vue';
import OrderPrintModal from '@/components/order/OrderPrintModal.vue';
import { getSODetail, assignManager, getOrderItemsHistory, getItemHistory, cancelOrder } from '@/api/order/salesOrder';
import { getEmployees } from '@/api/employee/employee';
import ManagerAssignmentModal from './ManagerAssignmentModal.vue';
import { 
  getPRListByOrderId, 
  createPRDraft, 
  getPRDraftDetail, 
  updatePRDraft 
} from '@/api/production/productionRequest';
import { getDOListByOrderId, createDO } from '@/api/shipping/deliveryOrder';
import { getGIListByOrderId } from '@/api/shipping/goodsIssue';
import { getApprovalSummary } from '@/api/approval/approval';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const activeTab = ref('ORDER');
const order = ref(null);
const itemHistory = ref(null);
const deptEmployees = ref([]);

const selectedItemName = ref('');
const historyDetails = ref([]);

const isLoading = ref(false);
const isApprovalLoading = ref(false);

const isModalOpen = ref(false);
const isPRModalOpen = ref(false);
const isHistoryModalOpen = ref(false);
const isDOModalOpen = ref(false);
const isPrintModalOpen = ref(false);
const isCancelModalOpen = ref(false);

const prInitialData = ref(null);
const isPRUpdateMode = ref(false);
const currentPrId = ref(null);
const approvalData = ref(null); 
const isCancelling = ref(false);


const steps = ['접수/검토', '주문 결재', '생산/출고', '배송 완료'];

const fetchApprovalSummary = async () => {
  if (!order.value?.approvalCode) {
    approvalData.value = null;
    return;
  }
  
  isApprovalLoading.value = true;
  try {
    const data = await getApprovalSummary(order.value.approvalCode);
    approvalData.value = data;
  } catch (err) {
    console.error('결재 현황 로드 실패:', err);
    approvalData.value = null;
  } finally {
    isApprovalLoading.value = false;
  }
};


const goToCreateApproval = () => {
  const routeData = router.resolve({
    path: '/approval/create',
    query: { 
      refDocType: 'so', 
      refDocId: route.params.orderId 
    }
  });

  window.open(routeData.href, '_blank');
};

const getPositionLabel = (code) => {
  const map = { JP_CEO: '사장', JP_DIR: '이사', JP_MGR: '부장', JP_SM: '과장', JP_AM: '대리', JP_STF: '사원' };
  return map[code] || code;
};
const getLineTypeLabel = (type) => {
  const map = { AT_APPR: '결재', AT_RVW: '협조', AT_REF: '참조', AT_RCPT: '수신' };
  return map[type] || '결재';
};
const getLineStatusLabel = (status) => {
  const map = { ALS_PEND: '대기', ALS_RVW: '검토중', ALS_APPR: '승인', ALS_RJCT: '반려' };
  return map[status] || status;
};
const getLineStatusClass = (status) => {
  if (status === 'ALS_APPR') return 'text-[#10B981]';
  if (status === 'ALS_RJCT') return 'text-red-600';
  if (status === 'ALS_RVW') return 'text-blue-600';
  return 'text-gray-400';
};

const currentStepIndex = computed(() => {
    const status = order.value?.status;
    if (!status) return -1;
    if (['ORD_RED', 'ORD_RVW'].includes(status)) return 0;
    if (status.includes('APPR')) return 1;
    if (['ORD_PRO', 'ORD_SHIPPING', 'ORD_PARTIAL_ING'].includes(status)) return 2;
    if (status === 'ORD_DONE') return 3;
    return -1;
});

// 부분 출고 지원: 미출고 수량이 남아있는지 확인
const hasUnshippedQuantity = computed(() => {
  console.log('hasUnshippedQuantity 체크:', {
    hasOrderItems: !!order.value?.items,
    orderItemsCount: order.value?.items?.length,
    hasItemHistory: !!itemHistory.value?.items,
    itemHistoryCount: itemHistory.value?.items?.length,
    orderItems: order.value?.items,
    itemHistory: itemHistory.value?.items
  });

  if (!order.value?.items || !itemHistory.value?.items) {
    console.log('→ 데이터 없음, false 반환');
    return false;
  }

  const result = order.value.items.some(item => {
    const history = itemHistory.value.items.find(h => h.itemId === item.id);
    const shippedQty = history?.doQuantity || 0;
    const unshippedQty = item.quantity - shippedQty;

    console.log(`품목 ${item.itemName}:`, {
      itemId: item.id,
      quantity: item.quantity,
      historyFound: !!history,
      doQuantity: history?.doQuantity,
      shippedQty,
      unshippedQty,
      hasRemaining: unshippedQty > 0
    });

    return unshippedQty > 0;
  });

  console.log('→ 최종 결과:', result);
  return result;
});

// 생산 설정/납품 설정 버튼 표시 조건
const canCreateDeliveryOrProduction = computed(() => {
  if (!order.value?.status) return false;

  // 결재 승인 또는 작업 진행 중인 상태에서만 버튼 표시
  const allowedStatuses = [
    'ORD_APPR_DONE',    // 결재 승인
    'ORD_WORK_REQ',     // 작업 요청
    'ORD_PRO',          // 생산 중
    'ORD_SHIP_READY',   // 출고 준비
    'ORD_SHIPPING'      // 출고 중
  ];

  const statusAllowed = allowedStatuses.includes(order.value.status);
  const hasRemaining = hasUnshippedQuantity.value;

  console.log('canCreateDeliveryOrProduction:', {
    status: order.value.status,
    statusAllowed,
    hasUnshippedQuantity: hasRemaining,
    result: statusAllowed && hasRemaining
  });

  return statusAllowed && hasRemaining;
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
        isLoading.value = true;
        const data = await getSODetail(route.params.orderId);
        order.value = data;
        if (data.approvalCode) fetchApprovalSummary();
    } catch (err) {
        console.error('상세 정보 조회 실패:', err);
    } finally {
      isLoading.value = false;
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

const openPRModal = () => {
  isPRModalOpen.value = true;
};

const openEditPRModal = async (prId) => {
  try {
    isLoading.value = true;
    const data = await getPRDraftDetail(prId);
    prInitialData.value = data;
    currentPrId.value = prId;
    isPRUpdateMode.value = true;
    isPRModalOpen.value = true;
  } catch (err) {
    console.error('상세 정보 로드 실패:', err);
    alert('데이터를 불러오지 못했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const handlePRDraftSubmit = async (payload) => {
  try {
    isLoading.value = true;
    if (isPRUpdateMode.value) {
      await updatePRDraft(currentPrId.value, payload);
      alert('생산 요청이 수정되었습니다.');
    } else {
      await createPRDraft({ ...payload, soId: Number(route.params.orderId) });
      alert('생산 요청이 임시저장되었습니다.');
    }
    
    isPRModalOpen.value = false;
    await fetchAllDocuments(); 
  } catch (err) {
    console.error('저장 실패:', err);
    alert('처리에 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};


const openDOModal = () => {
  isDOModalOpen.value = true;
};

const handleDOSubmit = async (payload) => {
  try {
    isLoading.value = true;
    await createDO(payload);

    alert('납품서가 생성되었습니다.');
    isDOModalOpen.value = false;
    await fetchHistory(); // 이력 갱신하여 미출고 수량 업데이트
    if (activeTab.value === 'PRODUCTION') await fetchAllDocuments();
  } catch (err) {
    console.error('납품 요청 실패:', err);
    alert('납품 요청이 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const openPrintModal = () => {
  isPrintModalOpen.value = true;
};

const getLinkPath = (type, doc) => {
  if (!doc) return '#';
  
  switch (type) {
    case 'PRODUCTION':
    if (doc.status === 'PR_TMP') {
        return `/production/requests`;
      }
      return `/production/requests/${doc.prId}`;
    case 'DELIVERY': 
      return `/warehouse/delivery-orders`;
    case 'ISSUE':     
      return `/warehouse/goods-issues/${doc.id}`;
    default:
      return '#';
  }
};

const fetchAllDocuments = async () => {
  const orderId = route.params.orderId;
  
  const promises = docSections.value.map(async (section) => {
    try {
      const response = await section.fetchFn(orderId);
      section.data = response || [];
    } catch (err) {
      console.error(`${section.title} 조회 실패:`, err);
      section.data = [];
    }
  });

  await Promise.all(promises);
};

watch(activeTab, async (newTab) => {
  if (newTab !== 'PRODUCTION') return;

  isLoading.value = true;
  try {
    await Promise.all([
      fetchHistory(),
      fetchAllDocuments()
    ]);
  } finally {
    isLoading.value = false;
  }
});

watch(isPRModalOpen, (val) => {
  if (!val) {
    isPRUpdateMode.value = false;
    prInitialData.value = null;
    currentPrId.value = null;
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

const getOrderStatusBadgeClass = (s) => {
  const styles = {
    'ORD_RED': 'bg-[#FFFBEB] text-[#B4540A]',
    'ORD_RVW': 'bg-[#FFFBEB] text-[#B4540A]',
    'ORD_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]',
    'ORD_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]',
    'ORD_PRO': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_SHIPPING': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_PARTIAL_ING': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'ORD_DONE': 'bg-[#F3F4F6] text-[#000000]',
    'ORD_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]',
    'ORD_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'
  };
  return styles[s] || 'bg-gray-100 text-gray-600';
};

const getOrderStatusLabel = (s) => {
    const map = { 
        'ORD_RED': '접수대기', 'ORD_RVW': '주문검토', 'ORD_APPR_PEND': '주문결재중', 
        'ORD_APPR_DONE': '결재승인', 'ORD_APPR_RJCT': '결재반려','ORD_PRO': '생산중', 'ORD_SHIPPING': '출고/배송중', 'ORD_PARTIAL_ING': '부분처리중', 
        'ORD_DONE': '배송완료', 'ORD_CANCEL': '주문취소' 
    };
    return map[s] || s;
};

const getPRStatusBadgeClass = (s) => {
  const styles = {
    'PR_TMP': 'bg-[#dbc4ad] text-[#fff]',
    'PR_RVW': 'bg-[#FFFBEB] text-[#B4540A]',
    'PR_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]',
    'PR_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]',
    'PR_PLANNED': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'PR_PRODUCING': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'PR_DONE': 'bg-[#F3F4F6] text-[#000000]',
    'PR_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]',
    'PR_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'
  };
  return styles[s] || 'bg-gray-100 text-gray-600';
};

const getPRStatusLabel = (s) => {
    const map = { 
        'PR_TMP': '임시저장', 'PR_RVW': '요청검토', 'PR_APPR_PEND': '결재중', 
        'PR_APPR_DONE': '결재승인', 'PR_APPR_RJCT': '결재반려', 'PR_PLANNED': '계획수립', 'PR_PRODUCING': '생산중', 
        'PR_DONE': '생산완료', 'PR_CANCEL': '취소' 
    };
    return map[s] || s;
};

const getDOStatusBadgeClass = (s) => {
  const styles = {
    'DO_BEFORE_GI': 'bg-[#FFFBEB] text-[#B4540A]',
    'DO_AFTER_GI': 'bg-[#F3F4F6] text-[#000000]'
  };
  return styles[s] || 'bg-gray-100 text-gray-600';
};

const getDOStatusLabel = (s) => {
    const map = { 
        'DO_BEFORE_GI': '출고지시 대기', 'DO_AFTER_GI': '출고지시 완료'
    };
    return map[s] || s;
};

const getGIStatusBadgeClass = (s) => {
  const styles = {
    'GI_RVW': 'bg-[#FFFBEB] text-[#B4540A]',
    'GI_APPR_PEND': 'bg-[#ECFEF6] text-[#278465]',
    'GI_APPR_DONE': 'bg-[#ECFEF6] text-[#278465]',
    'GI_ISSUED': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'GI_SHIP_ING': 'bg-[#F0F6FF] text-[#1E4ED8]',
    'GI_SHIP_DONE': 'bg-[#F3F4F6] text-[#000000]',
    'GI_APPR_RJCT': 'bg-[#FFD8D8] text-[#D34242]',
    'GI_CANCEL': 'bg-[#FFD8D8] text-[#D34242]'
  };
  return styles[s] || 'bg-gray-100 text-gray-600';
};

const getGIStatusLabel = (s) => {
    const map = { 
        'GI_RVW': '접수대기', 'GI_APPR_PEND': '주문검토', 'GI_APPR_DONE': '주문결재중', 
        'GI_ISSUED': '출고완료', 'GI_SHIP_ING': '배송중', 'GI_SHIP_DONE': '배송완료', 'GI_APPR_RJCT': '결재반려', 
        'GI_CANCEL': '취소'
    };
    return map[s] || s;
};

const getDocumentUrl = (doc) => {
  if (!doc) return null;
  return doc.giUrl || doc.doUrl || doc.prUrl || null;
};

const openDocument = (doc) => {
  const url = getDocumentUrl(doc);
  if (url) {
    window.open(url, '_blank');
  } else {
    alert('해당 문서의 PDF 파일을 찾을 수 없습니다');
  }
};


const docSections = ref([
  { 
    title: '생산 요청 문서', 
    type: 'PRODUCTION', 
    btnLabel: '생산요청',
    codeField: 'prCode',   
    nameField: 'mainItemName', 
    dateField: 'requestedAt',
    badgeFn: getPRStatusBadgeClass, 
    labelFn: getPRStatusLabel,     
    fetchFn: getPRListByOrderId, 
    data: [] 
  },
  { 
    title: '납품 요청 문서', 
    type: 'DELIVERY', 
    btnLabel: '납품서',
    codeField: 'doCode',   
    nameField: 'itemName', 
    dateField: 'createdAt',
    badgeFn: getDOStatusBadgeClass, 
    labelFn: getDOStatusLabel,      
    fetchFn: getDOListByOrderId, 
    data: [] 
  },
  { 
    title: '출고 지시 문서', 
    type: 'ISSUE', 
    btnLabel: '출고지시',
    codeField: 'giCode',    
    nameField: 'itemName', 
    dateField: 'createdAt',
    badgeFn: getGIStatusBadgeClass, 
    labelFn: getGIStatusLabel,      
    fetchFn: getGIListByOrderId, 
    data: [] 
  }
]);

const handleCancelConfirm = async (cancelData) => {
  isCancelling.value = true;
  try {
    await cancelOrder(route.params.orderId, cancelData);
    
    alert('주문이 성공적으로 취소되었습니다.');
    isCancelModalOpen.value = false; 

    if (typeof fetchDetail === 'function') await fetchDetail();
  } catch (error) {
    console.error('취소 실패:', error);
    alert('주문 취소 처리 중 오류가 발생했습니다.');
  } finally {
    isCancelling.value = false;
  }
};

onMounted(() => {
  fetchDetail();
  fetchHistory(); // 버튼 표시를 위해 이력 데이터 로드
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