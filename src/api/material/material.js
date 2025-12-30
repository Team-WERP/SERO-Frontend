import api from '@/api/axios.js';

/**
 * 자재 목록 조회
 * @param {Object} params - 검색 조건
 * @param {string} params.type - 자재 유형 (MAT_FG, MAT_RM) (optional)
 * @param {string} params.status - 상태 (MAT_NORMAL, MAT_STOP) (optional)
 * @param {string} params.keyword - 검색어 (자재명/자재코드) (optional)
 * @returns {Promise<Array>} 자재 목록
 */
export const getMaterialList = (params) => {
    return api.get('/materials', { params })
        .then(res => res.data)
}

/**
 * 자재 상세 조회 (BOM 구성 포함)
 * @param {number} materialId - 자재 ID
 * @returns {Promise<Object>} 자재 상세 정보 (BOM 목록 포함)
 */
export const getMaterialDetail = (materialId) => {
    return api.get(`/materials/${materialId}`)
        .then(res => res.data)
}

/**
 * 자재 검색 (BOM 계산용)
 * @param {Object} params - 검색 조건
 * @param {string} params.keyword - 검색어 (optional)
 * @param {string} params.type - 자재 유형 (MAT_FG, MAT_RM) (optional)
 * @returns {Promise<Array>} 자재 검색 결과
 */
export const searchMaterials = (params) => {
    return api.get('/bom/materials/search', { params })
        .then(res => res.data)
}

/**
 * BOM 정전개 (완제품 -> 원자재 소요량 계산)
 * @param {number} materialId - 완제품 자재 ID
 * @param {number} quantity - 생산 수량
 * @returns {Promise<Object>} 원자재 소요량 정보
 */
export const calculateBomExplosion = (materialId, quantity) => {
    return api.get(`/bom/explosion/${materialId}`, {
        params: { quantity }
    }).then(res => res.data)
}

/**
 * BOM 역전개 (원자재 -> 사용되는 완제품 조회)
 * @param {number} rawMaterialId - 원자재 ID
 * @returns {Promise<Object>} 완제품 목록 정보
 */
export const calculateBomImplosion = (rawMaterialId) => {
    return api.get(`/bom/implosion/${rawMaterialId}`)
        .then(res => res.data)
}

/**
 * 자재 등록
 * @param {Object} materialData - 자재 등록 데이터
 * @returns {Promise<Object>} 등록된 자재 정보
 */
export const createMaterial = (materialData) => {
    return api.post('/materials', materialData)
        .then(res => res.data)
}

/**
 * 자재 수정
 * @param {number} materialId - 자재 ID
 * @param {Object} materialData - 수정할 자재 데이터
 * @returns {Promise<Object>} 수정된 자재 정보
 */
export const updateMaterial = (materialId, materialData) => {
    return api.put(`/materials/${materialId}`, materialData)
        .then(res => res.data)
}

/**
 * 자재 비활성화
 * @param {number} materialId - 자재 ID
 * @returns {Promise<Object>} 비활성화된 자재 ID
 */
export const deactivateMaterial = (materialId) => {
    return api.patch(`/materials/${materialId}/deactivate`)
        .then(res => res.data)
}

/**
 * 자재 활성화
 * @param {number} materialId - 자재 ID
 * @returns {Promise<Object>} 활성화된 자재 ID
 */
export const activateMaterial = (materialId) => {
    return api.patch(`/materials/${materialId}/activate`)
        .then(res => res.data)
}

/**
 * BOM 구성 추가
 * @param {number} materialId - 완제품 자재 ID
 * @param {Object} bomData - BOM 구성 데이터
 * @returns {Promise<Object>} 추가된 BOM 정보
 */
export const addBom = (materialId, bomData) => {
    return api.post(`/materials/${materialId}/bom`, bomData)
        .then(res => res.data)
}

/**
 * BOM 구성 수정 (전체 교체)
 * @param {number} materialId - 완제품 자재 ID
 * @param {Object} bomData - BOM 구성 데이터
 * @returns {Promise<Object>} 수정된 BOM 정보
 */
export const updateBom = (materialId, bomData) => {
    return api.put(`/materials/${materialId}/bom`, bomData)
        .then(res => res.data)
}
