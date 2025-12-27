<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
            <!-- 모달 헤더 -->
            <div class="modal-header">
                <h2>납품서 미리보기</h2>
                <button class="btn-close" @click="closeModal">
                    <i class="icon-close">✕</i>
                </button>
            </div>

            <!-- 납품서 내용 (인쇄 영역) -->
            <div ref="printArea" class="delivery-order-content">
                <div class="do-header">
                    <h1>납품서</h1>
                </div>

                <!-- 기본 정보 테이블 -->
                <table class="info-table">
                    <tr>
                        <th class="col-label">문서번호</th>
                        <td class="col-value">{{ deliveryOrder.doCode }}</td>
                        <th class="col-label">일자</th>
                        <td class="col-value">{{ formatDate(deliveryOrder.createdAt) }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">수신처</th>
                        <td colspan="3" class="col-value">{{ deliveryOrder.recipient }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">상호</th>
                        <td class="col-value">{{ deliveryOrder.companyName }}</td>
                        <th class="col-label">대표자</th>
                        <td class="col-value">{{ deliveryOrder.ceoName }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">사업자번호</th>
                        <td class="col-value">{{ deliveryOrder.businessNo }}</td>
                        <th class="col-label">전화번호</th>
                        <td class="col-value">{{ deliveryOrder.companyContact }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">주소</th>
                        <td colspan="3" class="col-value">{{ deliveryOrder.address }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">업태</th>
                        <td class="col-value">{{ deliveryOrder.businessType }}</td>
                        <th class="col-label">업종</th>
                        <td class="col-value">{{ deliveryOrder.businessItem }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">합계금액</th>
                        <td colspan="3" class="col-value total-amount">
                            일금 {{ numberToKorean(deliveryOrder.totalAmount) }} (₩{{ formatNumber(deliveryOrder.totalAmount) }})
                        </td>
                    </tr>
                </table>

                <!-- 품목 테이블 -->
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>품명</th>
                            <th>규격</th>
                            <th>수량</th>
                            <th>단가</th>
                            <th>금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in deliveryOrder.items" :key="index">
                            <td>{{ index + 1 }}</td>
                            <td>{{ item.itemName }}</td>
                            <td>{{ item.spec }}</td>
                            <td>{{ formatNumber(item.quantity) }}</td>
                            <td>{{ formatNumber(item.unitPrice) }}</td>
                            <td>{{ formatNumber(item.amount) }}</td>
                        </tr>
                        <!-- 빈 행 추가 (고정된 레이아웃을 위해) -->
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
                            <td colspan="5" class="footer-label">합계</td>
                            <td class="footer-total">{{ formatNumber(deliveryOrder.totalAmount) }}</td>
                        </tr>
                    </tfoot>
                </table>

                <!-- 하단 정보 -->
                <table class="bottom-info-table">
                    <tr>
                        <th class="col-label">납품기한</th>
                        <td class="col-value">{{ formatDate(deliveryOrder.shippedAt) }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">납품장소</th>
                        <td class="col-value">{{ deliveryOrder.deliveryLocation }}</td>
                    </tr>
                    <tr>
                        <th class="col-label">특이사항</th>
                        <td class="col-value">{{ deliveryOrder.note || '-' }}</td>
                    </tr>
                </table>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
                <button class="btn-secondary" @click="closeModal">닫기</button>
                <button class="btn-primary" @click="printDeliveryOrder">인쇄</button>
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
    deliveryOrder: {
        type: Object,
        required: true,
        default: () => ({
            doCode: '',
            date: '',
            recipient: '',
            companyName: '',
            ceo: '',
            businessNumber: '',
            phone: '',
            address: '',
            businessType: '',
            businessCategory: '',
            totalAmount: 0,
            items: [],
            deliveryDate: '',
            deliveryLocation: '',
            paymentMethod: ''
        })
    }
})

const emit = defineEmits(['close'])

const printArea = ref(null)

// 빈 행 개수 계산 (최소 5개 행 유지)
const emptyRows = computed(() => {
    const minRows = 5
    const currentRows = props.deliveryOrder.items?.length || 0
    return Math.max(0, minRows - currentRows)
})

// 모달 닫기
const closeModal = () => {
    emit('close')
}

// 날짜 포맷팅
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

// 숫자 포맷팅
const formatNumber = (value) => {
    if (!value && value !== 0) return '-'
    return value.toLocaleString()
}

// 숫자를 한글로 변환
const numberToKorean = (num) => {
    if (!num) return '영원'

    const units = ['', '만', '억', '조']
    const smallUnits = ['', '십', '백', '천']
    const numbers = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

    let result = ''
    let unitIndex = 0

    while (num > 0) {
        const part = num % 10000
        if (part > 0) {
            let partStr = ''
            let tempPart = part
            let smallUnitIndex = 0

            while (tempPart > 0) {
                const digit = tempPart % 10
                if (digit > 0) {
                    partStr = numbers[digit] + smallUnits[smallUnitIndex] + partStr
                }
                tempPart = Math.floor(tempPart / 10)
                smallUnitIndex++
            }

            result = partStr + units[unitIndex] + result
        }
        num = Math.floor(num / 10000)
        unitIndex++
    }

    return result + '원'
}

// 인쇄 기능
const printDeliveryOrder = () => {
    const printContent = printArea.value.innerHTML
    const printWindow = window.open('', '_blank', 'width=800,height=600')

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>납품서</title>
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

                body {
                    font-family: 'Malgun Gothic', sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #000;
                }

                .delivery-order-content {
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 10mm;
                }

                .do-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 3px double #000;
                }

                .do-header h1 {
                    font-size: 28px;
                    font-weight: bold;
                    margin: 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }

                th, td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }

                th {
                    background: #f5f5f5;
                    font-weight: 600;
                }

                .info-table .col-label {
                    width: 15%;
                    background: #f5f5f5;
                    text-align: center;
                }

                .info-table .col-value {
                    width: 35%;
                    padding-left: 10px;
                }

                .total-amount {
                    font-size: 14px;
                    font-weight: bold;
                }

                .items-table thead th {
                    background: #e0e0e0;
                    text-align: center;
                    font-weight: bold;
                }

                .items-table tbody td {
                    text-align: center;
                }

                .items-table tbody td:nth-child(2) {
                    text-align: left;
                    padding-left: 10px;
                }

                .items-table tfoot td {
                    background: #f5f5f5;
                    font-weight: bold;
                    text-align: center;
                }

                .footer-total {
                    text-align: right;
                    padding-right: 10px;
                }

                .bottom-info-table {
                    margin-top: 20px;
                }

                .bottom-info-table .col-label {
                    width: 20%;
                    background: #f5f5f5;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `)

    printWindow.document.close()

    // 이미지 로딩 대기 후 인쇄
    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.modal-container {
    background: #ffffff;
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.btn-print {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-print:hover {
    background: #3d3dbb;
}

.btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-close:hover {
    background: #e5e7eb;
}

.icon-close {
    font-size: 20px;
    color: #6b7280;
    font-style: normal;
}

.delivery-order-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
    background: #ffffff;
}

.do-header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 3px double #000;
}

.do-header h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #000;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

th, td {
    border: 1px solid #000;
    padding: 10px;
}

th {
    background: #f5f5f5;
    font-weight: 600;
    color: #000;
}

.info-table .col-label {
    width: 15%;
    background: #f5f5f5;
    text-align: center;
    font-weight: 600;
}

.info-table .col-value {
    width: 35%;
    padding-left: 12px;
}

.total-amount {
    font-size: 15px;
    font-weight: 700;
    color: #000;
}

.items-table {
    margin-top: 25px;
}

.items-table thead th {
    background: #e0e0e0;
    text-align: center;
    font-weight: 700;
    padding: 12px 10px;
}

.items-table tbody td {
    text-align: center;
    padding: 10px;
}

.items-table tbody td:nth-child(2) {
    text-align: left;
    padding-left: 12px;
}

.items-table tfoot td {
    background: #f5f5f5;
    font-weight: 700;
    text-align: center;
    padding: 12px;
}

.footer-label {
    font-size: 14px;
}

.footer-total {
    text-align: right;
    padding-right: 12px;
    font-size: 14px;
}

.bottom-info-table {
    margin-top: 25px;
}

.bottom-info-table .col-label {
    width: 20%;
    background: #f5f5f5;
    text-align: center;
    font-weight: 600;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
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

/* 스크롤바 스타일링 */
.delivery-order-content::-webkit-scrollbar {
    width: 8px;
}

.delivery-order-content::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.delivery-order-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.delivery-order-content::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
