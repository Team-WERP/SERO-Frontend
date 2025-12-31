export const getDefaultPathByModule = (moduleKey, roles) => {
    // 고객포털
    if (moduleKey === 'clientPortal') {
        if (roles.includes('AC_CLI')) {
            return '/client-portal/dashboard';
        }
    }

    // 주문
    if (moduleKey === 'order') {
        if (roles.includes('AC_SAL') || roles.includes('AC_SYS')) {
            return '/order/dashboard';
        }
        if (roles.includes('AC_PRO') || roles.includes('AC_WHS')) {
            return '/order/management';
        }
        return null;
    }

    const map = {
        production: '/production/dashboard',
        warehouse: '/warehouse/stock',
        master: '/master/bom',
        approval: '/approval/dashboard',
        notices: '/notices',
        system: '/system/common-code',
    };

    return map[moduleKey] || null;
};

// 해당 모듈에서 접근 가능한 첫 서브메뉴
export const getFirstAccessibleMenuPath = (menus = [], roles = []) => {
    const menu = menus.find(menu =>
        !menu.role || menu.role.some(r => roles.includes(r))
    );

    return menu?.path || null;
};