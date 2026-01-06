import api from "../axios"

/**
 * 고객사 목록 조회
 * @returns {Promise} 고객사 목록
 */
export async function getClientList() {
    const response = await api.get('/clients-manage')
    return response.data
}

/**
 * 고객사 상세 조회
 * @param {number} clientId - 고객사 ID
 * @returns {Promise} 고객사 상세 정보
 */
export async function getClientDetail(clientId) {
    const response = await api.get(`/clients-manage/${clientId}`)
    return response.data
}

/**
 * 고객사 거래 품목 등록
 * @param {number} clientId - 고객사 ID
 * @param {object} data - 거래 품목 정보
 * @param {number} data.itemId - 품목 ID
 * @param {number} data.contractPrice - 계약 단가
 * @returns {Promise} 등록된 거래 품목 정보
 */
export async function createClientItem(clientId, data) {
    const response = await api.post(`/clients-manage/${clientId}/items`, data)
    return response.data
}
