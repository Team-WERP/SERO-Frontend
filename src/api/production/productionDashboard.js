import api from '@/api/axios.js';

/**
 * 생산 대시보드 KPI 요약
 */
export const getDashboardSummary = () =>
    api.get('/production/dashboard/summary')
        .then(res => res.data);

/**
 * 라인 가동 상태 (도넛)
 */
export const getLineStatus = () =>
    api.get('/production/dashboard/line-status')
        .then(res => res.data);

/**
 * 라인 CAPA 부하
 */
export const getLineCapa = () =>
    api.get('/production/dashboard/line-capa')
        .then(res => res.data);

/**
 * 자재 부족 현황
 */
export const getMaterialShortage = () =>
    api.get('/production/dashboard/material-shortage')
        .then(res => res.data);

/**
 * 월별 생산 추이
 */
export const getMonthlyTrend = () =>
    api.get('/production/dashboard/monthly-trend')
        .then(res => res.data);

/**
 * PR 리스크 리스트
 */
export const getPrRiskList = () =>
    api.get('/production/dashboard/pr-risk')
        .then(res => res.data);
