import api from '@/api/axios.js';

// 부서별 본사 직원 목록 조회
export const getEmployees = (deptCode) => {
  return api.get('/employees', { 
    params: { deptCode: deptCode }
  }).then(res => res.data);
};