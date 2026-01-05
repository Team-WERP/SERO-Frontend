import api from "../axios";

// 공지사항 등록 API
export const registNotice = async (formData) => {
    const res = await api.post("/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};
