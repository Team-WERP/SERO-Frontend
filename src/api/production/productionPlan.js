import api from '@/api/axios.js';

// 생산라인 목록 (생산계획 페이지에서 사용)
export const getProductionLines = (factoryId) => {
    return api.get('/production-lines', { params: { factoryId } }).then(r => r.data)
}

// PR Item 기준 생산계획 수립용 상세 조회 (생산계획 페이지에서 사용)
export const getPRItemPlanning = (prItemId) => {
    return api.get(`/production-request-items/${prItemId}/planning`).then(r => r.data)
}

// 계획 대상 추가 (PR 상세 PLAN 탭에서 사용)
export const addPlanningTarget = (prItemId) => {
    return api.post('/production-plans/targets', { prItemId }).then(r => r.data)
}

// (참고) validate / create는 생산계획 페이지에서만
export const validatePlan = (payload) => {
    return api.post('/production-plans/validate', payload).then(r => r.data)
}

export const createPlan = (payload) => {
    return api.post('/production-plans', payload).then(r => r.data)
}
