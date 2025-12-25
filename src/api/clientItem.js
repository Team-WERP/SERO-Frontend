import { apiClient } from '@/config/api'

// 고객사 거래 품목 조회
export async function getClientItems(clientId, params = {}) {
    return await apiClient.get(`/clients/${clientId}/items`, params)
}

// 고객사 가격 변동 이력 조회
export async function getPriceHistory(clientId, itemId) {
    return await apiClient.get(`/clients/${clientId}/items/${itemId}/price-history`)
}
