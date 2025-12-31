<template>
    <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-60">
        <div class="w-96 bg-white rounded shadow-lg p-5">
            <div class="flex flex-row justify-between items-center shrink-0 mb-4">
                <div class="flex flex-row items-center justify-center gap-2">
                    <div class="w-1 h-4 bg-[#4C4CDD]"></div>
                    <h2 class="font-bold">결재선 템플릿 저장</h2>
                </div>

                <button @click="$emit('cancel')" class="text-gray-500 rounded cursor-pointer p-1 hover:shadow-sm">
                    <svg fill="#4C4CDD" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                        <path
                            d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
                    </svg>
                </button>
            </div>

            <div class="mb-3">
                <label class="text-[12px] text-gray-500"><span class="font-bold text-red-500 ml-1">*</span> 템플릿
                    이름</label>
                <input v-model="name" class="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-[13px]"
                    placeholder="템플릿 이름을 입력하세요." maxlength="100" />
            </div>

            <div class="mb-4">
                <div class="flex flex-row justify-between items-center">
                    <label class="text-xs text-gray-500">설명</label>
                    <span class="text-xs text-gray-400">{{ description.length }} / 100자</span>
                </div>

                <textarea v-model="description" rows="4"
                    class="w-full mt-1 border border-gray-300 rounded px-2 py-1 text-[13px]"
                    placeholder="템플릿 설명을 입력하세요." maxlength="100" />
            </div>

            <div class="flex justify-end gap-2">
                <button @click="$emit('cancel')"
                    class="hover:bg-gray-50 hover:shadow-sm px-4 py-1 text-[12px] border border-[#efefef] rounded cursor-pointer">
                    취소
                </button>
                <button @click="confirm"
                    class="hover:bg-[#3b3bcf] hover:shadow-sm px-4 py-1 text-[12px] bg-[#4C4CDD] text-white rounded cursor-pointer">
                    저장
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['confirm', 'cancel']);

const name = ref('');
const description = ref('');

const confirm = () => {
    if (!name.value.trim()) {
        alert('템플릿 이름을 입력해주세요.');
        return;
    }

    emit('confirm', {
        name: name.value,
        description: description.value
    });
};
</script>
