// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import MainLayout from "@/layouts/MainLayout.vue";

// 로그인
import Login from "@/views/auth/Login.vue";

// 고객포털
import ClientDashboard from "@/views/client-portal/ClientDashboard.vue";
import ClientOrderCreate from "@/views/client-portal/ClientOrderCreate.vue";
import ClientOrderList from "@/views/client-portal/ClientOrderList.vue";
import ClientOrderDetail from "@/views/client-portal/ClientOrderDetail.vue";
import ClientOrderDelivery from "@/views/client-portal/ClientOrderDelivery.vue";
import ClientItemList from "@/views/client-portal/ClientItemList.vue";
import ClientAddress from "@/views/client-portal/ClientAddress.vue";
import ClientCompanyInfo from "@/views/client-portal/ClientCompanyInfo.vue";
import ClientNotices from "@/views/client-portal/ClientNotices.vue";

// 주문
import OrderDashboard from "@/views/order/OrderDashboard.vue";
import OrderManagement from "@/views/order/OrderManagement.vue";
import ClientManagement from "@/views/order/ClientManagement.vue";
import OrderDetail from "@/views/order/OrderDetail.vue";

// 생산
import ProductionDashboard from "@/views/production/ProductionDashboard.vue";
import ProductionRequestList from "@/views/production/ProductionRequestList.vue";
import ProductionPlanList from "@/views/production/ProductionPlanList.vue";
import WorkOrderList from "@/views/production/WorkOrderList.vue";
import WorkResultInput from "@/views/production/WorkResultInput.vue";
import WorkResultList from "@/views/production/WorkResultList.vue";
import ProcessFlowManagement from "@/views/production/ProcessFlowManagement.vue";
import PRDraftDetailView from "@/views/production/PRDraftDetailView.vue";
import PRDetail from "@/views/production/PRDetail.vue";

// 재고·물류
import DeliveryOrderList from "@/views/warehouse/DeliveryOrderList.vue";
import DeliveryManagement from "@/views/delivery/DeliveryManagement.vue";
import DriverLogin from "@/views/delivery/DriverLogin.vue";
import GoodsIssueList from "@/views/warehouse/GoodsIssueList.vue";
import GoodsIssueCreate from "@/views/warehouse/GoodsIssueCreate.vue";
import GoodsIssueDetail from "@/views/warehouse/GoodsIssueDetail.vue";

// 기준정보
import ItemBomManagement from "@/views/master/ItemBomManagement.vue";
import MasterCompanyInfo from "@/views/master/MasterCompanyInfo.vue";
import EmployeeList from "@/views/master/EmployeeList.vue";

// 전자결재
import ApprovalDashboard from "@/views/approval/ApprovalDashboard.vue";
import ApprovalSubmitted from "@/views/approval/ApprovalSubmitted.vue";
import ApprovalReceived from "@/views/approval/ApprovalReceived.vue";
import ApprovalRequested from "@/views/approval/ApprovalRequested.vue";
import ApprovalArchived from "@/views/approval/ApprovalArchived.vue";
import ApprovalReferenced from "@/views/approval/ApprovalReferenced.vue";
import ApprovalCreate from "@/views/approval/ApprovalCreate.vue";
import ApprovalDetail from "@/views/approval/ApprovalDetail.vue";

// 공지사항
import NoticeList from "@/views/notices/NoticeList.vue";

// 시스템 관리
import SystemCommonCode from "@/views/system/SystemCommonCode.vue";
import SystemEmployeeManagement from "@/views/system/SystemEmployeeManagement.vue";
import RoleManagement from "@/views/system/RoleManagement.vue";
import StockByWarehouse from "@/views/warehouse/StockByWarehouse.vue";
import DeliveryTracking from "@/views/warehouse/DeliveryTracking.vue";

// 에러
import Forbidden from "@/views/error/Forbidden.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: () => {
                const userStore = useUserStore();

                if (userStore.authorities.includes("AC_CLI")) {
                    return "/client-portal/dashboard";
                }
                if (userStore.authorities.includes("AC_SYS")) {
                    return "/client-portal/dashboard";
                }
                if (userStore.authorities.includes("AC_SAL")) {
                    return "/order/dashboard";
                }
                if (userStore.authorities.includes("AC_PRO")) {
                    return "/order/management";
                }
                if (userStore.authorities.includes("AC_WHS")) {
                    return "/order/management";
                }

                return "/forbidden";
            },
            component: MainLayout,
            children: [
                // ---------------------
                // 로그인
                // ---------------------
                {
                    path: "/login",
                    component: Login,
                    meta: {
                        hideLayout: true,
                        noPadding: true,
                        public: true,
                    },
                },
                {
                    path: "/driver/login",
                    component: DriverLogin,
                    meta: {
                        hideLayout: true,
                        noPadding: true,
                        public: true,
                    },
                },
                {
                    path: "/delivery/login",
                    component: DriverLogin,
                    meta: {
                        hideLayout: true,
                        noPadding: true,
                        public: true,
                    },
                },

                // ---------------------
                // 고객포털
                // ---------------------
                {
                    path: "/client-portal/dashboard",
                    component: ClientDashboard,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                {
                    path: "/client-portal/order-create",
                    component: ClientOrderCreate,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                { path: "/client-portal/orders", component: ClientOrderList },
                {
                    path: "/client-portal/orders/:orderId",
                    component: ClientOrderDetail,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                {
                    path: "/client-portal/order-delivery",
                    component: ClientOrderDelivery,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                {
                    path: "/client-portal/items",
                    component: ClientItemList,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                {
                    path: "/client-portal/address",
                    component: ClientAddress,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                {
                    path: "/client-portal/company",
                    component: ClientCompanyInfo,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },
                {
                    path: "/client-portal/notices",
                    component: ClientNotices,
                    meta: { roles: ["AC_CLI", "AC_SYS"] },
                },

                // ---------------------
                // 주문
                // ---------------------
                {
                    path: "/order/dashboard",
                    component: OrderDashboard,
                    meta: { roles: ["AC_SAL", "AC_SYS"] },
                },
                {
                    path: "/order/management",
                    component: OrderManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/order/clients",
                    component: ClientManagement,
                    meta: { roles: ["AC_SAL", "AC_SYS"] },
                },
                {
                    path: "/order/management/:orderId",
                    component: OrderDetail,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] }, // TODO 주문 상세 조회 권한 체킹 필요
                },

                // ---------------------
                // 생산
                // ---------------------
                {
                    path: "/production/dashboard",
                    component: ProductionDashboard,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/requests",
                    component: ProductionRequestList,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/plans",
                    component: ProductionPlanList,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/work-orders",
                    component: WorkOrderList,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/work-results/input",
                    component: WorkResultInput,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/work-results/management",
                    component: WorkResultList,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/process-flow",
                    component: ProcessFlowManagement,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "/production/requests/drafts/:prId",
                    component: PRDraftDetailView,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_SYS"] }, // TODO 권한 체킹 필요
                },
                {
                    path: "/production/requests/:prId",
                    component: PRDetail,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_SYS"] }, // TODO 권한 체킹 필요
                },

                // ---------------------
                // 재고·물류
                // ---------------------
                {
                    path: "/warehouse/stock",
                    component: StockByWarehouse,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/warehouse/delivery-orders",
                    component: DeliveryOrderList,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/warehouse/goods-issues",
                    component: GoodsIssueList,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/warehouse/goods-issues/create/:doCode",
                    name: "GoodsIssueCreate",
                    component: GoodsIssueCreate,
                    meta: { roles: ["AC_WHS", "AC_SYS"] }, // TODO 권한 체킹 필요
                },
                {
                    path: "/warehouse/goods-issues/:giCode",
                    name: "GoodsIssueDetail",
                    component: GoodsIssueDetail,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] }, // TODO 권한 체킹 필요
                },
                {
                    path: "/warehouse/tracking",
                    component: DeliveryTracking,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/delivery/management",
                    component: DeliveryManagement,
                    meta: {
                        hideLayout: true,
                        noPadding: true,
                        roles: ["AC_WHS", "AC_SYS"],
                    },
                },

                // ---------------------
                // 기준정보
                // ---------------------
                {
                    path: "/master/bom",
                    component: ItemBomManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/master/company",
                    component: MasterCompanyInfo,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/master/employees",
                    component: EmployeeList,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/master/common-code",
                    component: SystemCommonCode,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },

                // ---------------------
                // 전자결재
                // ---------------------
                {
                    path: "/approval/dashboard",
                    component: ApprovalDashboard,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/submitted",
                    component: ApprovalSubmitted,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/requested",
                    component: ApprovalRequested,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/archived",
                    component: ApprovalArchived,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/received",
                    component: ApprovalReceived,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/referenced",
                    component: ApprovalReferenced,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/create",
                    component: ApprovalCreate,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/approval/:approvalId",
                    component: ApprovalDetail,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },

                // ---------------------
                // 공지사항
                // ---------------------
                {
                    path: "/notices",
                    component: NoticeList,
                    meta: {
                        roles: [
                            "AC_CLI",
                            "AC_SAL",
                            "AC_PRO",
                            "AC_WHS",
                            "AC_SYS",
                        ],
                    },
                },

                // ---------------------
                // 시스템 관리
                // ---------------------
                {
                    path: "/system/common-code",
                    component: SystemCommonCode,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/system/employees",
                    component: SystemEmployeeManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "/system/roles",
                    component: RoleManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                // ---------------------
                // 에러
                // ---------------------
                {
                    path: "/forbidden",
                    component: Forbidden,
                    meta: {
                        roles: [
                            "AC_CLI",
                            "AC_SAL",
                            "AC_PRO",
                            "AC_WHS",
                            "AC_SYS",
                        ],
                    },
                },
            ],
        },
    ],
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const token = localStorage.getItem("accessToken");

    // 로그인 안 한 경우
    if (!token && !to.meta.public) {
        return next("/login");
    }

    if (to.path === "/forbidden") {
        return next();
    }

    // 권한 체크
    if (to.meta.roles) {
        const hasRole = to.meta.roles.some((role) =>
            userStore.authorities.includes(role)
        );

        if (!hasRole) {
            return next("/forbidden");
        }
    }

    next();
});

export default router;
