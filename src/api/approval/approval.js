import api from '../axios'

// 결재에 대한 결재선 요약
export async function getApprovalSummary(approvalCode){
  const response = await api.get(`/approvals/summary/${approvalCode}`);
  return response.data
};
