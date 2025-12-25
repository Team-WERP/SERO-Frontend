<template>
    <div class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal">
            <div class="modal-header">
                <div>
                    <h2 class="modal-title">임시저장된 생산요청 목록</h2>
                    <p class="modal-sub">주문에서 작성한 임시저장 목록입니다.</p>
                </div>
                <button class="close-btn" @click="$emit('close')" aria-label="닫기">×</button>
            </div>

            <div class="table-wrap">
                <table class="draft-table">
                    <thead>
                        <tr>
                            <th style="width:60px; text-align:center;">No</th>
                            <th style="width:170px;">주문번호</th>
                            <th style="width:140px;">고객사</th>
                            <th>요청명 (대표 품목)</th>
                            <th style="width:110px; text-align:center;">총 수량</th>
                            <th style="width:130px;">생산마감일</th>
                            <th style="width:130px;">작성일</th>
                        </tr>
                    </thead>


                    <tbody>
                        <tr v-for="(d, idx) in drafts" :key="d.prId" @click="selectDraft(d)"
                            :class="{ selected: selected?.prId === d.prId }">
                            <td class="text-center">{{ idx + 1 }}</td>

                            <td class="mono">{{ d.soCode }}</td>

                            <td>{{ d.clientName }}</td>

                            <td class="item-name" :title="displayTitle(d)">
                                {{ d.representativeItemName || '-' }}
                                <span v-if="d.itemTypeCount > 1" class="muted">
                                    외 {{ d.itemTypeCount - 1 }}건
                                </span>
                            </td>

                            <td class="text-center">
                                {{ formatQuantity(d.totalQuantity) }}
                            </td>

                            <td>{{ formatDate(d.dueAt) }}</td>
                            <td>{{ formatDate(d.createdAt) }}</td>
                        </tr>

                        <tr v-if="drafts.length === 0">
                            <td colspan="7" class="empty">
                                임시저장된 생산요청이 없습니다.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="modal-footer">
                <button class="btn btn-ghost" @click="$emit('close')">취소</button>
                <button class="btn btn-primary" :disabled="!selected" @click="confirm">
                    선택 항목 불러오기
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPRDraftList } from '@/api/production/productionRequest'

const emit = defineEmits(['close', 'select'])

const drafts = ref([])
const selected = ref(null)

onMounted(async () => {
    drafts.value = await getPRDraftList()
})

const selectDraft = (d) => {
    selected.value = d
}

const confirm = () => {
    if (!selected.value) return
    emit('select', selected.value)
}

const formatDate = (v) => v?.slice(0, 10) || '-'

const formatQuantity = (v) => {
    if (v == null) return '-'
    return v.toLocaleString()
}

const displayTitle = (d) => {
    if (!d?.representativeItemName) return '품목 없음'
    return d.itemTypeCount > 1
        ? `${d.representativeItemName} 외 ${d.itemTypeCount - 1}건`
        : d.representativeItemName
}

</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(17, 24, 39, 0.45);
    z-index: 9999;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 24px;
}

/* Modal box */
.modal {
    width: min(980px, 100%);
    max-height: 82vh;
    background: #ffffff;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);

    padding: 20px 22px;
    overflow: hidden;
    /* table-wrap에서 스크롤 처리 */
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 14px;
}

.modal-title {
    font-size: 18px;
    font-weight: 800;
    color: #111827;
    margin: 0;
}

.modal-sub {
    font-size: 13px;
    color: #6b7280;
    margin: 6px 0 0 0;
}

.close-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    color: #374151;
}

.close-btn:hover {
    background: #f9fafb;
}

/* Table container (scroll) */
.table-wrap {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: auto;
    max-height: calc(82vh - 170px);
}

/* Table */
.draft-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
}

.draft-table thead th {
    position: sticky;
    top: 0;
    z-index: 1;

    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;

    padding: 12px 14px;
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    text-align: left;
}

.draft-table tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
    color: #111827;
    vertical-align: middle;
}

.draft-table tbody tr {
    cursor: pointer;
}

.draft-table tbody tr:hover {
    background: #f9fafb;
}

/* Selected row */
.draft-table tbody tr.selected {
    background: #eef2ff;
}

.draft-table tbody tr.selected td {
    border-bottom-color: #e0e7ff;
}

/* Utility */
.text-center {
    text-align: center;
}

.muted {
    color: #6b7280;
    margin-left: 6px;
}

.mono {
    font-variant-numeric: tabular-nums;
}

/* Item name: prevent ugly vertical wrap */
.item-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Empty */
.empty {
    text-align: center;
    padding: 60px 0 !important;
    color: #9ca3af !important;
    cursor: default;
}

/* Status badge */
.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: #f3f4f6;
    color: #374151;
}

/* Footer buttons */
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 14px;
}

.btn {
    height: 36px;
    padding: 0 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid transparent;
}

.btn-ghost {
    background: #fff;
    border-color: #d1d5db;
    color: #374151;
}

.btn-ghost:hover {
    background: #f9fafb;
}

.btn-primary {
    background: #4C4CDD;
    color: #fff;
    border-color: #4C4CDD;
}

.btn-primary:hover {
    background: #3d3dbb;
    border-color: #3d3dbb;
}

.btn-primary:disabled {
    background: #c7c7f7;
    border-color: #c7c7f7;
    cursor: not-allowed;
}
</style>
