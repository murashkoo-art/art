<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <h1 class="profile-title">Профиль</h1>
        <p class="profile-subtitle">Управление настройками учетной записи</p>
      </div>
      
      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="sidebar-nav">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['sidebar-item', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              <Icon :name="tab.icon" class="sidebar-icon" />
              <span class="sidebar-label">{{ tab.label }}</span>
            </button>

            
          </div>
          <div class="sidebar-footer">
            <Button fullWidth="{{ true }}" variant="outline" @click="authStore.logout()" class="mt-6">
              <Icon name="logout" :size="24" />
              Выйти
            </Button>
          </div>
        </div>
        
        <div class="profile-main">
          <!-- Панель профиля -->
          <div v-if="activeTab === 'info'" class="profile-tab">
            <div class="tab-header">
              <h2 class="tab-title">Информация профиля</h2>
              <p class="tab-subtitle">Обновите свои личные данные</p>
            </div>
            
            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="avatar-section">
                <div class="avatar-preview">
                  <div class="avatar-large">
                    <span class="avatar-text-large">
                      {{ userInitials }}
                    </span>
                  </div>
                </div>
                <div class="avatar-actions">
                  <Button type="button" variant="outline" size="sm" @click="openUploadModal">
                    Загрузить фото
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    Удалить
                  </Button>
                </div>
              </div>
              
              <div class="form-grid">
                <InputField
                  v-model="profileForm.first_name"
                  type="text"
                  label="Имя"
                  placeholder="Введите ваше имя"
                />
                
                <InputField
                  v-model="profileForm.last_name"
                  type="text"
                  label="Фамилия"
                  placeholder="Введите вашу фамилию"
                />
                
                <InputField
                  v-model="profileForm.username"
                  type="text"
                  label="Псевдоним"
                  placeholder="Выберите имя пользователя"
                />
                
                <InputField
                  v-model="profileForm.bio"
                  type="textarea"
                  label="О себе"
                  placeholder="Расскажите о себе."
                  :rows="4"
                />
              </div>
              
              <div class="form-actions">
                <Button 
                  type="submit" 
                  :loading="userStore.isLoading"
                  :disabled="!isProfileFormChanged"
                >
                  Сохранить изменения
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  @click="resetProfileForm"
                  :disabled="!isProfileFormChanged"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </div>
          
          <!-- Безопастность -->
          <div v-else-if="activeTab === 'security'" class="profile-tab">
            <div class="tab-header">
              <h2 class="tab-title">Настройки безопасности</h2>
              <p class="tab-subtitle">Управляйте своими паролями и электронной почтой.</p>
            </div>
            
            <div class="security-settings">
              <!-- Пароль -->
              <div class="security-section">
                <div class="security-card" @click="showPasswordModal = true">
                  <div class="security-card-content">
                    <div class="security-card-header">
                    
                      <div class="security-icon">
                        <Icon name="security" :size="24" />
                      </div>
                      <div class="section-title">Пароль</div>
 
                      <div class="section-subtitle">
                        Последнее изменение: {{ passwordLastChanged }}
                      </div>
                    </div>
                    <div class="security-info">
                      <div class="security-description">
                        Нажмите, чтобы обновить пароль
                      </div>
                    </div>
                  </div>
                  <div class="security-action">
                    <Icon name="chevron-down" :size="20" />
                  </div>
                </div>
              </div>
              
              <!-- Email -->
              <div class="security-section">
                               
                <div class="security-card" @click="showEmailModal = true">
                  <div class="security-card-content">
                    <div class="security-card-header">
                      <div class="security-icon">
                        <Icon name="email" :size="24" />
                      </div>
                      <div class="section-title">Адрес электронной почты</div>
                  
                      
                      <div class="security-title">{{ authStore.user?.email }}</div>
                    </div>
                    
                    
                    <div class="security-info">
                      
                      <div class="section-subtitle">
                        Ваш основной адрес электронной почты для доступа к учетной записи
                      </div>
                      <div class="security-description">
                        Нажмите, чтобы изменить свой адрес электронной почты
                      </div>
                    </div>
                  </div>
                  <div class="security-action">
                    <Icon name="chevron-down" :size="20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Роли (Только админ) -->
          <div v-else-if="activeTab === 'roles' && authStore.userRole === 'admin'" class="profile-tab">
            <div class="tab-header">
              <h2 class="tab-title">Управление ролями</h2>
              <p class="tab-subtitle">Управление ролями и правами пользователей.</p>
            </div>
            
            <div class="users-table">
              <div class="table-header">
                <div class="table-search">
                  <InputField
                    v-model="searchQuery"
                    placeholder="Поиск пользователей..."
                    clearable
                  >
                    <template #prefix>
                      <Icon name="search" :size="16" />
                    </template>
                  </InputField>
                </div>
              </div>
              
              <div v-if="userStore.isLoading" class="table-loading">
                Загрузка пользователей...
              </div>
              
              <div v-else class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Пользователь</th>
                      <th>почта</th>
                      <th>Роль</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id">
                      <td class="user-cell">
                        <div class="user-info">
                          <div class="user-avatar-small">
                            <span class="avatar-text-small">
                              {{ getUserInitials(user) }}
                            </span>
                          </div>
                          <div class="user-details">
                            <div class="user-name">{{ user.username }}</div>
                            <div v-if="user.first_name || user.last_name" class="user-fullname">
                              {{ user.first_name }} {{ user.last_name }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{{ user.email }}</td>
                      <td>
                        <span :class="`role-badge role-${user.role}`">
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="actions-cell">
                        <select 
                          v-model="user.role" 
                          @change="updateUserRole(user.id, user.role)"
                          class="role-select"
                          :disabled="user.id === authStore.user?.id"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div v-else-if="activeTab === 'profile_status'" class="profile-tab">
            <ProfileStats />
          </div>

          <!-- Роли -->
          <div v-else class="profile-tab">
            <div class="tab-not-found">
              <Icon name="error" :size="64" color="var(--color-gray-300)" />
              <h3>Раздел не доступен</h3>
              <p>Для доступа в раздел необходим повышенный доступ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Изменения пароля -->
    <BaseModal
      :show="showPasswordModal"
      title="Изменить пароль"
      size="md"
      @close="closePasswordModal"
    >
      <form @submit.prevent="changePassword" class="modal-form">
        <InputField
          v-model="passwordForm.currentPassword"
          type="password"
          label="Текущий пароль"
          placeholder="Введите текущий пароль"
          :error="passwordErrors.currentPassword"
          required
        />
        
        <InputField
          v-model="passwordForm.newPassword"
          type="password"
          label="Новый пароль"
          placeholder="Введите новый пароль"
          :error="passwordErrors.newPassword"
          required
        />
        
        <InputField
          v-model="passwordForm.confirmPassword"
          type="password"
          label="Подтвердите новый пароль"
          placeholder="Подтвердите новый пароль"
          :error="passwordErrors.confirmPassword"
          required
        />
        
        <div class="modal-actions">
          <Button 
            type="submit" 
            :loading="authStore.isLoading"
          >
            Изменить пароль
          </Button>
          <Button 
            type="button" 
            variant="ghost"
            @click="closePasswordModal"
          >
            Cancel
          </Button>
        </div>
      </form>
    </BaseModal>

    <!-- Email -->
    <BaseModal
      v-model:show="showEmailModal"
      title="Изменить Email"
      size="md"
      @close="closeEmailModal"
    >
      <form @submit.prevent="changeEmail" class="modal-form">
        <div class="current-email">
          <div class="current-email-label">Текущий Email:</div>
          <div class="current-email-value">{{ authStore.user?.email }}</div>
        </div>
        
        <InputField
          v-model="emailForm.newEmail"
          type="email"
          label="Новый Email"
          placeholder="Введите новый email address"
          :error="emailErrors.newEmail"
          required
        />
        
        <InputField
          v-model="emailForm.currentPassword"
          type="password"
          label="Пароль"
          placeholder="Введите пароль для подтверждения"
          :error="emailErrors.currentPassword"
          required
        />
        
        <div class="modal-actions">
          <Button 
            type="submit" 
            :loading="emailLoading"
          >
            Подтвердить
          </Button>
          <Button 
            type="button" 
            variant="ghost"
            @click="closeEmailModal"
          >
            Закрыть
          </Button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useNotificationStore } from '@/stores/notification';
import Icon from '@/components/common/Icon.vue';
import InputField from '@/components/common/InputField.vue';
import Button from '@/components/common/Button.vue';
import BaseModal from '@/components/common/BaseModal.vue';
import ProfileStats from '@/pages/profile/ProfileStats.vue';

const authStore = useAuthStore();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const activeTab = ref('info');
const searchQuery = ref('');
const showPasswordModal = ref(false);
const showEmailModal = ref(false);
const passwordLastChanged = ref('Unknown');
const showUploadModal = ref(false);

// Загружаем дату последнего изменения пароля
const loadLastPasswordChange = async () => {
  const result = await authStore.getLastPasswordChange();
  if (result.success && result.data.lastPasswordChange) {
    const date = new Date(result.data.lastPasswordChange);
    passwordLastChanged.value = formatDate(date);
  }
};

const formatDate = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 30) {
    return `${Math.floor(diffDays / 30)} months ago`;
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

const tabs = [
  { id: 'info', label: 'Информация профиля', icon: 'user' },
  { id: 'security', label: 'Безопасность', icon: 'security' },
  { id: 'roles', label: 'Управление ролями', icon: 'roles' },
  { id: 'profile_status', label: 'Статистика', icon: 'users' },
];

const profileForm = reactive({
  first_name: '',
  last_name: '',
  username: '',
  bio: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const emailForm = reactive({
  newEmail: '',
  currentPassword: ''
});

const emailErrors = reactive({
  newEmail: '',
  currentPassword: ''
});

const userInitials = computed(() => {
  const user = authStore.user;
  if (!user) return '?';
  
  const first_name = user.first_name || '';
  const last_name = user.last_name || '';
  const username = user.username || '';
  
  if (first_name && last_name) {
    return `${first_name[0]}${last_name[0]}`.toUpperCase();
  }
  
  if (first_name) {
    return first_name[0].toUpperCase();
  }
  
  if (username) {
    return username[0].toUpperCase();
  }
  
  return '?';
});

const isProfileFormChanged = computed(() => {
  const user = authStore.user;
  if (!user) return false;
  
  return (
    profileForm.first_name !== (user.first_name || '') ||
    profileForm.last_name !== (user.last_name || '') ||
    profileForm.username !== (user.username || '') ||
    profileForm.bio !== (user.bio || '')
  );
});

const filteredUsers = computed(() => {
  if (!searchQuery.value) {
    return userStore.users;
  }
  
  const query = searchQuery.value.toLowerCase();
  return userStore.users.filter(user => 
    (user.username && user.username.toLowerCase().includes(query)) ||
    user.email.toLowerCase().includes(query) ||
    (user.first_name && user.first_name.toLowerCase().includes(query)) ||
    (user.last_name && user.last_name.toLowerCase().includes(query))
  );
});

const loadProfileData = () => {
  const user = authStore.user;
  if (!user) return;
  
  profileForm.first_name = user.first_name || '';
  profileForm.last_name = user.last_name || '';
  profileForm.username = user.username || '';
  profileForm.bio = user.bio || '';
};

const resetProfileForm = () => {
  loadProfileData();
};

const updateProfile = async () => {
  const result = await userStore.updateProfile(profileForm);
  
  if (result.success) {
    resetProfileForm();
  }
};

const validatePasswordForm = () => {
  let isValid = true;
  
  // Сброс ошибок
  Object.keys(passwordErrors).forEach(key => passwordErrors[key] = '');
  
  // Проверка текущего пароля
  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Требуется ввести текущий пароль';
    isValid = false;
  }
  
  // Проверка нового пароля
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'Требуется ввести новый пароль';
    isValid = false;
  } else if (passwordForm.newPassword.length < 6) {
    passwordErrors.newPassword = 'Пароль должен состоять не менее чем из 6 символов.';
    isValid = false;
  }
  
  // Подтверждение пароля
  if (!passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Пожалуйста, подтвердите свой пароль';
    isValid = false;
  } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Пароли не совпадают';
    isValid = false;
  }
  
  return isValid;
};

const changePassword = async () => {
  if (!validatePasswordForm()) return;
  
  const result = await authStore.changePassword(
    passwordForm.currentPassword,
    passwordForm.newPassword
  );
  
  if (result.success) {
    // Очистить форму
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    
    // Закрыть модаку
    closePasswordModal();
    
    // Обновить графу последняя смена пароля
    await loadLastPasswordChange();
    
    // Сообщение о смене
    notificationStore.addNotification({
      type: 'success',
      title: 'Готово!',
      message: 'Пароль успешно изменен'
    });
  }
};

const validateEmailForm = () => {
  let isValid = true;
  
  // Сброс ошибок
  Object.keys(emailErrors).forEach(key => emailErrors[key] = '');
  
  // Подтверждение нового Email
  if (!emailForm.newEmail) {
    emailErrors.newEmail = 'Требуется ввести новый адрес электронной почты';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(emailForm.newEmail)) {
    emailErrors.newEmail = 'Пожалуйста, введите действительный адрес электронной почты';
    isValid = false;
  }
  
  // Проверка, отличается ли Email от текущего
  if (emailForm.newEmail === authStore.user?.email) {
    emailErrors.newEmail = 'Новый адрес электронной почты идентичен текущему.';
    isValid = false;
  }
  
  // Подтверждение паролем
  if (!emailForm.currentPassword) {
    emailErrors.currentPassword = 'Требуется ввести текущий пароль';
    isValid = false;
  }
  
  return isValid;
};

const changeEmail = async () => {
  if (!validateEmailForm()) return;
  
  const result = await authStore.changeEmail(
    emailForm.newEmail,
    emailForm.currentPassword
  );
  
  if (result.success) {
    emailForm.newEmail = '';
    emailForm.currentPassword = '';
    closeEmailModal();
    authStore.clearEmailChangeState();
    notificationStore.addNotification({
      type: 'success',
      title: 'Готово!',
      message: 'Адрес электронной почты успешно изменен. Пожалуйста, проверьте свой новый адрес электронной почты для подтверждения.'
    });
  } else {
    emailErrors.newEmail = authStore.emailChangeError || 'Не удалось изменить адрес электронной почты';
  }
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  passwordForm.currentPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
  Object.keys(passwordErrors).forEach(key => passwordErrors[key] = '');
};

const closeEmailModal = () => {
  showEmailModal.value = false;
  emailForm.newEmail = '';
  emailForm.currentPassword = '';
  Object.keys(emailErrors).forEach(key => emailErrors[key] = '');
  authStore.clearEmailChangeState();
};

const getUserInitials = (user) => {
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  
  if (user.first_name) {
    return user.first_name[0].toUpperCase();
  }
  
  if (user.username) {
    return user.username[0].toUpperCase();
  }
  
  return user.email ? user.email[0].toUpperCase() : '?';
};

const updateUserRole = async (userId, role) => {
  await userStore.updateUserRole(userId, role);
};

function openUploadModal() {
  showUploadModal.value = true;
}

async function handleProfileImageUpload(data) {
  // Здесь можно обновить аватар пользователя
  notificationStore.addNotification({
    type: 'success',
    title: 'Изображение загружено',
    message: 'Изображение профиля обновлено'
  });
}

// Watch for active tab changes
watch(activeTab, async (newTab) => {
  if (newTab === 'roles' && authStore.userRole === 'admin') {
    await userStore.getAllUsers();
  }
});

onMounted(() => {
  loadProfileData();
  loadLastPasswordChange();
});
</script>

<style scoped>
@import "@/styles/profile/profile.css";
</style>