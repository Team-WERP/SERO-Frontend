import api from "../axios";

// 공지사항 등록 API
export const registNotice = async (formData) => {
    const res = await api.post("/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// 본사 직원용 공지사항 상세 조회 API
export const getNoticeDetail = async (noticeId) => {
    return api.get(`/notices/${noticeId}`).then((res) => res.data);
}

// 고객사 직원용 공지사항 상세 조회 API
export const getNoticeDetailByClientEmployee = async (noticeId) => {
    return api.get(`/clients/notices/${noticeId}`).then((res) => res.data);
}