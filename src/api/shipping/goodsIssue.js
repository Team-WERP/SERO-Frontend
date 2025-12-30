import api from '@/api/axios.js';

/**
 * 출고지시 목록 조회
 * @param {Object} params - 필터 파라미터
 * @param {number} params.warehouseId - 창고 ID (null/0 = 전체)
 * @param {string} params.status - 상태
 * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
 * @param {string} params.searchKeyword - 검색어 (출고지시번호)
 * @param {number} params.page - 페이지 번호
 * @returns {Promise<Array>}
 */
export const getGIList = (params = {}) => {
    return api.get('/goods-issues', { params })
        .then(res => res.data);
};

/**
 * 출고지시 상세 조회
 * @param {string} giCode
 * @returns {Promise<Object>}
 */
export const getGIDetail = (giCode) => {
    return api.get(`/goods-issues/${giCode}`)
        .then(res => res.data);
};

/**
 * 출고지시 등록
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const createGI = (data) => {
    return api.post('/goods-issues', data)
        .then(res => res.data);
};

/**
 * 출고지시 담당자 배정 (물류팀)
 * @param {string} giCode
 * @param {number} empId - 담당자 직원 ID
 * @returns {Promise<Object>}
 */
export const assignGIManager = (giCode, empId) => {
    return api.patch(`/goods-issues/${giCode}/assign-manager`, { empId })
        .then(res => res.data);
};

/**
 * 출고 완료 처리 (물류팀)
 * @param {string} giCode
 * @returns {Promise<Object>}
 */
export const completeGI = (giCode) => {
    return api.post(`/goods-issues/${giCode}/complete`)
        .then(res => res.data);
};

/**
 * 출고지시 목록 조회 (주문 ID 기준)
 * @param {number} orderId
 * @returns {Promise<Array>}
 */
export const getGIListByOrderId = (orderId) => {
    return api.get(`/goods-issues/search/${orderId}`)
        .then(res => res.data);
};
