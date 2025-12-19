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

/**
 * 임시저장된 생산요청 목록 조회 (현재 사용자)
 */
export const getPRDraftList = (params = {}) => {
    return api.get('/production-requests/drafts', { params })
        .then(res => res.data)
}

/**
 * 임시저장된 생산요청 상세 조회
 */
export const getPRDraftDetail = (prId) => {
    return api.get(`/production-requests/drafts/${prId}`)
        .then(res => res.data)
}