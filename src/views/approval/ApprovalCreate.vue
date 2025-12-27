<template>
    <div class="p-[5px] bg-slate-50 min-h-screen">
        <header class="flex justify-between items-center mb-5 max-w-7xl mx-auto pt-5">
            <div class="flex items-center gap-3">
                <h1 class="text-[28px] font-bold text-slate-800">기안서 작성</h1>
                <span
                    class="px-2 py-0.5 rounded text-[12px] font-semibold bg-slate-200 text-slate-600 border border-slate-300">
                    작성 중
                </span>
            </div>

            <div class="flex gap-2">
                <button
                    class="px-3 py-1.5 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    미리보기
                </button>

                <button
                    class="px-3 py-1.5 bg-[#4c4cdd] text-white rounded text-sm font-medium hover:bg-[#1c1c6f] transition-colors shadow-sm flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    결재 상신
                </button>
            </div>
        </header>

        <ApprovalLineModal v-if="approvalLineStore.isOpen" />

        <section class="max-w-7xl mx-auto bg-white rounded border border-slate-200 shadow-sm mb-5 overflow-hidden">
            <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    결재 라인
                </h2>
                <button @click="openApprovalModal"
                    class="text-xs font-medium text-slate-500 hover:text-blue-600 bg-white border border-slate-200 hover:bg-blue-50 px-2.5 py-1.5 rounded transition-colors shadow-sm">
                    ⚙️ 결재선 지정
                </button>
            </div>



            <div class="p-5 overflow-x-auto">
                <div class="flex items-start w-full px-2 min-w-[600px]"> <template
                        v-for="(approver, idx) in approvalLine" :key="idx">
                        <div class="flex flex-col items-center gap-2 group cursor-default relative z-10 shrink-0">
                            <div class="w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-sm font-bold transition-all relative box-border"
                                :class="[
                                    approver.status === 'approved' ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-100' :
                                        approver.status === 'current' ? 'bg-slate-800 text-white ring-2 ring-slate-800 scale-110' :
                                            'bg-slate-100 text-slate-400'
                                ]">
                                <span v-if="approver.status === 'approved'">✓</span>
                                <span v-else>{{ idx + 1 }}</span>

                                <span
                                    class="absolute -top-8 bg-slate-800 text-white text-[10px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {{ approver.statusText }}
                                </span>
                            </div>

                            <div class="text-center w-max">
                                <p class="text-xs text-slate-500 mb-0.5">{{ approver.team }}</p>
                                <p class="text-sm font-bold text-slate-800">{{ approver.name }} {{ approver.position }}
                                </p>
                            </div>
                        </div>

                        <div v-if="idx < approvalLine.length - 1"
                            class="flex-1 h-[2px] bg-slate-200 mt-6 mx-2 rounded min-w-[20px]">
                        </div>
                    </template>
                </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-100 px-5 py-4 flex flex-col gap-3">

                <div class="flex items-start gap-4">
                    <span class="text-xs font-bold text-slate-800 w-10 shrink-0 mt-1.5">수신</span>
                    <div class="flex flex-wrap gap-2"> <span v-for="(rcv, idx) in receivers" :key="idx"
                            class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700 font-medium shadow-sm flex items-center gap-1.5 hover:bg-blue-50 transition-colors cursor-default">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {{ rcv.team }} {{ rcv.name }} {{ rcv.position }}
                        </span>
                        <span v-if="receivers.length === 0" class="text-xs text-slate-400 mt-1">지정된 수신자가 없습니다.</span>
                    </div>
                </div>

                <div class="border-t border-slate-200 border-dashed w-full"></div>

                <div class="flex items-start gap-4">
                    <span class="text-xs font-bold text-slate-500 w-10 shrink-0 mt-1.5">참조</span>
                    <div class="flex flex-wrap gap-2"> <span v-for="(ref, idx) in referrers" :key="idx"
                            class="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 flex items-center gap-1.5 hover:bg-slate-200 transition-colors cursor-default">
                            <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            {{ ref.team }} {{ ref.name }} {{ ref.position }}
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
                        <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg>
                            기본 정보
                        </h2>
                        <span class="text-xs text-slate-400">기안일: {{ nowDate }}</span>
                    </div>

                    <div class="p-6 grid grid-cols-2 gap-6">
                        <div class="col-span-2">
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">문서 제목</label>
                            <input v-model="formData.title" type="text"
                                class="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-300"
                                placeholder="제목을 입력하세요" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">문서 번호</label>
                            <input type="text" value="자동 생성 (ORD-2025-001)" disabled
                                class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm text-slate-500 cursor-not-allowed" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">관련 문서 검색</label>
                            <div class="relative group">
                                <input type="text" readonly
                                    :value="formData.relatedDoc ? formData.relatedDoc.title : ''"
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
                                        <span
                                            class="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded border border-blue-200">LINKED</span>
                                        <span class="text-xs text-blue-600 opacity-70">{{ formData.relatedDoc.docId
                                            }}</span>
                                    </div>
                                    <p class="text-sm font-bold text-blue-800 leading-tight">{{
                                        formData.relatedDoc.title }}</p>
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
                            <a :href="formData.relatedDoc.pdfUrl" target="_blank"
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
                            <iframe :src="formData.relatedDoc.pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0'"
                                class="w-full h-full" frameborder="0"></iframe>
                        </div>
                    </section>
                </transition>

                <section class="bg-white rounded border border-slate-200 shadow-sm p-6">
                    <div class="mb-5">
                        <label class="block text-xs font-semibold text-slate-500 mb-2 uppercase">비고 / 특이사항</label>
                        <textarea
                            class="w-full h-24 px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 resize-none"
                            placeholder="내용을 입력하세요."></textarea>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="block text-xs font-semibold text-slate-500 uppercase">첨부 파일</label>
                            <span class="text-[10px] text-slate-400">PDF, JPG, PNG (Max 10MB)</span>
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
                            <span class="text-sm font-bold text-slate-700 group-hover:text-blue-700">{{ doc.title
                                }}</span>
                            <div class="flex gap-2">
                                <span v-if="doc.hasPdf"
                                    class="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold">PDF</span>
                                <span
                                    class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{{
                                        doc.status }}</span>
                            </div>
                        </div>
                        <div class="flex justify-between text-xs text-slate-400">
                            <span>{{ doc.docId }}</span>
                            <span>{{ doc.author }} · {{ doc.date }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import ApprovalLineModal from '@/components/approval/ApprovalLineModal.vue';
import { useApprovalLineStore } from '@/stores/approvalLine';

const approvalLineStore = useApprovalLineStore();
const isApprovalModalOpen = ref(false);

const openApprovalModal = () => {
    approvalLineStore.isOpen = true;
};

const isModalOpen = ref(false);
const isPreviewOpen = ref(false);
const fileInput = ref(null);

const nowDate = new Date().toISOString().slice(0, 10);

const formData = reactive({
    title: '12월 정기 사무용품 및 PC 주변기기 구매',
    relatedDoc: null,
    items: [],
    files: []
});

const dummyPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const dummyDocuments = [
    { id: 1, title: '11월 정기 사무용품 구매 건 (견적서 포함)', docId: 'ORD-2025-0088', author: '김기안', date: '2025-11-28', status: '승인완료', hasPdf: true, pdfUrl: dummyPdfUrl },
    { id: 2, title: '영업1팀 노트북 교체 요청', docId: 'REQ-2025-0102', author: '이팀장', date: '2025-11-15', status: '반려', hasPdf: false, pdfUrl: null },
    { id: 3, title: '2025년도 상반기 비품 예산안', docId: 'BUD-2025-0001', author: '박이사', date: '2025-01-05', status: '승인완료', hasPdf: true, pdfUrl: dummyPdfUrl },
];

const selectDocument = (doc) => {
    formData.relatedDoc = doc;
    isModalOpen.value = false;
    if (doc.hasPdf) {
        isPreviewOpen.value = true;
    } else {
        isPreviewOpen.value = false;
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

// [기존 approvalLine 유지]
const approvalLine = ref([
    { name: '김기안', position: '대리', team: '영업1팀', status: 'approved', statusText: '기안완료' },
    { name: '이팀장', position: '팀장', team: '영업1팀', status: 'current', statusText: '검토중' },
    { name: '박이사', position: '이사', team: '경영지원', status: 'pending', statusText: '대기' },
    { name: '최대표', position: '대표', team: 'CEO', status: 'pending', statusText: '대기' },
]);

// [수정됨] 수신자와 참조자 데이터를 분리하고, 줄바꿈 테스트를 위해 더미 데이터를 늘렸습니다.
const receivers = ref([
    { name: '이수신', team: '구매팀', position: '팀장' },
    { name: '강구매', team: '구매팀', position: '대리' },
    { name: '조자재', team: '자재팀', position: '과장' },
    { name: '오물류', team: '물류팀', position: '사원' },
    { name: '한창고', team: '자재팀', position: '주임' }, // 줄바꿈 테스트용
]);

const referrers = ref([
    { name: '박참조', team: '회계팀', position: '과장' },
    { name: '정감사', team: '감사팀', position: '팀장' },
    { name: '김인사', team: '인사팀', position: '대리' }
]);
</script>