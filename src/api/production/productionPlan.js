import { apiClient } from '@/config/api'

// --------------------
// Command
// --------------------
export const validatePlan = (payload) =>
    apiClient.post('/production-plans/validate', payload)

export const createPlan = (payload) =>
    apiClient.post('/production-plans', payload)

export const addPlanningTarget = (prItemId) =>
    apiClient.post('/production-plans/targets', { prItemId })


// --------------------
// Query
// --------------------

// 생산라인 목록
export const getProductionLines = (factoryId) =>
    apiClient.get('/production-plans/production-lines', { factoryId })


// PR Item 기준 계획 수립용 상세
export const getPRItemPlanning = (prItemId) =>
    apiClient.get(`/production-plans/production-request-items/${prItemId}`)


// 미편성 생산요청 목록
export const getUnassignedTargets = () =>
    apiClient.get('/production-plans/unassigned')


// 월별 생산계획 목록
export const getMonthlyPlans = (month /* 'YYYY-MM' */) =>
    apiClient.get('/production-plans', { month })

// Daily Preview (작업지시 생성용)
export const getDailyPlanPreview = (date /* YYYY-MM-DD */) =>
    apiClient.get('/production-plans/daily-preview', { date })