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

// 주문 품목별 변동 이력 조회
export const getOrderItemsHistory = (orderId) => {
  return api.get(`/orders/${orderId}/item-history/latest`) 
      .then(res => res.data);
};


// 주문 특정 품목 변동 이력 조회
export const getItemHistory = (orderId, itemId) => {
  return api.get(`/orders/${orderId}/item-history/${itemId}`) 
      .then(res => res.data);
};


// ====================== 고객사 =============================

// 고객사 주문
export const createClientOrder = (orderData) => {
  return api.post('/clients/orders', orderData)
    .then(res => res.data);
};

// 최근 주문 이력 목록 조회
export const getOrderHistory = () => {
  return api.get('/clients/orders/history').then(res => res.data);
};

// 특정 주문 정보 복사 조회
export const getOrderCopyInfo = (orderId) => {
  return api.get(`/clients/orders/${orderId}/copy-info`).then(res => res.data);
};