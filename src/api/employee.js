import api from "@/api/axios.js";

// 사원 목록 조회 API
export const getEmployees = () => api.get("/employees", {}).then((r) => r.data);
