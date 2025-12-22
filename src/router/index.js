// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

// 로그인
import Login from "@/views/auth/Login.vue";

// 고객포털
import ClientDashboard from "@/views/client-portal/ClientDashboard.vue";
import ClientOrderCreate from "@/views/client-portal/ClientOrderCreate.vue";
import ClientOrderList from "@/views/client-portal/ClientOrderList.vue";
import ClientOrderDelivery from "@/views/client-portal/ClientOrderDelivery.vue";
import ClientItemList from "@/views/client-portal/ClientItemList.vue";
import ClientAddress from "@/views/client-portal/ClientAddress.vue";
import ClientCompanyInfo from "@/views/client-portal/ClientCompanyInfo.vue";
import ClientNotices from "@/views/client-portal/ClientNotices.vue";

// 주문
import OrderDashboard from "@/views/order/OrderDashboard.vue";
import OrderManagement from "@/views/order/OrderManagement.vue";
import ClientManagement from "@/views/order/ClientManagement.vue";

// 생산
import ProductionDashboard from "@/views/production/ProductionDashboard.vue";
import ProductionRequestList from "@/views/production/ProductionRequestList.vue";
import ProductionPlanList from "@/views/production/ProductionPlanList.vue";
import WorkOrderList from "@/views/production/WorkOrderList.vue";
import WorkResultInput from "@/views/production/WorkResultInput.vue";
import WorkResultList from "@/views/production/WorkResultList.vue";
import ProcessFlowManagement from "@/views/production/ProcessFlowManagement.vue";

// 재고·물류
import DeliveryOrderList from "@/views/warehouse/DeliveryOrderList.vue";

// 기준정보
import ItemBomManagement from "@/views/master/ItemBomManagement.vue";
import MasterCompanyInfo from "@/views/master/MasterCompanyInfo.vue";
import EmployeeList from "@/views/master/EmployeeList.vue";

// 전자결재
import ApprovalDashboard from "@/views/approval/ApprovalDashboard.vue";
import ApprovalSubmitted from "@/views/approval/ApprovalSubmitted.vue";
import ApprovalReceived from "@/views/approval/ApprovalReceived.vue";

// 공지사항
import NoticeList from "@/views/notices/NoticeList.vue";

// 시스템 관리
import SystemCommonCode from "@/views/system/SystemCommonCode.vue";
import SystemEmployeeManagement from "@/views/system/SystemEmployeeManagement.vue";
import RoleManagement from "@/views/system/RoleManagement.vue";
import StockByWarehouse from "@/views/warehouse/StockByWarehouse.vue";
import DeliveryTracking from "@/views/warehouse/DeliveryTracking.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: "/client-portal/dashboard",
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
                        noPadding: true
                    }
                },

                // ---------------------
                // 고객포털
                // ---------------------
                { path: "/client-portal/dashboard", component: ClientDashboard },
                { path: "/client-portal/order-create", component: ClientOrderCreate },
                { path: "/client-portal/orders", component: ClientOrderList },
                { path: "/client-portal/order-delivery", component: ClientOrderDelivery },
                { path: "/client-portal/items", component: ClientItemList },
                { path: "/client-portal/address", component: ClientAddress },
                { path: "/client-portal/company", component: ClientCompanyInfo },
                { path: "/client-portal/notices", component: ClientNotices },

                // ---------------------
                // 주문
                // ---------------------
                { path: "/order/dashboard", component: OrderDashboard },
                { path: "/order/management", component: OrderManagement },
                { path: "/order/clients", component: ClientManagement },

                // ---------------------
                // 생산
                // ---------------------
                { path: "/production/dashboard", component: ProductionDashboard },
                { path: "/production/requests", component: ProductionRequestList },
                { path: "/production/plans", component: ProductionPlanList },
                { path: "/production/work-orders", component: WorkOrderList },
                { path: "/production/work-results/input", component: WorkResultInput },
                { path: "/production/work-results/management", component: WorkResultList },
                { path: "/production/process-flow", component: ProcessFlowManagement },

                // ---------------------
                // 재고·물류
                // ---------------------
                { path: "/warehouse/stock", component: StockByWarehouse },
                { path: "/warehouse/delivery-orders", component: DeliveryOrderList },
                { path: "/warehouse/tracking", component: DeliveryTracking },

                // ---------------------
                // 기준정보
                // ---------------------
                { path: "/master/bom", component: ItemBomManagement },
                { path: "/master/company", component: MasterCompanyInfo },
                { path: "/master/employees", component: EmployeeList },
                { path: "/master/common-code", component: SystemCommonCode },

                // ---------------------
                // 전자결재
                // ---------------------
                { path: "/approval/dashboard", component: ApprovalDashboard },
                { path: "/approval/submitted", component: ApprovalSubmitted },
                { path: "/approval/received", component: ApprovalReceived },

                // ---------------------
                // 공지사항
                // ---------------------
                { path: "/notices", component: NoticeList },

                // ---------------------
                // 시스템 관리
                // ---------------------
                { path: "/system/common-code", component: SystemCommonCode },
                { path: "/system/employees", component: SystemEmployeeManagement },
                { path: "/system/roles", component: RoleManagement }
            ]
        }
    ]
});

export default router;
