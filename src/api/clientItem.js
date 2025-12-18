import { apiRequest } from './config'

// 고객사 거래 품목 조회
export async function getClientItems(clientId, params = {}) {
    const queryParams = new URLSearchParams()

    if (params.keyword) {
        queryParams.append('keyword', params.keyword)
    }

    if (params.status) {
        queryParams.append('status', params.status)
    }

    const queryString = queryParams.toString()
    const url = `/clients/${clientId}/items${queryString ? `?${queryString}` : ''}`

    return await apiRequest(url)
}

// 고객사 가격 변동 이력 조회
export async function getPriceHistory(clientId, itemId) {
    return await apiRequest(`/clients/${clientId}/items/${itemId}/price-history`)
}
