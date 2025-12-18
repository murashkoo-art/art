<template>
  <div class="notification-center" v-click-outside="closeDropdown">
    <div class="notification-badge" @click="toggleDropdown">
      <Icon name="bell" :size="24" />
      <span v-if="unreadCenterCount > 0" class="badge-count">
        {{ unreadCenterCount > 99 ? '99+' : unreadCenterCount }}
      </span>
      <span 
        v-if="activeUploadsCount > 0" 
        class="upload-indicator"
        :title="`${activeUploadsCount} активных загрузок`"
      >
        <Icon name="loader" :size="12" />
      </span>
    </div>

    <div v-if="isDropdownOpen" class="notification-dropdown">
      <div class="notification-header">
        <h3>Уведомления</h3>
        <div class="notification-actions">
          <button 
            v-if="unreadCenterCount > 0" 
            class="mark-all-read" 
            @click="markAllAsRead"
            :disabled="notificationStore.isLoading"
          >
            Отметить все как прочитанные
          </button>
          <button class="close-dropdown" @click="closeDropdown">
            <Icon name="close" :size="16" />
          </button>
        </div>
      </div>

      <div v-if="activeUploadsCount > 0" class="uploads-section">
        <h4 class="section-title">
          <Icon name="upload" :size="16" />
          Активные загрузки ({{ activeUploadsCount }})
        </h4>
        <div class="uploads-list">
          <div 
            v-for="upload in notificationStore.getActiveUploads" 
            :key="upload.id"
            class="upload-item"
          >
            <div class="upload-header">
              <div class="upload-title">
                Загрузка {{ upload.totalFiles }} файлов
              </div>
              <div class="upload-status">
                <span class="status-badge uploading">
                  Загружается
                </span>
              </div>
            </div>
            
            <div class="upload-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${upload.progress || 0}%` }"
                ></div>
              </div>
              <div class="progress-info">
                <span class="progress-text">
                  {{ getProgressText(upload) }}
                </span>
                <span class="progress-percent">
                  {{ upload.progress || 0 }}%
                </span>
              </div>
            </div>
            
            <div class="upload-actions">
              <button 
                class="action-btn cancel-btn"
                @click="cancelUpload(upload.id)"
                title="Отменить"
              >
                <Icon name="x" :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="notification-list">
        <div v-if="notificationStore.isLoading" class="notification-loading">
          Загрузка...
        </div>
        
        <div v-else-if="filteredNotifications.length === 0 && activeUploadsCount === 0" 
             class="notification-empty">
          Нет уведомлений
        </div>
        
        <div v-else class="notifications-container">
          <div 
            v-for="notification in filteredNotifications" 
            :key="notification.id"
            :class="[
              'notification-item', 
              { 
                'notification-unread': !notification.isRead,
                'notification-local': notification.source === 'local',
                'notification-upload': notification.source === 'upload'
              }
            ]"
            @click="toggleNotification(notification)"
          >
            <div class="notification-icon" :class="`icon-${notification.type}`">
              <div class="icon-circle">
                <Icon 
                  :name="getIconName(notification.type)" 
                  :size="12" 
                  :color="getIconColor(notification.type)"
                />
              </div>
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-meta">
                <span class="notification-time">
                  {{ formatTime(notification.timestamp) }}
                </span>
                <span v-if="notification.source === 'local'" class="notification-source">
                  инфо.
                </span>
              </div>
            </div>
            
            <div class="notification-actions">
              <button 
                v-if="!notification.isRead"
                class="mark-read-btn"
                @click.stop="markAsRead(notification.id)"
                title="Отметить как прочитанное"
              >
                <Icon name="check" :size="12" />
              </button>
              
              <button 
                class="delete-btn"
                @click.stop="deleteNotification(notification.id)"
                title="Удалить"
              >
                <Icon name="close" :size="12" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-notifications">
      <transition-group name="notification-slide">
        <div 
          v-for="toast in toastNotifications" 
          :key="toast.id"
          :class="['toast-notification', `toast-${toast.type}`]"
        >
          <div class="toast-content">
            <div class="toast-icon">
              <Icon 
                :name="getIconName(toast.type)" 
                :size="20" 
                :color="getIconColor(toast.type)"
              />
            </div>
            <div class="toast-text">
              <div class="toast-title">{{ toast.title }}</div>
              <div class="toast-message">{{ toast.message }}</div>
            </div>
          </div>
          <button 
            class="toast-close"
            @click="removeToastNotification(toast.id)"
          >
            <Icon name="close" :size="16" />
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import Icon from '@/components/common/Icon.vue';

const props = defineProps({
  maxNotifications: {
    type: Number,
    default: 20
  }
});

const notificationStore = useNotificationStore();
const isDropdownOpen = ref(false);

// Вычисления
const filteredNotifications = computed(() => {
  return notificationStore.allCenterNotifications.slice(0, props.maxNotifications);
});

const toastNotifications = computed(() => 
  notificationStore.toastNotifications.slice(0, 5)
);

const unreadCenterCount = computed(() => notificationStore.unreadCenterCount);
const activeUploadsCount = computed(() => notificationStore.getActiveUploads.length);

// Методы
const toggleDropdown = async () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  
  if (isDropdownOpen.value) {
    await notificationStore.getNotifications();
  }
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const toggleNotification = async (notification) => {
  if (!notification.isRead) {
    await markAsRead(notification.id);
  }
};

const markAsRead = async (notificationId) => {
  await notificationStore.markCenterNotificationAsRead(notificationId);
};

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead();
};

const deleteNotification = async (notificationId) => {
  await notificationStore.removeCenterNotification(notificationId);
};

const removeToastNotification = (id) => {
  notificationStore.removeToastNotification(id);
};

const cancelUpload = async (uploadId) => {
  if (confirm('Вы уверены, что хотите отменить загрузку?')) {
    await notificationStore.cancelUpload(uploadId);
  }
};

const getProgressText = (upload) => {
  if (upload.status === 'uploading') {
    return `Файл ${upload.currentFile || 0}/${upload.totalFiles}`;
  }
  return '';
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} д назад`;
  
  return date.toLocaleDateString();
};

const getIconName = (type) => {
  const icons = {
    success: 'check',
    error: 'alert-circle',
    warning: 'alert-circle',
    info: 'bell',
    upload: 'upload-cloud'
  };
  return icons[type] || 'bell';
};

const getIconColor = (type) => {
  const colors = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
    upload: 'var(--color-primary)'
  };
  return colors[type] || 'currentColor';
};

// Список новых уведомления
let pollInterval;

onMounted(() => {
  if (localStorage.getItem('token')) {
    notificationStore.getUnreadCount();
    
    pollInterval = setInterval(() => {
      notificationStore.getUnreadCount();
    }, 30000);
  }
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});


const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
@import "@/styles/notification-center.css";
</style>