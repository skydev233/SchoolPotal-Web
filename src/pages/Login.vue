<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)
const step = ref(1)
const email = ref('')
const code = ref('')
const username = ref('')
const password = ref('')
const agreeTerms = ref(false)
const error = ref('')
const loading = ref(false)
const countdown = ref(0)
const needVerify = ref(true)
const passwordError = ref('')
const showTermsModal = ref(false)

const checkEmailVerification = async () => {
  try {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    needVerify.value = data.email_verification === 'true'
  } catch (e) {
    needVerify.value = true
  }
}

const validateEmail = (emailStr) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(emailStr)
}

const validatePassword = (pwd) => {
  if (pwd.length < 8) {
    return '密码至少8个字符'
  }
  if (!/[a-z]/.test(pwd)) {
    return '密码必须包含小写字母'
  }
  if (!/[A-Z]/.test(pwd)) {
    return '密码必须包含大写字母'
  }
  if (!/[0-9]/.test(pwd)) {
    return '密码必须包含数字'
  }
  return ''
}

const validateUsername = (name) => {
  if (name.length < 2) {
    return '用户名至少2个字符'
  }
  if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(name)) {
    return '用户名只能包含字母、数字、下划线和中文'
  }
  return ''
}

const onPasswordInput = () => {
  passwordError.value = validatePassword(password.value)
}

const openTerms = () => {
  showTermsModal.value = true
}

const closeTerms = () => {
  showTermsModal.value = false
}

const agreeAndClose = () => {
  agreeTerms.value = true
  showTermsModal.value = false
}

const sendCode = async () => {
  if (!email.value) {
    error.value = '请输入邮箱'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = '请输入有效的邮箱地址'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })

    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || '发送失败'
    } else {
      step.value = 2
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) clearInterval(timer)
      }, 1000)
    }
  } catch (e) {
    error.value = '网络错误'
  } finally {
    loading.value = false
  }
}

const verifyCode = async () => {
  if (!code.value) {
    error.value = '请输入验证码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, code: code.value }),
    })

    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || '验证失败'
    } else {
      step.value = 3
    }
  } catch (e) {
    error.value = '网络错误'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const usernameError = validateUsername(username.value)
  if (usernameError) {
    error.value = usernameError
    return
  }

  passwordError.value = validatePassword(password.value)
  if (passwordError.value) {
    error.value = passwordError.value
    return
  }

  if (!agreeTerms.value) {
    error.value = '请先阅读并同意用户协议'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        username: username.value,
        password: password.value,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || '注册失败'
    } else {
      isLogin.value = true
      step.value = 1
      alert('注册成功，请登录')
      email.value = ''
      code.value = ''
      username.value = ''
      password.value = ''
      agreeTerms.value = false
    }
  } catch (e) {
    error.value = '网络错误'
  } finally {
    loading.value = false
  }
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }

  if (!validateEmail(email.value)) {
    error.value = '请输入有效的邮箱地址'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email.value,
        password: password.value,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || '登录失败'
    } else {
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      localStorage.setItem('role', data.role)
      router.push('/admin')
    }
  } catch (e) {
    error.value = '网络错误'
  } finally {
    loading.value = false
  }
}

const goHome = () => {
  router.push('/')
}

const backToLogin = () => {
  isLogin.value = true
  step.value = 1
  error.value = ''
  agreeTerms.value = false
}

onMounted(checkEmailVerification)
</script>

<template>
  <div class="login-page">
    <div class="login-card glass">
      <button class="back-btn" type="button" @click="goHome">
        ← 返回首页
      </button>

      <div class="login-header">
        <h1>{{ isLogin ? '登录' : '注册' }}</h1>
        <p class="subtitle">
          {{ isLogin ? '欢迎回来' : '创建新账号' }}
          <span v-if="!isLogin && !needVerify" class="hint-badge">免邮箱验证</span>
        </p>
      </div>

      <div v-if="error" class="error-alert">{{ error }}</div>

      <form class="login-form" @submit.prevent>
        <template v-if="isLogin">
          <div class="form-group">
            <label for="login-email">邮箱</label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              placeholder="请输入注册邮箱"
              autocomplete="email"
            />
          </div>
          <div class="form-group">
            <label for="login-password">密码</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              placeholder="请输入密码"
              autocomplete="current-password"
            />
          </div>
          <button class="btn btn-filled submit-btn" type="button" @click="handleLogin" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </template>

        <template v-else>
          <template v-if="step === 1">
            <div class="form-group">
              <label for="reg-email">邮箱地址</label>
              <input
                id="reg-email"
                v-model="email"
                type="email"
                placeholder="请输入邮箱地址"
                autocomplete="email"
              />
            </div>
            <p class="validation-hint">
              请输入有效的学校邮箱地址
            </p>
            <button
              v-if="needVerify"
              class="btn btn-tonal submit-btn"
              type="button"
              @click="sendCode"
              :disabled="loading || countdown > 0"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '发送验证码' }}
            </button>
            <button
              v-else
              class="btn btn-tonal submit-btn"
              type="button"
              @click="step = 3"
              :disabled="loading"
            >
              继续
            </button>
          </template>

          <template v-else-if="step === 2">
            <p class="step-hint">验证码已发送至 <strong>{{ email }}</strong></p>
            <div class="form-group">
              <label for="verify-code">验证码</label>
              <input
                id="verify-code"
                v-model="code"
                type="text"
                placeholder="请输入6位验证码"
                maxlength="6"
              />
            </div>
            <button class="btn btn-tonal submit-btn" type="button" @click="verifyCode" :disabled="loading">
              {{ loading ? '验证中...' : '验证' }}
            </button>
            <button class="btn btn-outlined btn-sm back-btn-inline" type="button" @click="step = 1">
              重新输入邮箱
            </button>
          </template>

          <template v-else-if="step === 3">
            <div class="form-group">
              <label for="reg-email-display">邮箱</label>
              <input
                id="reg-email-display"
                :value="email"
                type="email"
                disabled
              />
            </div>
            <div class="form-group">
              <label for="reg-username">用户名</label>
              <input
                id="reg-username"
                v-model="username"
                type="text"
                placeholder="设置用户名（2个字符以上）"
              />
            </div>
            <div class="form-group">
              <label for="reg-password">密码</label>
              <input
                id="reg-password"
                v-model="password"
                type="password"
                placeholder="设置密码"
                @input="onPasswordInput"
              />
              <div class="password-requirements">
                <p :class="{ valid: password.length >= 8 }">✓ 至少8个字符</p>
                <p :class="{ valid: /[a-z]/.test(password) }">✓ 包含小写字母</p>
                <p :class="{ valid: /[A-Z]/.test(password) }">✓ 包含大写字母</p>
                <p :class="{ valid: /[0-9]/.test(password) }">✓ 包含数字</p>
              </div>
            </div>
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agreeTerms" />
                <span>我已阅读并同意 <span class="terms-link" @click.prevent="openTerms">《用户协议》</span></span>
              </label>
            </div>
            <button class="btn btn-filled submit-btn" type="button" @click="handleRegister" :disabled="loading">
              {{ loading ? '注册中...' : '完成注册' }}
            </button>
            <button class="btn btn-outlined btn-sm back-btn-inline" type="button" @click="backToLogin">
              已有账号？去登录
            </button>
          </template>
        </template>
      </form>

      <div class="login-footer">
        <p v-if="isLogin">
          还没有账号？
          <a class="text-link" href="#" @click.prevent="isLogin = false; step = 1">
            立即注册
          </a>
        </p>
      </div>
    </div>

    <div v-if="showTermsModal" class="modal-overlay" @click.self="closeTerms">
      <div class="modal terms-modal">
        <div class="modal-header">
          <h3>用户协议</h3>
          <button class="close-btn" @click="closeTerms">×</button>
        </div>
        <div class="modal-content">
          <h4>一、接受条款</h4>
          <p>欢迎使用校园门户平台。当您注册或使用本平台时，表示您已同意遵守本协议的所有条款。</p>

          <h4>二、服务描述</h4>
          <p>本平台为校园师生提供信息发布、课程管理、活动组织等服务。具体功能以平台实际提供为准。</p>

          <h4>三、用户注册</h4>
          <p>1. 您需要使用有效的学校邮箱进行注册。<br>
             2. 您应妥善保管账号信息，因个人原因导致的账号被盗用，由用户自行承担责任。<br>
             3. 每个邮箱限注册一个账号。</p>

          <h4>四、用户行为规范</h4>
          <p>1. 不得发布违法、违规或侵犯他人权益的内容。<br>
             2. 不得进行任何可能破坏系统安全的操作。<br>
             3. 尊重其他用户，不得进行骚扰、诽谤或人身攻击。</p>

          <h4>五、隐私保护</h4>
          <p>本平台会保护用户的个人信息，不会未经同意向第三方透露，但法律另有规定的除外。</p>

          <h4>六、知识产权</h4>
          <p>平台上的所有内容，包括但不限于文字、图片、标识等，其知识产权归学校或相应权利人所有。</p>

          <h4>七、免责声明</h4>
          <p>因不可抗力或系统维护导致的平台服务中断，本平台不承担责任。</p>

          <h4>八、协议修改</h4>
          <p>本平台有权随时修改本协议，修改后会在平台公告，不再另行通知。如继续使用平台，则视为接受修改后的协议。</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outlined" @click="closeTerms">暂不同意</button>
          <button class="btn btn-filled" @click="agreeAndClose">同意并继续</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.back-btn:hover {
  opacity: 0.7;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  margin: 0;
  font-weight: 800;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0.5rem 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.hint-badge {
  padding: 2px 8px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 10px;
  font-size: 0.7rem;
  color: var(--color-primary);
}

.error-alert {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="text"] {
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--color-surface-glass);
  color: var(--color-text);
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.validation-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: -0.5rem 0 0;
}

.step-hint {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
}

.password-requirements p {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
  transition: color 0.2s;
}

.password-requirements p.valid {
  color: #22c55e;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.terms-link {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.back-btn-inline {
  width: 100%;
  margin-top: 0.5rem;
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.terms-modal {
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-secondary);
  line-height: 1;
}

.close-btn:hover {
  color: var(--color-text);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-content h4 {
  font-size: 0.95rem;
  margin: 1rem 0 0.5rem;
  color: var(--color-text);
}

.modal-content h4:first-child {
  margin-top: 0;
}

.modal-content p {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.modal-footer .btn {
  flex: 1;
  padding: 10px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>