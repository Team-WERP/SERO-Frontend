import api from '@/api/axios.js';

// 납기 가능 여부 확인
export const checkDeliveryAvailability = (clientId, payload) => {
  return api.post(`/clients/${clientId}/check-availability`, payload)
    .then(res => res.data);
};
