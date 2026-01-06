// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import MainLayout from "@/layouts/MainLayout.vue";

// 로그인
import Login from "@/views/auth/Login.vue";

// 자동 로그아웃
import SessionExpired from "@/views/auth/SessionExpired.vue";

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
import ItemBomDetail from "@/views/master/ItemBomDetail.vue";
import MasterCompanyInfo from "@/views/master/MasterCompanyInfo.vue";
import EmployeeList from "@/views/master/EmployeeList.vue";
import CommonCodeManagement from "@/views/master/CommonCodeManagement.vue";

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
import NoticeCreate from "@/views/notices/NoticeCreate.vue";
import NoticeDetail from "@/views/notices/NoticeDetail.vue";

// 시스템 관리
import SystemCommonCode from "@/views/system/SystemCommonCode.vue";
import SystemEmployeeManagement from "@/views/system/SystemEmployeeManagement.vue";
import SystemCommonCodeManagement from "@/views/system/SystemCommonCodeManagement.vue";
import RoleManagement from "@/views/system/RoleManagement.vue";
import StockByWarehouse from "@/views/warehouse/StockByWarehouse.vue";
import DeliveryTracking from "@/views/warehouse/DeliveryTracking.vue";

// 에러
import Forbidden from "@/views/error/Forbidden.vue";
import NotFound from "@/views/error/NotFound.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // 로그인
        {
            path: "/login",
            component: Login,
            meta: { public: true, hideLayout: true, noPadding: true },
        },
        {
            path: "/driver/login",
            component: DriverLogin,
            meta: { public: true, hideLayout: true, noPadding: true },
        },
        {
            path: "/delivery/login",
            component: DriverLogin,
            meta: { public: true, hideLayout: true, noPadding: true },
        },
        // 존재하지 않는 페이지 접근
        {
            path: "/not-found",
            component: NotFound,
            meta: { public: true },
        },
        {
            path: "/session-expired",
            component: SessionExpired,
            meta: { public: true, hideLayout: true, noPadding: true },
        },
        {
            path: "/",
            component: MainLayout,
            children: [
                {
                    path: "forbidden",
                    component: Forbidden,
                },

                // 고객포털
                {
                    path: "client-portal/dashboard",
                    component: ClientDashboard,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/order-create",
                    component: ClientOrderCreate,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/orders",
                    component: ClientOrderList,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/orders/:orderId",
                    component: ClientOrderDetail,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/order-delivery",
                    component: ClientOrderDelivery,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/items",
                    component: ClientItemList,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/address",
                    component: ClientAddress,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/company",
                    component: ClientCompanyInfo,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/notices",
                    component: ClientNotices,
                    meta: { roles: ["AC_CLI"] },
                },
                {
                    path: "client-portal/notices/:noticeId",
                    component: NoticeDetail,
                    meta: { roles: ["AC_CLI"] },
                },
                // 주문
                {
                    path: "order/dashboard",
                    component: OrderDashboard,
                    meta: { roles: ["AC_SAL", "AC_SYS"] },
                },
                {
                    path: "order/management",
                    component: OrderManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "order/clients",
                    component: ClientManagement,
                    meta: { roles: ["AC_SAL", "AC_SYS"] },
                },
                {
                    path: "order/clients/:clientId",
                    component: () => import("@/views/order/ClientDetail.vue"),
                    meta: { roles: ["AC_SAL", "AC_SYS"] },
                },
                {
                    path: "order/management/:orderId",
                    component: OrderDetail,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },

                // 생산
                {
                    path: "production/dashboard",
                    component: ProductionDashboard,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "production/requests",
                    component: ProductionRequestList,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_SYS"] },
                },
                {
                    path: "production/plans/:id?",
                    component: ProductionPlanList,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "production/work-orders",
                    component: WorkOrderList,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "production/work-results/management",
                    component: WorkResultList,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "production/process-flow",
                    component: ProcessFlowManagement,
                    meta: { roles: ["AC_PRO", "AC_SYS"] },
                },
                {
                    path: "production/requests/drafts/:prId",
                    component: PRDraftDetailView,
                    meta: { roles: ["AC_SAL", "AC_SYS"] },
                },
                {
                    path: "production/requests/:prId",
                    component: PRDetail,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_SYS"] },
                },

                // 재고·물류
                {
                    path: "warehouse/stock",
                    component: StockByWarehouse,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "warehouse/delivery-orders",
                    component: DeliveryOrderList,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "warehouse/goods-issues",
                    component: GoodsIssueList,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "warehouse/goods-issues/create/:doCode",
                    name: "GoodsIssueCreate",
                    component: GoodsIssueCreate,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "warehouse/goods-issues/:id",
                    component: GoodsIssueDetail,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "warehouse/tracking",
                    component: DeliveryTracking,
                    meta: { roles: ["AC_SAL", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "delivery/management",
                    component: DeliveryManagement,
                    meta: {
                        hideLayout: true,
                        noPadding: true,
                        roles: ["AC_WHS", "AC_SYS"],
                    },
                },

                // 기준정보
                // ---------------------
                { path: "/master/bom", component: ItemBomManagement },
                { path: "/master/bom/:id", component: ItemBomDetail },
                { path: "/master/company", component: MasterCompanyInfo },
                { path: "/master/employees", component: EmployeeList },
                {
                    path: "/master/common-code",
                    component: CommonCodeManagement,
                },
                {
                    path: "master/bom",
                    component: ItemBomManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "master/company",
                    component: MasterCompanyInfo,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "master/employees",
                    component: EmployeeList,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "master/common-code",
                    component: CommonCodeManagement,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                // 시스템 관리
                {
                    path: "system/common-code",
                    component: SystemCommonCodeManagement,
                    meta: { roles: ["AC_SYS"] },
                },
                {
                    path: "system/employees",
                    component: SystemEmployeeManagement,
                    meta: { roles: ["AC_SYS"] },
                },
                {
                    path: "system/roles",
                    component: RoleManagement,
                    meta: { roles: ["AC_SYS"] },
                },
                // 전자결재
                {
                    path: "approval/dashboard",
                    component: ApprovalDashboard,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/submitted",
                    component: ApprovalSubmitted,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/requested",
                    component: ApprovalRequested,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/archived",
                    component: ApprovalArchived,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/received",
                    component: ApprovalReceived,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/referenced",
                    component: ApprovalReferenced,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/create",
                    component: ApprovalCreate,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                {
                    path: "approval/:approvalId",
                    component: ApprovalDetail,
                    meta: { roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"] },
                },
                // 공지사항
                {
                    path: "notices",
                    component: NoticeList,
                    meta: {
                        roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                    },
                },
                {
                    path: "notices/create",
                    component: NoticeCreate,
                    meta: {
                        roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                    },
                },
                {
                    path: "notices/:noticeId",
                    component: NoticeDetail,
                    meta: {
                        roles: ["AC_SAL", "AC_PRO", "AC_WHS", "AC_SYS"],
                    },
                },
            ],
        },

        // ---------------------
        // Catch All
        // ---------------------
        {
            path: "/:pathMatch(.*)*",
            component: NotFound,
        },
    ],
});

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const token = localStorage.getItem("accessToken");

    if (to.meta.public) return next();

    if (!token) return next("/login");

    if (!userStore.authorities.length) {
        try {
            userStore.initialize();
        } catch {
            localStorage.removeItem("accessToken");
            return next("/login");
        }
    }

    if (to.path === "/") {
        const roles = userStore.authorities;

        if (roles.includes("AC_CLI")) {
            return next("/client-portal/dashboard");
        }

        if (roles.includes("AC_SAL") || roles.includes("AC_SYS")) {
            return next("/order/dashboard");
        }

        if (roles.includes("AC_PRO") || roles.includes("AC_WHS")) {
            return next("/order/management");
        }

        return next("/forbidden");
    }

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
