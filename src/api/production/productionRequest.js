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

/** 
 * 임시저장 수정 
 */
export const updatePRDraft = (prId, data) =>
    api.put(`/production-requests/drafts/${prId}`, data)

/**
 * 생산요청 확정
 */
export const requestProduction = (prId) =>
    api.post(`/production-requests/${prId}/request`)

/**
 * 생산요청 목록 조회(주문id)
 */
export const getPRListByOrderId = (orderId) => {
    return api.get(`/production-requests/search/${orderId}`, orderId)
        .then(res => res.data)
}