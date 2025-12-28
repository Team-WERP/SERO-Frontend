import api from "./axios";

// 결재 상신 API
export const submitApproval = async (formData) => {
    const res = await api.post("/approvals", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 결재선 템플릿 조회 API
export const getApprovalTemplates = () =>
    api.get("/approval-templates", {}).then((res) => res.data);

// 기안 문서함 조회 API
export const getSubmittedApprovals = (params = {}) => {
    return api.get("/approvals/submitted", { params }).then((res) => res.data);
};

// 결재 요청함 조회 API
export const getRequestedApprovals = (params = {}) => {
    return api.get("/approvals/requested", { params }).then((res) => res.data);
};

// 수신 문서함 조회 API
export const getReceivedApprovals = (params = {}) => {
    return api.get("/approvals/received", { params }).then((res) => res.data);
};

// 결재 문서함 조회 API
export const getProcessedApprovals = (params = {}) => {
    return api.get("/approvals/archived", { params }).then((res) => res.data);
};

// 참조 문서함 조회 API
export const getReferencedApprovals = (params = {}) => {
    return api.get("/approvals/referenced", { params }).then((res) => res.data);
};
