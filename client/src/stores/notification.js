import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const error = ref(null);

  // Всплывающие уведомления (кратковременные
  const toastNotifications = ref([]);
  
  // Центр уведомлений (постоянные)
  const centerNotifications = ref([]);

  // Отслеживание активных загрузок
  const activeUploads = ref([]);
  
  // Отслеживание активных загрузок
  const uploadSessions = ref({});

  // Получение всех уведомлений
  const getNotifications = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/notifications');
      notifications.value = response.data;
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch notifications';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  // Получение счетчика непрочитанных
  const getUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread-count');
      unreadCount.value = response.data.count;
      return response.data.count;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  };

  // Отметить как прочитанное
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      
      // Обновляем локальное состояние
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications.value[index].is_read = true;
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Failed to mark as read:', err);
      return { success: false, error: err.message };
    }
  };

  // Отметить все как прочитанные
  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      
      // Обновляем локальное состояние
      notifications.value.forEach(notification => {
        notification.is_read = true;
      });
      unreadCount.value = 0;
      
      return { success: true };
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      return { success: false, error: err.message };
    }
  };

  // Удалить уведомление
  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      
      // Удаляем из локального состояния
      const index = notifications.value.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        if (!notifications.value[index].is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        notifications.value.splice(index, 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Failed to delete notification:', err);
      return { success: false, error: err.message };
    }
  };

  // Добавить toast-уведомление
  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || 'info',
      title: notification.title || 'Уведомление',
      message: notification.message,
      duration: notification.duration || 5000,
      timestamp: new Date(),
      isToast: true,
      isRead: false
    };

    toastNotifications.value.unshift(newNotification);

    // После показа в тосте добавляем в центр уведомлений (если это не уведомление о загрузке)
    if (notification.type !== 'upload') {
      const centerNotification = {
        ...newNotification,
        id: `local_${id}`,
        isToast: false,
        source: 'local'
      };
      
      centerNotifications.value.unshift(centerNotification);
    }

    // Автоматическое удаление через указанное время
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeToastNotification(id);
      }, newNotification.duration);
    }
  };

  // Удалить toast-уведомление
  const removeToastNotification = (id) => {
    const index = toastNotifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      toastNotifications.value.splice(index, 1);
    }
  };

  // Очистить все toast-уведомления
  const clearToastNotifications = () => {
    toastNotifications.value = [];
  };

  // Удалить уведомление из центра
  const removeCenterNotification = (id) => {
    if (id.startsWith('local_')) {
      // Удаляем локальное уведомление
      const index = centerNotifications.value.findIndex(n => n.id === id);
      if (index !== -1) {
        centerNotifications.value.splice(index, 1);
      }
    } else {
      // Удаляем серверное уведомление
      deleteNotification(id);
    }
  };

  // Отметить уведомление в центре как прочитанное
  const markCenterNotificationAsRead = (id) => {
    if (id.startsWith('local_')) {
      // Отмечаем локальное уведомление
      const index = centerNotifications.value.findIndex(n => n.id === id);
      if (index !== -1) {
        centerNotifications.value[index].isRead = true;
      }
    } else {
      // Отмечаем серверное уведомление
      markAsRead(id);
    }
  };

  // Создать уведомление о загрузке
  const createUploadNotification = (uploadData) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const uploadNotification = {
      id: uploadId,
      type: 'upload',
      title: 'Загрузка изображений',
      message: `Начата загрузка ${uploadData.totalFiles || 1} файлов`,
      timestamp: new Date(),
      isRead: false,
      source: 'upload',
      uploadData: {
        ...uploadData,
        id: uploadId,
        status: 'uploading',
        progress: 0,
        currentFile: 0,
        totalFiles: uploadData.totalFiles || 1,
        files: uploadData.files || [],
        startTime: Date.now(),
        createdAt: new Date().toISOString()
      }
    };

    // Добавляем в активные загрузки
    activeUploads.value.push(uploadNotification.uploadData);
    
    // Добавляем в центр уведомлений
    centerNotifications.value.unshift(uploadNotification);

    // Создаем toast-уведомление
    addNotification({
      type: 'info',
      title: 'Начата загрузка',
      message: `Загрузка ${uploadData.totalFiles || 1} изображений начата`,
      duration: 3000
    });

    return uploadId;
  };

  // Обновить прогресс загрузки
  const updateUploadProgress = (uploadId, progressData) => {
    const uploadIndex = activeUploads.value.findIndex(u => u.id === uploadId);
    if (uploadIndex !== -1) {
      const upload = activeUploads.value[uploadIndex];
      Object.assign(upload, progressData);
      upload.updatedAt = new Date().toISOString();
      
      // Обновляем в сессиях
      if (uploadSessions.value[uploadId]) {
        uploadSessions.value[uploadId] = upload;
        saveUploadSessionsToStorage();
      }

      // Обновляем соответствующее уведомление в центре
      const notificationIndex = centerNotifications.value.findIndex(n => 
        n.source === 'upload' && n.uploadData?.id === uploadId
      );
      
      if (notificationIndex !== -1) {
        const notification = centerNotifications.value[notificationIndex];
        notification.uploadData = upload;
        notification.message = getUploadMessage(upload);
        
        // Обновляем заголовок в зависимости от статуса
        if (upload.status === 'completed') {
          notification.title = 'Загрузка завершена';
          notification.type = 'success';
        } else if (upload.status === 'error') {
          notification.title = 'Ошибка загрузки';
          notification.type = 'error';
        }
      }

      // Если загрузка завершена, перемещаем из активных в историю
      if (upload.status === 'completed' || upload.status === 'error') {
        setTimeout(() => {
          const idx = activeUploads.value.findIndex(u => u.id === uploadId);
          if (idx !== -1) {
            activeUploads.value.splice(idx, 1);
          }
        }, 5000);

        // Удаляем сессию
        delete uploadSessions.value[uploadId];
        saveUploadSessionsToStorage();

        // Создаем финальное toast-уведомление
        if (upload.status === 'completed') {
          addNotification({
            type: 'success',
            title: 'Загрузка завершена',
            message: `Успешно загружено ${upload.filesCompleted || upload.totalFiles} из ${upload.totalFiles} файлов`,
            duration: 5000
          });
        }
      }
    }
  };

  // Получить сообщение для уведомления о загрузке
  const getUploadMessage = (upload) => {
    const { status, progress, currentFile, totalFiles, filesCompleted, error } = upload;
    
    switch (status) {
      case 'uploading':
        return `Загружено ${currentFile || 0}/${totalFiles} файлов (${progress || 0}%)`;
      case 'completed':
        return `Завершено: ${filesCompleted || totalFiles}/${totalFiles} файлов`;
      case 'error':
        return `Ошибка: ${error || 'Неизвестная ошибка'}`;
      default:
        return `Статус: ${status}`;
    }
  };

  // Отменить загрузку
  const cancelUpload = async (uploadId) => {
    const upload = activeUploads.value.find(u => u.id === uploadId);
    if (upload) {
      try {
        // Если есть возможность отменить на сервере
        if (upload.cancelToken) {
          console.log('Cancelling upload:', uploadId);
        }

        updateUploadProgress(uploadId, {
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        });

        addNotification({
          type: 'warning',
          title: 'Загрузка отменена',
          message: `Загрузка ${upload.totalFiles} файлов отменена`,
          duration: 3000
        });

        return true;
      } catch (err) {
        console.error('Error cancelling upload:', err);
        return false;
      }
    }
    return false;
  };

  // Получить активные загрузки
  const getActiveUploads = computed(() => {
    return activeUploads.value.filter(u => u.status === 'uploading');
  });

  // Получить недавние завершенные загрузки
  const getRecentCompletedUploads = computed(() => {
    const recent = centerNotifications.value.filter(n => 
      n.source === 'upload' && 
      n.uploadData?.status === 'completed' &&
      new Date() - new Date(n.timestamp) < 24 * 60 * 60 * 1000
    );
    return recent.slice(0, 10);
  });

  // Восстановить сессии загрузок
  const restoreUploadSessions = () => {
    try {
      const saved = localStorage.getItem('notification_upload_sessions');
      if (saved) {
        const sessions = JSON.parse(saved);
        
        const now = Date.now();
        Object.entries(sessions).forEach(([id, session]) => {
          if (now - new Date(session.createdAt).getTime() < 3600000) {
            uploadSessions.value[id] = session;
            
            // Если загрузка была в процессе, добавляем в активные
            if (session.status === 'uploading') {
              activeUploads.value.push(session);
              
              // Создаем уведомление для этой сессии
              const notification = {
                id: id,
                type: 'info',
                title: 'Загрузка в процессе',
                message: getUploadMessage(session),
                timestamp: new Date(session.createdAt),
                isRead: false,
                source: 'upload',
                uploadData: session
              };
              
              centerNotifications.value.unshift(notification);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error restoring upload sessions:', error);
    }
  };

  // Сохранить сессии в localStorage
  const saveUploadSessionsToStorage = () => {
    try {
      localStorage.setItem('notification_upload_sessions', JSON.stringify(uploadSessions.value));
    } catch (error) {
      console.error('Error saving upload sessions:', error);
    }
  };

  // Очистить старые сессии
  const cleanupOldSessions = () => {
    const now = Date.now();
    Object.keys(uploadSessions.value).forEach(id => {
      const session = uploadSessions.value[id];
      if (now - new Date(session.createdAt).getTime() > 3600000) {
        delete uploadSessions.value[id];
      }
    });
    saveUploadSessionsToStorage();
  };

  // Полный список уведомлений для центра
  const allCenterNotifications = computed(() => {
    const serverNotifs = notifications.value.map(n => ({
      ...n,
      id: n.id,
      type: n.type || 'info',
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at),
      source: 'server',
      isRead: n.is_read
    }));

    const localNotifs = centerNotifications.value.filter(n => n.source !== 'upload');
    const uploadNotifs = centerNotifications.value.filter(n => n.source === 'upload');

    const all = [...serverNotifs, ...localNotifs, ...uploadNotifs];
    return all.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  });

  // Счетчик непрочитанных в центре
  const unreadCenterCount = computed(() => {
    return allCenterNotifications.value.filter(n => !n.isRead).length;
  });

  // Инициализация
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('token')) {
      getUnreadCount();
    }
    restoreUploadSessions();
    // Очищаем старые сессии раз в час
    setInterval(cleanupOldSessions, 3600000);
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    toastNotifications,
    centerNotifications,
    activeUploads,
    uploadSessions,
    allCenterNotifications,
    unreadCenterCount,
    getActiveUploads,
    getRecentCompletedUploads,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    removeToastNotification,
    clearToastNotifications,
    removeCenterNotification,
    markCenterNotificationAsRead,
    createUploadNotification,
    updateUploadProgress,
    cancelUpload,
    restoreUploadSessions,
    cleanupOldSessions
  };
});