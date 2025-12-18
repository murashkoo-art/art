import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useNotificationStore } from './notification';

export const useGalleryStore = defineStore('gallery', () => {
  const items = ref([]);
  const publicItems = ref([]);
  const currentItem = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const searchQuery = ref('');
  const sortBy = ref('created_at');
  const sortOrder = ref('desc');
  const filterStatus = ref('all'); 

  // Для отслеживания загрузок
  const uploadProgress = ref({});
  const activeUploads = ref([]);
  const uploadHistory = ref([]);

  const notificationStore = useNotificationStore();

  // Полный URL для изображения
  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/uploads/')) {
      return `${window.location.origin}${url}`;
    }
    return url;
  };

  // Основной метод загрузки
  const uploadItems = async (files, itemsData = null, onProgress = null) => {
    const formData = new FormData();
    
    // Добавляем файлы
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Добавляем данные если есть
    if (itemsData && Array.isArray(itemsData)) {
      formData.append('items', JSON.stringify(itemsData));
    }
    
    // Создаем уведомление о начале загрузки
    const notificationId = notificationStore.createUploadNotification({
      totalFiles: files.length,
      files: files.map(f => ({ name: f.name, size: f.size }))
    });

    try {
      const response = await axios.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress, files.length, files.length);
            
            // Обновляем прогресс в уведомлении
            notificationStore.updateUploadProgress(notificationId, {
              progress,
              currentFile: Math.floor((progress / 100) * files.length),
              totalFiles: files.length,
              status: 'uploading'
            });
          }
        }
      });
      
      // Обновляем локальное состояние
      if (response.data.items && Array.isArray(response.data.items)) {
        const itemsWithFullUrls = response.data.items.map(item => ({
          ...item,
          image_url: getFullImageUrl(item.image_url)
        }));
        
        items.value.unshift(...itemsWithFullUrls);
      }
      
      // Обновляем уведомление
      notificationStore.updateUploadProgress(notificationId, {
        status: 'completed',
        progress: 100,
        currentFile: files,
                filesCompleted: files.length,
        totalFiles: files.length
      });

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Upload error:', err.response?.data);
      error.value = err.response?.data?.error || 'Failed to upload items';
      
      // Обновляем уведомление об ошибке
      notificationStore.updateUploadProgress(notificationId, {
        status: 'error',
        error: error.value
      });
      
      return { success: false, error: error.value };
    }
  };

  // Получение всех работ (публичных + пользовательских в зависимости от фильтра)
  const getItems = async (page = 1) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const params = {
        page,
        limit: 20,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        q: searchQuery.value,
        status: filterStatus.value
      };
      
      // Если фильтр "my", добавляем параметр для получения только своих работ
      if (filterStatus.value === 'my') {
        params.my = 'true';
      }
      
      const response = await axios.get('/gallery', { params });
      
      // Преобразуем URL изображений
      const itemsWithFullUrls = response.data.map(item => ({
        ...item,
        image_url: getFullImageUrl(item.image_url)
      }));
      
      if (page === 1) {
        items.value = itemsWithFullUrls;
      } else {
        items.value.push(...itemsWithFullUrls);
      }
      
      return { success: true, data: itemsWithFullUrls };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch gallery items';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // Получение одной работы
  const getItem = async (id) => {
    try {
      const response = await axios.get(`/gallery/${id}`);
      
      currentItem.value = {
        ...response.data,
        image_url: getFullImageUrl(response.data.image_url)
      };
      
      return { success: true, data: currentItem.value };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch item';
      return { success: false, error: error.value };
    }
  };

  // Создание работы (без файла)
  const createItem = async (itemData) => {
    try {
      const response = await axios.post('/gallery/upload', itemData);
      
      const newItem = {
        ...response.data,
        image_url: getFullImageUrl(response.data.image_url)
      };
      
      items.value.unshift(newItem);
      return { success: true, data: newItem };
    } catch (err) {
      console.error('Create item error:', err.response?.data);
      error.value = err.response?.data?.error || 'Failed to create item';
      return { success: false, error: error.value };
    }
  };

  // Обновление работы
  const updateItem = async (id, itemData) => {
    const isFormData = itemData instanceof FormData;
    
    try {
      const config = {
        headers: {}
      };
      
      if (isFormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
      
      const response = await axios.put(`/gallery/${id}`, itemData, config);
      
      const updatedItem = {
        ...response.data.data,
        image_url: getFullImageUrl(response.data.data.image_url)
      };
      
      // Обновляем в локальном хранилище
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = updatedItem;
      }
      
      return { success: true, data: updatedItem };
    } catch (err) {
      console.error('Update item error:', err.response?.data);
      error.value = err.response?.data?.error || 'Failed to update item';
      return { success: false, error: error.value, details: err.response?.data?.details };
    }
  };

  // Удаление работы
  const deleteItem = async (id) => {
    try {
      await axios.delete(`/gallery/${id}`);
      
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value.splice(index, 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Delete item error:', err.response?.data);
      error.value = err.response?.data?.error || 'Failed to delete item';
      return { success: false, error: error.value };
    }
  };

  // Поиск работ
  const searchItems = async (query) => {
    searchQuery.value = query;
    return await getItems(1);
  };

  // Сортировка
  const setSort = (by, order) => {
    sortBy.value = by;
    sortOrder.value = order;
    return getItems(1);
  };

  // Фильтрация
  const setFilter = (status) => {
    filterStatus.value = status;
    return getItems(1);
  };

  // Получение статистики
  const getStatistics = async () => {
    try {
      const response = await axios.get('/gallery/statistics');
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to get statistics:', err);
      return { success: false, error: err.message };
    }
  };

  // Валидация работы
  const validateItem = async (id) => {
    try {
      const response = await axios.put(`/gallery/${id}/validate`);
      
      const index = items.value.findIndex(item => item.id === id);
      if (index !== -1) {
        items.value[index] = response.data;
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Validate item error:', err);
      return { success: false, error: err.message };
    }
  };

  // Получение статистики загрузок
  const getUploadStats = () => {
    const total = uploadHistory.value.length;
    const successful = uploadHistory.value.filter(u => u.status === 'completed').length;
    const failed = uploadHistory.value.filter(u => u.status === 'error').length;
    
    return {
      total,
      successful,
      failed
    };
  };

  // Очистка истории загрузок
  const clearUploadHistory = () => {
    uploadHistory.value = [];
  };

  return {
    items,
    publicItems,
    currentItem,
    isLoading,
    error,
    searchQuery,
    sortBy,
    sortOrder,
    filterStatus,
    uploadProgress,
    activeUploads,
    uploadHistory,
    totalItems: computed(() => items.value.length),
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
    uploadItems,
    searchItems,
    setSort,
    setFilter,
    getStatistics,
    validateItem,
    getFullImageUrl,
    getUploadStats,
    clearUploadHistory
  };
});