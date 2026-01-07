import api from '@/api/axios.js'

// ============ Query (조회) ============

/**
 * 모든 코드 타입 조회
 */
export const getAllCodeTypes = async () => {
    const response = await api.get('/common-code-manage/types')
    return response.data
}

/**
 * 특정 타입의 공통 코드 목록 조회
 */
export const getCodeDetailsByType = async (typeCode) => {
    const response = await api.get(`/common-code-manage/types/${typeCode}`)
    return response.data
}

// ============ Command (관리 - 관리자 전용) ============

/**
 * 공통코드 타입 생성
 */
export const createCodeType = async (data) => {
    const response = await api.post('/code-types', data)
    return response.data
}

/**
 * 공통코드 타입 수정
 */
export const updateCodeType = async (code, data) => {
    const response = await api.put(`/code-types/${code}`, data)
    return response.data
}

/**
 * 공통코드 타입 삭제
 */
export const deleteCodeType = async (code) => {
    await api.delete(`/code-types/${code}`)
}

/**
 * 공통코드 생성
 */
export const createCode = async (data) => {
    const response = await api.post('/codes', data)
    return response.data
}

/**
 * 공통코드 수정
 */
export const updateCode = async (code, data) => {
    const response = await api.put(`/codes/${code}`, data)
    return response.data
}

/**
 * 공통코드 삭제
 */
export const deleteCode = async (code) => {
    await api.delete(`/codes/${code}`)
}
