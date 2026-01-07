<template>
    <div class="min-h-screen">
        <header class="flex justify-between items-center mb-4 rounded">
            <h1 class="text-xl font-bold flex items-center gap-2">
                <span class="w-1.5 h-6 bg-[#4C4CDD] rounded-sm inline-block"></span>
                공지사항 작성
            </h1>
            <div class="flex gap-2">
                <button @click="goBack"
                    class="font-semibold px-3 py-1.5 bg-white border border-slate-300 rounded text-sm hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer">
                    <svg clip-rule="evenodd" class="w-3.5 h-3.5" fill-rule="evenodd" stroke-linejoin="round"
                        stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="m12 10.93 5.719-5.72c.146-.146.339-.219.531-.219.404 0 .75.324.75.749 0 .193-.073.385-.219.532l-5.72 5.719 5.719 5.719c.147.147.22.339.22.531 0 .427-.349.75-.75.75-.192 0-.385-.073-.531-.219l-5.719-5.719-5.719 5.719c-.146.146-.339.219-.531.219-.401 0-.75-.323-.75-.75 0-.192.073-.384.22-.531l5.719-5.719-5.72-5.719c-.146-.147-.219-.339-.219-.532 0-.425.346-.749.75-.749.192 0 .385.073.531.219z" />
                    </svg>
                    취소
                </button>
                <button @click="registerNotice"
                    class="font-semibold px-3 py-1.5 bg-[#4C4CDD] text-white border border-[#4C4CDD] rounded text-sm hover:bg-[#4346a8] transition-colors flex items-center gap-1 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-3.5 h-3.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    저장
                </button>
            </div>
        </header>

        <section class="bg-white border border-[#cbd5e1] rounded">

            <div class="grid grid-cols-12 border-b border-slate-200">
                <div class="col-span-12 md:col-span-2 bg-slate-50 p-3 flex items-center border-r border-slate-200">
                    <label class="text-sm font-bold text-slate-700">구분 <span class="text-red-500">*</span></label>
                </div>
                <div
                    class="col-span-12 md:col-span-4 p-2 flex items-center border-r border-slate-200 md:border-r-0 lg:border-r">
                    <select v-model="formData.category"
                        class="w-full px-2 py-1.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#4C4CDD]">
                        <option value="">선택</option>
                        <option value="NOTICE_INTERNAL">사내 공지</option>
                        <option value="NOTICE_CUSTOMER">고객 공지</option>
                        <option v-if="isSystemAdmin" value="NOTICE_SYSTEM">시스템 공지</option>
                    </select>
                </div>

                <div
                    class="col-span-12 md:col-span-2 bg-slate-50 p-3 flex items-center border-t md:border-t-0 border-r border-slate-200">
                    <label class="text-sm font-bold text-slate-700">제목 <span class="text-red-500">*</span></label>
                </div>
                <div class="col-span-12 md:col-span-4 p-2 flex items-center border-t md:border-t-0">
                    <input v-model="formData.title" type="text"
                        class="w-full px-2 py-1.5 border border-slate-300 rounded-sm text-sm focus:outline-none focus:border-[#4C4CDD]"
                        placeholder="제목을 입력하세요" maxlength="300" />
                </div>
            </div>

            <div class="grid grid-cols-12 border-b border-slate-200">
                <div class="col-span-12 md:col-span-2 bg-slate-50 p-3 flex items-center border-r border-slate-200">
                    <label class="text-sm font-bold text-slate-700">노출 설정</label>
                </div>
                <div class="col-span-12 md:col-span-10 p-2 flex flex-wrap items-center gap-6">

                    <div class="flex items-center">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" v-model="formData.isPinned" :disabled="formData.isEmergency"
                                class="w-4 h-4 rounded border-gray-300 text-[#4C4CDD] focus:ring-[#4C4CDD]">
                            <span class="text-sm text-slate-700">상단 고정</span>
                        </label>

                        <div v-if="formData.isPinned"
                            class="flex items-center gap-2 ml-3 px-2 py-1 bg-slate-100 border border-slate-200 rounded-sm transition-all">
                            <span class="text-xs font-medium text-slate-500">종료일</span>
                            <input type="date" v-model="formData.pinnedEndAt"
                                class="bg-transparent border-none p-0 text-xs text-slate-700 focus:ring-0 cursor-pointer w-[90px]">

                            <span class="text-[11px] text-slate-400 tracking-tight whitespace-nowrap">
                                * 미지정 시 무기한
                            </span>
                        </div>
                    </div>

                    <div class="h-4 w-px bg-slate-300 hidden md:block"></div>
                    <div class="flex items-center">
                        <label class="flex items-center gap-2 cursor-pointer select-none">
                            <input type="checkbox" v-model="formData.isEmergency" :disabled="formData.isPinned"
                                class="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500">
                            <span class="text-sm text-red-600 font-bold">긴급 공지</span>
                        </label>

                        <span class="text-[11px] text-slate-400 ml-1.5 mt-0.5 tracking-tight">(목록 최상단 노출)</span>

                        <div v-if="formData.isEmergency"
                            class="flex items-center gap-2 ml-3 px-2 py-1 bg-red-50 border border-red-100 rounded-sm">
                            <span class="text-xs font-medium text-red-500">종료일</span>
                            <input type="date" v-model="formData.emergencyEndAt"
                                class="bg-transparent border-none p-0 text-xs text-red-700 focus:ring-0 cursor-pointer">
                        </div>
                    </div>

                </div>
            </div>

            <div class="grid grid-cols-12 border-b border-slate-200">
                <div class="col-span-12 md:col-span-2 bg-slate-50 p-3 flex items-start border-r border-slate-200">
                    <label class="text-sm font-bold text-slate-700 mt-1">상세 내용 <span
                            class="text-red-500">*</span></label>
                </div>
                <div class="col-span-12 md:col-span-10 p-4">
                    <div class="max-w-none">
                        <textarea id="summernote" name="editordata"></textarea>
                    </div>
                </div>
            </div>

            <!-- <div class="grid grid-cols-12 border-b border-slate-200">
                <div class="col-span-12 md:col-span-2 bg-slate-50 p-3 flex items-center border-r border-slate-200">
                    <label class="text-sm font-bold text-slate-700">첨부 파일</label>
                </div>
                <div class="col-span-12 md:col-span-10 p-2">
                    <div class="flex items-center gap-2 mb-2">
                        <button @click="$refs.fileInput.click()"
                            class="px-3 py-1 bg-slate-600 text-white text-xs rounded-sm hover:bg-slate-700">
                            파일 찾기
                        </button>
                        <span class="text-xs text-slate-400">드래그 앤 드롭 가능 (최대 10MB)</span>
                        <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileChange" />
                    </div>

                    <div @dragover.prevent @drop.prevent="handleFileDrop"
                        class="border border-dashed border-slate-300 rounded-sm bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors"
                        :class="{ 'bg-indigo-50 border-indigo-300': false }">
                        <div v-if="formData.files.length === 0" class="text-xs text-slate-500">
                            첨부할 파일을 이곳에 끌어다 놓으세요.
                        </div>

                        <ul v-else class="space-y-1 text-left">
                            <li v-for="(file, idx) in formData.files" :key="idx"
                                class="flex justify-between items-center text-sm bg-white border border-slate-200 px-2 py-1 rounded-sm">
                                <span class="flex items-center gap-1 truncate text-slate-700 text-xs">
                                    <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                                        </path>
                                    </svg>
                                    {{ file.name }} <span class="text-slate-400">({{ (file.size / 1024).toFixed(1) }}
                                        KB)</span>
                                </span>
                                <button @click.stop="removeFile(idx)" class="text-slate-400 hover:text-red-500">
                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div> -->

            <div class="grid grid-cols-12 border-b border-slate-200">
                <div class="col-span-12 md:col-span-2 bg-slate-50 p-3 flex items-start border-r border-slate-200">
                    <label class="text-sm font-bold text-slate-700 mt-2">첨부 파일</label>
                </div>

                <div class="col-span-12 md:col-span-10 p-2">
                    <div @dragover.prevent @drop.prevent="handleFileDrop" @click="$refs.fileInput.click()"
                        class="border-2 border-dashed border-[#e5e7eb] rounded p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#4C4CDD] transition-colors cursor-pointer group">

                        <input type="file" ref="fileInput" class="hidden" multiple @change="handleFileChange" />

                        <div class="mb-3 p-3 bg-slate-100 rounded-full group-hover:bg-indigo-50 transition-colors">
                            <svg class="w-8 h-8 text-slate-400 group-hover:text-[#5457CD]" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                </path>
                            </svg>
                        </div>

                        <p class="text-sm font-medium mb-1 text-slate-600">
                            <span class="text-[#5457CD] font-bold">이곳을 클릭</span>하거나 파일을 드래그하여 첨부하세요.
                        </p>
                        <span class="text-xs text-slate-400">(최대 10MB)</span>
                    </div>

                    <div v-if="formData.files.length > 0" class="mt-4 space-y-2">
                        <div v-for="(file, idx) in formData.files" :key="idx"
                            class="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-md text-sm shadow-sm hover:bg-slate-50 transition-colors">

                            <div class="flex items-center gap-2">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                                <span class="text-slate-700 font-medium">{{ file.name }}</span>
                                <span class="text-xs text-slate-400">({{ (file.size / 1024).toFixed(1) }} KB)</span>
                            </div>

                            <button @click.stop="removeFile(idx)"
                                class="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                                    stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { reactive, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from "@/stores/user";
import { registNotice as registNoticeAPI } from '@/api/notice/notice.js';

const userStore = useUserStore();
const isSystemAdmin = userStore.hasAuthority('AC_SYS');
const isClient = userStore.hasAuthority('AC_CLI');
const router = useRouter();

const formData = reactive({
    category: '',
    title: '',
    content: '',
    files: [],
    isPinned: false,
    pinnedEndAt: null,
    isEmergency: false,
    emergencyEndAt: null
});

const handleFileChange = (e) => { const newFiles = Array.from(e.target.files); formData.files = [...formData.files, ...newFiles]; e.target.value = ''; };

const handleFileDrop = (e) => { const droppedFiles = Array.from(e.dataTransfer.files); formData.files = [...formData.files, ...droppedFiles]; };

const removeFile = (idx) => { formData.files.splice(idx, 1); };

onMounted(() => {
    nextTick(() => {
        const $ = window.$;

        if ($ && $.fn.summernote) {
            $('#summernote').summernote({
                placeholder: '공지 내용을 입력하세요.',
                tabsize: 2,
                height: 400, // 에디터 높이 
                toolbar: [
                    // ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    // ['insert', ['link', 'picture', 'video']],
                    ['view', ['fullscreen', 'codeview', 'help']]],
                callbacks: {
                    onChange: function (contents) {
                        formData.content = contents;
                    }
                }
            });
        } else {
            console.warn('Summernote library is not loaded.');
        }
    })
});

onBeforeUnmount(() => {
    const $ = window.$;

    if ($ && $.fn.summernote) {
        $('#summernote').summernote('destroy');
    }
});

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

    if (formData.isEmergency && formData.emergencyEndAt === null) {
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

    const response = await registNoticeAPI(submitData);

    alert('공지사항이 등록되었습니다.');

    if (isClient) {
        router.push(`/client-portal/notices/${response.noticeId}`);
    } else {
        router.push(`/notices/${response.noticeId}`);
    }
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

:deep(.note-editor *) {
    box-sizing: border-box;
}

:deep(.note-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    background-color: #fff;
    border: 1px solid #e2e8f0;
    color: #333;
}

:deep(.note-btn:hover) {
    background-color: #f1f5f9;
}

:deep(.note-btn-group .note-dropdown-menu) {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #e2e8f0;
}

:deep(.note-editor) {
    border-color: #cbd5e1 !important;
    /* slate-300 */
    border-radius: 0.125rem !important;
    /* rounded-sm */
    box-shadow: none !important;
}

:deep(.note-toolbar) {
    background-color: #f8fafc !important;
    /* slate-50 */
    border-bottom: 1px solid #cbd5e1 !important;
}

:deep(.note-editable) {
    line-height: 1.6;
}

:deep(.note-statusbar) {
    border-top: 1px solid #e2e8f0;
    background-color: #f8fafc;
}

:deep(.note-editable ul) {
    list-style-type: disc !important;
    padding-left: 1.5rem;
}

:deep(.note-editable ol) {
    list-style-type: decimal !important;
    padding-left: 1.5rem;
}

:deep(.note-editable li) {
    margin-bottom: 0.25rem;
}

/* paragraph spacing */
:deep(.note-editable p) {
    margin-bottom: 0.75em;
}

/* line break */
:deep(.note-editable br) {
    display: block;
    margin-bottom: 0.5em;
}

/* table safety */
:deep(.note-editable td p) {
    margin: 0;
}

/* inline */
:deep(.note-editable strong) {
    font-weight: 600;
}

:deep(.note-editable u) {
    text-decoration: underline;
}
</style>
