<template>
  <BaseModal
    :show="show"
    @update:show="$emit('update:show', $event)"
    @close="$emit('close')"
    :title="item.title || 'Без названия'"
    size="xl"
    :close-on-overlay="true"
    :close-on-esc="true"
    :show-footer="true"
  >
    <div class="view-container">
      <div class="image-viewer">
        <img :src="item.image_url" :alt="item.title" class="main-image" />
      </div>
      
      <div class="details-panel">
        <div class="detail-section">
          <h3>Информация о работе</h3>
          
          <div class="detail-item" v-if="item.artist">
            <span class="detail-label">Художник:</span>
            <span class="detail-value">{{ item.artist }}</span>
          </div>
          
          <div class="detail-item" v-if="item.year">
            <span class="detail-label">Год создания:</span>
            <span class="detail-value">{{ item.year }}</span>
          </div>
          
          <div class="detail-item" v-if="item.created_at">
            <span class="detail-label">Добавлено:</span>
            <span class="detail-value">{{ formatDate(item.created_at) }}</span>
          </div>
          
          <div class="detail-item" v-if="item.user">
            <span class="detail-label">Автор:</span>
            <span class="detail-value">{{ item.user.name || item.user.email }}</span>
          </div>
        </div>
        
        <div class="detail-section" v-if="item.description">
          <h3>Описание</h3>
          <p class="description">{{ item.description }}</p>
        </div>
        
        <div class="detail-section" v-if="item.tags">
          <h3>Теги</h3>
          <div class="tags">
            <span 
              v-for="tag in parseTags(item.tags)" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        
        <div class="detail-section" v-if="!item.is_valid">
          <div class="validation-notice">
            <Icon name="alert-circle" :size="20" />
            <p>Эта работа находится на проверке.</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="$emit('close')">Закрыть</Button>
      <Button @click="edit" v-if="canEdit">Редактировать</Button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';
import Button from '@/components/common/Button.vue';
import Icon from '@/components/common/Icon.vue';
import { useAuthStore } from '@/stores/auth';

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

const emit = defineEmits(['update:show', 'close', 'edit']);

const authStore = useAuthStore();

const canEdit = computed(() => {
  return authStore.user && authStore.user.id === props.item.user_id;
});

const edit = () => {
  emit('edit', props.item);
};

const parseTags = (tagsString) => {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.view-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  min-height: 400px;
}

@media (max-width: 768px) {
  .view-container {
    grid-template-columns: 1fr;
  }
}

.image-viewer {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.main-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.details-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
}

.detail-label {
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

.detail-value {
  color: #6b7280;
  text-align: right;
  margin-left: 1rem;
}

.description {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.validation-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
}

.validation-notice .icon {
  color: #d97706;
  flex-shrink: 0;
}

.validation-notice p {
  color: #92400e;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>