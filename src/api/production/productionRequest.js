import { apiClient } from '@/config/api';

/**
 * 생산요청 목록 조회
 */
export const getPRList = (params = {}) => {
    return apiClient.get('/production-requests', params)
}

/**
 * 생산요청 상세 조회
 */
export const getPRDetail = (prId) => {
    return apiClient.get(`/production-requests/${prId}`)
}

/**
 * 임시저장된 생산요청 목록 조회 (현재 사용자)
 */
export const getPRDraftList = (params = {}) => {
    return apiClient.get('/production-requests/drafts', params)
}

/**
 * 임시저장된 생산요청 상세 조회
 */
export const getPRDraftDetail = (prId) => {
    return apiClient.get(`/production-requests/drafts/${prId}`)
}

/**
 * 임시저장 수정
 */
export const updatePRDraft = (prId, data) =>
    apiClient.put(`/production-requests/drafts/${prId}`, data)

/**
 * 생산요청 확정
 */
export const requestProduction = (prId) =>
    apiClient.post(`/production-requests/${prId}/request`)