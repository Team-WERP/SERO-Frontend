<template>
    <div class="p-[5px] min-h-screen">
        <header class="flex justify-between items-center mb-5 max-w-7xl mx-auto pt-5">
            <div class="flex items-center gap-3">
                <h1 class="text-[28px] font-bold text-slate-800">기안서 작성</h1>
                <span
                    class="px-2 py-0.5 rounded text-[12px] font-semibold bg-slate-200 text-slate-600 border border-slate-300">
                    작성 중
                </span>
            </div>

            <div class="flex gap-2 items-center relative">
                <!-- 미리보기 버튼 -->
                <button
                    class="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    미리보기
                </button>

                <!-- 결재 상신 버튼 + 툴팁 -->
                <div class="relative group">
                    <button
                        class="px-3 py-1.5 bg-[#4c4cdd] text-white rounded text-sm font-medium hover:bg-[#1c1c6f] transition-colors shadow-sm flex items-center gap-1.5"
                        :class="{ 'opacity-50 cursor-not-allowed hover:bg-[#4c4cdd]': !canSubmit }"
                        :disabled="!canSubmit" @click="submitApproval">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                        </svg>
                        결재 상신
                    </button>

                    <!-- 툴팁 -->
                    <div v-if="!canSubmit"
                        class="absolute right-0 bottom-full mb-2 px-2 py-1 text-xs text-white bg-red-500 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        결재선이 비어있으면 상신할 수 없습니다.
                    </div>
                </div>
            </div>
        </header>

        <ApprovalLineModal v-if="approvalLineStore.isOpen" />

        <section class="max-w-7xl mx-auto bg-white rounded border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 class="text-sm font-bold flex items-center gap-2 text-[#4C4CDD]">
                    결재 라인
                </h2>
                <button @click="openApprovalModal"
                    class="text-xs font-medium text-slate-500 hover:text-[#4C4CDD] bg-white border border-slate-200 hover:bg-blue-50 px-2.5 py-1.5 rounded transition-colors shadow-sm">
                    ⚙️ 결재선 지정
                </button>
            </div>


            <div class="p-5 overflow-x-auto">
                <!-- <div class="flex w-full px-2 min-w-[600px] items-center justify-center">
                    <template v-for="(item, idx) in approvalFlow" :key="idx">
                        <div class="flex flex-col items-center gap-2 shrink-0">
                            <div class="w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-sm font-bold"
                                :class="item.lineType === 'drafter'
                                    ? 'bg-blue-100 text-[#4C4CDD] ring-2 ring-blue-100'
                                    : 'bg-slate-100 text-slate-400'">
                                <span v-if="item.lineType === 'drafter'">기안</span>
                                <span v-else>{{ getApprovalType(item.lineType) }}</span>
                            </div>

                            <div class="text-center w-max">
                                <p class="text-xs text-slate-500 mb-0.5">{{ item.deptName }}</p>
                                <p class="text-sm font-bold text-slate-800">
                                    {{ item.name }} {{ getPositionName(item.position) }} · {{ getRankName(item.rank) }}
                                </p>
                            </div>
                        </div>

                        <div v-if="idx < approvalFlow.length - 1"
                            class="flex-1 h-[2px] bg-slate-200 mt-6 mx-2 rounded min-w-[20px]" />
                    </template>
</div> -->

                <div class="flex w-full px-2 min-w-[600px] items-start justify-center">

                    <template v-for="(item, idx) in approvalFlow" :key="idx">
                        <div class="flex flex-col items-center gap-2 shrink-0">
                            <div class="w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-sm font-bold"
                                :class="item.lineType === 'drafter'
                                    ? 'bg-blue-100 text-[#4C4CDD] ring-2 ring-blue-100'
                                    : 'bg-slate-100 text-slate-400'">
                                <span v-if="item.lineType === 'drafter'">기안</span>
                                <span v-else>{{ getApprovalType(item.lineType) }}</span>
                            </div>

                            <div class="text-center w-max">
                                <p class="text-xs text-slate-500 mb-0.5">{{ item.deptName }}</p>
                                <p class="text-sm font-bold text-slate-800">
                                    {{ item.name }} {{ getPositionName(item.position) }} · {{ getRankName(item.rank) }}
                                </p>
                            </div>
                        </div>

                        <div v-if="idx < approvalFlow.length - 1"
                            class="flex-1 h-[2px] bg-slate-200 rounded min-w-[20px] mt-[23px]" />
                    </template>
                </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-100 px-5 py-4 flex flex-col gap-3">

                <div class="flex items-start gap-4">
                    <div class="relative flex items-center shrink-0 mt-1.5 group gap-1.5 w-12">
                        <span class="text-xs font-bold text-slate-800">수신</span>

                        <div class="rounded-full bg-white">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8.228 9.75a3.75 3.75 0 117.544 0c0 1.636-1.216 2.396-2.25 2.75-.75.26-1.25.75-1.25 1.25v.5M12 17h.01" />
                            </svg>
                        </div>

                        <div
                            class="absolute top-full left-0 mt-2 w-56 bg-slate-800 text-white text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                            수신자는 결재가 완료된 후<br />
                            문서를 전달받는 사용자입니다.
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2"> <span v-for="(rcv, idx) in receivers" :key="idx"
                            class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs shadow-sm flex items-center gap-1.5 hover:bg-blue-50 transition-colors cursor-default">
                            <span class="w-1.5 h-1.5 rounded-full bg-[#4C4CDD]"></span>
                            {{ rcv.deptName }} {{ rcv.name }} {{ getPositionName(rcv.position) }}
                        </span>
                        <span v-if="receivers.length === 0" class="text-xs text-slate-400 mt-1">지정된 수신자가 없습니다.</span>
                    </div>
                </div>

                <div class="border-t border-slate-200 border-dashed w-full"></div>

                <div class="flex items-start gap-4">
                    <span class="text-xs font-bold text-slate-500 w-12 shrink-0 mt-1.5">참조</span>
                    <div class="flex flex-wrap gap-2"> <span v-for="(ref, idx) in referrers" :key="idx"
                            class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs flex items-center shadow-sm gap-1.5 hover:bg-slate-200 transition-colors cursor-default">
                            <span class="w-1.5 h-1.5 rounded-full bg-[#64dd4c]"></span>
                            {{ ref.deptName }} {{ ref.name }} {{ getPositionName(ref.position) }}
                        </span>
                        <span v-if="referrers.length === 0" class="text-xs text-slate-400 mt-1">지정된 참조자가 없습니다.</span>
                    </div>
                </div>

            </div>
        </section>

        <div class="max-w-7xl mx-auto">
            <main class="col-span-12 lg:col-span-9 flex flex-col gap-5">

                <section class="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
                    <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                        <h2 class="text-sm font-bold text-[#4C4CDD] flex items-center gap-2">
                            기안 정보
                        </h2>
                        <span class="text-xs text-slate-400">기안일: {{ nowDate }}</span>
                    </div>

                    <div class="p-6 grid grid-cols-2 gap-6">
                        <div class="col-span-2">
                            <label class="block text-xs mb-1.5 uppercase">
                                <span class="text-[#ff0000] font-bold">*</span> <span
                                    class="font-semibold text-slate-500">문서
                                    제목</span></label>
                            <input v-model="formData.title" type="text"
                                class="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-300"
                                placeholder="제목을 입력하세요" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">문서 번호</label>
                            <input type="text" value="자동 생성" disabled
                                class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm text-slate-500 cursor-not-allowed" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase"><span
                                    class="text-[#ff0000] font-bold">*</span> 관련 문서 검색</label>
                            <div class="relative group">
                                <input type="text" readonly
                                    :value="formData.relatedDoc?.prCode || formData.relatedDoc?.soCode || formData.relatedDoc?.giCode || ''"
                                    :placeholder="formData.relatedDoc ? '' : '클릭하여 관련 문서를 검색하세요...'"
                                    @click="!formData.relatedDoc ? isModalOpen = true : null"
                                    class="w-full px-3 py-2 border rounded text-sm transition-all text-ellipsis pr-8"
                                    :class="[
                                        formData.relatedDoc
                                            ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-default'
                                            : 'bg-white border-slate-300 text-slate-900 cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 hover:border-blue-400'
                                    ]" />

                                <div class="absolute right-2 top-1/2 -translate-y-1/2">
                                    <button v-if="formData.relatedDoc" @click="removeRelatedDoc"
                                        class="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-200 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                    <svg v-else class="w-4 h-4 text-slate-400 pointer-events-none" fill="none"
                                        stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div class="col-span-2" v-if="formData.relatedDoc">
                            <div
                                class="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center animate-fade-in-down">
                                <div class="flex flex-col">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span v-if="formData.relatedDoc.soCode"
                                            class="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded border border-blue-200">{{
                                                getRefDocType(formData.relatedDoc.soCode) }}</span>
                                        <span v-else-if="formData.relatedDoc.prCode"
                                            class="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded border border-blue-200">{{
                                                getRefDocType(formData.relatedDoc.prCode) }}</span>
                                        <span v-else
                                            class="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded border border-blue-200">{{
                                                getRefDocType(formData.relatedDoc.giCode) }}ㅇ</span>
                                        <span class="text-xs text-blue-600 opacity-70">{{ formData.relatedDoc.soCode ||
                                            formData.relatedDoc.prCode ||
                                            formData.relatedDoc.giCode
                                            }}</span>
                                    </div>
                                    <p class="text-sm font-bold text-blue-800 leading-tight">{{
                                        formData.relatedDoc.clientName }}</p>
                                </div>

                                <div class="flex items-center gap-2">
                                    <button @click="isPreviewOpen = !isPreviewOpen"
                                        class="text-xs font-medium px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
                                        :class="isPreviewOpen ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600'">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                            </path>
                                        </svg>
                                        {{ isPreviewOpen ? '미리보기 닫기' : '내용 보기' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <transition enter-active-class="transition duration-200 ease-out"
                    enter-from-class="transform -translate-y-2 opacity-0"
                    enter-to-class="transform translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="transform translate-y-0 opacity-100"
                    leave-to-class="transform -translate-y-2 opacity-0">
                    <section v-if="formData.relatedDoc && isPreviewOpen"
                        class="bg-slate-700 rounded border border-slate-600 shadow-lg overflow-hidden flex flex-col h-[600px] -mt-2 relative z-10">
                        <div class="px-4 py-2 bg-slate-800 flex justify-between items-center border-b border-slate-600">
                            <div class="flex items-center gap-2 text-white">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                                <span class="text-sm font-medium">{{ formData.relatedDoc.title }}.pdf</span>
                            </div>
                            <a :href="formData.relatedDoc.url" target="_blank"
                                class="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14">
                                    </path>
                                </svg>
                                새 창으로 열기
                            </a>
                        </div>
                        <div class="flex-grow bg-slate-200 relative">
                            <iframe :src="formData.relatedDoc.url + '#toolbar=0&navpanes=0&scrollbar=0'"
                                class="w-full h-full" frameborder="0"></iframe>
                        </div>
                    </section>
                </transition>

                <section class="bg-white rounded border border-slate-200 shadow-sm p-6">
                    <div class="mb-5">
                        <label class="block text-xs font-semibold text-slate-500 mb-2 uppercase"><span
                                class="text-[#ff0000] font-bold">*</span> 기안 내용</label>
                        <textarea v-model="formData.content"
                            class="w-full h-24 px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="내용을 입력하세요."></textarea>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-xs font-semibold text-slate-500 uppercase">첨부 파일</label>
                            <!-- <span class="text-[10px] text-slate-400">(Max 10MB)</span> -->
                        </div>

                        <div @dragover.prevent @drop.prevent="handleFileDrop"
                            class="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer group"
                            @click="$refs.fileInput.click()">
                            <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileChange" />

                            <div class="mb-2 p-2 bg-slate-100 rounded-full group-hover:bg-blue-50 transition-colors">
                                <svg class="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                    </path>
                                </svg>
                            </div>
                            <p class="text-sm text-slate-600 font-medium">
                                <span class="text-blue-600">클릭하여 업로드</span> 하거나 파일을 드래그하세요
                            </p>
                            <span class="text-[10px] text-slate-400">(Max 10MB)</span>
                        </div>

                        <div v-if="formData.files.length > 0" class="mt-3 space-y-2">
                            <div v-for="(file, idx) in formData.files" :key="idx"
                                class="flex justify-between items-center p-2 bg-slate-50 border border-slate-200 rounded text-sm">
                                <div class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                        </path>
                                    </svg>
                                    <span class="text-slate-700">{{ file.name }}</span>
                                    <span class="text-xs text-slate-400">({{ (file.size / 1024).toFixed(1) }} KB)</span>
                                </div>
                                <button @click="removeFile(idx)"
                                    class="text-slate-400 hover:text-red-500 px-2">×</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>

        <div v-if="isModalOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 class="font-bold text-slate-800">관련 문서 검색</h3>
                    <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12">
                            </path>
                        </svg>
                    </button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                    <div v-for="doc in dummyDocuments" :key="doc.id" @click="selectDocument(doc)"
                        class="px-5 py-3 border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors group">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-sm font-bold text-slate-700 group-hover:text-blue-700">{{ doc.clientName
                            }}</span>
                            <div class="flex gap-2">
                                <span v-if="doc.hasPdf"
                                    class="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold">PDF</span>
                                <span
                                    class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{{
                                        doc.shippedAt }}</span>
                            </div>
                        </div>
                        <div class="flex justify-between text-xs text-slate-400">
                            <span>{{ doc.soCode || doc.prCode || doc.giCode }}</span>
                            <span>{{ doc.recipientName }} · {{ doc.orderedAt }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import ApprovalLineModal from '@/components/approval/ApprovalLineModal.vue';
import { useApprovalLineStore } from '@/stores/approvalLine';
import { EMPLOYEE_RANK, EMPLOYEE_POSITION, APPROVAL_TYPE, DOC_TYPE_LABEL } from '@/constants/approval.js';
import { submitApproval as submitApprovalAPI } from '@/api/approval.js';

const approvalLineStore = useApprovalLineStore();
approvalLineStore.reset();

const {
    approvalLines,
    recipientLines,
    referenceLines
} = storeToRefs(approvalLineStore);

// 로그인한 사용자 정보 가져오기
const loggedEmployeeInfo = {
    name: "사용자 이름",
    deptName: "영업 1팀",
    position: "JP_STF",
    rank: "JR_TM"
};

const openApprovalModal = () => {
    // 1. 현재 작성 중인 결재선 데이터를 스토어에 세팅
    approvalLineStore.setLines({
        approval: approvalLine.value.map(item => ({
            ...item,
            id: item.approverId || item.id
        })),

        recipient: receivers.value.map(item => ({
            ...item,
            id: item.approverId || item.id
        })),

        reference: referrers.value.map(item => ({
            ...item,
            id: item.approverId || item.id
        }))
    });

    // 2. 그 다음 모달 열기 (이 시점의 데이터를 스냅샷으로 뜸)
    approvalLineStore.open();
};

const isModalOpen = ref(false);
const isPreviewOpen = ref(false);

const nowDate = new Date().toISOString().slice(0, 10);

const formData = reactive({
    title: '',
    content: '',
    relatedDoc: null,
    items: [],
    files: []
});

const dummyPdfUrl = "https://sero-erp-storage.s3.ap-northeast-2.amazonaws.com/sero/documents/28bfcc5f-ddc5-4990-89e1-43ba7e68ead1.pdf";

const dummyDocuments = [
    { id: 41, clientName: '에스엘(주)', soCode: 'SO-20251228-001', recipientName: '강지륜', orderedAt: '2025-12-28 16:41', shippedAt: '2026-02-10 16:00', hasPdf: true, url: dummyPdfUrl },
    { id: 2, clientName: '현대 모비스', prCode: 'PR-2025-0102', recipientName: '이팀장', orderedAt: '2025-12-28 16:41', shippedAt: '2026-02-10 16:00', hasPdf: false, url: null },
    { id: 3, clientName: '기아', giCode: 'GI-2025-0001', recipientName: '박이사', orderedAt: '2025-12-28 16:41', shippedAt: '2026-02-10 16:00', hasPdf: true, url: dummyPdfUrl },
];

const selectDocument = (doc) => {
    formData.relatedDoc = doc;

    isModalOpen.value = false;
    if (!doc.hasPdf) {
        alert('이 문서에는 미리볼 수 있는 PDF 파일이 없습니다.');
    }
};

const removeRelatedDoc = () => {
    formData.relatedDoc = null;
    isPreviewOpen.value = false;
}

const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    formData.files = [...formData.files, ...newFiles];
};

const handleFileDrop = (e) => {
    const droppedFiles = Array.from(e.dataTransfer.files);
    formData.files = [...formData.files, ...droppedFiles];
};

const removeFile = (idx) => {
    formData.files.splice(idx, 1);
};

const canSubmit = computed(() => {
    // drafter(기안자) 제외, 결재선이 한 명 이상 있어야 상신 가능
    return approvalFlow.value.length > 1;
});

// 문서 제목 체크
const validateTitle = () => {
    if (!formData.title) {
        alert('문서 제목을 입력해야 합니다.'); // ERP 느낌: 정식 안내 문구
        return false;
    }
    return true;
};

// 관련 문서 체크
const validateRelatedDoc = () => {
    if (!formData.relatedDoc?.id) {
        alert('관련 문서를 선택해야 합니다.'); // ERP 느낌: 정식 안내 문구
        return false;
    }
    return true;
};

// 결재 가능 여부 체크
const validateApprovalFlow = () => {
    if (!canSubmit.value) {
        alert('결재선에 최소 1명의 결재자를 지정해야 합니다.');
        return false;
    }
    return true;
};

// 문서 내용 체크
const validateContent = () => {
    if (!formData.content) {
        alert('문서 내용을 입력해야 합니다.'); // ERP 느낌: 정식 안내 문구
        return false;
    }
    return true;
};

const submitApproval = async () => {
    if (!validateApprovalFlow()) return;
    if (!validateTitle()) return;
    if (!validateRelatedDoc()) return;
    if (!validateContent()) return;

    const formDataToSend = buildApprovalFormData(formData, approvalFlow.value);

    try {
        const res = await submitApprovalAPI(formDataToSend);

        console.log('결재 상신 완료', res.data);
        alert('결재 상신이 완료되었습니다.');
    } catch (err) {
        console.error(err);
        alert('결재 상신에 실패했습니다.');
    }
};

const buildApprovalFormData = (formData, approvalFlow) => {
    const docCode = formData.relatedDoc.soCode
        ? formData.relatedDoc.soCode
        : formData.relatedDoc.prCode
            ? formData.relatedDoc.prCode
            : formData.relatedDoc.giCode;

    // 1. [결재자] 리스트 변환 (기안자 제외)
    const approvalList = approvalLines.value.map(line => ({
        approverId: line.id,
        lineType: line.lineType, // AT_APPR (결재), AT_RVW (협조)
        sequence: line.sequence  // 순서 포함
    }));

    // 2. [수신자] 리스트 변환
    const recipientList = recipientLines.value.map(line => ({
        approverId: line.id,
        lineType: line.lineType, // AT_RCPT (수신) 등
        sequence: null // 수신자는 순서 없음 (필요시 추가)
    }));

    // 3. [참조자] 리스트 변환
    const referenceList = referenceLines.value.map(line => ({
        approverId: line.id,
        lineType: line.lineType, // AT_REF (참조) 등
        sequence: null // 참조자는 순서 없음
    }));

    // 4. [통합] 세 리스트를 하나로 합치기
    const allLines = [
        ...approvalList,
        ...recipientList,
        ...referenceList
    ];

    // 5. requestDTO 생성
    const requestDTO = {
        title: formData.title,
        content: formData.content,
        refCode: docCode,
        approvalTargetType: docCode.slice(0, 2),
        approvalLines: allLines
    };

    // 6. FormData
    const formDataToSend = new FormData();
    formDataToSend.append('requestDTO', new Blob([JSON.stringify(requestDTO)], { type: 'application/json' }));

    // 7. 파일 추가
    if (formData.files?.length) {
        formData.files.forEach(file => formDataToSend.append('files', file));
    }

    return formDataToSend;
};

// [기존 approvalLine 유지]
const approvalLine = ref([]);

// 수신자
const receivers = ref([]);

// 참조자
const referrers = ref([]);

watch(
    approvalLines,
    (lines) => {
        approvalLine.value = lines.map(line => ({
            id: line.id,
            name: line.name,
            deptName: line.deptName,
            position: line.position,
            rank: line.rank,
            lineType: line.lineType,
            sequence: line.sequence
        }))
    },
    { immediate: true, deep: true }
);

watch(
    recipientLines,
    (lines) => {
        receivers.value = lines.map(line => ({
            id: line.id,
            name: line.name,
            deptName: line.deptName,
            rank: line.rank,
            position: line.position,
            lineType: line.lineType
        }))
    },
    { immediate: true, deep: true }
);

watch(
    referenceLines,
    (lines) => {
        referrers.value = lines.map(line => ({
            id: line.id,
            name: line.name,
            deptName: line.deptName,
            position: line.position,
            rank: line.rank,
            lineType: line.lineType
        }))
    },
    { immediate: true, deep: true }
);

const getRankName = (rank) => {
    if (rank && EMPLOYEE_RANK.CODE[rank]) {
        return EMPLOYEE_RANK.CODE[rank];
    }

    return '';
};

const getPositionName = (position) => {
    if (position && EMPLOYEE_POSITION.CODE[position]) {
        return EMPLOYEE_POSITION.CODE[position];
    }

    return '';
};

const getApprovalType = (lineType) => {
    if (lineType && APPROVAL_TYPE.CODE[lineType])
        return APPROVAL_TYPE.CODE[lineType]

    return '';
};

const approvalFlow = computed(() => {
    return [
        {
            lineType: 'drafter',
            name: loggedEmployeeInfo.name,
            status: 'approved',
            rank: loggedEmployeeInfo.rank,
            deptName: loggedEmployeeInfo.deptName,
            position: loggedEmployeeInfo.position
        },
        ...approvalLine.value
    ]
})

const getRefDocType = (refDocCode) => {
    const refDocType = refDocCode.slice(0, 2);

    if (refDocType && DOC_TYPE_LABEL[refDocType])
        return DOC_TYPE_LABEL[refDocType];

    return '';
};

</script>