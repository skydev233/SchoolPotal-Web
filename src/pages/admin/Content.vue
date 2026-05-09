<script setup>
import { ref, onMounted } from 'vue'

const notices = ref([])
const services = ref([])
const loading = ref(false)
const showNoticeForm = ref(false)
const showServiceForm = ref(false)
const noticeForm = ref({ title: '', tag: '' })
const serviceForm = ref({ title: '', description: '', url: '' })

const fetchData = async () => {
  loading.value = true
  try {
    const [noticesRes, servicesRes] = await Promise.all([
      fetch('/api/admin/notices'),
      fetch('/api/admin/services'),
    ])
    notices.value = await noticesRes.json()
    services.value = await servicesRes.json()
  } catch (e) {
    console.error('Failed to fetch data', e)
  } finally {
    loading.value = false
  }
}

const openNoticeForm = () => {
  noticeForm.value = { title: '', tag: '' }
  showNoticeForm.value = true
}

const openServiceForm = () => {
  serviceForm.value = { title: '', description: '', url: '' }
  showServiceForm.value = true
}

const closeNoticeForm = () => {
  showNoticeForm.value = false
}

const closeServiceForm = () => {
  showServiceForm.value = false
}

const handleNoticeSubmit = async () => {
  if (!noticeForm.value.title || !noticeForm.value.tag) {
    alert('请填写标题和标签')
    return
  }
  try {
    await fetch('/api/admin/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noticeForm.value),
    })
    closeNoticeForm()
    fetchData()
  } catch (e) {
    alert('添加公告失败')
  }
}

const handleServiceSubmit = async () => {
  if (!serviceForm.value.title || !serviceForm.value.description) {
    alert('请填写标题和描述')
    return
  }
  try {
    await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceForm.value),
    })
    closeServiceForm()
    fetchData()
  } catch (e) {
    alert('添加服务失败')
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="admin-section">
    <h3>内容管理</h3>

    <div class="content-tabs">
      <div class="tab-header">
        <button class="tab-btn active">公告管理</button>
        <button class="tab-btn">服务管理</button>
      </div>

      <div class="tab-content">
        <div class="section-header">
          <h4>公告列表</h4>
          <button class="btn btn-filled" type="button" @click="openNoticeForm">
            + 添加公告
          </button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>标签</th>
              <th>发布时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(notice, index) in notices" :key="notice.id" :style="{ '--i': index }">
              <td>{{ notice.id }}</td>
              <td>{{ notice.title }}</td>
              <td><span class="chip">{{ notice.tag }}</span></td>
              <td>{{ new Date(notice.published_at).toLocaleDateString() }}</td>
            </tr>
            <tr v-if="notices.length === 0">
              <td colspan="4" class="empty-state">暂无公告</td>
            </tr>
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="section-header">
          <h4>服务列表</h4>
          <button class="btn btn-filled" type="button" @click="openServiceForm">
            + 添加服务
          </button>
        </div>

        <table v-if="!loading" class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>标题</th>
              <th>描述</th>
              <th>链接</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(service, index) in services" :key="service.id" :style="{ '--i': index }">
              <td>{{ service.id }}</td>
              <td>{{ service.title }}</td>
              <td class="desc-cell">{{ service.description }}</td>
              <td>{{ service.url }}</td>
            </tr>
            <tr v-if="services.length === 0">
              <td colspan="4" class="empty-state">暂无服务</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showNoticeForm" class="modal-overlay" @click.self="closeNoticeForm">
      <div class="modal">
        <h4>添加公告</h4>
        <form @submit.prevent="handleNoticeSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="noticeForm.title" type="text" placeholder="请输入公告标题" />
          </div>
          <div class="form-group">
            <label>标签</label>
            <input v-model="noticeForm.tag" type="text" placeholder="如：教务、信息中心" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outlined" @click="closeNoticeForm">取消</button>
            <button type="submit" class="btn btn-filled">确定</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showServiceForm" class="modal-overlay" @click.self="closeServiceForm">
      <div class="modal">
        <h4>添加服务</h4>
        <form @submit.prevent="handleServiceSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="serviceForm.title" type="text" placeholder="请输入服务标题" />
          </div>
          <div class="form-group">
            <label>描述</label>
            <input v-model="serviceForm.description" type="text" placeholder="请输入服务描述" />
          </div>
          <div class="form-group">
            <label>链接</label>
            <input v-model="serviceForm.url" type="text" placeholder="如：/service/library" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outlined" @click="closeServiceForm">取消</button>
            <button type="submit" class="btn btn-filled">确定</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-tabs {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.tab-header {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  width: fit-content;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.loading {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 32px 0;
}

.desc-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  max-width: 400px;
  padding: 32px;
  background: var(--color-surface-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
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

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>