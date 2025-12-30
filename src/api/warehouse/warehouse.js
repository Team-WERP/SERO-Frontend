import api from '@/api/axios.js';

/**
 * 창고 목록 조회
 * @returns {Promise<Array>} 창고 목록
 */
export const getWarehouses = () => {
    return api.get('/warehouses')
        .then(res => res.data)
}

/**
 * 창고별 재고 목록 조회
 * @param {Object} params - 검색 조건
 * @param {number} params.warehouseId - 창고 ID (optional)
 * @param {string} params.materialType - 자재 유형 (MAT_FG, MAT_RM) (optional)
 * @param {string} params.stockStatus - 재고 상태 (NORMAL, LOW, OUT_OF_STOCK) (optional)
 * @param {string} params.keyword - 검색어 (자재명/자재코드/창고명) (optional)
 * @returns {Promise<Array>} 재고 목록
 */
export const getWarehouseStocks = (params) => {
    return api.get('/warehouse/stocks', { params })
        .then(res => res.data)
}

/**
 * 재고 상세 조회 (수량 변경 이력 포함)
 * @param {number} stockId - 재고 ID
 * @returns {Promise<Object>} 재고 상세 정보 (warehouse, material, stockHistory 포함)
 */
export const getStockDetail = (stockId) => {
    return api.get(`/warehouse/stocks/${stockId}`)
        .then(res => res.data)
}
