<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const notices = ref([])
const isLoggedIn = ref(!!localStorage.getItem('token'))

onMounted(async () => {
  try {
    const res = await fetch('/api/notices?limit=5')
    notices.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch notices', e)
  }
})

const goToLogin = () => {
  router.push('/login')
}

const goToAdmin = () => {
  router.push('/admin')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  router.push('/login')
}
</script>

<template>
  <div class="portal">
    <header class="topbar surface-1">
      <div class="brand">
        <span class="brand-mark">SP</span>
        <div>
          <p class="brand-title">校园门户</p>
          <p class="brand-subtitle">School Portal</p>
        </div>
      </div>
      <nav class="topnav" aria-label="主导航">
        <a href="#">首页</a>
        <a href="#">学习</a>
        <a href="#">生活</a>
        <a href="#">服务</a>
      </nav>
      <div class="header-actions">
        <button v-if="isLoggedIn" class="btn btn-tonal" type="button" @click="goToAdmin">管理后台</button>
        <button v-if="isLoggedIn" class="btn btn-outlined" type="button" @click="logout">退出</button>
        <button v-else class="btn btn-tonal" type="button" @click="goToLogin">登录</button>
      </div>
    </header>

    <main class="main-content">
      <section class="hero surface-1">
        <div class="hero-text">
          <p class="eyebrow">智慧校园平台</p>
          <h1>一站式校园信息与服务入口</h1>
          <p class="hero-desc">
            聚合通知、日程和办事系统，让师生在一个页面完成日常校园操作。
          </p>
          <div class="hero-actions">
            <button class="btn btn-filled" type="button" @click="isLoggedIn ? goToAdmin() : goToLogin()">
              {{ isLoggedIn ? '进入管理后台' : '登录统一认证' }}
            </button>
          </div>
        </div>
        <img
          class="hero-image"
          src="../assets/hero.png"
          alt="校园门户概览插图"
          width="420"
          height="280"
          decoding="async"
          fetchpriority="high"
        />
      </section>

      <section class="dashboard-grid">
        <article class="card surface-1">
          <div class="card-header">
            <h2>最新公告</h2>
            <a href="#" class="text-link">公告中心</a>
          </div>
          <ul class="notices">
            <li v-for="item in notices" :key="item.id">
              <div>
                <p class="item-title">{{ item.title }}</p>
                <p class="item-sub">{{ item.tag }} · {{ new Date(item.publishedAt).toLocaleDateString() }}</p>
              </div>
            </li>
            <li v-if="notices.length === 0">
              <p class="item-sub">暂无公告</p>
            </li>
          </ul>
        </article>
      </section>
    </main>
  </div>
</template>