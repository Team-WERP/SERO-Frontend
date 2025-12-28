<template>
    <div class="driver-login-page">
        <div class="login-container">
            <div class="login-card">
                <div class="logo-section">
                    <h1 class="logo">SERO</h1>
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

                <div class="footer-links">
                    <a href="#" class="link">비밀번호 찾기</a>
                    <span class="separator">|</span>
                    <a href="#" class="link">기사님 등록 문의</a>
                </div>
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

        console.log('로그인 응답:', response)

        // 로그인 성공 시 토큰 저장
        const { accessToken } = response.data

        if (accessToken) {
            localStorage.setItem('accessToken', accessToken)

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
    max-width: 440px;
}

.login-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-section {
    text-align: center;
    margin-bottom: 32px;
}

.logo {
    font-size: 48px;
    font-weight: 700;
    color: #4C4CDD;
    margin: 0 0 8px 0;
    font-style: italic;
    letter-spacing: 2px;
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
    margin-bottom: 24px;
}

.form-group {
    margin-bottom: 16px;
}

.form-input {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #4C4CDD;
    box-shadow: 0 0 0 3px rgba(76, 76, 221, 0.1);
}

.form-input::placeholder {
    color: #9ca3af;
}

.login-btn {
    width: 100%;
    padding: 16px;
    background: #4C4CDD;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.login-btn:hover:not(:disabled) {
    background: #3d3dbb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 76, 221, 0.3);
}

.login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.footer-links {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.link {
    font-size: 14px;
    color: #6b7280;
    text-decoration: none;
    transition: color 0.2s;
}

.link:hover {
    color: #4C4CDD;
}

.separator {
    color: #d1d5db;
    font-size: 14px;
}

/* 반응형 */
@media (max-width: 480px) {
    .login-card {
        padding: 32px 24px;
    }

    .logo {
        font-size: 40px;
    }

    .subtitle {
        font-size: 18px;
    }
}
</style>
