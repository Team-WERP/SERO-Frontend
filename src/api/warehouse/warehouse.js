import api from '@/api/axios.js';

/**
 * 창고 목록 조회
 * @returns {Promise<Array>} 창고 목록
 */
export const getWarehouses = () => {
    return api.get('/warehouses')
        .then(res => res.data)
}
