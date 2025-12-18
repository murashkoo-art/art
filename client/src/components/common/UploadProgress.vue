<template>
  <div class="upload-progress-container">
    <button 
      v-if="hasActiveUploads && !isPanelOpen"
      class="floating-btn"
      @click="togglePanel"
      :class="{ 'has-errors': hasErrors }"
    >
      <Icon name="upload" :size="20" />
      <span class="badge" v-if="activeUploadsCount > 0">
        {{ activeUploadsCount }}
      </span>
      <span class="error-badge" v-if="errorCount > 0">
        {{ errorCount }}
      </span>
    </button>

    <div v-if="isPanelOpen" class="progress-panel">
      <div class="panel-header">
        <h3>Загрузка изображений</h3>
          <Button 
            size="sm" 
            variant="ghost" 
            @click="togglePanel"
          >
            <Icon name="close" :size="20" />
          </Button>
      </div>

      <div v-if="hasActiveUploads" class="active-uploads">
        <h4>В процессе ({{ activeUploadsCount }})</h4>
        
        <div v-for="upload in galleryStore.activeUploads" :key="upload.id" class="upload-item">
          <div class="upload-info">
            <div class="filename">{{ truncateFilename(upload.filename) }}</div>
            <div class="file-size">{{ formatFileSize(upload.file?.size) }}</div>
          </div>
          
          <div class="upload-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :class="{
                  'progress-success': upload.status === 'completed',
                  'progress-error': upload.status === 'error'
                }"
                :style="{ width: upload.progress + '%' }"
              ></div>
            </div>
            <div class="progress-text">
              <span v-if="upload.status === 'uploading'">{{ upload.progress }}%</span>
              <span v-else-if="upload.status === 'completed'" class="success">
                <Icon name="check" :size="14" /> Загружено
              </span>
              <span v-else-if="upload.status === 'error'" class="error">
                <Icon name="alert-circle" :size="14" /> Ошибка
              </span>
            </div>
          </div>
          
          <div v-if="upload.status === 'error'" class="error-message">
            {{ upload.error }}
          </div>
        </div>
      </div>
      <div v-if="hasUploadHistory" class="upload-history">
        <div class="history-header">
          <h4>История загрузок</h4>
          <Button 
            size="sm" 
            variant="ghost" 
            @click="galleryStore.clearUploadHistory"
            v-if="galleryStore.uploadHistory.length > 0"
          >
            Очистить
          </Button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="(item, index) in recentHistory" 
            :key="index" 
            class="history-item"
            :class="{
              'history-success': item.status === 'completed',
              'history-error': item.status === 'error'
            }"
          >
            <div class="history-icon">
              <Icon 
                :name="item.status === 'completed' ? 'check-circle' : 'alert-circle'" 
                :size="16" 
              />
            </div>
            <div class="history-info">
              <div class="history-filename">{{ truncateFilename(item.filename) }}</div>
              <div class="history-time">{{ formatTime(item.completedAt) }}</div>
            </div>
            <div class="history-size">{{ formatFileSize(item.file?.size) }}</div>
          </div>
        </div>
        
        <div v-if="galleryStore.uploadHistory.length > 5" class="show-more">
          <Button 
            variant="link" 
            size="sm"
            @click="showFullHistory = !showFullHistory"
          >
            {{ showFullHistory ? 'Скрыть' : `Показать еще ${galleryStore.uploadHistory.length - 5}` }}
          </Button>
        </div>
      </div>

      <div v-if="uploadStats.total > 0" class="upload-stats">
        <div class="stat-item">
          <div class="stat-value">{{ uploadStats.total }}</div>
          <div class="stat-label">Всего загрузок</div>
        </div>
        <div class="stat-item">
          <div class="stat-value success">{{ uploadStats.successful }}</div>
          <div class="stat-label">Успешно</div>
        </div>
        <div class="stat-item">
          <div class="stat-value error">{{ uploadStats.failed }}</div>
          <div class="stat-label">С ошибками</div>
        </div>
      </div>

      <div v-if="!hasActiveUploads && !hasUploadHistory" class="empty-state">
        <Icon name="upload-cloud" :size="48" />
        <p>Нет активных загрузок</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useGalleryStore } from '@/stores/gallery';
import { useNotificationStore } from '@/stores/notification';
import Button from '@/components/common/Button.vue';
import Icon from '@/components/common/Icon.vue';

const galleryStore = useGalleryStore();
const notificationStore = useNotificationStore();

const isPanelOpen = ref(false);
const showFullHistory = ref(false);

const activeUploadsCount = computed(() => galleryStore.activeUploads.length);
const errorCount = computed(() => galleryStore.activeUploads.filter(u => u.status === 'error').length);
const hasActiveUploads = computed(() => activeUploadsCount.value > 0);
const hasErrors = computed(() => errorCount.value > 0);
const hasUploadHistory = computed(() => galleryStore.uploadHistory.length > 0);

const recentHistory = computed(() => {
  if (showFullHistory.value) {
    return galleryStore.uploadHistory;
  }
  return galleryStore.uploadHistory.slice(0, 5);
});

const uploadStats = computed(() => galleryStore.getUploadStats());


const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value;
};

const truncateFilename = (filename) => {
  if (!filename) return '';
  if (filename.length <= 20) return filename;
  const ext = filename.split('.').pop();
  const name = filename.substring(0, 15);
  return `${name}... .${ext}`;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  return d.toLocaleDateString('ru-RU');
};


watch(() => activeUploadsCount.value, (newVal, oldVal) => {
  if (newVal === 0 && oldVal > 0) {
    const completedCount = galleryStore.uploadHistory.filter(
      u => u.status === 'completed' && 
      new Date() - new Date(u.completedAt) < 1000
    ).length;
    
    if (completedCount > 0) {
      notificationStore.addNotification({
        type: 'success',
        title: 'Загрузка завершена',
        message: `Успешно загружено ${completedCount} файлов`,
        duration: 5000
      });
    }
  }
});
</script>

<style scoped>
.upload-progress-container {
  position: relative;
}

.floating-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.floating-btn.has-errors {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #10b981;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-badge {
  position: absolute;
  top: -4px;
  left: -4px;
  background: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-panel {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 400px;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #475569;
}

.active-uploads,
.upload-history,
.upload-stats {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.active-uploads h4,
.upload-history h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.upload-item {
  margin-bottom: 1rem;
}

.upload-item:last-child {
  margin-bottom: 0;
}

.upload-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.filename {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.75rem;
  color: #64748b;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.progress-success {
  background: #10b981;
}

.progress-fill.progress-error {
  background: #dc2626;
}

.progress-text {
  font-size: 0.75rem;
  color: #64748b;
  min-width: 60px;
  text-align: right;
}

.progress-text .success {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.progress-text .error {
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #fef2f2;
  border-radius: 4px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.history-item:hover {
  background: #f8fafc;
}

.history-item.history-success {
  background: #f0fdf4;
}

.history-item.history-error {
  background: #fef2f2;
}

.history-icon {
  flex-shrink: 0;
}

.history-item.history-success .history-icon {
  color: #10b981;
}

.history-item.history-error .history-icon {
  color: #dc2626;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-filename {
  font-size: 0.875rem;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 0.75rem;
  color: #64748b;
}

.history-size {
  font-size: 0.75rem;
  color: #64748b;
  flex-shrink: 0;
}

.show-more {
  text-align: center;
  margin-top: 0.5rem;
}

.upload-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.error {
  color: #dc2626;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.empty-state {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #94a3b8;
}

.empty-state .icon {
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}
</style>