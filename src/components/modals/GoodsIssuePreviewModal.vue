<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
            <!-- 모달 헤더 -->
            <div class="modal-header">
                <h2>출고지시서 미리보기</h2>
                <button class="btn-close" @click="closeModal">
                    <i class="icon-close">✕</i>
                </button>
            </div>

            <!-- 출고지시서 내용 (인쇄 영역) -->
            <div ref="printArea" class="goods-issue-content">
                <div class="gi-header">
                    <h1>출고지시서</h1>
                    <table class="header-info">
                        <tbody>
                            <tr>
                                <th>문서번호</th>
                                <td>{{ goodsIssue.giCode }}</td>
                            </tr>
                            <tr>
                                <th>출고예정일자</th>
                                <td>{{ formatDate(goodsIssue.scheduledAt) }}</td>
                            </tr>
                            <tr>
                                <th>참조문서</th>
                                <td>{{ goodsIssue.doCode }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr class="divider" />

                <!-- 출고/배송 정보 -->
                <div class="info-section">
                    <div class="from-section">
                        <h3>출고 정보 (From)</h3>
                        <table class="detail-table">
                            <tbody>
                                <tr>
                                    <th>출고 창고</th>
                                    <td>{{ goodsIssue.warehouseName }}</td>
                                </tr>
                                <tr>
                                    <th>담당자</th>
                                    <td>{{ goodsIssue.managerName || '미배정' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="to-section">
                        <h3>배송 정보 (To)</h3>
                        <table class="detail-table">
                            <tbody>
                                <tr>
                                    <th>납품처</th>
                                    <td>{{ goodsIssue.companyName }}</td>
                                </tr>
                                <tr>
                                    <th>도착지 주소</th>
                                    <td>{{ goodsIssue.address }}</td>
                                </tr>
                                <tr>
                                    <th>연락처</th>
                                    <td>{{ goodsIssue.recipientContact }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="recipient-info">
                            <span class="label">수령인 이름</span>
                            <span class="value">{{ goodsIssue.recipientName }}</span>
                        </div>
                    </div>
                </div>

                <!-- 출고 품목 상세 -->
                <h3>출고 품목 상세</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>품목코드</th>
                            <th>품목명</th>
                            <th>규격</th>
                            <th>단위</th>
                            <th>지시수량</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in goodsIssue.items" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.itemCode }}</td>
                            <td>{{ item.itemName }}</td>
                            <td>{{ item.spec || '-' }}</td>
                            <td>{{ item.unit }}</td>
                            <td>{{ formatNumber(item.quantityAUn) }}</td>
                        </tr>
                        <!-- 빈 행 추가 (고정된 레이아웃) -->
                        <tr v-for="i in emptyRows" :key="'empty-' + i">
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" class="footer-label">합계 (Total)</td>
                            <td class="footer-total">{{ totalQuantity }}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- 특이사항 -->
                <h3>특이사항 (Note)</h3>
                <div class="note-box">
                    {{ goodsIssue.note || '-' }}
                </div>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
                <button class="btn-secondary" @click="closeModal">닫기</button>
                <button v-if="goodsIssue.giUrl" class="btn-download" @click="downloadPdf">
                    <i class="icon-download">📥</i>
                    PDF 다운로드
                </button>
                <button class="btn-primary" @click="printGoodsIssue">인쇄</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true
    },
    goodsIssue: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['close'])

const printArea = ref(null)

// 빈 행 개수 계산 (최소 5행 유지)
const emptyRows = computed(() => {
    const minRows = 5
    const currentRows = props.goodsIssue.items?.length || 0
    return Math.max(0, minRows - currentRows)
})

// 총 수량 계산
const totalQuantity = computed(() => {
    if (!props.goodsIssue.items || props.goodsIssue.items.length === 0) return 0
    const total = props.goodsIssue.items.reduce((sum, item) => sum + (item.quantityAUn || 0), 0)
    return formatNumber(total)
})

// 숫자 포맷팅
const formatNumber = (value) => {
    if (!value && value !== 0) return '-'
    return value.toLocaleString()
}

// 날짜 포맷팅
const formatDate = (dateTime) => {
    if (!dateTime) return '-'
    if (typeof dateTime === 'string') {
        // ISO 8601 형식 처리 (YYYY-MM-DDTHH:mm:ss)
        if (dateTime.includes('T')) {
            return dateTime.split('T')[0]
        }
        // 이미 포맷된 형태라면 날짜 부분만 추출
        if (dateTime.includes(' ')) {
            return dateTime.split(' ')[0]
        }
        return dateTime
    }
    return '-'
}

// 모달 닫기
const closeModal = () => {
    emit('close')
}

// PDF 다운로드 기능
const downloadPdf = () => {
    if (props.goodsIssue.giUrl) {
        window.open(props.goodsIssue.giUrl, '_blank')
    }
}

// 출고지시서 인쇄
const printGoodsIssue = () => {
    const printContent = printArea.value.innerHTML
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>출고지시서</title>
            <style>
                @media print {
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Malgun Gothic', sans-serif;
                    padding: 20px;
                }

                .goods-issue-content {
                    max-width: 210mm;
                    margin: 0 auto;
                }

                .gi-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                }

                .gi-header h1 {
                    font-size: 32px;
                    font-weight: bold;
                    color: #111827;
                }

                .header-info {
                    border-collapse: collapse;
                    text-align: left;
                }

                .header-info th {
                    padding: 4px 12px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                }

                .header-info td {
                    padding: 4px 12px;
                    font-size: 14px;
                    color: #111827;
                    border: 1px solid #d1d5db;
                }

                .divider {
                    border: none;
                    border-top: 2px solid #111827;
                    margin: 20px 0;
                }

                .info-section {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .from-section, .to-section {
                    flex: 1;
                }

                .info-section h3 {
                    font-size: 16px;
                    font-weight: bold;
                    color: #111827;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .detail-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }

                .detail-table th {
                    width: 100px;
                    padding: 8px 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    text-align: left;
                }

                .detail-table td {
                    padding: 8px 12px;
                    font-size: 13px;
                    color: #111827;
                    border: 1px solid #e5e7eb;
                }

                .recipient-info {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 10px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                }

                .recipient-info .label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                }

                .recipient-info .value {
                    font-size: 14px;
                    font-weight: bold;
                    color: #111827;
                }

                h3 {
                    font-size: 16px;
                    font-weight: bold;
                    color: #111827;
                    margin: 20px 0 10px 0;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    border: 1px solid #d1d5db;
                }

                .items-table thead {
                    background: #f3f4f6;
                }

                .items-table th {
                    padding: 10px 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #374151;
                    border: 1px solid #d1d5db;
                    text-align: center;
                }

                .items-table td {
                    padding: 8px;
                    font-size: 13px;
                    color: #111827;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                }

                .items-table tfoot {
                    background: #f9fafb;
                    font-weight: 600;
                }

                .items-table tfoot td {
                    padding: 10px 8px;
                    border-top: 2px solid #d1d5db;
                }

                .footer-label {
                    text-align: right !important;
                    font-weight: bold;
                }

                .footer-total {
                    font-weight: bold;
                    color: #111827;
                }

                .note-box {
                    padding: 15px;
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    min-height: 60px;
                    font-size: 13px;
                    color: #374151;
                    white-space: pre-wrap;
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `)

    printWindow.document.close()

    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
}
</script>

<style scoped>
/* ===== 모달 오버레이 ===== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
}

/* ===== 모달 헤더 ===== */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.btn-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.btn-close:hover {
    background: #f3f4f6;
    color: #111827;
}

/* ===== 출고지시서 내용 ===== */
.goods-issue-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
}

.gi-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.gi-header h1 {
    font-size: 32px;
    font-weight: bold;
    color: #111827;
}

.header-info {
    border-collapse: collapse;
    text-align: left;
}

.header-info th {
    padding: 6px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
}

.header-info td {
    padding: 6px 16px;
    font-size: 14px;
    color: #111827;
    border: 1px solid #d1d5db;
}

.divider {
    border: none;
    border-top: 2px solid #111827;
    margin: 20px 0;
}

/* ===== 출고/배송 정보 ===== */
.info-section {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
}

.from-section, .to-section {
    flex: 1;
}

.info-section h3 {
    font-size: 16px;
    font-weight: bold;
    color: #111827;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 2px solid #e5e7eb;
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
}

.detail-table th {
    width: 100px;
    padding: 10px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    text-align: left;
}

.detail-table td {
    padding: 10px 12px;
    font-size: 14px;
    color: #111827;
    border: 1px solid #e5e7eb;
}

.recipient-info {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
}

.recipient-info .label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
}

.recipient-info .value {
    font-size: 15px;
    font-weight: bold;
    color: #111827;
}

/* ===== 품목 테이블 ===== */
h3 {
    font-size: 16px;
    font-weight: bold;
    color: #111827;
    margin: 20px 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 2px solid #e5e7eb;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    border: 1px solid #d1d5db;
}

.items-table thead {
    background: #f3f4f6;
}

.items-table th {
    padding: 12px 8px;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    border: 1px solid #d1d5db;
    text-align: center;
}

.items-table td {
    padding: 10px 8px;
    font-size: 14px;
    color: #111827;
    border: 1px solid #e5e7eb;
    text-align: center;
}

.items-table tfoot {
    background: #f9fafb;
    font-weight: 600;
}

.items-table tfoot td {
    padding: 12px 8px;
    border-top: 2px solid #d1d5db;
}

.footer-label {
    text-align: right !important;
    font-weight: bold;
}

.footer-total {
    font-weight: bold;
    color: #111827;
}

/* ===== 특이사항 ===== */
.note-box {
    padding: 15px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    min-height: 80px;
    font-size: 14px;
    color: #374151;
    white-space: pre-wrap;
}

/* ===== 모달 푸터 ===== */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 30px;
    border-top: 1px solid #e5e7eb;
}

.btn-secondary {
    padding: 10px 24px;
    background: #ffffff;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.btn-primary {
    padding: 10px 24px;
    background: #4C4CDD;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover {
    background: #3d3dbb;
}

.btn-download {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 24px;
    background: #10b981;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-download:hover {
    background: #059669;
}

.icon-download {
    font-style: normal;
    font-size: 16px;
}
</style>
