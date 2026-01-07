<template>
    <div class="operator-login-page">
        <div class="login-container">
            <div class="login-card">
                <div class="logo-section">
                    <div class="factory-icon">🏭</div>
                    <h2 class="subtitle">SERO 생산 실행 시스템</h2>
                    <p class="description">
                        함께해서 든든합니다! <br />
                        오늘도 <strong>안전한 작업</strong> 되시길 바랍니다.
                    </p>
                </div>

                <form @submit.prevent="handleLogin" class="login-form">
                    <div class="form-group">
                        <label>사원 번호 (이메일 계정)</label>
                        <input v-model="email" type="email" class="form-input" placeholder="example@sero.com"
                            required />
                    </div>

                    <div class="form-group">
                        <label>비밀번호</label>
                        <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
                    </div>

                    <button type="submit" class="login-btn" :disabled="loading">
                        <span v-if="loading">인증 정보를 확인하고 있습니다...</span>
                        <span v-else>안전하게 작업 시작하기</span>
                    </button>
                </form>

                <div class="footer-info">
                    <p>로그인 문제가 발생하면 관리자에게 문의하세요.</p>
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
    // 유효성 검사
    if (!email.value || !password.value) {
        alert('사원 번호와 비밀번호를 모두 입력해 주세요.')
        return
    }

    loading.value = true
    try {
        const response = await login('hq', {
            email: email.value,
            password: password.value
        })

        const { accessToken } = response.data

        if (accessToken) {
            // 1. 토큰 저장
            localStorage.setItem('accessToken', accessToken)

            // 2. 스토어 사용자 정보 갱신
            userStore.setFromToken(accessToken)

            // 3. 작업 실행 페이지로 이동
            router.push('/work/execution')
        } else {
            alert('인증에 성공했으나 권한 정보를 찾을 수 없습니다. 관리자에게 문의하세요.')
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
.operator-login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.login-container {
    width: 100%;
    max-width: 460px;
}

.login-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 48px 40px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.factory-icon {
    font-size: 48px;
    margin-bottom: 16px;
    text-align: center;
}

.logo-section {
    text-align: center;
    margin-bottom: 40px;
}

.subtitle {
    font-size: 24px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 12px;
}

.description {
    color: #64748b;
    font-size: 15px;
    line-height: 1.6;
}

.description strong {
    color: #4C4CDD;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
    margin-left: 4px;
}

.form-input {
    width: 100%;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.form-input:focus {
    outline: none;
    border-color: #4C4CDD;
    box-shadow: 0 0 0 4px rgba(76, 76, 221, 0.1);
}

.login-btn {
    width: 100%;
    padding: 18px;
    background: #4C4CDD;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 17px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.2s;
}

.login-btn:hover:not(:disabled) {
    background: #3d3dbb;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 76, 221, 0.2);
}

.login-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
}

.footer-info {
    text-align: center;
    margin-top: 32px;
    color: #94a3b8;
    font-size: 14px;
    line-height: 1.5;
}

.support-link {
    color: #4C4CDD;
    text-decoration: underline;
    font-weight: 600;
    display: inline-block;
    margin-top: 4px;
}

/* 모바일 대응 */
@media (max-width: 480px) {
    .login-card {
        padding: 32px 20px;
    }

    .subtitle {
        font-size: 20px;
    }
}
</style>