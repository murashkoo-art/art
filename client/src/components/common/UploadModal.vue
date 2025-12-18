<template>
  <BaseModal
    :show="show"
    @update:show="handleModalUpdate"
    @close="handleClose"
    @overlay-click="handleOverlayClick"
    title="Загрузить изображения в галерею"
    size="lg"
    :close-on-overlay="false"
    :close-on-esc="false"
    :closable="!isUploading"
    :show-footer="true"
  >
    <div class="upload-container">
      <!-- Информация о загрузке -->
      <div class="upload-info">
        <Icon name="info" :size="20" />
        <p>Изображения будут сразу сохранены в вашу галерею. Вы сможете добавить информацию позже.</p>
      </div>
      
      <!-- Компонент загрузки -->
      <UploadComponent
        ref="uploadComponent"
        mode="multiple"
        :withFields="true"
        :disabled="isUploading"
        @files-updated="handleFilesUpdate"
        class="uploader"
      />
      
      <!-- Общий прогресс загрузки -->
      <div v-if="isUploading" class="overall-progress">
        <div class="progress-header">
          <h3>Загрузка файлов</h3>
          <div class="progress-stats">
            {{ currentUploaded }}/{{ totalFiles }} файлов
            <span class="progress-percent">{{ overallProgress }}%</span>
          </div>
        </div>
        
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: overallProgress + '%' }"
          ></div>
        </div>
        
        <!-- Прогресс по файлам -->
        <div v-if="uploadedFiles?.length > 0" class="files-progress">
          <div 
            v-for="(file, index) in uploadedFiles" 
            :key="index"
            class="file-progress-item"
          >
            <div class="file-info">
              <Icon 
                :name="getFileStatusIcon(file.status)" 
                :size="16" 
                :class="file.status"
              />
              <span class="file-name">{{ truncateFilename(file.file?.name) }}</span>
            </div>
            <div class="file-progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: file.progress + '%' }"
                :class="file.status"
              ></div>
            </div>
            <span class="file-progress-text">{{ file.progress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="handleClose" :disabled="isUploading">
        {{ isUploading ? 'Скрыть' : 'Отмена' }}
      </Button>
      <Button 
        @click="handleUpload" 
        :disabled="isUploading || !uploadedFiles?.length"
        :loading="isUploading"
      >
        {{ getUploadButtonText }}
      </Button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import Button from '@/components/common/Button.vue';
import Icon from '@/components/common/Icon.vue';
import UploadComponent from '@/components/common/UploadComponent.vue';
import { useGalleryStore } from '@/stores/gallery';
import { useNotificationStore } from '@/stores/notification';
import { truncateFilename } from '@/utils/formatUtils';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:show', 'close', 'uploaded']);

const galleryStore = useGalleryStore();
const notificationStore = useNotificationStore();

const uploadComponent = ref(null);
const uploadedFiles = ref([]);
const isUploading = ref(false);
const overallProgress = ref(0);
const currentUploaded = ref(0);
const totalFiles = ref(0);


const getUploadButtonText = computed(() => {
  if (isUploading.value) {
    return `Загрузка... ${overallProgress.value}%`;
  }
  return `Загрузить ${uploadedFiles.value?.length || 0} файлов`;
});


const handleFilesUpdate = (files) => {
  uploadedFiles.value = files.map(fileData => ({
    ...fileData,
    status: 'pending',
    progress: 0,
    error: null
  }));
  totalFiles.value = files.length;
};

const getFileStatusIcon = (status) => {
  switch (status) {
    case 'uploading': return 'loader';
    case 'success': return 'check-circle';
    case 'error': return 'alert-circle';
    default: return 'clock';
  }
};

const handleModalUpdate = (value) => {
  emit('update:show', value);
  if (!value) {
    handleClose();
  }
};

const handleClose = () => {
  if (isUploading.value) {
    emit('update:show', false);
    saveUploadSession();
  } else {
    emit('close');
    emit('update:show', false);
  }
};

const handleOverlayClick = () => {
  handleClose();
};

const saveUploadSession = () => {
  const session = {
    files: uploadedFiles.value,
    overallProgress: overallProgress.value,
    currentUploaded: currentUploaded.value,
    totalFiles: totalFiles.value,
    timestamp: Date.now()
  };
  
  localStorage.setItem('gallery_upload_session', JSON.stringify(session));
  
  notificationStore.addNotification({
    type: 'info',
    title: 'Загрузка продолжается в фоне',
    message: 'Вы можете отслеживать прогресс в центре уведомлений',
    duration: 3000
  });
};

const handleUpload = async () => {
  if (!uploadedFiles.value?.length) return;
  
  isUploading.value = true;
  overallProgress.value = 0;
  currentUploaded.value = 0;
  
  try {
    const files = uploadedFiles.value.map(f => f.file);
    
    // Подготавливаем данные для каждого файла
    const itemsData = uploadedFiles.value.map(fileData => ({
      filename: fileData.file.name,
      title: fileData.title || '',
      description: fileData.description || '',
      artist: fileData.artist || '',
      year: fileData.year ? parseInt(fileData.year) : null,
      tags: fileData.tags || '',
      is_valid: false
    }));
    
    const result = await galleryStore.uploadItems(files, itemsData, (progress, uploaded, total) => {
      overallProgress.value = progress;
      currentUploaded.value = uploaded;
      
      // Обновляем прогресс для каждого файла
      uploadedFiles.value.forEach((file, index) => {
        if (index < uploaded) {
          file.status = 'success';
          file.progress = 100;
        } else if (index === uploaded) {
          file.status = 'uploading';
          file.progress = progress % 100;
        }
      });
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    emit('uploaded', uploadedFiles.value);
    handleClose();
  } catch (error) {
    console.error('Upload error:', error);
    notificationStore.addNotification({
      type: 'error',
      title: 'Ошибка загрузки',
      message: error.message || 'Произошла ошибка при загрузке'
    });
  } finally {
    isUploading.value = false;
  }
};

const restoreUploadSession = () => {
  const saved = localStorage.getItem('gallery_upload_session');
  if (saved) {
    try {
      const session = JSON.parse(saved);
      uploadedFiles.value = session.files || [];
      overallProgress.value = session.overallProgress || 0;
      currentUploaded.value = session.currentUploaded || 0;
      totalFiles.value = session.totalFiles || 0;
      
      // Если была незавершенная загрузка, показываем сообщение
      if (session.overallProgress > 0 && session.overallProgress < 100) {
        notificationStore.addNotification({
          type: 'info',
          title: 'Незавершенная загрузка',
          message: 'У вас есть незавершенная загрузка. Вы можете продолжить ее.',
          duration: 5000
        });
      }
    } catch (err) {
      console.error('Error restoring upload session:', err);
    }
  }
};

onMounted(() => {
  restoreUploadSession();
});

onUnmounted(() => {
  if (!isUploading.value) {
    localStorage.removeItem('gallery_upload_session');
  }
});
</script>

<style scoped>
.upload-container {
  min-height: 300px;
}

.upload-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: #0369a1;
}

.upload-info .icon {
  flex-shrink: 0;
}

.upload-info p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.overall-progress {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #1e293b;
}

.progress-stats {
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-percent {
  font-weight: 600;
  color: #4f46e5;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.files-progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-progress-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.file-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.file-name {
  font-size: 0.875rem;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-progress-bar {
  width: 100px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.file-progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 30px;
  text-align: right;
}
</style>