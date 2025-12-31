// src/stores/menu.js
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
    state: () => ({
        activeModule: null, // 최초 모듈 설정 (고객포털)

        menus: {
            // 1. 고객포털
            clientPortal: [
                {
                    name: "대시보드",
                    path: "/client-portal/dashboard",
                    role: ["AC_CLI"],
                },
                {
                    name: "주문등록",
                    path: "/client-portal/order-create",
                    role: ["AC_CLI"],
                },
                {
                    name: "주문조회",
                    path: "/client-portal/orders",
                    role: ["AC_CLI"],
                },
                {
                    name: "주문배송조회",
                    path: "/client-portal/order-delivery",
                    role: ["AC_CLI"],
                },
                {
                    name: "거래품목조회",
                    path: "/client-portal/items",
                    role: ["AC_CLI"],
                },
                {
                    name: "배송지관리",
                    path: "/client-portal/address",
                    role: ["AC_CLI"],
                },
                {
                    name: "기업정보관리",
                    path: "/client-portal/company",
                    role: ["AC_CLI"],
                },
                {
                    name: "공지사항",
                    path: "/client-portal/notices",
                    role: ["AC_CLI"],
                },
            ],

            // 2. 주문
            order: [
                {
                    name: "대시보드",
                    path: "/order/dashboard",
                    role: ["AC_SAL", "AC_SYS"],
                },
                {
                    name: "주문관리",
                    path: "/order/management",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "고객사관리",
                    path: "/order/clients",
                    role: ["AC_SAL", "AC_SYS"],
                },
            ],

            // 3. 생산
            production: [
                {
                    name: "대시보드",
                    path: "/production/dashboard",
                    role: ["AC_PRO", "AC_SYS"],
                },
                {
                    name: "생산요청 관리",
                    path: "/production/requests",
                    role: ["AC_SAL", "AC_PRO", "AC_SYS"],
                },
                {
                    name: "생산계획 관리",
                    path: "/production/plans",
                    role: ["AC_PRO", "AC_SYS"],
                },
                {
                    name: "작업지시 관리",
                    path: "/production/work-orders",
                    role: ["AC_PRO", "AC_SYS"],
                },
                {
                    name: "작업지시 실적 등록",
                    path: "/production/work-results/input",
                    role: ["AC_PRO", "AC_SYS"],
                },
                {
                    name: "작업지시 실적 관리",
                    path: "/production/work-results/management",
                    role: ["AC_PRO", "AC_SYS"],
                },
                {
                    name: "공정 흐름 관리",
                    path: "/production/process-flow",
                    role: ["AC_PRO", "AC_SYS"],
                },
            ],

            // 4. 재고·물류
            warehouse: [
                {
                    name: "재고관리(창고별)",
                    path: "/warehouse/stock",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "납품서 관리",
                    path: "/warehouse/delivery-orders",
                    role: ["AC_SAL", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "출고지시 관리",
                    path: "/warehouse/goods-issues",
                    role: ["AC_SAL", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "배송상태 추적",
                    path: "/warehouse/tracking",
                    role: ["AC_SAL", "AC_WHS", "AC_SYS"],
                },
            ],

            // 5. 기준정보
            master: [
                {
                    name: "자재·BOM 관리",
                    path: "/master/bom",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "기업정보관리",
                    path: "/master/company",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "사원정보조회",
                    path: "/master/employees",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "공통코드 관리",
                    path: "/master/common-code",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
            ],

            // 6. 전자결재
            approval: [
                {
                    name: "대시보드",
                    path: "/approval/dashboard",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "기안 문서함",
                    path: "/approval/submitted",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "결재 요청함",
                    path: "/approval/requested",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "결재 문서함",
                    path: "/approval/archived",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "수신 문서함",
                    path: "/approval/received",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
                {
                    name: "참조 문서함",
                    path: "/approval/referenced",
                    role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                },
            ],

            // 7. 공지사항
            notices: [{ name: "공지사항", path: "/notices", role: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] }],

            // 8. 시스템 관리
            system: [
                {
                    name: "공통코드 관리",
                    path: "/system/common-code",
                    role: ["AC_SYS"],
                },
                {
                    name: "사원 정보 관리",
                    path: "/system/employees",
                    role: ["AC_SYS"],
                },
                {
                    name: "사용자 권한 관리",
                    path: "/system/roles",
                    role: ["AC_SYS"],
                },
            ],
        },
    }),

    actions: {
        setActiveModule(moduleKey) {
            this.activeModule = moduleKey;
        },
    },
});
