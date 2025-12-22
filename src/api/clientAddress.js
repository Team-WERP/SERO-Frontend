import api from './axios'

// 고객사 배송지 목록 조회
export async function getClientAddresses(clientId, params = {}) {
    const queryParams = new URLSearchParams()

    if (params.keyword) {
        queryParams.append('keyword', params.keyword)
    }

    const queryString = queryParams.toString()
    const url = `/clients/${clientId}/addresses${queryString ? `?${queryString}` : ''}`

    const response = await api.get(url)
    return response.data
}

// 배송지 등록
export async function createClientAddress(clientId, addressData) {
    // id 필드 제거 (신규 등록 시 불필요)
    const { id, ...dataToSend } = addressData
    const response = await api.post(`/clients/${clientId}/addresses`, dataToSend)
    return response.data
}

// 배송지 수정
export async function updateClientAddress(clientId, addressId, addressData) {
    const response = await api.put(`/clients/${clientId}/addresses/${addressId}`, addressData)
    return response.data
}

// 배송지 삭제
export async function deleteClientAddress(clientId, addressId) {
    const response = await api.delete(`/clients/${clientId}/addresses/${addressId}`)
    return response.data
}

// 기본 배송지 설정
export async function setDefaultAddress(clientId, addressId) {
    const response = await api.patch(`/clients/${clientId}/addresses/${addressId}/default`)
    return response.data
}
