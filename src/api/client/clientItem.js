import api from "../axios"

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

    const response = await api.get(url)
    return response.data
}

// 고객사 가격 변동 이력 조회
export async function getPriceHistory(clientId, itemId) {
    const response = await api.get(`/clients/${clientId}/items/${itemId}/price-history`)
    return response.data
}
