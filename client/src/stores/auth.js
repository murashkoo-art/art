import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);
  const isLoading = ref(false);
  const error = ref(null);

  //Сброс пароля
  const passwordResetLoading = ref(false);
  const passwordResetError = ref(null);
  const passwordResetSuccess = ref(false);

  //Изменение Email
  const emailChangeLoading = ref(false);
  const emailChangeError = ref(null);
  const emailChangeSuccess = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.role);

  const setAuthData = (userData, authToken) => {
    user.value = userData;
    token.value = authToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const clearAuthData = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/auth/login', { email, password });
      setAuthData(response.data.user, response.data.token);
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/auth/register', userData);
      setAuthData(response.data.user, response.data.token);
      return { success: true };
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    clearAuthData();
    window.location.href = '/';
  };

  const fetchCurrentUser = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/auth/me');
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    } catch (err) {
      clearAuthData();
      error.value = err.response?.data?.error || 'Failed to fetch user data';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, data: response.data };
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to change password';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const changeEmail = async (newEmail, currentPassword) => {
    emailChangeLoading.value = true;
    emailChangeError.value = null;
    emailChangeSuccess.value = false;
    
    try {
      const response = await axios.put('/users/change-email', {
        newEmail,
        currentPassword
      });
      
      user.value = response.data;
      localStorage.setItem('user', JSON.stringify(response.data));
      
      emailChangeSuccess.value = true;
      return { success: true, data: response.data };
    } catch (err) {
      emailChangeError.value = err.response?.data?.error || 'Failed to change email';
      return { success: false, error: emailChangeError.value };
    } finally {
      emailChangeLoading.value = false;
    }
  };

  const getLastPasswordChange = async () => {
    try {
      const response = await axios.get('/users/last-password-change');
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Failed to get last password change:', err);
      return { success: false, error: err.message };
    }
  };

  const requestPasswordReset = async (email) => {
    passwordResetLoading.value = true;
    passwordResetError.value = null;
    passwordResetSuccess.value = false;
    
    try {
      const response = await axios.post('/password-reset/request', { email });
      passwordResetSuccess.value = true;
      return { success: true, data: response.data };
    } catch (err) {
      passwordResetError.value = err.response?.data?.error || 'Failed to request password reset';
      return { success: false, error: passwordResetError.value };
    } finally {
      passwordResetLoading.value = false;
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    passwordResetLoading.value = true;
    passwordResetError.value = null;
    passwordResetSuccess.value = false;
    
    try {
      const response = await axios.post('/password-reset/reset', {
        token,
        newPassword,
        confirmPassword
      });
      passwordResetSuccess.value = true;
      return { success: true, data: response.data };
    } catch (err) {
      passwordResetError.value = err.response?.data?.error || 'Failed to reset password';
      return { success: false, error: passwordResetError.value };
    } finally {
      passwordResetLoading.value = false;
    }
  };

  const validateResetToken = async (token) => {
    try {
      const response = await axios.get(`/password-reset/validate/${token}`);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Invalid reset token' };
    }
  };

  const clearPasswordResetState = () => {
    passwordResetLoading.value = false;
    passwordResetError.value = null;
    passwordResetSuccess.value = false;
  };

  const clearEmailChangeState = () => {
    emailChangeLoading.value = false;
    emailChangeError.value = null;
    emailChangeSuccess.value = false;
  };

  /// Инициализируем заголовок аксиос, если токен существует
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  return {
    user,
    token,
    isLoading,
    error,
    passwordResetLoading,
    passwordResetError,
    passwordResetSuccess,
    emailChangeLoading,
    emailChangeError,
    emailChangeSuccess,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
    fetchCurrentUser,
    changePassword,
    changeEmail,
    getLastPasswordChange,
    requestPasswordReset,
    resetPassword,
    validateResetToken,
    clearPasswordResetState,
    clearEmailChangeState
  };
});