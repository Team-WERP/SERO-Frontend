import api from '@/api/axios.js'


/**
 * 출고 지시 목록 조회(주문id)
 */
export const getGIListByOrderId = (orderId) => {
  return api.get(`/goods-issues/search/${orderId}`, orderId)
      .then(res => res.data)
}