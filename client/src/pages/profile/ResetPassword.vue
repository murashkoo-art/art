<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/login" class="back-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8334 10H4.16669M4.16669 10L10 15.8334M4.16669 10L10 4.16669" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Вернуться к входу
          </router-link>
          
          <h1 class="auth-title">Установить новый пароль</h1>
          <p class="auth-subtitle" v-if="email">
            Сбросить пароль для <strong>{{ email }}</strong>
          </p>
          <p class="auth-subtitle" v-else>
            Введите свой новый пароль
          </p>
        </div>
        
        <div v-if="tokenValid === null" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Проверка токена...</p>
        </div>
        
        <div v-else-if="tokenValid === false" class="error-state">
          <div class="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 9L9 15" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 9L15 15" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <h3 class="error-title">Недействительная или устаревшая ссылка</h3>
          <p class="error-description">
            Данная ссылка для сброса пароля недействительна или срок ее действия истек.
            Пожалуйста, запросите новую ссылку для сброса пароля.
          </p>
          
          <div class="error-actions">
            <router-link to="/forgot-password">
              <Button>Запросить новую ссылку</Button>
            </router-link>
          </div>
        </div>
        
        <div v-else-if="!success" class="auth-form">
          <form @submit.prevent="handleSubmit">
            <InputField
              v-model="form.newPassword"
              type="password"
              label="New Password"
              placeholder="Enter new password"
              :error="errors.newPassword"
              required
              autocomplete="new-password"
            >
              <template #hint>
                Длина текста должна составлять не менее 6 символов.
              </template>
            </InputField>
            
            <InputField
              v-model="form.confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="Confirm new password"
              :error="errors.confirmPassword"
              required
              autocomplete="new-password"
            />
            
            <div class="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li :class="{ 'requirement-met': form.newPassword.length >= 6 }">
                  At least 6 characters
                </li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              :loading="authStore.passwordResetLoading"
              :disabled="authStore.passwordResetLoading || !isFormValid"
              fullWidth
            >
              Reset Password
            </Button>
            
            <div v-if="authStore.passwordResetError" class="error-message">
              {{ authStore.passwordResetError }}
            </div>
          </form>
        </div>
        
        <div v-else class="success-state">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <h3 class="success-title">Сброс пароля пройден успешно.</h3>
          <p class="success-description">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          
          <div class="success-actions">
            <router-link to="/login">
              <Button>Login Now</Button>
            </router-link>
          </div>
        </div>
        
        <div class="auth-footer">
          <p>Remember your password? <router-link to="/login">Sign in</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import InputField from '@/components/common/InputField.vue';
import Button from '@/components/common/Button.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  newPassword: '',
  confirmPassword: ''
});

const errors = reactive({
  newPassword: '',
  confirmPassword: ''
});

const token = ref(route.query.token || '');
const tokenValid = ref(null);
const email = ref('');
const success = ref(false);

const isFormValid = computed(() => {
  return (
    form.newPassword.length >= 6 &&
    form.confirmPassword.length >= 6 &&
    form.newPassword === form.confirmPassword
  );
});

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => errors[key] = '');
  if (!form.newPassword) {
    errors.newPassword = 'Требуется ввести новый пароль';
    isValid = false;
  } else if (form.newPassword.length < 6) {
    errors.newPassword = 'Пароль должен состоять не менее чем из 6 символов.';
    isValid = false;
  }
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Пожалуйста, подтвердите свой пароль';
    isValid = false;
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
    isValid = false;
  }
  
  return isValid;
};

const validateToken = async () => {
  if (!token.value) {
    tokenValid.value = false;
    return;
  }
  
  try {
    const result = await authStore.validateResetToken(token.value);
    if (result.success && result.data.valid) {
      tokenValid.value = true;
      email.value = result.data.email;
    } else {
      tokenValid.value = false;
    }
  } catch (error) {
    tokenValid.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  const result = await authStore.resetPassword(
    token.value,
    form.newPassword,
    form.confirmPassword
  );
  
  if (result.success) {
    success.value = true;
  }
};

onMounted(() => {
  validateToken();
  
  // Очистка
  return () => {
    authStore.clearPasswordResetState();
  };
});
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  padding: var(--spacing-8) 0;
}

.auth-card {
  max-width: 400px;
  margin: 0 auto;
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-gray-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-4);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.back-link svg {
  width: 16px;
  height: 16px;
}

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-2);
}

.auth-subtitle {
  color: var(--color-gray-600);
}

.auth-subtitle strong {
  color: var(--color-gray-800);
  font-weight: 600;
}

.loading-state {
  text-align: center;
  padding: var(--spacing-8) 0;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--color-gray-600);
}

.error-state,
.success-state {
  text-align: center;
  padding: var(--spacing-4) 0;
}

.error-icon,
.success-icon {
  margin-bottom: var(--spacing-4);
}

.error-title,
.success-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-2);
}

.error-description,
.success-description {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-6);
  line-height: 1.6;
}

.error-actions,
.success-actions {
  margin-bottom: var(--spacing-6);
}

.auth-form {
  margin-bottom: var(--spacing-6);
}

.password-requirements {
  margin: var(--spacing-4) 0;
  padding: var(--spacing-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.password-requirements h4 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-2);
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-1);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.password-requirements li:before {
  content: '•';
  color: var(--color-gray-400);
}

.password-requirements li.requirement-met {
  color: var(--color-success);
}

.password-requirements li.requirement-met:before {
  content: '✓';
  color: var(--color-success);
}

.error-message {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: rgba(247, 37, 133, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  text-align: center;
}

.auth-footer {
  text-align: center;
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-gray-200);
  color: var(--color-gray-600);
}

.auth-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>