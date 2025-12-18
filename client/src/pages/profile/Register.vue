<template>
  <AuthLayout 
    title="Зарегистрироваться"
    subtitle="Зарегистрируйтесь, чтобы начать."
    maxWidth="500px"
  >
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-row">
        <InputField
          v-model="form.first_name"
          type="text"
          label="Имя"
          placeholder="Введите ваше имя"
          :error="errors.first_name"
        />
        
        <InputField
          v-model="form.last_name"
          type="text"
          label="Фамилия"
          placeholder="Введите вашу фамилию"
          :error="errors.last_name"
        />
      </div>

      <div class="form-row-x1">
        <InputField
          v-model="form.email"
          type="email"
          label="Электронная почта"
          placeholder="Введите свой адрес электронной почты"
          :error="errors.email"
          required
        />
      </div>
      
      <div class="form-row-x1">
        <InputField
          v-model="form.password"
          type="password"
          label="Пароль"
          placeholder="Создать пароль"
          :error="errors.password"
          required
        >
          <template #hint>
            Длина текста должна составлять не менее 6 символов.
          </template>
        </InputField>
      </div>
      
      <div class="form-row-x1">
        <InputField
          v-model="form.confirmPassword"
          type="password"
          label="Подтвердите пароль"
          placeholder="Подтвердите ваш пароль"
          :error="errors.confirmPassword"
          required
        />
      </div>

      <div class="form-row-x1">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
      </div>
      

      <div class="form-row-x1">
        <Button 
          type="submit" 
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading"
          fullWidth
        >
          Зарегистрироваться
        </Button>
      </div>
    
    </form>

    <template #footer>
      <p>У вас уже есть аккаунт? <router-link to="/login">Войти</router-link></p>
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
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const errors = reactive({
  first_name: '',
  last_name: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const validateForm = () => {
  let isValid = true;
  
  // Очистить ошибки
  Object.keys(errors).forEach(key => errors[key] = '');
  
  // Email
  if (!form.email) {
    errors.email = 'Требуется ввести электронную почту';
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Электронная почта недействительна';
    isValid = false;
  }
  
  // Пароль
  if (!form.password) {
    errors.password = 'Требуется ввести пароль';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = 'Пароль должен состоять как минимум из 6 символов.';
    isValid = false;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  const userData = {
    email: form.email,
    password: form.password,
    first_name: form.first_name || undefined,
    last_name: form.last_name || undefined
  };
  
  const result = await authStore.register(userData);
  
  if (result.success) {
    router.push('/profile');
  }
};
</script>

<style scoped>
.auth-form {
  margin-bottom: var(--spacing-7);
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