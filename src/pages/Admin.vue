<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'

const router = useRouter()
const username = ref('')
const role = ref('')
const theme = ref('light')

const currentPath = computed(() => router.currentRoute.value.path)

onMounted(() => {
  username.value = localStorage.getItem('username') || ''
  role.value = localStorage.getItem('role') || ''

  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
  }
  applyTheme()
})

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  applyTheme()
}

const navigateTo = (path) => {
  router.push(path)
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar surface-1">
      <div class="sidebar-header">
        <h2>管理后台</h2>
        <p class="user-info">{{ username }} ({{ role }})</p>
      </div>

      <nav class="sidebar-nav">
        <button
          :class="['nav-item', { active: currentPath === '/admin/accounts' }]"
          type="button"
          @click="navigateTo('/admin/accounts')"
        >
          <span class="nav-icon">👥</span>
          账号管理
        </button>
        <button
          :class="['nav-item', { active: currentPath === '/admin/content' }]"
          type="button"
          @click="navigateTo('/admin/content')"
        >
          <span class="nav-icon">📝</span>
          内容管理
        </button>
        <button
          :class="['nav-item', { active: currentPath === '/admin/settings' }]"
          type="button"
          @click="navigateTo('/admin/settings')"
        >
          <span class="nav-icon">⚙️</span>
          系统设置
        </button>
        <button
          :class="['nav-item', { active: currentPath === '/admin/live' }]"
          type="button"
          @click="navigateTo('/admin/live')"
        >
          <span class="nav-icon">📺</span>
          直播管理
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle" type="button" @click="toggleTheme">
          {{ theme === 'light' ? '🌙' : '☀️' }}
          {{ theme === 'light' ? '深色模式' : '浅色模式' }}
        </button>
        <button class="logout-btn" type="button" @click="logout">
          退出登录
        </button>
      </div>
    </aside>

    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
}

.sidebar-header {
  margin-bottom: 2rem;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.user-info {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text);
  transition: background 0.15s;
}

.nav-item:hover {
  background: var(--color-hover);
}

.nav-item.active {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

.nav-icon {
  font-size: 1.125rem;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.theme-toggle,
.logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  text-align: left;
  color: var(--color-text);
}

.theme-toggle:hover,
.logout-btn:hover {
  background: var(--color-hover);
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>