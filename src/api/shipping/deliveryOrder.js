import api from '@/api/axios.js'


/**
 * 납품서 목록 조회(주문id)
 */
export const getDOListByOrderId = (orderId) => {
  return api.get(`/delivery-orders/search/${orderId}`, orderId)
      .then(res => res.data)
}