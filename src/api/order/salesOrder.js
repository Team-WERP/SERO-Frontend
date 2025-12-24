import api from '@/api/axios.js';

// ====================== 본사 =============================

// 주문 목록 조회
export const getSOList = (params = {}) => {
  return api.get('/orders', { params })
      .then(res => res.data)
}

// 주문 목록 상세 조회
export const getSODetail = (orderId) => {
  return api.get(`/orders/${orderId}`) 
      .then(res => res.data);
};

// 주문 담당자 배정
export const assignManager = (orderId, empId) => {
  return api.put(`/orders/${orderId}/manager`, { empId: empId })
      .then(res => res.data)
}