import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const updateProfile = async (profileData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.put('/users/profile', profileData);
      const authStore = useAuthStore();
      authStore.user = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      
      const { useNotificationStore } = await import('./notification');
      const notificationStore = useNotificationStore();
      notificationStore.addNotification({
        type: 'success',
        title: 'Готово!',
        message: 'Профиль успешно обновлен.'
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update profile';
      
      const { useNotificationStore } = await import('./notification');
      const notificationStore = useNotificationStore();
      notificationStore.addNotification({
        type: 'error',
        title: 'Ошибка',
        message: error.value
      });
      
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const changeEmail = async (newEmail, currentPassword) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/users/change-email', {newEmail, currentPassword});
      const authStore = useAuthStore();
      authStore.user.email = newEmail;
      localStorage.setItem('user', JSON.stringify(authStore.user));
      
      const { useNotificationStore } = await import('./notification');
      const notificationStore = useNotificationStore();
      notificationStore.addNotification({
        type: 'success',
        title: 'Готово!',
        message: 'Новый адрес электронной почты сохранен'
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update profile';
      
      const { useNotificationStore } = await import('./notification');
      const notificationStore = useNotificationStore();
      notificationStore.addNotification({
        type: 'error',
        title: 'Ошибка',
        message: error.value
      });
      
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const getAllUsers = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/users');
      users.value = response.data;
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch users';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const updateUserRole = async (userId, role) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.put(`/users/${userId}/role`, { role });
      
      // Обновление локального состояния
      const index = users.value.findIndex(user => user.id === userId);
      if (index !== -1) {
        users.value[index] = response.data;
      }
      
      const { useNotificationStore } = await import('./notification');
      const notificationStore = useNotificationStore();
      notificationStore.addNotification({
        type: 'success',
        title: 'Готово!',
        message: `Роль пользователя обновлена ​​до ${role}`
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update user role';
      
      const { useNotificationStore } = await import('./notification');
      const notificationStore = useNotificationStore();
      notificationStore.addNotification({
        type: 'error',
        title: 'Ошибка',
        message: error.value
      });
      
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    users,
    isLoading,
    error,
    updateProfile,
    changeEmail,
    getAllUsers,
    updateUserRole
  };
});