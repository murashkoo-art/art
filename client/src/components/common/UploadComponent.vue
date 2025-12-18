<template>
  <div class="upload-component">
    <div class="multiple-upload">
      <div 
        class="upload-area"
        @click="triggerFileInput"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDropMultiple"
        :class="{ 'drag-over': dragOver }"
      >
        <input
          ref="fileInput"
          type="file"
          :accept="accept"
          multiple
          @change="handleMultipleFileSelect"
          :disabled="disabled"
          style="display: none"
        />
        <div class="upload-icon">
          <Icon name="upload" :size="48" />
        </div>
        <p class="upload-text">Нажмите или перетащите файлы для загрузки</p>
        <p class="upload-hint">Максимальный размер: {{ maxSizeMB }}MB на файл</p>
      </div>

      <div v-if="files.length > 0" class="files-list">
        <div v-for="(file, index) in files" :key="index" class="file-item">
          <div class="file-preview">
            <img v-if="file.preview" :src="file.preview" alt="" />
            <div v-else class="file-icon">
              <Icon name="file" :size="32" />
            </div>
          </div>
          <div class="file-info">
            <p class="file-name">{{ file.name }}</p>
            <p class="file-size">{{ formatFileSize(file.size) }}</p>
            
            <!-- Поля для информации о файле -->
            <div v-if="withFields" class="file-fields">
              <div class="form-group">
                <input
                  v-model="file.title"
                  placeholder="Название"
                  class="field-input"
                  :disabled="disabled"
                  @input="updateField(index, 'title', $event.target.value)"
                />
              </div>
              <div class="form-group">
                <textarea
                  v-model="file.description"
                  placeholder="Описание"
                  rows="2"
                  class="field-input"
                  :disabled="disabled"
                  @input="updateField(index, 'description', $event.target.value)"
                ></textarea>
              </div>
              <div class="form-group">
                <input
                  v-model="file.artist"
                  placeholder="Художник"
                  class="field-input"
                  :disabled="disabled"
                  @input="updateField(index, 'artist', $event.target.value)"
                />
              </div>
              <div class="form-group">
                <input
                  v-model="file.year"
                  placeholder="Год"
                  type="number"
                  class="field-input"
                  :disabled="disabled"
                  @input="updateField(index, 'year', $event.target.value)"
                />
              </div>
              <div class="form-group">
                <input
                  v-model="file.tags"
                  placeholder="Теги (через запятую)"
                  class="field-input"
                  :disabled="disabled"
                  @input="updateField(index, 'tags', $event.target.value)"
                />
              </div>
            </div>
          </div>
          <div class="file-actions">
            <button @click="removeFile(index)" class="remove-btn" :disabled="disabled">
              <Icon name="trash" :size="24" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="progress-text">{{ uploadProgress }}%</p>
    </div>

    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Icon from './Icon.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'multiple',
    validator: (value) => ['single', 'multiple'].includes(value)
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSizeMB: {
    type: Number,
    default: 10
  },
  withFields: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: [File, Array],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'files-updated']);

const fileInput = ref(null);
const dragOver = ref(false);
const files = ref([]);
const uploadProgress = ref(0);
const error = ref('');

const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value.click();
  }
};

const handleMultipleFileSelect = (event) => {
  const fileList = Array.from(event.target.files);
  const validFiles = fileList.filter(file => validateFile(file));
  processMultipleFiles(validFiles);
};

const handleDropMultiple = (event) => {
  dragOver.value = false;
  const fileList = Array.from(event.dataTransfer.files);
  const validFiles = fileList.filter(file => validateFile(file));
  processMultipleFiles(validFiles);
};

const validateFile = (file) => {
  error.value = '';
  
  if (!file) return false;
  
  // Проверка типа файла
  if (!file.type.match('image.*')) {
    error.value = 'Разрешены только изображения';
    return false;
  }
  
  // Проверка размера файла
  const maxSize = props.maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    error.value = `Размер файла не должен превышать ${props.maxSizeMB}MB`;
    return false;
  }
  
  return true;
};

const processMultipleFiles = (fileList) => {
  const newFiles = fileList.map(file => {
    const preview = URL.createObjectURL(file);
    return {
      file,
      name: file.name,
      size: file.size,
      preview,
      title: '',
      description: '',
      artist: '',
      year: '',
      tags: ''
    };
  });
  
  files.value = [...files.value, ...newFiles];
  emitFilesUpdate();
};

const updateField = (index, field, value) => {
  files.value[index][field] = value;
  emitFilesUpdate();
};

const emitFilesUpdate = () => {
  const fileData = files.value.map(f => ({
    file: f.file,
    title: f.title,
    description: f.description,
    artist: f.artist,
    year: f.year,
    tags: f.tags
  }));
  emit('files-updated', fileData);
  emit('update:modelValue', files.value.map(f => f.file));
};

const removeFile = (index) => {
  if (files.value[index].preview) {
    URL.revokeObjectURL(files.value[index].preview);
  }
  files.value.splice(index, 1);
  emitFilesUpdate();
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const reset = () => {
  files.value = [];
  error.value = '';
  uploadProgress.value = 0;
  emit('update:modelValue', null);
  emit('files-updated', []);
};

defineExpose({ reset });

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    reset();
  }
}, { immediate: true });
</script>

<style scoped>
.upload-component {
  width: 100%;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s ease;
  background-color: #fafafa;
}

.upload-area.drag-over {
  border-color: #4f46e5;
  background-color: #f0f9ff;
}

.upload-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.875rem;
  color: #9ca3af;
}

.files-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
}

.file-preview {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 4px;
  color: #9ca3af;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
  word-break: break-all;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.file-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

.field-input {
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.field-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.file-actions {
  display: flex;
  align-items: flex-start;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background-color: #fee2e2;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4f46e5;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-top: 0.25rem;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  color: #dc2626;
  font-size: 0.875rem;
}
</style>