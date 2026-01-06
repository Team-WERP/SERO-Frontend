import api from '@/api/axios.js'


export const createWorkOrder = (payload) =>
    api.post('/work-orders', payload)

export const getWorkOrdersByDate = (date) =>
    api.get('/work-orders/by-date', { params: { date } })

export const startWorkOrder = (woId, note) =>
    api.post(`/work-orders/${woId}/start`, null, { params: { note } })

export const pauseWorkOrder = (woId, note) =>
    api.post(`/work-orders/${woId}/pause`, null, { params: { note } })

export const resumeWorkOrder = (woId, note) =>
    api.post(`/work-orders/${woId}/resume`, null, { params: { note } })

export const endWorkOrder = (woId, payload) =>
    api.post(`/work-orders/${woId}/end`, payload)

export const getWorkOrderHistory = (woId) =>
    api.get(`/work-orders/${woId}/history`)

export const previewWorkOrderResult = (woId, payload) =>
    api.post(`/work-orders/${woId}/result/preview`, payload)

export const getDailyWorkOrders = (date) =>
    api.get('/work-orders/daily', { params: { date } })

export const getEmergencyTargetsByLine = (lineId) =>
    api.get('/work-orders/emergency-targets', {
        params: { lineId }
    })