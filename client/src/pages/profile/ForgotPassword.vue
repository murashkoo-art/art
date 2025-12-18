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
          
          <h1 class="auth-title">Забыли пароль</h1>
          <p class="auth-subtitle">Введите свой адрес электронной почты, чтобы сбросить пароль.</p>
        </div>
        
        <div v-if="!success" class="auth-form">
          <form @submit.prevent="handleSubmit">
            <InputField
              v-model="form.email"
              type="email"
              label="Email"
              placeholder="Введите свой адрес электронной почты"
              :error="errors.email"
              required
              autocomplete="email"
            />
            
            <Button 
              type="submit" 
              :loading="authStore.passwordResetLoading"
              :disabled="authStore.passwordResetLoading"
              fullWidth
            >
              Отправить инструкции по сбросу
            </Button>
            
            <div v-if="authStore.passwordResetError" class="error-message">
              {{ authStore.passwordResetError }}
            </div>
          </form>
        </div>
        
        <div v-else class="success-message">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <h3 class="success-title">Проверьте свою электронную почту</h3>
          <p class="success-description">
            Если существует учетная запись с <strong>{{ form.email }}</strong>, вы получите инструкции по сбросу пароля..
          </p>
          
          <div class="success-actions">
            <router-link to="/login">
              <Button variant="outline">Вернуться к входу</Button>
            </router-link>
            <Button @click="resetForm">Сбросить другой адрес электронной почты</Button>
          </div>
          
          <div class="development-notice" v-if="isDevelopment">
            <p><strong>Уведомление о разработке:</strong> В рабочей среде будет отправлено электронное письмо. А пока проверьте консоль сервера, чтобы найти ссылку для сброса.</p>
          </div>
        </div>
        
        <div class="auth-footer">
          <p>Помнишь свой пароль? <router-link to="/login">Войти</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import InputField from '@/components/common/InputField.vue';
import Button from '@/components/common/Button.vue';

const authStore = useAuthStore();

const form = reactive({
  email: ''
});

const errors = reactive({
  email: ''
});

const success = ref(false);

const isDevelopment = computed(() => process.env.NODE_ENV === 'development');

const validateForm = () => {
  let isValid = true;
  
  // Сброс ошибок
  Object.keys(errors).forEach(key => errors[key] = '');
  
  //  Проверка Email
  if (!form.email) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  const result = await authStore.requestPasswordReset(form.email);
  
  if (result.success) {
    success.value = true;
  }
};

const resetForm = () => {
  success.value = false;
  authStore.clearPasswordResetState();
};
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

.auth-form {
  margin-bottom: var(--spacing-6);
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

.success-message {
  text-align: center;
  padding: var(--spacing-4) 0;
}

.success-icon {
  margin-bottom: var(--spacing-4);
}

.success-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-2);
}

.success-description {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-6);
  line-height: 1.6;
}

.success-description strong {
  color: var(--color-gray-800);
  font-weight: 600;
}

.success-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
  margin-bottom: var(--spacing-6);
}

.development-notice {
  padding: var(--spacing-4);
  background-color: rgba(248, 150, 30, 0.1);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  text-align: left;
}

.development-notice p {
  margin: 0;
}

.development-notice strong {
  color: var(--color-warning);
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

@media (max-width: 576px) {
  .success-actions {
    flex-direction: column;
  }
  
  .success-actions a,
  .success-actions button {
    width: 100%;
  }
}
</style>