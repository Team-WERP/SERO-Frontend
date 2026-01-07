import api from '@/api/axios.js';

// 라인-품목 목록
export function getLineMaterialList() {
    return api.get('/production-process/line-material')
}

// 라인-품목 기준 공정 조회
export function getProductionProcessList(lineMaterialId) {
    return api.get('/production-process/process', {
        params: { lineMaterialId }
    })
}