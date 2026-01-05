<template>
    <div class="min-h-screen p-1.25">
        <header class="flex justify-between items-center mb-4 max-w-7xl mx-auto">
            <h1 class="text-[28px] font-bold">공지사항 작성</h1>
            <div class="flex gap-2"> <button @click="goBack"
                    class="px-4 py-2 bg-white border border-[#e5e7eb] rounded text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    ✕ 취소 </button> <button @click="registerNotice"
                    class="px-4 py-2 bg-[#4C4CDD] text-white rounded text-sm font-medium hover:bg-[#4346a8] transition-colors shadow-sm flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg> 공지 등록 </button> </div>
        </header>
        <section class="bg-white rounded border border-[#e5e7eb] overflow-hidden p-8">
            <!-- 구분 -->
            <div class="mb-6">
                <label class="block text-sm font-semibold mb-2">
                    구분 <span class="text-red-500">*</span>
                </label>
                <select v-model="formData.category" class="w-full px-3 py-2.5 border border-slate-300 rounded text-sm
               focus:outline-none focus:ring-1 focus:ring-[#4C4CDD]">
                    <option value="">공지 구분을 선택해주세요.</option>
                    <option value="NOTICE_INTERNAL">사내 공지</option>
                    <option value="NOTICE_CUSTOMER">고객 공지</option>
                    <option v-if="isSystemAdmin" value="NOTICE_SYSTEM">시스템 공지</option>
                </select>
            </div>

            <!-- 공지 노출 설정 -->
            <div class="mb-8 rounded border border-slate-200 bg-slate-50 p-5 space-y-6">

                <p class="text-sm font-semibold text-slate-700">
                    공지 노출 설정
                </p>

                <!-- 상단 고정 -->
                <div>
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-slate-800">상단 고정</p>
                            <p class="text-xs text-slate-500">
                                공지를 목록 상단에 고정하여 노출합니다.
                            </p>
                        </div>
                        <input type="checkbox" v-model="formData.isPinned" class="accent-[#4C4CDD] w-4 h-4" />
                    </div>

                    <!-- 고정 종료일 -->
                    <div v-if="formData.isPinned" class="mt-4 pl-1">
                        <label class="block text-sm font-medium mb-1">
                            고정 종료일
                        </label>
                        <input type="date" v-model="formData.pinEndDate" class="px-3 py-2 border border-slate-300 rounded text-sm
                       focus:outline-none focus:ring-1 focus:ring-[#4C4CDD]" />
                        <p class="mt-1 text-xs text-slate-500">
                            종료일을 지정하지 않으면 무기한 고정됩니다.
                        </p>
                    </div>
                </div>

                <!-- 긴급 공지 -->
                <div class="border-t border-slate-200 pt-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-red-600">긴급 공지</p>
                            <p class="text-xs text-slate-500">
                                즉시 확인이 필요한 공지에 사용합니다.
                            </p>
                        </div>
                        <input type="checkbox" v-model="formData.isEmergency" class="accent-red-500 w-4 h-4" />
                    </div>

                    <!-- 긴급 종료 일시 -->
                    <div v-if="formData.isEmergency" class="mt-4 pl-1">
                        <label class="block text-sm font-medium mb-1 text-red-600">
                            긴급 종료 일시 <span class="text-red-500">*</span>
                        </label>
                        <input type="datetime-local" v-model="formData.emergencyEndAt" class="px-3 py-2 border border-slate-300 rounded text-sm
                       focus:outline-none focus:ring-1 focus:ring-red-400" />
                        <p class="mt-1 text-xs text-slate-500">
                            지정된 시간이 지나면 긴급 표시가 자동 해제됩니다.
                        </p>
                    </div>
                </div>

            </div>

            <!-- 제목 -->
            <div class="mb-6">
                <label class="block text-sm font-semibold mb-2">
                    제목 <span class="text-red-500">*</span>
                </label>
                <input v-model="formData.title" type="text" placeholder="예: 12월 3주차 물류 출고 일정 변동 안내" class="w-full px-3 py-2.5 border border-slate-300 rounded text-sm
               focus:outline-none focus:ring-1 focus:ring-[#4C4CDD]" />
            </div>

            <div class="mb-8"> <label class="block text-sm font-semibold mb-2"> 상세 내용 <span
                        class="text-red-500">*</span> </label>
                <div class="prose max-w-none"> <textarea id="summernote" name="editordata"></textarea> </div>
            </div>


            <div> <label class="block text-sm font-bold text-slate-700 mb-2"> 첨부 파일 </label>
                <div @dragover.prevent @drop.prevent="handleFileDrop" @click="$refs.fileInput.click()"
                    class="border-2 border-dashed border-[#e5e7eb] rounded p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#4C4CDD] transition-colors cursor-pointer group">
                    <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileChange" />
                    <div class="mb-3 p-3 bg-slate-100 rounded-full group-hover:bg-indigo-50 transition-colors"> <svg
                            class="w-8 h-8 text-slate-400 group-hover:text-[#5457CD]" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                            </path>
                        </svg> </div>
                    <p class="text-sm font-medium mb-1"> <span class="text-[#5457CD] font-bold">이곳을 클릭</span>하거나 파일을
                        드래그하여 첨부하세요. </p> <span class="text-xs text-slate-400">(최대 10MB)</span>
                </div>
                <div v-if="formData.files.length > 0" class="mt-4 space-y-2">
                    <div v-for="(file, idx) in formData.files" :key="idx"
                        class="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                        <div class="flex items-center gap-2"> <svg class="w-4 h-4 text-slate-400" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                </path>
                            </svg> <span class="text-slate-700 font-medium">{{ file.name }}</span> <span
                                class="text-xs text-slate-400">({{ (file.size / 1024).toFixed(1) }} KB)</span> </div>
                        <button @click.stop="removeFile(idx)"
                            class="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg> </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>


<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from "@/stores/user";
import { registNotice as registNoticeAPI } from '@/api/notice/notice.js';

const userStore = useUserStore();
const isSystemAdmin = userStore.hasAuthority('AC_SYS');
const router = useRouter();

const formData = reactive({
    category: '',
    title: '',
    content: '',
    files: [],
    isPinned: false,
    pinEndDate: null,
    isEmergency: false,
    emergencyEndAt: null
});

const fileInput = ref(null);

const handleFileChange = (e) => { const newFiles = Array.from(e.target.files); formData.files = [...formData.files, ...newFiles]; e.target.value = ''; };

const handleFileDrop = (e) => { const droppedFiles = Array.from(e.dataTransfer.files); formData.files = [...formData.files, ...droppedFiles]; };

const removeFile = (idx) => { formData.files.splice(idx, 1); };

onMounted(() => {
    if (typeof $ !== 'undefined' && $('#summernote').summernote) {
        $('#summernote').summernote({
            placeholder: '공지 내용을 입력하세요.', tabsize: 2, height: 300, // 에디터 높이 
            toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'picture', 'video']], ['view', ['fullscreen', 'codeview', 'help']]], callbacks: { onChange: function (contents) { formData.content = contents; } }
        });
    } else { console.warn('Summernote library is not loaded.'); }
});

onBeforeUnmount(() => { if (typeof $ !== 'undefined' && $('#summernote').summernote) { $('#summernote').summernote('destroy'); } });

const goBack = () => { router.back(); };

const registerNotice = async () => {
    if (!formData.category.trim()) {
        alert('공지사항 구분을 선택해주세요.');
        return;
    }

    if (!formData.title.trim()) {
        alert('제목을 입력해주세요.');
        return;
    }

    if (typeof $ !== 'undefined') {
        formData.content = $('#summernote').summernote('code');
    }

    if (!formData.content || formData.content === '<p><br></p>') {
        alert('내용을 입력해주세요.');
        return;
    }

    if (formData.isEmergency || formData.emergencyEndAt === null) {
        alert('긴급 종료 일시를 선택해주세요.');
        return;
    }

    const submitData = new FormData();

    let pinnedEndAt = null;

    if (formData.isPinned) {
        pinnedEndAt = formData.pinnedEndAt || null;
    } else if (formData.isEmergency) {
        pinnedEndAt = formData.emergencyEndAt || null;
    }

    const requestDTO = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        pinned: formData.isPinned,
        emergency: formData.isEmergency,
        pinnedEndAt
    };

    submitData.append('requestDTO', new Blob([JSON.stringify(requestDTO)], { type: 'application/json' }));

    formData.files.forEach(file => { submitData.append('files', file); });

    await registNoticeAPI(formData);

    alert('공지사항이 등록되었습니다.');
};
</script>
<style scoped>
/* Summernote 스타일 오버라이드 (필요시) */
:deep(.note-editor) {
    border-color: #e5e7eb;
    border-radius: 0.5rem;
}

:deep(.note-toolbar) {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 0.5rem 0.5rem 0 0;
}
</style>
