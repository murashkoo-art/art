<template>
  <BaseModal
    :show="show"
    @update:show="$emit('update:show', $event)"
    @close="handleClose"
    @overlay-click="handleOverlayClick"
    title="Редактирование работы"
    size="lg"
    :close-on-overlay="false"
    :close-on-esc="false"
    :disabled="isSaving"
    :show-footer="true"
  >
    <div class="edit-form">
      <!-- Текущее изображение -->
      <div class="image-section">
        <div class="current-image">
          <img :src="getFullImageUrl(form.image_url)" :alt="form.title" />
        </div>
        
        <!-- Загрузка нового изображения -->
        <div class="image-upload">
          <div 
            class="upload-area" 
            @click="triggerFileInput" 
            :class="{ 'drag-over': dragOver }"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleFileDrop"
            :style="{ pointerEvents: isSaving ? 'none' : 'auto' }"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              style="display: none"
              :disabled="isSaving"
            />
            <Icon name="upload" :size="32" />
            <p>Нажмите для загрузки нового изображения</p>
            <p class="file-hint">Максимальный размер: 10MB</p>
          </div>
          
          <div v-if="newImage" class="new-image-preview">
            <img :src="newImagePreview" alt="Новое изображение" />
            <div class="preview-actions">
              <Button size="sm" variant="outline" @click="removeNewImage" :disabled="isSaving">
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Форма редактирования -->
      <div class="form-section">
        <div class="form-group">
          <label>Название работы</label>
          <input 
            v-model="form.title" 
            placeholder="Введите название"
            :disabled="isSaving"
          />
        </div>
        
        <div class="form-group">
          <label>Описание</label>
          <textarea 
            v-model="form.description" 
            placeholder="Введите описание"
            rows="4"
            :disabled="isSaving"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Художник</label>
            <input 
              v-model="form.artist" 
              placeholder="Имя художника"
              :disabled="isSaving"
            />
          </div>
          
          <div class="form-group">
            <label>Год создания</label>
            <input 
              v-model="form.year" 
              type="number" 
              min="1000" 
              max="2100"
              placeholder="Год"
              :disabled="isSaving"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>Теги (через запятую)</label>
          <input 
            v-model="form.tags" 
            placeholder="живопись, пейзаж, масло..."
            :disabled="isSaving"
          />
        </div>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              v-model="form.is_valid" 
              type="checkbox"
              :disabled="isSaving"
            />
            <span>Отметить как валидную (видно всем)</span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Прогресс сохранения -->
    <div v-if="isSaving" class="save-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: saveProgress + '%' }"></div>
      </div>
      <p>Сохранение изменений...</p>
    </div>

    <template #footer>
      <Button variant="outline" @click="handleClose" :disabled="isSaving">
        Отмена
      </Button>
      <Button @click="save" :disabled="isSaving" :loading="isSaving">
        Сохранить изменения
      </Button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import Button from '@/components/common/Button.vue';
import Icon from '@/components/common/Icon.vue';
import { useGalleryStore } from '@/stores/gallery';
import { useNotificationStore } from '@/stores/notification';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:show', 'close', 'saved']);

const galleryStore = useGalleryStore();
const notificationStore = useNotificationStore();

const form = ref({});
const newImage = ref(null);
const newImagePreview = ref('');
const fileInput = ref(null);
const dragOver = ref(false);
const isSaving = ref(false);
const saveProgress = ref(0);
const hasUnsavedChanges = ref(false);

onMounted(() => {
  form.value = { ...props.item };
  
  watch(() => form.value, (newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      hasUnsavedChanges.value = true;
    }
  }, { deep: true });
});

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return window.location.origin + url;
  }
  return url;
};

const triggerFileInput = () => {
  if (!isSaving.value && fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file && validateFile(file)) {
    newImage.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      newImagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
    
    hasUnsavedChanges.value = true;
  }
};

const handleFileDrop = (event) => {
  dragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file && validateFile(file)) {
    newImage.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      newImagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
    
    hasUnsavedChanges.value = true;
  }
};

const validateFile = (file) => {
  if (!file.type.match('image.*')) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Ошибка',
      message: 'Разрешены только изображения'
    });
    return false;
  }
  
  if (file.size > 10 * 1024 * 1024) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Ошибка',
      message: 'Размер файла не должен превышать 10MB'
    });
    return false;
  }
  
  return true;
};

const removeNewImage = () => {
  newImage.value = null;
  newImagePreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleClose = () => {
  if (hasUnsavedChanges.value && !isSaving.value) {
    if (confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?')) {
      emit('close');
    }
  } else {
    emit('close');
  }
};

const handleOverlayClick = () => {
  handleClose();
};

const save = async () => {
  isSaving.value = true;
  saveProgress.value = 30;

  try {
    const dataToSend = { ...form.value };
    
    // технические поля
    delete dataToSend.image_url;
    delete dataToSend.created_at;
    delete dataToSend.updated_at;
    
    // Преобразуем теги: строка -> массив -> JSON строка
    if (dataToSend.tags) {
      let tagsArray;
      if (typeof dataToSend.tags === 'string') {
        tagsArray = dataToSend.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(dataToSend.tags)) {
        tagsArray = dataToSend.tags;
      }
      dataToSend.tags = JSON.stringify(tagsArray || []);
    }
    
    if (typeof dataToSend.is_valid === 'boolean') {
      dataToSend.is_valid = dataToSend.is_valid.toString();
    }
    
    if (newImage.value) {
      saveProgress.value = 50;
      
      const formData = new FormData();
      formData.append('image', newImage.value);
      
      Object.keys(dataToSend).forEach(key => {
        const value = dataToSend[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const result = await galleryStore.updateItem(props.item.id, formData);
      
      if (result.success) {
        saveProgress.value = 100;
        emit('saved', result.data);
        notificationStore.addNotification({
          type: 'success',
          title: 'Работа обновлена',
          message: 'Изображение и информация успешно обновлены'
        });
        emit('update:show', false);
      } else {
        throw new Error(result.error || 'Не удалось обновить работу');
      }
    } else {
      saveProgress.value = 80;
      
      const result = await galleryStore.updateItem(props.item.id, dataToSend);
      
      if (result.success) {
        saveProgress.value = 100;
        emit('saved', result.data);
        notificationStore.addNotification({
          type: 'success',
          title: 'Работа обновлена',
          message: 'Информация успешно обновлена'
        });
        emit('update:show', false);
      } else {
        throw new Error(result.error || 'Не удалось обновить работу');
      }
    }
  } catch (error) {
    console.error('Save error:', error);
    notificationStore.addNotification({
      type: 'error',
      title: 'Ошибка сохранения',
      message: error.message || 'Не удалось сохранить изменения'
    });
  } finally {
    isSaving.value = false;
    saveProgress.value = 0;
  }
};
</script>

<style scoped>
.edit-form {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .edit-form {
    grid-template-columns: 1fr;
  }
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-image {
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
}

.current-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-upload {
  margin-top: 1rem;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #f0f9ff;
}

.upload-area.drag-over {
  border-color: #4f46e5;
  background: #e0f2fe;
}

.upload-area .icon {
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.upload-area p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.file-hint {
  font-size: 0.75rem;
  color: #9ca3af;
}

.new-image-preview {
  margin-top: 1rem;
  text-align: center;
}

.new-image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.preview-actions {
  margin-top: 0.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
  width: auto;
}

.save-progress {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.save-progress .progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.save-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.save-progress p {
  margin: 0;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}
</style>