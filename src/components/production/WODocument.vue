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
                    <th>생산라인</th>
                    <td>{{ group.lineName }}</td>
                </tr>
            </tbody>
        </table>

        <table class="item-table">
            <colgroup>
                <col style="width: 5%">
                <col style="width: 20%">
                <col style="width: 30%">
                <col style="width: 15%">
                <col style="width: 15%">
                <col style="width: 15%">
            </colgroup>
            <thead>
                <tr>
                    <th>No</th>
                    <th>생산계획번호</th>
                    <th>품목명(코드)</th>
                    <th>계획수량</th>
                    <th>지시수량</th>
                    <th>비고</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(item, idx) in group.items" :key="item.ppId">
                    <td class="center">{{ idx + 1 }}</td>
                    <td class="center">{{ item.ppCode }}</td>
                    <td>
                        <div class="bold">{{ item.materialName }}</div>
                        <div class="small-text">({{ item.materialCode }})</div>
                    </td>
                    <td class="right">
                        {{ (item.dailyPlannedQuantity ?? 0).toLocaleString() }}
                        <span class="unit">{{ item.baseUnit }}</span>
                    </td>
                    <td class="right bold">
                        {{ (item.woPlannedQuantity ?? 0).toLocaleString() }}
                        <span class="unit">{{ item.baseUnit }}</span>
                    </td>

                    <td></td>
                </tr>
                <tr v-for="n in Math.max(0, 8 - group.items.length)" :key="'empty-' + n">
                    <td v-for="i in 6" :key="i">&nbsp;</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="4">합 계</th>
                    <td class="right bold">
                        {{
                            group.items
                                .reduce((sum, i) => sum + (i.woPlannedQuantity ?? 0), 0)
                                .toLocaleString()
                        }}
                    </td>
                    <td></td>
                </tr>
            </tfoot>
        </table>

        <div class="footer-note">
            <p>※ 주의사항: 작업 전 안전 장구 착용을 확인하고, 생산 완료 후 실적 등록을 즉시 완료할 것.</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    group: Object,
    workDate: String
})
</script>

<style scoped>
/* 기존에 주신 프린트 스타일과 동일 */
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