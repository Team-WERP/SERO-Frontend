<template>
    <div class="print-page">
        <div class="header-container">
            <h1 class="doc-title">생 산 요 청 서</h1>
        </div>

        <table class="info-table">
            <tbody>
                <tr>
                    <th>생산요청번호</th>
                    <td>{{ header.prCode }}</td>
                    <th>요청일자</th>
                    <td>{{ header.requestedAt }}</td>
                </tr>
                <tr>
                    <th>주문번호</th>
                    <td>{{ header.soCode }}</td>
                    <th>납기일자</th>
                    <td class="highlight-text">{{ header.dueAt }}</td>
                </tr>
                <tr>
                    <th>요청자</th>
                    <td>{{ header.drafterName }}</td>
                    <th>담당자</th>
                    <td>{{ header.managerName || '-' }}</td>
                </tr>
            </tbody>
        </table>


        <table class="item-table">
            <colgroup>
                <col style="width: 5%">
                <col style="width: 15%">
                <col style="width: 30%">
                <col style="width: 20%">
                <col style="width: 10%">
                <col style="width: 20%">
            </colgroup>
            <thead>
                <tr>
                    <th>No</th>
                    <th>품목코드</th>
                    <th>품목명</th>
                    <th>규격</th>
                    <th>단위</th>
                    <th>수량</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(i, idx) in items" :key="i.prItemId">
                    <td class="center">{{ idx + 1 }}</td>
                    <td class="center">{{ i.itemCode }}</td>
                    <td>{{ i.itemName }}</td>
                    <td class="center">{{ i.spec }}</td>
                    <td class="center">{{ i.unit }}</td>
                    <td class="right bold">{{ i.requestedQuantity.toLocaleString() }}</td>
                </tr>
                <tr v-for="n in Math.max(0, 10 - items.length)" :key="'empty-' + n">
                    <td class="center">&nbsp;</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="5">합 계</th>
                    <td class="right bold">{{ totalQuantity.toLocaleString() }}</td>
                </tr>
            </tfoot>
        </table>

        <div class="footer-note">
            <p>※ 특이사항: 위와 같이 생산을 요청하오니 기한 내 납품 바랍니다.</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    header: Object,
    items: Array
})

// 수량 합계 계산
const totalQuantity = computed(() => {
    return props.items.reduce((acc, cur) => acc + (cur.requestedQuantity || 0), 0);
});
</script>

<style scoped>
.print-page {
    width: 100%;
    margin: 0;
    padding: 10mm;
    /* 여백 조정 */
    background-color: #ffffff !important;
    /* 배경색 하얀색 강제 */
    box-sizing: border-box;
}

table {
    page-break-inside: auto;
}

tr {
    page-break-inside: avoid;
    page-break-after: auto;
}

@media print {

    html,
    body {
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
    }
}

/* 헤더 레이아웃 */
.header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
}

.doc-title {
    font-size: 32px;
    letter-spacing: 15px;
    /* 글자 간격 넓게 */
    text-decoration: underline;
    text-underline-offset: 8px;
    margin-top: 20px;
}

/* 결재란 스타일 */
.sign-table {
    width: auto;
    border-collapse: collapse;
}

.sign-table th,
.sign-table td {
    border: 1px solid #000;
    width: 70px;
    font-size: 12px;
    text-align: center;
    padding: 4px;
}

.sign-title {
    width: 25px !important;
    background-color: #f8f8f8;
}

.sign-box {
    height: 60px;
}

/* 일반 테이블 스타일 */
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 15px;
    table-layout: fixed;
}

th,
td {
    border: 1px solid #000;
    padding: 8px;
    font-size: 13px;
    word-break: break-all;
}

th {
    background: #f2f2f2;
    font-weight: bold;
}

/* 정렬 및 강조 */
.center {
    text-align: center;
}

.right {
    text-align: right;
}

.bold {
    font-weight: bold;
}

.highlight-text {
    color: #d32f2f;
    font-weight: bold;
}

/* 하단 비고 */
.footer-note {
    margin-top: 20px;
    font-size: 12px;
    border: 1px solid #000;
    padding: 10px;
    min-height: 60px;
}
</style>