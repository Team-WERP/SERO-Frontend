import api from '@/api/axios.js';

/**
 * 출고지시 목록 조회
 * @param {Object} params - 필터 파라미터
 * @param {number} params.warehouseId - 창고 ID (null/0 = 전체)
 * @param {string} params.status - 상태 (GI_RVW, GI_APPR_PEND, GI_APPR_DONE, GI_APPR_RJCT, GI_ISSUED, GI_SHIP_ING, GI_SHIP_DONE, GI_CANCEL)
 * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
 * @param {string} params.searchKeyword - 검색어 (출고지시번호)
 * @param {number} params.page - 페이지 번호 (기본값: 0)
 * @returns {Promise<Array>} 출고지시 목록
 */
export const getGIList = (params = {}) => {
    return api.get('/goods-issues', { params })
        .then(res => res.data)
}

/**
 * 출고지시 상세 조회
 * @param {string} giCode - 출고지시 번호
 * @returns {Promise<Object>} 출고지시 상세 정보
 */
export const getGIDetail = (giCode) => {
    return api.get(`/goods-issues/${giCode}`)
        .then(res => res.data)
}

/**
 * 출고지시 등록
 * @param {Object} data - 출고지시 등록 데이터
 * @returns {Promise<Object>} 생성된 출고지시 정보
 */
export const createGI = (data) => {
    return api.post('/goods-issues', data)
        .then(res => res.data)
}

/**
 * 출고지시 담당자 배정 (물류팀)
 * @param {string} giCode - 출고지시 번호
 * @returns {Promise<Object>} 배정 결과
 */
export const assignGIManager = (giCode) => {
    return api.patch(`/goods-issues/${giCode}/assign-manager`)
        .then(res => res.data)
}

/**
 * 출고 완료 처리 (물류팀)
 * @param {string} giCode - 출고지시 번호
 * @returns {Promise<Object>} 출고 완료 정보 (추적번호, 운전자 정보 등)
 */
export const completeGI = (giCode) => {
    return api.post(`/goods-issues/${giCode}/complete`)
        .then(res => res.data)
}
