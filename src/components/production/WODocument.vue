<template>
    <div class="print-page">
        <div class="header-container">
            <h1 class="doc-title">작 업 지 시 서</h1>
        </div>

        <table class="info-table">
            <tbody>
                <tr>
                    <th>작업지시일자</th>
                    <td class="highlight-text">{{ workDate }}</td>
                    <th>작업지시번호</th>
                    <td>{{ group.workOrderCode }}</td>
                </tr>
                <tr>
                    <th>생산라인</th>
                    <td>{{ group.lineName }}</td>
                    <th>일일 생산능력</th>
                    <td>{{ group.dailyCapacity }}</td>
                </tr>
                <tr>
                    <th>생산 품목</th>
                    <td>{{ group.itemName }}</td>
                    <th>품목 코드</th>
                    <td>{{ group.itemCode }}</td>
                </tr>

            </tbody>
        </table>


        <table class="item-table">
            <colgroup>
                <col style="width: 5%">
                <col style="width: 15%">
                <col style="width: 40%">
                <col style="width: 20%">
                <col style="width: 20%">
            </colgroup>

            <thead>
                <tr>
                    <th>No</th>
                    <th>유형</th>
                    <th>참조 번호</th>
                    <th>지시 수량</th>
                    <th>비고</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(item, idx) in group.items" :key="idx">
                    <td class="center">{{ idx + 1 }}</td>
                    <td class="center">
                        <strong>{{ item.type }}</strong>
                    </td>
                    <td class="center">
                        {{ item.refCode }}
                    </td>
                    <td class="right bold">
                        {{ item.plannedQuantity }}
                        <span class="unit">{{ group.unit }}</span>
                    </td>
                    <td></td>
                </tr>
            </tbody>

            <tfoot>
                <tr>
                    <th colspan="3">합계</th>
                    <th class="right bold">
                        {{
                            group.items.reduce((s, i) => s + i.plannedQuantity, 0).toLocaleString()
                        }}
                    </th>
                    <th></th>
                </tr>
            </tfoot>
        </table>


        <div class="footer-note">
            <p>※ 주의사항: 작업 전 안전 장구 착용을 확인하고, 생산 완료 후 실적 등록을 즉시 완료할 것.</p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    group: Object,
    workDate: String
})

</script>

<style scoped>
.print-page {
    width: 100%;
    padding: 10mm;
    background-color: #fff;
    box-sizing: border-box;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 30px;
}

.doc-title {
    font-size: 32px;
    letter-spacing: 15px;
    text-decoration: underline;
    text-underline-offset: 8px;
    margin-top: 20px;
}

.sign-table {
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

.center {
    text-align: center;
}

.right {
    text-align: right;
}

.bold {
    font-weight: bold;
}

.small-text {
    font-size: 11px;
    color: #666;
}

.highlight-text {
    color: #d32f2f;
    font-weight: bold;
}

.footer-note {
    margin-top: 20px;
    font-size: 12px;
    border: 1px solid #000;
    padding: 10px;
    min-height: 60px;
}
</style>