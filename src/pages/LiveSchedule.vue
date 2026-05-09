<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const channels = ref([])
const schedules = ref([])
const loading = ref(false)
const username = ref('')
const userEmail = ref('')
const showBookModal = ref(false)
const bookingForm = ref({
  channelId: '',
  title: '',
  startTime: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const [channelsRes, schedulesRes] = await Promise.all([
      fetch('/api/admin/live-channels'),
      fetch('/api/live/schedule'),
    ])
    channels.value = await channelsRes.json()
    schedules.value = await schedulesRes.json()
  } catch (e) {
    console.error('Failed to fetch data', e)
  } finally {
    loading.value = false
  }
}

const openBookModal = (channelId = '') => {
  bookingForm.value = {
    channelId: channelId || (channels.value[0]?.id || ''),
    title: '',
    startTime: '',
  }
  showBookModal.value = true
}

const closeBookModal = () => {
  showBookModal.value = false
}

const handleBook = async () => {
  if (!bookingForm.value.channelId || !bookingForm.value.title || !bookingForm.value.startTime) {
    alert('请填写所有必填项')
    return
  }

  const userId = 1

  try {
    const res = await fetch('/api/live/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: parseInt(bookingForm.value.channelId),
        title: bookingForm.value.title,
        startTime: new Date(bookingForm.value.startTime).toISOString(),
        userId: userId,
        userEmail: userEmail.value || 'user@example.com',
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error || '预约失败')
    } else {
      alert('预约成功！请查看邮箱确认')
      closeBookModal()
      fetchData()
    }
  } catch (e) {
    alert('预约失败')
  }
}

const getChannelName = (channelId) => {
  const ch = channels.value.find(c => c.id === channelId)
  return ch ? ch.name : '未知频道'
}

const getStatusLabel = (status) => {
  const map = {
    scheduled: '已预约',
    live: '直播中',
    ended: '已结束',
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const goToStream = (scheduleId) => {
  router.push(`/live/stream/${scheduleId}`)
}

onMounted(() => {
  username.value = localStorage.getItem('username') || ''
  userEmail.value = localStorage.getItem('email') || ''
  fetchData()
})
</script>

<template>
  <div class="live-schedule-page">
    <header class="topbar glass">
      <div class="brand">
        <span class="brand-mark">SP</span>
        <div>
          <p class="brand-title">校园门户</p>
          <p class="brand-subtitle">直播预约</p>
        </div>
      </div>
      <button class="btn btn-outlined" type="button" @click="router.push('/')">返回首页</button>
    </header>

    <main class="main-content">
      <div class="section-header">
        <h2>直播预约</h2>
        <button class="btn btn-filled" type="button" @click="openBookModal()">
          + 预约直播
        </button>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="schedule-list">
        <div
          v-for="(schedule, index) in schedules"
          :key="schedule.id"
          class="schedule-card glass-card"
          :style="{ '--i': index }"
        >
          <div class="schedule-info">
            <h3>{{ schedule.title }}</h3>
            <p class="schedule-meta">
              频道：{{ getChannelName(schedule.channelId) }} |
              时间：{{ new Date(schedule.startTime).toLocaleString() }}
            </p>
          </div>
          <div class="schedule-status">
            <span :class="['status-badge', getStatusClass(schedule.status)]">
              {{ getStatusLabel(schedule.status) }}
            </span>
          </div>
          <div class="schedule-actions">
            <button
              v-if="schedule.status === 'scheduled'"
              class="btn btn-filled btn-sm"
              type="button"
              @click="goToStream(schedule.id)"
            >
              进入开播
            </button>
          </div>
        </div>
        <div v-if="schedules.length === 0" class="empty-state">
          暂无预约直播
        </div>
      </div>
    </main>

    <div v-if="showBookModal" class="modal-overlay" @click.self="closeBookModal">
      <div class="modal glass">
        <h4>预约直播</h4>
        <form @submit.prevent="handleBook">
          <div class="form-group">
            <label>选择频道</label>
            <select v-model="bookingForm.channelId">
              <option v-for="ch in channels" :key="ch.id" :value="ch.id">
                {{ ch.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>直播标题</label>
            <input v-model="bookingForm.title" type="text" placeholder="请输入直播标题" />
          </div>
          <div class="form-group">
            <label>开播时间</label>
            <input v-model="bookingForm.startTime" type="datetime-local" />
          </div>
          <p class="hint">预约成功后，系统将发送确认邮件到您的邮箱</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-outlined" @click="closeBookModal">取消</button>
            <button type="submit" class="btn btn-filled">确认预约</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-schedule-page {
  min-height: 100vh;
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.main-content {
  margin-top: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.loading {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
}

.schedule-info {
  flex: 1;
}

.schedule-info h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.schedule-meta {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-scheduled {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}

.status-live {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.status-ended {
  background: rgba(148, 163, 184, 0.2);
  color: var(--color-text-secondary);
}

.schedule-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 420px;
  padding: 32px;
}

.modal h4 {
  margin: 0 0 24px;
  font-size: 1.25rem;
}

.modal form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--color-surface-glass);
  color: var(--color-text);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>