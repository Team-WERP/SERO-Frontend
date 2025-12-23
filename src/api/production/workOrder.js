import api from '@/api/axios.js'


export const createWorkOrder = (payload) =>
    api.post('/work-orders', payload)
