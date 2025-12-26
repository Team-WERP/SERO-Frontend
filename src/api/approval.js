import api from './axios';

export const getApprovalTemplates = () =>
    api.get('/approval-templates', {
    }).then(r => r.data); 

export const getSubmittedApprovals = (params = {}) => {
    return api.get('/approvals/submitted', { params })
        .then(res => res.data)
};

export const getRequestedApprovals = (params = {}) => {
    return api.get('/approvals/requested', { params })
        .then(res => res.data)
};

export const getReceivedApprovals = (params = {}) => {
    return api.get('/approvals/received', { params })
        .then(res => res.data)
};