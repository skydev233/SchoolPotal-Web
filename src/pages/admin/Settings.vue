<script setup>
import { ref, onMounted } from 'vue'

const settings = ref({
  registration_enabled: 'true',
  allowed_email_domain: '',
  smtp_host: '',
  smtp_port: '587',
  smtp_username: '',
  smtp_password: '',
  smtp_from: '',
  email_verification: 'true',
  rtmp_host: 'localhost',
})
const loading = ref(false)
const saving = ref(false)
const message = ref('')

const fetchSettings = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    for (const key in data) {
      if (settings.value.hasOwnProperty(key)) {
        settings.value[key] = data[key]
      }
    }
  } catch (e) {
    showMessage('获取设置失败')
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const res = await fetch('/api/admin/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings.value),
    })
    if (res.ok) {
      showMessage('设置保存成功')
    } else {
      showMessage('保存失败')
    }
  } catch (e) {
    showMessage('保存失败')
  } finally {
    saving.value = false
  }
}

const showMessage = (msg) => {
  message.value = msg
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

onMounted(fetchSettings)
</script>

<template>
  <div class="admin-section">
    <h3>系统设置</h3>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="settings-form glass-card">
      <div class="settings-group">
        <h4>注册设置</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>开放注册</label>
            <select v-model="settings.registration_enabled">
              <option value="true">启用</option>
              <option value="false">关闭</option>
            </select>
          </div>
          <div class="form-group">
            <label>允许的邮箱域名</label>
            <input
              v-model="settings.allowed_email_domain"
              type="text"
              placeholder="如：school.edu.cn（留空则不限制）"
            />
          </div>
          <div class="form-group">
            <label>邮箱验证</label>
            <select v-model="settings.email_verification">
              <option value="true">启用</option>
              <option value="false">关闭</option>
            </select>
          </div>
        </div>
      </div>

      <div class="settings-group">
        <h4>SMTP 邮箱设置</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>SMTP 服务器</label>
            <input
              v-model="settings.smtp_host"
              type="text"
              placeholder="smtp.gmail.com 或 smtp.office365.com"
            />
          </div>
          <div class="form-group">
            <label>SMTP 端口</label>
            <input v-model="settings.smtp_port" type="text" placeholder="587" />
          </div>
          <div class="form-group">
            <label>发件邮箱</label>
            <input
              v-model="settings.smtp_from"
              type="email"
              placeholder="noreply@school.edu.cn"
            />
          </div>
          <div class="form-group">
            <label>SMTP 用户名</label>
            <input
              v-model="settings.smtp_username"
              type="text"
              placeholder="your-email@school.edu.cn"
            />
          </div>
          <div class="form-group">
            <label>SMTP 密码</label>
            <input
              v-model="settings.smtp_password"
              type="password"
              placeholder="邮箱密码或授权码"
            />
          </div>
        </div>
        <p class="hint">
          提示：Gmail 需要使用<a href="https://support.google.com/accounts/answer/185833" target="_blank">应用专用密码</a>，Office 365 使用普通邮箱密码。
        </p>
      </div>

      <div class="settings-group">
        <h4>直播设置</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>RTMP 服务器地址</label>
            <input
              v-model="settings.rtmp_host"
              type="text"
              placeholder="推流服务器域名或IP"
            />
          </div>
        </div>
        <p class="hint">
          提示：填写部署 RTMP 服务器的域名或 IP 地址，用户推流时将使用此地址。
        </p>
      </div>

      <div class="settings-actions">
        <p v-if="message" class="message">{{ message }}</p>
        <button class="btn btn-filled" type="button" @click="saveSettings" :disabled="saving">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-form {
  padding: 32px;
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.settings-group {
  margin-bottom: 32px;
}

.settings-group:last-of-type {
  margin-bottom: 0;
}

.settings-group h4 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--color-primary);
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

.hint a {
  color: var(--color-primary);
  text-decoration: underline;
}

.settings-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.message {
  color: var(--color-primary);
  font-weight: 500;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
}
</style>