// 1. 탭 메뉴 (statusValue를 포함시켜서 API 호출 시 if문 없애기!)
export const APPROVAL_TABS = [
    { id: "all", label: "전체", statusValue: null },
    { id: "ing", label: "진행중", statusValue: "AS_ING" },
    { id: "appr", label: "승인", statusValue: "AS_APPR" },
    { id: "rjct", label: "반려", statusValue: "AS_RJCT" },
];

// 2. 문서 구분 (코드 -> 한글)
export const DOC_TYPE_LABEL = {
    SO: "주문 요청서",
    PR: "생산 요청서",
    GI: "출고 지시서",
};

// 3. 문서 구분 뱃지 색상
export const DOC_TYPE_BADGE = {
    SO: "badge-blue",
    PR: "badge-green",
    GI: "badge-purple",
};

// 4. 결재 상태 라벨
export const APPROVAL_STATUS_LABEL = {
    AS_ING: "진행중",
    AS_APPR: "승인",
    AS_RJCT: "반려",
    AS_SAVE: "임시저장", // 혹시 몰라 추가
};

// 5. 결재 상태 뱃지 색상
export const APPROVAL_STATUS_BADGE = {
    AS_APPR: "status-active",
    AS_RJCT: "status-reject",
    AS_ING: "status-progress",
    AS_SAVE: "status-inactive",
};

export const EMPLOYEE_RANK = {
    CODE: {
        JR_CEO: "CEO",
        JR_TL: "팀장",
        JR_TM: "팀원",
    },
    LABEL: {
        CEO: "JR_CEO",
        팀장: "JR_TL",
        팀원: "JR_TM",
    },
};

export const EMPLOYEE_POSITION = {
    CODE: {
        JP_CEO: "사장",
        JP_DIR: "이사",
        JP_MGR: "부장",
        JP_SM: "과장",
        JP_AM: "대리",
        JP_STF: "사원",
    },
    LABEL: {
        사장: "JP_CEO",
        이사: "JP_DIR",
        부장: "JP_MGR",
        과장: "JP_SM",
        대리: "JP_AM",
        사원: "JP_STF",
    },
};

export const APPROVAL_TYPE = {
    CODE: {
        AT_APPR: "결재",
        AT_RVW: "협조",
        AT_REF: "참조",
        AT_RCPT: "수신",
    },
    LABEL: {
        결재: "AT_APPR",
        협조: "AT_RVW",
        참조: "AT_REF",
        수신: "AT_RCPT",
    },
};
