<template>
    <div class="driver-login-page">
        <div class="login-container">
            <div class="login-card">
                <p class="logo-subtitle">새로운 길로, 새로</p>
                <div class="logo-section">
                    <img src="@/assets/logo.png" alt="SERO Logo" class="logo-image" />
                </div>
                <div class="header-section">
                    <h2 class="subtitle">SERO 배송 파트너</h2>
                    <p class="description">오늘도 안전한 배송 부탁드립니다!</p>
                </div>

                <form @submit.prevent="handleLogin" class="login-form">
                    <div class="form-group">
                        <input
                            v-model="email"
                            type="email"
                            class="form-input"
                            placeholder="이메일"
                        />
                    </div>

                    <div class="form-group">
                        <input
                            v-model="password"
                            type="password"
                            class="form-input"
                            placeholder="비밀번호"
                        />
                    </div>

                    <button type="submit" class="login-btn" :disabled="loading">
                        {{ loading ? '로그인 중...' : '로그인' }}
                    </button>
                </form>

                <button @click="devLogin" class="dev-login-btn">
                    배송 기사로 로그인
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
    if (!email.value || !password.value) {
        alert('이메일과 비밀번호를 입력해주세요.')
        return
    }

    loading.value = true
    try {
        const response = await login('hq', {
            email: email.value,
            password: password.value
        })

        // 로그인 성공 시 토큰과 이름 저장
        const { accessToken, name } = response.data

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken)
            if (name) {
                localStorage.setItem('name', name)
            }

            // userStore 초기화
            userStore.setFromToken(accessToken)

            // 배송 관리 페이지로 이동
            router.push('/delivery/management')
        } else {
            alert('로그인에 성공했지만 토큰을 받지 못했습니다.')
        }
    } catch (error) {
        console.error('로그인 실패:', error)
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
    } finally {
        loading.value = false
    }
}

// 개발용 빠른 로그인
const devLogin = async () => {
    try {
        loading.value = true
        const response = await login('hq', {
            email: 'driver@werp.com',
            password: 'kang'
        })

        const { accessToken, name } = response.data

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken)
            if (name) {
                localStorage.setItem('name', name)
            }

            userStore.setFromToken(accessToken)
            router.push('/delivery/management')
        } else {
            alert('로그인에 성공했지만 토큰을 받지 못했습니다.')
        }
    } catch (error) {
        console.error('개발용 로그인 실패:', error)
        alert('로그인에 실패했습니다.')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.driver-login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-container {
    width: 100%;
    max-width: 430px;
}

.login-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-subtitle {
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 8px 0;
}

.logo-section {
    text-align: center;
    margin-bottom: 24px;
}

.logo-image {
    width: 160px;
    height: auto;
    margin: 0 auto;
    display: block;
}

.header-section {
    text-align: center;
    margin-bottom: 24px;
}

.subtitle {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
}

.description {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
}

.login-form {
    margin-bottom: 0;
}

.form-group {
    margin-bottom: 12px;
}

.form-input {
    width: 100%;
    padding: 10px 16px;
    border: 1px solid #dcdfea;
    border-radius: 11px;
    font-size: 14px;
    transition: all 0.2s;
    outline: none;
}

.form-input:focus {
    border-color: #4C4CDD;
}

.form-input::placeholder {
    color: #9ca3af;
}

.login-btn {
    width: 100%;
    padding: 10px 16px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;
}

.login-btn:hover:not(:disabled) {
    opacity: 0.95;
}

.login-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.dev-login-btn {
    width: 100%;
    padding: 10px 16px;
    background: #ffffff;
    color: #4C4CDD;
    border: 1px solid #4C4CDD;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 32px;
}

.dev-login-btn:hover {
    background: #f9fafb;
}

/* 반응형 */
@media (max-width: 480px) {
    .login-card {
        padding: 32px 24px;
    }

    .logo-image {
        width: 140px;
    }

    .subtitle {
        font-size: 18px;
    }
}
</style>
