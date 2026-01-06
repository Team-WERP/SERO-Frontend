<template>
    <div class="bg-white flex h-screen w-full items-center justify-center">
        <div class="w-[430px] rounded-2xl px-10 py-10">

            <p class="mb-1 text-center text-[13px] text-gray-500">
                새로운 길로, 새로
            </p>
            <div class="mb-6 flex justify-center">
                <img :src="logo" class="w-40" alt="SERO Logo" />
            </div>

            <div class="relative mb-6 flex h-[40px] rounded-xl bg-[#f1f3f9] p-1">
                <div class="absolute left-1 top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-[#4C4CDD] transition-all duration-300"
                    :class="employeeType === 'client' ? 'translate-x-full' : ''" />

                <button class="z-10 flex-1 text-sm font-semibold cursor-pointer"
                    :class="employeeType === 'hq' ? 'text-white' : 'text-gray-500'" @click="employeeType = 'hq'">
                    본사
                </button>

                <button class="z-10 flex-1 text-sm font-semibold cursor-pointer"
                    :class="employeeType === 'client' ? 'text-white' : 'text-gray-500'"
                    @click="employeeType = 'client'">
                    고객사
                </button>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="mb-1.5">
                    <input ref="emailRef" v-model="email" type="text" placeholder="이메일"
                        :class="inputClass(errors.email)" @input="errors.email = ''" />
                    <p class="min-h-[12px] text-[11px] text-red-500">
                        {{ errors.email }}
                    </p>
                </div>

                <div>
                    <input ref="passwordRef" v-model="password" type="password" placeholder="비밀번호"
                        :class="inputClass(errors.password)" @input="errors.password = ''" />
                    <p class="min-h-[12px] text-[11px] text-red-500">
                        {{ errors.password }}
                    </p>
                </div>

                <p class="mt-1 mb-1 min-h-[12px] text-[11px] text-red-500">
                    {{ errors.common }}
                </p>

                <button type="submit" :disabled="isLoggingIn"
                    class="h-10 w-full rounded-xl bg-[#4C4CDD] text-[14px] font-semibold text-white hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                    {{ isLoggingIn ? '로그인 중…' : '로그인' }}
                </button>
            </form>

            <button @click="devLogin('sys')"
                class="mt-8 h-10 w-full rounded-xl text-[14px] border border-[#4C4CDD] font-semibold text-[#4C4CDD] hover:opacity-95 transition cursor-pointer">
                본사 직원(시스템 관리자)로 로그인
            </button>

            <button @click="devLogin('sal')"
                class="mt-4 h-10 w-full rounded-xl text-[14px] border border-[#4C4CDD] font-semibold text-[#4C4CDD] hover:opacity-95 transition cursor-pointer">
                본사 직원(영업팀)로 로그인
            </button>

            <button @click="devLogin('pro')"
                class="mt-4 h-10 w-full rounded-xl text-[14px] border border-[#4C4CDD] font-semibold text-[#4C4CDD] hover:opacity-95 transition cursor-pointer">
                본사 직원(생산팀)로 로그인
            </button>

            <button @click="devLogin('whs')"
                class="mt-4 h-10 w-full rounded-xl text-[14px] border border-[#4C4CDD] font-semibold text-[#4C4CDD] hover:opacity-95 transition cursor-pointer">
                본사 직원(물류팀)로 로그인
            </button>

            <button @click="devLogin('cli')"
                class="mt-4 h-10 w-full rounded-xl  text-[14px] border border-[#4C4CDD] text-[#4C4CDD] font-semibold hover:opacity-95 transition cursor-pointer">
                고객사 직원으로 로그인
            </button>

            <div class="mt-4 text-center text-[11px] text-gray-400">
                <p>© 2026 WERP</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { login } from '@/api/auth';
import router from '@/router';
import logo from '@/assets/logo.png';
import { useUserStore } from '@/stores/user'

const email = ref('');
const password = ref('');
const employeeType = ref('hq');
const isLoggingIn = ref(false);

const emailRef = ref(null);
const passwordRef = ref(null);

const firstRouteByRole = {
    AC_SYS: '/order/dashboard',
    AC_CLI: '/client-portal/dashboard',
    AC_SAL: '/order/dashboard',
    AC_PRO: '/order/management',
    AC_WHS: '/order/management',
};

const errors = reactive({
    email: '',
    password: '',
    common: ''
});

const redirectByRole = (router, roles) => {
    const target =
        roles.find(role => firstRouteByRole[role]);

    router.replace(
        target ? firstRouteByRole[target] : '/'
    );
};

const inputClass = (hasError) => [
    'w-full h-10 rounded-[11px] border px-4 text-sm outline-none transition-all',
    hasError
        ? 'border-red-400 focus:border-red-500 animate-shake'
        : 'border-[#dcdfea] focus:border-[#4C4CDD]'
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handleLogin = async () => {
    errors.email = '';
    errors.password = '';
    errors.common = '';

    if (!email.value) {
        errors.email = '이메일을 입력해 주세요.';
        await focusField(emailRef);
        return;
    }

    if (!emailRegex.test(email.value)) {
        errors.email = '이메일 형식이 올바르지 않습니다.';
        await focusField(emailRef);
        return;
    }

    if (!password.value) {
        errors.password = '비밀번호를 입력해 주세요.';
        await focusField(passwordRef);
        return;
    }

    isLoggingIn.value = true;

    try {
        const res = await login(employeeType.value, {
            email: email.value,
            password: password.value
        });

        afterLogin(res);
    } catch (e) {
        if (e.response?.status === 401) {
            errors.common =
                '아이디 또는 비밀번호가 올바르지 않습니다. 입력하신 정보를 다시 확인해 주세요.';
            shakeAll();
            await focusField(emailRef);
        }
    } finally {
        isLoggingIn.value = false;
    }
};

const focusField = async (refEl) => {
    await nextTick();
    refEl?.value?.focus();
}

const shakeAll = () => {
    emailRef.value?.classList.add('animate-shake');
    passwordRef.value?.classList.add('animate-shake');

    setTimeout(() => {
        emailRef.value?.classList.remove('animate-shake');
        passwordRef.value?.classList.remove('animate-shake');
    }, 300);
}

const devLogin = async (role) => {
    try {
        const accountConfigByRole = {
            sys: {
                type: 'hq',
                email: 'admin@werp.com',
                password: 'kang',
            },
            sal: {
                type: 'hq',
                email: 'jihyepark@werp.com',
                password: 'kang',
            },
            pro: {
                type: 'hq',
                email: 'jaehyun.choi@werp.com',
                password: 'kang',
            },
            whs: {
                type: 'hq',
                email: 'zxc@werp.com',
                password: 'kang',
            },
            cli: {
                type: 'client',
                email: 'procurement01@hanwha.com',
                password: 'kang',
            },
        };

        const config = accountConfigByRole[role];

        if (!config) {
            throw new Error(`지원하지 않는 role: ${role}`);
        }

        const { type, email, password } = config;

        const res = await login(type, { email, password });

        afterLogin(res);
    } catch (e) {
        console.error('개발용 로그인 실패', e);
    }
};

const afterLogin = (res) => {
    const { accessToken, name } = res.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('name', name);

    const userStore = useUserStore();
    userStore.setFromToken(accessToken);

    redirectByRole(router, userStore.authorities);
};
</script>

<style scoped>
@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-3px);
    }

    50% {
        transform: translateX(3px);
    }

    75% {
        transform: translateX(-3px);
    }

    100% {
        transform: translateX(0);
    }
}

.animate-shake {
    animation: shake 0.25s ease-in-out;
}
</style>