import { apiClient } from '@/config/api'

// 고객사 배송지 목록 조회
export async function getClientAddresses(clientId) {
    return await apiClient.get(`/clients/${clientId}/addresses`)
}

// 배송지 등록
export async function createClientAddress(clientId, addressData) {
    // id 필드 제거 (신규 등록 시 불필요)
    const { id, ...dataToSend } = addressData
    return await apiClient.post(`/clients/${clientId}/addresses`, dataToSend)
}

// 배송지 수정
export async function updateClientAddress(clientId, addressId, addressData) {
    return await apiClient.put(`/clients/${clientId}/addresses/${addressId}`, addressData)
}

// 배송지 삭제
export async function deleteClientAddress(clientId, addressId) {
    return await apiClient.delete(`/clients/${clientId}/addresses/${addressId}`)
}

// 기본 배송지 설정
export async function setDefaultAddress(clientId, addressId) {
    return await apiClient.patch(`/clients/${clientId}/addresses/${addressId}/default`)
}
