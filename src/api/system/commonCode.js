import api from '@/api/axios.js'

/**
 * 모든 코드 타입 조회
 */
export const getAllCodeTypes = async () => {
    const response = await api.get('/common-codes/types')
    return response.data
}

/**
 * 특정 타입의 상세 코드 목록 조회
 */
export const getCodeDetailsByType = async (typeCode) => {
    const response = await api.get(`/common-codes/types/${typeCode}`)
    return response.data
}
