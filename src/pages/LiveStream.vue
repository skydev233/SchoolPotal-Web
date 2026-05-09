<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const schedule = ref(null)
const streamInfo = ref(null)
const loading = ref(false)
const copied = ref(false)

const fetchStreamInfo = async () => {
  loading.value = true
  try {
    const id = route.params.id

    const res = await fetch(`/api/live/stream-key?id=${id}`)
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || '获取推流信息失败')
      return
    }

    streamInfo.value = data
  } catch (e) {
    console.error('Failed to fetch stream info', e)
  } finally {
    loading.value = false
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

const goBack = () => {
  router.push('/live/schedule')
}

onMounted(fetchStreamInfo)
</script>

<template>
  <div class="stream-page">
    <header class="topbar glass">
      <div class="brand">
        <span class="brand-mark">SP</span>
        <div>
          <p class="brand-title">校园门户</p>
          <p class="brand-subtitle">直播开播</p>
        </div>
      </div>
      <button class="btn btn-outlined" type="button" @click="goBack">返回</button>
    </header>

    <main class="main-content">
      <div v-if="loading" class="loading">加载中...</div>

      <div v-else-if="streamInfo" class="stream-container">
        <div class="stream-header">
          <h2>推流信息</h2>
          <p class="subtitle">请使用 OBS 或其他直播软件进行推流</p>
        </div>

        <div class="stream-card glass-card">
          <div class="stream-info-item">
            <label>推流地址 (RTMP URL)</label>
            <div class="copy-row">
              <code>{{ streamInfo.serverUrl }}</code>
              <button class="btn btn-sm btn-outlined" @click="copyToClipboard(streamInfo.serverUrl)">
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>
          </div>

          <div class="stream-info-item">
            <label>推流码 (Stream Key)</label>
            <div class="copy-row">
              <code class="stream-key">{{ streamInfo.streamKey }}</code>
              <button class="btn btn-sm btn-outlined" @click="copyToClipboard(streamInfo.streamKey)">
                {{ copied ? '已复制' : '复制' }}
              </button>
            </div>
          </div>
        </div>

        <div class="obs-guide glass-card">
          <h3>OBS 推流设置</h3>
          <ol>
            <li>打开 OBS 设置 → 流</li>
            <li>选择"自定义"服务</li>
            <li>服务器填入上面的<strong>推流地址</strong></li>
            <li>推流密钥填入上面的<strong>推流码</strong></li>
            <li>点击"开始推流"即可</li>
          </ol>
        </div>

        <div class="webcam-section glass-card">
          <h3>网页开播</h3>
          <p class="hint">如果您的浏览器支持摄像头，可以使用以下网页开播工具</p>
          <div class="webcam-preview">
            <video id="webcam" autoplay playsinline muted></video>
          </div>
          <div class="webcam-controls">
            <button class="btn btn-filled" type="button" id="startWebcam">
              启动摄像头
            </button>
            <button class="btn btn-danger" type="button" id="stopWebcam" disabled>
              停止推流
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>无法获取推流信息</p>
        <button class="btn btn-outlined" @click="goBack">返回</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.stream-page {
  min-height: 100vh;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.main-content {
  margin-top: 24px;
}

.loading, .empty-state {
  text-align: center;
  padding: 48px;
  color: var(--color-text-secondary);
}

.stream-header {
  text-align: center;
  margin-bottom: 24px;
}

.stream-header h2 {
  margin: 0 0 8px;
  font-size: 1.5rem;
}

.subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.stream-card {
  padding: 24px;
  margin-bottom: 16px;
}

.stream-info-item {
  margin-bottom: 20px;
}

.stream-info-item:last-child {
  margin-bottom: 0;
}

.stream-info-item label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.copy-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.copy-row code {
  flex: 1;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

.stream-key {
  color: var(--color-primary);
}

.obs-guide, .webcam-section {
  padding: 24px;
  margin-bottom: 16px;
}

.obs-guide h3, .webcam-section h3 {
  margin: 0 0 16px;
  font-size: 1.1rem;
}

.obs-guide ol {
  margin: 0;
  padding-left: 24px;
  line-height: 2;
  color: var(--color-text-secondary);
}

.obs-guide strong {
  color: var(--color-text);
}

.hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
}

.webcam-preview {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.webcam-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.webcam-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>