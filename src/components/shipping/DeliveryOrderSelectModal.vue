<template>
    <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50" style="background-color: rgba(0, 0, 0, 0.5);">
        <div class="bg-white rounded-lg shadow-xl w-[900px] max-h-[80vh] flex flex-col">
            <!-- Modal Header -->
            <div class="flex justify-between items-center p-6 border-b">
                <h2 class="text-xl font-bold">납품서 선택</h2>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-auto p-6">
                <div v-if="loading" class="flex justify-center items-center h-64">
                    <div class="text-gray-500">로딩 중...</div>
                </div>

                <div v-else-if="error" class="flex justify-center items-center h-64">
                    <div class="text-red-500">{{ error }}</div>
                </div>

                <div v-else-if="deliveryOrders.length === 0" class="flex justify-center items-center h-64">
                    <div class="text-gray-500">출고지시서로 사용할 수 있는 납품서가 없습니다.</div>
                </div>

                <table v-else class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선택</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">납품서번호</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수주번호</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거래처</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">품목명</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr
                            v-for="order in deliveryOrders"
                            :key="order.doCode"
                            :class="{'bg-blue-50': selectedDO?.doCode === order.doCode}"
                            class="hover:bg-gray-50 cursor-pointer"
                            @click="selectDO(order)"
                        >
                            <td class="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="radio"
                                    :checked="selectedDO?.doCode === order.doCode"
                                    @click.stop="selectDO(order)"
                                    class="w-4 h-4 text-blue-600 cursor-pointer"
                                />
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {{ order.doCode }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ order.soCode }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ order.companyName }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatItemName(order.itemName, order.itemCount) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {{ formatDate(order.createdAt) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-3 p-6 border-t">
                <button
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    취소
                </button>
                <button
                    @click="confirmSelection"
                    :disabled="!selectedDO"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    선택사항 불러오기
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getDOListForGI } from '@/api/shipping/deliveryOrder.js'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    }
})

const emit = defineEmits(['close'])
const router = useRouter()

const deliveryOrders = ref([])
const selectedDO = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchDeliveryOrders = async () => {
    loading.value = true
    error.value = null
    try {
        deliveryOrders.value = await getDOListForGI()
    } catch (err) {
        console.error('납품서 목록 조회 실패:', err)
        error.value = '납품서 목록을 불러오는데 실패했습니다.'
    } finally {
        loading.value = false
    }
}

const selectDO = (order) => {
    selectedDO.value = order
}

const confirmSelection = () => {
    if (!selectedDO.value) return

    router.push({
        name: 'GoodsIssueCreate',
        params: {
            doCode: selectedDO.value.doCode
        }
    })
    closeModal()
}

const closeModal = () => {
    selectedDO.value = null
    emit('close')
}

const formatDate = (dateString) => {
    if (!dateString) return '-'
    return dateString.split('T')[0]
}

const formatItemName = (itemName, itemCount) => {
    if (!itemName) return '-'
    if (itemCount > 1) {
        return `${itemName} 외 ${itemCount - 1}건`
    }
    return itemName
}

watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        fetchDeliveryOrders()
    }
})
</script>
