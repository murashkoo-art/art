<template>
  <AuthLayout 
    title="Добро пожаловать"
    subtitle="Войдите в свой аккаунт"
  >
    <form @submit.prevent="handleSubmit" class="auth-form">
      <InputField
        v-model="form.email"
        type="email"
        label="Email"
        placeholder="Введите свой адрес электронной почты"
        :error="errors.email"
        required
      />
      
      <InputField
        v-model="form.password"
        type="password"
        label="Password"
        placeholder="Введите свой пароль"
        :error="errors.password"
        required
      />
      
      <div class="form-options">
        <div class="remember-me">
          <input 
            type="checkbox" 
            id="remember" 
            v-model="form.remember"
            class="checkbox"
          />
          <label for="remember">Запомнить меня</label>
        </div>
        
        <router-link to="/forgot-password" class="forgot-password">
          Забыли пароль?
        </router-link>
      </div>
      
      <Button 
        type="submit" 
        :loading="authStore.isLoading"
        :disabled="authStore.isLoading"
        fullWidth
      >
        Войти
      </Button>
      
      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>
    </form>

    <template #footer>
      <p>У вас нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
    </template>
  </AuthLayout>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AuthLayout from '@/components/layout/AuthLayout.vue';
import InputField from '@/components/common/InputField.vue';
import Button from '@/components/common/Button.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
  remember: false
});

const errors = reactive({
  email: '',
  password: ''
});

const validateForm = () => {
  let isValid = true;
  
  // Сброс ошибок
  Object.keys(errors).forEach(key => errors[key] = '');
  
  //  Проверка Email
  if (!form.email) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Email is invalid';
    isValid = false;
  }
  
  // Проверка пароля
  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  const result = await authStore.login(form.email, form.password);
  
  if (result.success) {
    router.push('/profile');
  }
};
</script>

<style scoped>
.auth-form {
  margin-bottom: var(--spacing-6);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.remember-me {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.checkbox {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-gray-300);
  cursor: pointer;
}

.checkbox:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.remember-me label {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  cursor: pointer;
}

.forgot-password {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.forgot-password:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
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
</style>