import api from '@/api/axios.js'

// --------------------
// Command
// --------------------
export const validatePlan = (payload) =>
    api.post('/production-plans/validate', payload).then(r => r.data)

export const createPlan = (payload) =>
    api.post('/production-plans', payload).then(r => r.data)

export const addPlanningTarget = (prItemId) =>
    api.post('/production-plans/targets', { prItemId }).then(r => r.data)


// --------------------
// Query
// --------------------

// 생산라인 목록
export const getProductionLines = (factoryId) =>
    api.get('/production-plans/production-lines', {
        params: { factoryId }
    }).then(r => r.data)


// PR Item 기준 계획 수립용 상세
export const getPRItemPlanning = (prItemId) =>
    api.get(`/production-plans/production-request-items/${prItemId}`)
        .then(r => r.data)


// 미편성 생산요청 목록
export const getUnassignedTargets = () =>
    api.get('/production-plans/unassigned').then(r => r.data)


// 월별 생산계획 목록
export const getMonthlyPlans = (month /* 'YYYY-MM' */) =>
    api.get('/production-plans', {
        params: { month }
    }).then(r => r.data)
