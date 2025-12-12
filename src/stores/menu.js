// src/stores/menu.js
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
    state: () => ({
        activeModule: "clientPortal", // 최초 모듈 설정 (고객포털)

        menus: {
            // 1. 고객포털
            clientPortal: [
                { name: "대시보드", path: "/client-portal/dashboard" },
                { name: "주문등록", path: "/client-portal/order-create" },
                { name: "주문조회", path: "/client-portal/orders" },
                { name: "주문배송조회", path: "/client-portal/order-delivery" },
                { name: "거래품목조회", path: "/client-portal/items" },
                { name: "배송지관리", path: "/client-portal/address" },
                { name: "기업정보관리", path: "/client-portal/company" },
                { name: "공지사항", path: "/client-portal/notices" }
            ],

            // 2. 주문
            order: [
                { name: "대시보드", path: "/order/dashboard" },
                { name: "주문관리", path: "/order/management" },
                { name: "고객사관리", path: "/order/clients" }
            ],

            // 3. 생산
            production: [
                { name: "대시보드", path: "/production/dashboard" },
                { name: "생산요청 관리", path: "/production/requests" },
                { name: "생산계획 관리", path: "/production/plans" },
                { name: "작업지시 관리", path: "/production/work-orders" },
                { name: "작업지시 실적 등록", path: "/production/work-results/input" },
                { name: "작업지시 실적 관리", path: "/production/work-results/management" },
                { name: "공정 흐름 관리", path: "/production/process-flow" }
            ],

            // 4. 재고·물류
            warehouse: [
                { name: "재고관리(창고별)", path: "/warehouse/stock" },
                { name: "출고지시 관리", path: "/warehouse/delivery-orders" },
                { name: "배송상태 추적", path: "/warehouse/tracking" }
            ],

            // 5. 기준정보
            master: [
                { name: "자재·BOM 관리", path: "/master/bom" },
                { name: "기업정보관리", path: "/master/company" },
                { name: "사원정보조회", path: "/master/employees" },
                { name: "공통코드 관리", path: "/master/common-code" }
            ],

            // 6. 전자결재
            approval: [
                { name: "대시보드", path: "/approval/dashboard" },
                { name: "결재 상신함", path: "/approval/submitted" },
                { name: "결재 수신함", path: "/approval/received" }
            ],

            // 7. 공지사항
            notices: [
                { name: "공지사항", path: "/notices" }
            ],

            // 8. 시스템 관리
            system: [
                { name: "공통코드 관리", path: "/system/common-code" },
                { name: "사원 정보 관리", path: "/system/employees" },
                { name: "사용자 권한 관리", path: "/system/roles" }
            ]
        }
    }),

    actions: {
        setActiveModule(moduleKey) {
            this.activeModule = moduleKey;
        }
    }
});
