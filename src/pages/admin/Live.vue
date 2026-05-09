<script setup>
import { ref, onMounted } from 'vue'

const channels = ref([])
const loading = ref(false)
const showForm = ref(false)
const channelName = ref('')
const channelDesc = ref('')

const fetchChannels = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/admin/live-channels')
    channels.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch channels', e)
  } finally {
    loading.value = false
  }
}

const createChannel = async () => {
  if (!channelName.value) {
    alert('请输入频道名称')
    return
  }
  try {
    await fetch('/api/admin/live-channels/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: channelName.value,
        description: channelDesc.value,
      }),
    })
    closeForm()
    fetchChannels()
  } catch (e) {
    alert('创建失败')
  }
}

const deleteChannel = async (id) => {
  if (!confirm('确定删除该频道吗？')) return
  try {
    await fetch(`/api/admin/live-channels/delete?id=${id}`, { method: 'POST' })
    fetchChannels()
  } catch (e) {
    alert('删除失败')
  }
}

const openForm = () => {
  channelName.value = ''
  channelDesc.value = ''
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}

onMounted(fetchChannels)
</script>

<template>
  <div class="admin-section">
    <div class="section-header">
      <h3>直播频道管理</h3>
      <button class="btn btn-filled" type="button" @click="openForm">
        + 添加频道
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>频道名称</th>
          <th>描述</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ch, index) in channels" :key="ch.id" :style="{ '--i': index }">
          <td>{{ ch.id }}</td>
          <td>{{ ch.name }}</td>
          <td>{{ ch.description || '-' }}</td>
          <td>{{ new Date(ch.created_at).toLocaleDateString() }}</td>
          <td class="action-btns">
            <button class="btn btn-danger btn-sm" type="button" @click="deleteChannel(ch.id)">
              删除
            </button>
          </td>
        </tr>
        <tr v-if="channels.length === 0">
          <td colspan="5" class="empty-state">暂无频道</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h4>添加频道</h4>
        <form @submit.prevent="createChannel">
          <div class="form-group">
            <label>频道名称</label>
            <input v-model="channelName" type="text" placeholder="如：主频道" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <input v-model="channelDesc" type="text" placeholder="可选描述" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outlined" @click="closeForm">取消</button>
            <button type="submit" class="btn btn-filled">确定</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.loading {
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
  animation: fadeIn 0.2s ease;
}

.modal {
  width: 100%;
  max-width: 420px;
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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

.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--color-surface-glass);
  color: var(--color-text);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
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