<template>
  <div class="gallery-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Галерея</h1>
        <p class="page-subtitle">Информационно-справочная система художественной галереи</p>
      </div>
      <div class="controls-panel">
        <div class="controls-left">
          <div class="search-box">
            <Icon name="search" :size="20" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по названию, описанию, художнику..."
              @input="onSearch"
              class="search-input"
            />
            <Button 
              v-if="searchQuery" 
              size="sm" 
              variant="ghost" 
              @click="clearSearch"
              class="clear-search-btn"
            >
              <Icon name="close" :size="24" />
            </Button>
          </div>
        </div>
        
        <div class="controls-right">
          <div class="sort-controls">
            <select v-model="sortBy" @change="onSortChange" class="sort-select">
              <option value="created_at">Дата добавления</option>
              <option value="title">Название</option>
              <option value="artist">Художник</option>
              <option value="year">Год</option>
            </select>
            
            <Button 
              @click="toggleSortOrder"
              size="sm" 
              variant="outline"
              class="sort-order-btn"
            >
              <Icon :name="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'" :size="24" />
            </Button>
          </div>
          
          <div class="filter-controls">
            <select v-model="filterStatus" @change="onFilterChange" class="filter-select">
              <option value="all">Все работы</option>
              <option value="valid">Валидные</option>
              <option value="invalid">На проверке</option>
              <option value="my">Мои работы</option>
            </select>
          </div>
          
          <Button @click="openUploadModal" class="add-btn">
            <Icon name="plus" :size="24" />
            Добавить работу
          </Button>
        </div>
      </div>
      <div v-if="statistics" class="statistics-panel">
        <div class="stat-item">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">Всего работ</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.valid }}</div>
          <div class="stat-label">Валидные</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.invalid }}</div>
          <div class="stat-label">На проверке</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalSize }}</div>
          <div class="stat-label">Общий размер</div>
        </div>
      </div>
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Загрузка галереи...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <Icon name="warning" :size="48" class="error-icon" />
        <p class="error-message">{{ error }}</p>
        <Button @click="loadGallery">Попробовать снова</Button>
      </div>
      <div v-else-if="items.length === 0" class="empty-state">
        <Icon name="logo" :size="64" class="empty-icon" />
        <p class="empty-message">
          {{ searchQuery ? 'По вашему запросу ничего не найдено' : 'В галерее пока нет работ' }}
        </p>
        <Button @click="openUploadModal" size="lg">Добавить первую работу</Button>
      </div>
      <div v-else class="gallery-grid">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="gallery-item"
          :class="{ 'invalid-item': !item.is_valid && filterStatus !== 'my' }"
          @click="openViewModal(item)"
        >
          <div class="item-image-container">
           <template v-if="showImage(item)">
              <img 
                :src="item.image_url" 
                :alt="item.title" 
                class="item-image"
                @error="handleImageError($event, item.id)"
              />
            </template>
            <div v-else class="image-error-placeholder">
              <Icon name="image" :size="48" />
            </div>
            
            <div v-if="!item.is_valid && filterStatus !== 'my'" class="invalid-badge">
              <Icon name="clock" :size="24" />
              <span>На проверке</span>
            </div>
            
            <div class="item-overlay">
              <div class="overlay-actions">
                <Button 
                  v-if="canEditItem(item)"
                  size="sm" 
                  variant="ghost" 
                  @click.stop="openEditModal(item)"
                  class="action-btn"
                >
                  <Icon name="edit" :size="48" />
                </Button>
                <Button 
                  v-if="canEditItem(item)"
                  size="sm" 
                  variant="ghost" 
                  @click.stop="deleteItem(item.id)"
                  class="action-btn"
                >
                  <Icon name="trash" :size="48" />
                </Button>
              </div>
            </div>
          </div>
          
          <div class="item-info">
            <h3 class="item-title">{{ item.title || 'Без названия' }}</h3>
            
            <div v-if="item.artist || item.year" class="item-meta">
              <span v-if="item.artist" class="artist">{{ item.artist }}</span>
              <span v-if="item.year" class="year">{{ item.year }}</span>
            </div>
            
            <p v-if="item.description" class="item-description">
              {{ truncateText(item.description, 100) }}
            </p>
            
            <div v-if="item.tags" class="item-tags">
              <span 
                v-for="tag in parseTags(item.tags)" 
                :key="tag"
                class="tag"
                @click.stop="searchByTag(tag)"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="items.length > 0 && items.length % 20 === 0" class="load-more">
        <Button 
          @click="loadMore" 
          variant="outline"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Загрузка...' : 'Загрузить еще' }}
        </Button>
      </div>
    </div>

    <!-- Модальное окно загрузки -->
    <UploadModal
      v-if="showUploadModal"
      :show="showUploadModal"
      @update:show="handleUploadModalUpdate"
      @close="closeUploadModal"
      @uploaded="handleUploadComplete"
    />
    
    <!-- Редактирование -->
    <EditGalleryModal
      v-if="showEditModal"
      :show="showEditModal"
      :item="editingItem"
      @update:show="handleEditModalUpdate"
      @close="closeEditModal"
      @saved="handleEditSave"
    />
    
    <!-- Просмотр -->
    <ViewModal
      v-if="showViewModal"
      :show="showViewModal"
      :item="viewingItem"
      @update:show="handleViewModalUpdate"
      @close="closeViewModal"
      @edit="openEditModalFromView"
    />

    <!-- прогресс загрузки -->
    <UploadProgress />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGalleryStore } from '@/stores/gallery';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import Button from '@/components/common/Button.vue';
import Icon from '@/components/common/Icon.vue';
import UploadModal from '@/components/common/UploadModal.vue';
import UploadProgress from '@/components/common/UploadProgress.vue';
import ViewModal from '@/pages/gallery/ViewModal.vue';
import EditGalleryModal from '@/pages/gallery/EditGalleryModal.vue';

const imageErrors = ref({});
const galleryStore = useGalleryStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// Состояния
const searchQuery = ref('');
const sortBy = ref('created_at');
const sortOrder = ref('desc');
const filterStatus = ref('all');
const showUploadModal = ref(false);
const showEditModal = ref(false);
const showViewModal = ref(false);
const editingItem = ref(null);
const viewingItem = ref(null);
const statistics = ref(null);
const page = ref(1);

// Вычисления
const items = computed(() => galleryStore.items);
const isLoading = computed(() => galleryStore.isLoading);
const error = computed(() => galleryStore.error);

const canEditItem = (item) => {
  return authStore.user && authStore.user.id === item.user_id;
};

onMounted(async () => {
  await loadGallery();
  await loadStatistics();
});

const loadGallery = async () => {
  page.value = 1;
  await galleryStore.getItems(page.value);
};

const loadStatistics = async () => {
  if (authStore.user) {
    const result = await galleryStore.getStatistics();
    if (result.success) {
      statistics.value = result.data;
    }
  }
};

const onSearch = debounce(() => {
  page.value = 1;
  galleryStore.searchItems(searchQuery.value);
}, 300);

const clearSearch = () => {
  searchQuery.value = '';
  galleryStore.searchItems('');
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  onSortChange();
};

const onSortChange = () => {
  page.value = 1;
  galleryStore.setSort(sortBy.value, sortOrder.value);
};

const onFilterChange = () => {
  page.value = 1;
  galleryStore.setFilter(filterStatus.value);
};

const openUploadModal = () => {
  showUploadModal.value = true;
};

const handleUploadModalUpdate = (value) => {
  showUploadModal.value = value;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const openViewModal = (item) => {
  viewingItem.value = item;
  showViewModal.value = true;
};

const handleViewModalUpdate = (value) => {
  showViewModal.value = value;
  if (!value) {
    viewingItem.value = null;
  }
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingItem.value = null;
};

const openEditModal = (item) => {
  editingItem.value = item;
  showEditModal.value = true;
};

const handleEditModalUpdate = (value) => {
  showEditModal.value = value;
  if (!value) {
    editingItem.value = null;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingItem.value = null;
};

const openEditModalFromView = (item) => {
  closeViewModal();
  openEditModal(item);
};

const handleEditSave = (updatedItem) => {
  const index = galleryStore.items.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    galleryStore.items[index] = updatedItem;
  }
  
  loadStatistics();
  
  notificationStore.addNotification({
    type: 'success',
    title: 'Работа обновлена',
    message: 'Информация о работе успешно обновлена'
  });
  
  closeEditModal();
};

const handleUploadComplete = (uploadedItems) => {
  loadGallery();
  loadStatistics();
  
  notificationStore.addNotification({
    type: 'success',
    title: 'Загрузка завершена',
    message: `Успешно загружено ${uploadedItems?.length || 0} файлов`
  });
  
  closeUploadModal();
};

const deleteItem = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить эту работу?')) {
    return;
  }

  try {
    const result = await galleryStore.deleteItem(id);
    
    if (result.success) {
      notificationStore.addNotification({
        type: 'success',
        title: 'Работа удалена',
        message: 'Работа успешно удалена из галереи'
      });
      
      await loadGallery();
      await loadStatistics();
    }
  } catch (err) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Ошибка',
      message: 'Не удалось удалить работу'
    });
  }
};

const searchByTag = (tag) => {
  searchQuery.value = tag;
  onSearch();
};

const loadMore = async () => {
  page.value += 1;
  await galleryStore.getItems(page.value);
};

const truncateText = (text, length) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

const parseTags = (tagsString) => {
  if (!tagsString) return [];
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
};

const showImage = (item) => {
  return !imageErrors.value[item.id];
};

const handleImageError = (event, itemId) => {
  imageErrors.value[itemId] = true;
  console.warn(`Image load error for item ${itemId}:`, event.target.src);
};

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
</script>

<style scoped>
.gallery-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #6b7280;
}

.controls-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.controls-left {
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
}

.controls-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-select {
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.sort-order-btn {
  padding: 0.5rem;
}

.filter-controls .filter-select {
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
}

.add-btn:hover {
  background: linear-gradient(135deg, #4338ca, #6d28d9);
}

.statistics-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-message {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.gallery-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-item.invalid-item {
  opacity: 0.7;
}

.item-image-container {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover .item-image {
  transform: scale(1.05);
}

.invalid-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(245, 158, 11, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-item:hover .item-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  border: none;
}

.action-btn:hover {
  background: white;
}

.item-info {
  padding: 1rem;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.artist {
  font-style: italic;
}

.year {
  color: #9ca3af;
}

.item-description {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tag:hover {
  background: #e5e7eb;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}
</style>