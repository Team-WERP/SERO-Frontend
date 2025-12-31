import api from "./axios";

// 결재 승인 API
export const approve = async (approvalId, note) => {
    return api.post(`/approvals/${approvalId}/approve`, {
        note
    });
};

// 결재 반려 API
export const reject = async (approvalId, note) => {
    return api.post(`/approvals/${approvalId}/reject`, {
        note
    });
};

// 결재 상신 API
export const submitApproval = async (formData) => {
    const res = await api.post("/approvals", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 결재선 템플릿 등록 API
export const registerApprovalTemplate = async (payload) => {
    return api.post("/approval-templates", payload).then((res) => res.data);
}

// 결재선 템플릿 삭제 API
export const deleteApprovalTemplate = async (approvalTemplateId) => {
    return api.delete(`/approval-templates/${approvalTemplateId}`).then((res) => res.data);
}

// 결재 상세 조회 API
export const getApprovalDetail = async (approvalId) => {
    return api.get(`/approvals/${approvalId}`).then((res) => res.data);
};

// 결재선 템플릿 조회 API
export const getApprovalTemplates = () =>
    api.get("/approval-templates", {}).then((res) => res.data);

// 기안 문서함 조회 API
export const getSubmittedApprovals = async (params = {}) => {
    return api.get("/approvals/submitted", { params }).then((res) => res.data);
};

// 결재 요청함 조회 API
export const getRequestedApprovals = async (params = {}) => {
    return api.get("/approvals/requested", { params }).then((res) => res.data);
};

// 수신 문서함 조회 API
export const getReceivedApprovals = async (params = {}) => {
    return api.get("/approvals/received", { params }).then((res) => res.data);
};

// 결재 문서함 조회 API
export const getProcessedApprovals = async (params = {}) => {
    return api.get("/approvals/archived", { params }).then((res) => res.data);
};

// 참조 문서함 조회 API
export const getReferencedApprovals = async (params = {}) => {
    return api.get("/approvals/referenced", { params }).then((res) => res.data);
};
