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

/**
 * 고객사 거래 품목 단가 수정
 * @param {number} clientId - 고객사 ID
 * @param {number} itemId - 거래 품목 ID
 * @param {object} data - 수정할 정보
 * @param {number} data.contractPrice - 계약 단가
 * @returns {Promise} 수정된 거래 품목 정보
 */
export async function updateClientItem(clientId, itemId, data) {
    const response = await api.put(`/clients-manage/${clientId}/items/${itemId}`, data)
    return response.data
}

/**
 * 고객사 거래 품목 삭제
 * @param {number} clientId - 고객사 ID
 * @param {number} itemId - 거래 품목 ID
 * @returns {Promise}
 */
export async function deleteClientItem(clientId, itemId) {
    const response = await api.delete(`/clients-manage/${clientId}/items/${itemId}`)
    return response.data
}

/**
 * 고객사 거래 품목 가격 이력 조회
 * @param {number} clientId - 고객사 ID
 * @param {number} itemId - 거래 품목 ID
 * @returns {Promise} 가격 변경 이력 목록
 */
export async function getClientItemPriceHistory(clientId, itemId) {
    const response = await api.get(`/clients-manage/${clientId}/items/${itemId}/price-history`)
    return response.data
}

// 고객사의 당사 기업정보 조회
export async function getClientCompanyDetail(clientId) {
    const response = await api.get(`/clients/${clientId}/details`)
    return response.data
}

