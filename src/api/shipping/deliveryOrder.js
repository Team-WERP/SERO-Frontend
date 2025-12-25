import api from '@/api/axios.js';

/**
 * 출고지시서 작성을 위한 납품서 목록 조회 (DO_BEFORE_GI 상태만)
 * @param {Object} params - 필터 파라미터
 * @param {number} params.page - 페이지 번호 (1부터 시작, 미입력시 전체 조회)
 * @returns {Promise<Array>} 납품서 목록
 */
export const getDOListForGI = (params = {}) => {
    return api.get('/delivery-orders', {
        params: {
            ...params,
            status: 'DO_BEFORE_GI'
        }
    }).then(res => res.data)
}

/**
 * 납품서 상세 조회
 * @param {string} doCode - 납품서 번호
 * @returns {Promise<Object>} 납품서 상세 정보
 */
export const getDODetail = (doCode) => {
    return api.get(`/delivery-orders/${doCode}`)
        .then(res => res.data)
}

/**
 * 납품서 생성
 * @param {Object} data - 납품서 생성 데이터
 * @param {number} data.soId - 주문 ID
 * @param {string} data.shippedAt - 납기일시
 * @param {string} data.note - 특이사항
 * @param {Array} data.items - 납품 품목 목록
 * @returns {Promise<Object>} 생성된 납품서 정보
 */
export const createDeliveryOrder = (data) => {
    return api.post('/delivery-orders', data)
        .then(res => res.data)
}
