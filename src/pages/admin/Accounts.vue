<script setup>
import { ref, computed, onMounted } from 'vue'

const users = ref([])
const loading = ref(false)
const showForm = ref(false)
const editingUser = ref(null)
const searchQuery = ref('')
const selectedUsers = ref([])
const showImportModal = ref(false)
const formData = ref({
  username: '',
  email: '',
  password: '',
  role: 'user',
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.username.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    u.role.toLowerCase().includes(query)
  )
})

const allSelected = computed(() => {
  return filteredUsers.value.length > 0 &&
    filteredUsers.value.every(u => selectedUsers.value.includes(u.id))
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/admin/users')
    users.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch users', e)
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = filteredUsers.value.map(u => u.id)
  }
}

const toggleSelect = (id) => {
  const idx = selectedUsers.value.indexOf(id)
  if (idx >= 0) {
    selectedUsers.value.splice(idx, 1)
  } else {
    selectedUsers.value.push(id)
  }
}

const openForm = (user = null) => {
  if (user) {
    editingUser.value = user
    formData.value = { username: user.username, email: user.email, password: '', role: user.role }
  } else {
    editingUser.value = null
    formData.value = { username: '', email: '', password: '', role: 'user' }
  }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingUser.value = null
  formData.value = { username: '', email: '', password: '', role: 'user' }
}

const handleSubmit = async () => {
  if (!formData.value.username || !formData.value.email || (!formData.value.password && !editingUser.value)) {
    alert('请填写用户名、邮箱和密码')
    return
  }

  try {
    if (editingUser.value) {
      await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.value.id,
          password: formData.value.password || editingUser.value.password,
          role: formData.value.role,
        }),
      })
    } else {
      await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.value),
      })
    }
    closeForm()
    fetchUsers()
  } catch (e) {
    alert('操作失败')
  }
}

const handleDelete = async (user) => {
  if (!confirm(`确定删除用户 "${user.username}" 吗？`)) return
  try {
    await fetch(`/api/admin/users/delete?id=${user.id}`, { method: 'POST' })
    fetchUsers()
  } catch (e) {
    alert('删除失败')
  }
}

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    alert('请选择要删除的用户')
    return
  }
  if (!confirm(`确定删除选中的 ${selectedUsers.value.length} 个用户吗？`)) return
  try {
    await fetch('/api/admin/users/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedUsers.value }),
    })
    selectedUsers.value = []
    fetchUsers()
  } catch (e) {
    alert('批量删除失败')
  }
}

const downloadTemplate = () => {
  const csv = '\uFEFF用户名,邮箱,密码,角色\n示例用户,user@school.edu.cn,Password123,user\n管理员,admin@school.edu.cn,AdminPass123,admin'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '学生名单示例.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}

const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const text = await file.text()
  const lines = text.split('\n').filter(l => l.trim())

  if (lines.length < 2) {
    alert('文件格式错误或无数据')
    return
  }

  const header = lines[0].split(',')
  if (header[0].trim() !== '用户名' || header[1].trim() !== '邮箱') {
    alert('请使用示例模板文件')
    return
  }

  let success = 0
  let failed = 0

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 4) continue

    const [username, email, password, role] = cols.map(c => c.trim())

    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: role || 'user' }),
      })
      if (res.ok) success++
      else failed++
    } catch {
      failed++
    }
  }

  alert(`导入完成：成功 ${success} 个，失败 ${failed} 个`)
  showImportModal.value = false
  fetchUsers()
  event.target.value = ''
}

onMounted(fetchUsers)
</script>

<template>
  <div class="admin-section">
    <div class="section-header">
      <h3>账号管理</h3>
      <div class="header-actions">
        <button class="btn btn-outlined" type="button" @click="showImportModal = true">
          导入 Excel
        </button>
        <button class="btn btn-filled" type="button" @click="openForm()">
          + 添加账号
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户名、邮箱或角色..."
        />
      </div>
      <button
        v-if="selectedUsers.length > 0"
        class="btn btn-danger"
        type="button"
        @click="handleBatchDelete"
      >
        批量删除 ({{ selectedUsers.length }})
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th class="checkbox-col">
            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
          </th>
          <th>ID</th>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, index) in filteredUsers" :key="user.id" :style="{ '--i': index }">
          <td class="checkbox-col">
            <input
              type="checkbox"
              :checked="selectedUsers.includes(user.id)"
              @change="toggleSelect(user.id)"
            />
          </td>
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email || '-' }}</td>
          <td>
            <span :class="['role-badge', user.role]">{{ user.role }}</span>
          </td>
          <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
          <td class="action-btns">
            <button class="btn btn-outlined btn-sm" type="button" @click="openForm(user)">
              编辑
            </button>
            <button class="btn btn-danger btn-sm" type="button" @click="handleDelete(user)">
              删除
            </button>
          </td>
        </tr>
        <tr v-if="filteredUsers.length === 0">
          <td colspan="7" class="empty-state">
            {{ searchQuery ? '没有找到匹配的用户' : '暂无账号数据' }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h4>{{ editingUser ? '编辑账号' : '添加账号' }}</h4>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>用户名</label>
            <input
              v-model="formData.username"
              type="text"
              placeholder="请输入用户名"
              :disabled="!!editingUser"
            />
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input
              v-model="formData.email"
              type="email"
              placeholder="请输入邮箱地址"
              :disabled="!!editingUser"
            />
          </div>
          <div class="form-group">
            <label>密码</label>
            <input
              v-model="formData.password"
              type="password"
              :placeholder="editingUser ? '留空则不修改密码' : '请输入密码'"
            />
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="formData.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outlined" @click="closeForm">取消</button>
            <button type="submit" class="btn btn-filled">确定</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
      <div class="modal">
        <h4>导入用户</h4>
        <div class="import-content">
          <p>请先下载示例模板，依照示例格式填写后上传</p>
          <button class="btn btn-tonal" type="button" @click="downloadTemplate">
            下载示例模板
          </button>
          <div class="divider"></div>
          <div class="form-group">
            <label>选择 Excel 文件</label>
            <input type="file" accept=".csv" @change="handleImport" />
          </div>
          <p class="hint">支持 CSV 格式，第一行必须为表头：用户名、邮箱、密码、角色</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-outlined" @click="showImportModal = false">关闭</button>
        </div>
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

.header-actions {
  display: flex;
  gap: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-box input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background: var(--color-surface-glass);
  color: var(--color-text);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.loading {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.checkbox-col input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.admin {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.role-badge.user {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
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

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.import-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-content p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 8px 0;
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
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