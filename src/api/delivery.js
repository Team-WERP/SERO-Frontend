import api from './axios'

/**
 * 출고지시 목록 조회
 * @param {Object} filter - 필터 조건
 * @param {number} page - 페이지 번호
 * @returns {Promise<Array>}
 */
export const getGoodsIssueList = async (filter = {}, page = null) => {
    const params = { ...filter }
    if (page) params.page = page

    const response = await api.get('/goods-issues', { params })
    return response.data
}

/**
 * 배송 시작
 * @param {string} giCode - 출고지시 코드
 * @returns {Promise<Object>}
 */
export const startDelivery = async (giCode) => {
    const response = await api.put('/delivery/start', null, {
        params: { giCode }
    })
    return response.data
}

/**
 * 배송 완료
 * @param {string} giCode - 출고지시 코드
 * @returns {Promise<Object>}
 */
export const completeDelivery = async (giCode) => {
    const response = await api.put('/delivery/complete', null, {
        params: { giCode }
    })
    return response.data
}

/**
 * 납품서 상세 조회
 * @param {string} doCode - 납품서 코드
 * @returns {Promise<Object>}
 */
export const getDeliveryOrderDetail = async (doCode) => {
    const response = await api.get(`/delivery-orders/${doCode}`)
    return response.data
}
