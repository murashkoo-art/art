<template>
  <div class="profile-stats">
    <div class="stats-header">
      <h3 class="stats-title">Статистика</h3>
      <div class="stats-refresh">
        <button 
          class="refresh-btn" 
          @click="refreshStats"
          :disabled="loading"
          :title="lastUpdated ? `Last updated: ${formatTime(lastUpdated)}` : 'Refresh'"
        >
          <Icon 
            name="refresh" 
            :size="16" 
            :class="{ 'refreshing': loading }" 
          />
        </button>
      </div>
    </div>

    <div class="stats-content">
      <!-- Основная информация пользователя -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="user" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Статус аккаунта</div>
            <div class="stat-value">
              <span :class="`status-${accountStatus}`">{{ accountStatusText }}</span>
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="role" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Роль</div>
            <div class="stat-value">
              <span :class="`role-badge role-${authStore.userRole}`">
                {{ authStore.userRole }}
              </span>
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="calendar" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Дата регистрации</div>
            <div class="stat-value">
              {{ formatDate(userStats.user?.member_since) }}
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="login" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Последний вход</div>
            <div class="stat-value">
              {{ formatTime(userStats?.user?.last_login) || 'Never' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика активности -->
      <div class="stats-section">
        <h4 class="section-title">Активность</h4>
        
        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="bell" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Непрочитанные уведомления</div>
            <div class="stat-value">
              <span class="notification-count">{{ userStats?.notifications?.unread || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="notification" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Всего уведомлений</div>
            <div class="stat-value">
              {{ userStats?.notifications?.total || 0 }}
            </div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <Icon name="email" :size="20" />
          </div>
          <div class="stat-info">
            <div class="stat-label">Email</div>
            <div class="stat-value">
              <span :class="`email-status ${authStore.user?.email_verified ? 'Подтверждён' : 'Не подтверждён'}`">
                {{ authStore.user?.email_verified ? 'Подтверждён' : 'Не подтверждён' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика для администратора -->
      <div v-if="isAdmin && adminStats" class="stats-section admin-stats">
        <h4 class="section-title">Системная информация</h4>
        
        <!-- Общая статистика системы -->
        <div class="admin-grid">
          <div class="admin-stat-card">
            <div class="admin-stat-header">
              <Icon name="users" :size="24" class="admin-stat-icon" />
              <h5>Пользователи</h5>
            </div>
            <div class="admin-stat-content">
              <div class="admin-stat-row">
                <span>Всего</span>
                <span class="admin-stat-value">{{ adminStats.users?.total || 0 }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Активные</span>
                <span class="admin-stat-value">{{ adminStats.users?.active || 0 }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Верифицированные</span>
                <span class="admin-stat-value">{{ adminStats.users?.verified || 0 }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Администраторы</span>
                <span class="admin-stat-value">{{ adminStats.users?.admins || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-header">
              <Icon name="bell" :size="24" class="admin-stat-icon" />
              <h5>Уведомления</h5>
            </div>
            <div class="admin-stat-content">
              <div class="admin-stat-row">
                <span>Всего</span>
                <span class="admin-stat-value">{{ adminStats.notifications?.total || 0 }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Непрочитанные</span>
                <span class="admin-stat-value">{{ adminStats.notifications?.unread || 0 }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Получены сегодня</span>
                <span class="admin-stat-value">{{ adminStats.notifications?.today || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-header">
              <Icon name="database" :size="24" class="admin-stat-icon" />
              <h5>База данных</h5>
            </div>
            <div class="admin-stat-content">
              <div class="admin-stat-row">
                <span>Таблицы</span>
                <span class="admin-stat-value">{{ adminStats.database?.table_count || 0 }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Всего строк</span>
                <span class="admin-stat-value">{{ formatNumber(adminStats.database?.total_rows || 0) }}</span>
              </div>
            </div>
          </div>

          <div class="admin-stat-card">
            <div class="admin-stat-header">
              <Icon name="chart" :size="24" class="admin-stat-icon" />
              <h5>Сервер</h5>
            </div>
            <div class="admin-stat-content">
              <div class="admin-stat-row">
                <span>Использование памяти</span>
                <span class="admin-stat-value">{{ adminStats.system?.memory_usage || '0%' }}</span>
              </div>
              <div class="admin-stat-row">
                <span>Время работы</span>
                <span class="admin-stat-value">{{ adminStats.system?.uptime || '0d' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Распределение по ролям -->
        <div class="stats-section" v-if="adminStats.roles && adminStats.roles.length > 0">
          <h5>Распределение пользователей по ролям</h5>
          <div class="role-distribution">
            <div 
              v-for="role in adminStats.roles" 
              :key="role.name"
              class="role-item"
              :style="{ width: `${role.percentage}%` }"
              :class="`role-${role.name}`"
            >
              <div class="role-label">{{ role.name }}</div>
              <div class="role-count">{{ role.count }}</div>
            </div>
          </div>
          <div class="role-legend">
            <div 
              v-for="role in adminStats.roles" 
              :key="role.name"
              class="legend-item"
            >
              <span class="legend-color" :class="`role-${role.name}`"></span>
              <span class="legend-text">{{ role.name }}: {{ role.count }} ({{ role.percentage }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="errorMessage" class="error-message">
        <Icon name="error" :size="20" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Сообщение о загрузке -->
      <div v-if="loading" class="loading-message">
        <Icon name="spinner" :size="20" class="spinning" />
        <span>Loading statistics...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import Icon from '@/components/common/Icon.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const loading = ref(false);
const lastUpdated = ref(null);
const errorMessage = ref('');
const userStats = ref(null);
const adminStats = ref(null);

const isAdmin = computed(() => authStore.userRole === 'admin');

const accountStatus = computed(() => {
  const user = authStore.user;
  if (!user) return 'inactive';
  
  if (!user.is_active) return 'inactive';
  if (!user.email_verified) return 'unverified';
  return 'active';
});

const accountStatusText = computed(() => {
  const status = accountStatus.value;
  const texts = {
    active: 'Активен',
    inactive: 'Не активен',
    unverified: 'Не подтверждён'
  };
  return texts[status] || 'Unknown';
});

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
      });
  } catch (e) {
    return 'Неверная дата';
  }
};

// Форматирование времени
const formatTime = (dateString) => {
  if (!dateString) return 'Никогда';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return formatDate(dateString);
  } catch (e) {
    return 'Неверная дата';
  }
};

// Форматирование чисел
const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Иконка для уведомлений
const getNotificationIcon = (type) => {
  const icons = {
    success: 'check',
    warning: 'warning',
    error: 'error',
    info: 'info'
  };
  return icons[type] || 'bell';
};

// Загрузка статистики
const loadStats = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const token = authStore.token;
    
    // Загрузка пользовательской статистики
    const userStatsResponse = await fetch('/api/stats/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userStatsResponse.ok) {
      const data = await userStatsResponse.json();
      userStats.value = data.data;
    } else {
      throw new Error(`Failed to load user stats: ${userStatsResponse.status}`);
    }

    // Загрузка админской статистики (если админ)
    if (isAdmin.value) {
      const adminStatsResponse = await fetch('/api/stats/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (adminStatsResponse.ok) {
        const data = await adminStatsResponse.json();
        adminStats.value = data.data;
      } else {
        console.warn('Failed to load admin stats, skipping...');
      }
    }

    lastUpdated.value = new Date();
  } catch (error) {
    console.error('Failed to load stats:', error);
    errorMessage.value = 'Unable to load statistics. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Обновление статистики
const refreshStats = async () => {
  await loadStats();
};

// Автообновление каждые 5 минут
let refreshInterval;

onMounted(async () => {
  await loadStats();
  
  refreshInterval = setInterval(() => {
    if (!loading.value) {
      loadStats();
    }
  }, 5 * 60 * 1000); 
});

// Очистка интервала
import { onUnmounted } from 'vue';
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.profile-stats {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  height: 100%;
  overflow-y: auto;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-gray-200);
}

.stats-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.stats-refresh .refresh-btn {
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.stats-refresh .refresh-btn:hover:not(:disabled) {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
  transform: rotate(90deg);
}

.stats-refresh .refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refreshing {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.stats-section {
  margin-bottom: var(--spacing-6);
}

.stats-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-gray-200);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-gray-800);
}

.status-active {
  color: var(--color-success);
  background-color: rgba(76, 201, 240, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-inactive {
  color: var(--color-danger);
  background-color: rgba(247, 37, 133, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-unverified {
  color: var(--color-warning);
  background-color: rgba(248, 150, 30, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.role-badge {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
}

.role-user {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.role-admin {
  background-color: rgba(247, 37, 133, 0.1);
  color: var(--color-danger);
}

.role-moderator {
  background-color: rgba(72, 149, 239, 0.1);
  color: var(--color-info);
}

.notification-count {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  background-color: var(--color-danger);
  color: var(--color-white);
  border-radius: var(--radius-full);
  text-align: center;
  line-height: 24px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 0 6px;
}

.email-status {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.email-status.verified {
  background-color: rgba(76, 201, 240, 0.1);
  color: var(--color-success);
}

.email-status.unverified {
  background-color: rgba(248, 150, 30, 0.1);
  color: var(--color-warning);
}

.notification-types {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.notification-type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.notification-type-item:last-child {
  border-bottom: none;
}

.type-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
}

.type-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.type-dot.type-success {
  background-color: var(--color-success);
}

.type-dot.type-warning {
  background-color: var(--color-warning);
}

.type-dot.type-error {
  background-color: var(--color-danger);
}

.type-dot.type-info {
  background-color: var(--color-info);
}

.type-count {
  font-weight: 600;
  color: var(--color-gray-800);
}

.recent-notifications {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.recent-notification-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  background-color: var(--color-gray-50);
  border-left: 3px solid var(--color-gray-300);
  transition: all var(--transition-fast);
}

.recent-notification-item:hover {
  background-color: var(--color-gray-100);
}

.recent-notification-item.unread {
  background-color: rgba(72, 149, 239, 0.05);
  border-left-color: var(--color-info);
}

.recent-notification-item.unread:hover {
  background-color: rgba(72, 149, 239, 0.1);
}

.recent-notification-item .notification-icon {
  color: var(--color-gray-500);
  flex-shrink: 0;
}

.recent-notification-item.unread .notification-icon {
  color: var(--color-info);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: var(--font-size-sm);
  color: var(--color-gray-800);
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.admin-stats {
  background-color: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.admin-stat-card {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  border: 1px solid var(--color-gray-200);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.admin-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.admin-stat-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-gray-200);
}

.admin-stat-header h5 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.admin-stat-icon {
  color: var(--color-primary);
}

.admin-stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.admin-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
}

.admin-stat-row span:first-child {
  color: var(--color-gray-600);
}

.admin-stat-value {
  font-weight: 600;
  color: var(--color-gray-800);
}

.role-distribution {
  display: flex;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: var(--spacing-3) 0;
  border: 1px solid var(--color-gray-200);
}

.role-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  transition: width var(--transition-fast);
  overflow: hidden;
  min-width: 40px;
}

.role-item.user {
  background-color: var(--color-gray-600);
}

.role-item.admin {
  background-color: var(--color-danger);
}

.role-item.moderator {
  background-color: var(--color-info);
}

.role-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-count {
  font-size: 12px;
}

.role-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  font-size: var(--font-size-xs);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
}

.legend-color.role-user {
  background-color: var(--color-gray-600);
}

.legend-color.role-admin {
  background-color: var(--color-danger);
}

.legend-color.role-moderator {
  background-color: var(--color-info);
}

.legend-text {
  color: var(--color-gray-700);
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background-color: rgba(247, 37, 133, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-4);
}

.loading-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background-color: rgba(72, 149, 239, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-info);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-4);
}

.spinning {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .profile-stats {
    padding: var(--spacing-4);
  }
  
  .admin-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-title {
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
  
  .stat-icon {
    align-self: flex-start;
  }
}
</style>