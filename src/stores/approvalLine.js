import { defineStore } from "pinia";

export const useApprovalLineStore = defineStore("approvalLine", {
    state: () => ({
        isOpen: false, // 결재선 모달 열림 여부

        approvalLines: [], // 결재/협조 라인
        referenceLines: [], // 참조 라인
        recipientLines: [], // 수신 라인

        originalSnapshot: null, // 원본 스냅샷 (편집 취소용)

        mode: "CREATE", // CREATE(생성), EDIT(수정)
    }),

    actions: {
        open(mode = "CREATE") {
            this.isOpen = true;
            this.mode = mode;

            this.originalSnapshot = JSON.parse(
                JSON.stringify({
                    approvalLines: this.approvalLines,
                    referenceLines: this.referenceLines,
                    recipientLines: this.recipientLines,
                })
            );
        },
        close() {
            this.isOpen = false;
            this.reset();
        },
        reset() {
            this.approvalLines = [];
            this.referenceLines = [];
            this.recipientLines = [];
            this.mode = "CREATE";
            this.originalSnapshot = null;
        },
    },
    getters: {
        totalLines: (state) => [
            ...state.approvalLines,
            ...state.referenceLines,
            ...state.recipientLines,
        ],
        isDirty: (state) => {
            JSON.stringify(state.originalSnapshot) !==
                JSON.stringify({
                    approvalLines: state.approvalLines,
                    referenceLines: state.referenceLines,
                    recipientLines: state.recipientLines,
                });
        },
    },
});
