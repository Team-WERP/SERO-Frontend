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
    }).then(res => res.data);
};

/**
 * 납품서 상세 조회
 * @param {string} doCode - 납품서 번호
 * @returns {Promise<Object>} 납품서 상세 정보
 */
export const getDODetail = (doCode) => {
    return api.get(`/delivery-orders/${doCode}`)
        .then(res => res.data);
};

/**
 * 납품서 목록 조회 (주문 ID 기준)
 * @param {number} orderId - 주문 ID
 * @returns {Promise<Array>} 납품서 목록
 */
export const getDOListByOrderId = (orderId) => {
    return api.get(`/delivery-orders/search/${orderId}`)
        .then(res => res.data);
};
