import { apiClient } from '@/config/api'


export const createWorkOrder = (payload) =>
    apiClient.post('/work-orders', payload)

export const getWorkOrdersByDate = (date) =>
    apiClient.get('/work-orders/by-date', { date })

export const startWorkOrder = (woId, note) =>
    apiClient.post(`/work-orders/${woId}/start?note=${note || ''}`)

export const pauseWorkOrder = (woId, note) =>
    apiClient.post(`/work-orders/${woId}/pause?note=${note || ''}`)

export const resumeWorkOrder = (woId, note) =>
    apiClient.post(`/work-orders/${woId}/resume?note=${note || ''}`)

export const endWorkOrder = (woId, payload) =>
    apiClient.post(`/work-orders/${woId}/end`, payload)

export const getWorkOrderHistory = (woId) =>
    apiClient.get(`/work-orders/${woId}/history`)
