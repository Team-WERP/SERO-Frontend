import api from '@/api/axios.js';

/**
 * 생산요청 목록 조회
*/
export const getPRList = (params = {}) => {
    return api.get('/production-requests', { params })
        .then(res => res.data)
}

/**
 * 생산요청 상세 조회
 */
export const getPRDetail = (prId) => {
    return api.get(`/production-requests/${prId}`)
        .then(res => res.data)
}
