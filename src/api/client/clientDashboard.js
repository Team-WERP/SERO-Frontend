import api from '../axios'

// 고객사 대시보드
export const getClientDashboard = () => {
  return api.get('/clients/orders/dashboard').then(res => res.data);
};
