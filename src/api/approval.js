import api from './axios';

export const getApprovalTemplates = () =>
    api.get('/approval-templates', {
    }).then(r => r.data); 

export const getSubmittedApprovals = (params = {}) => {
    return api.get('/approvals/submitted', { params })
        .then(res => res.data)
};