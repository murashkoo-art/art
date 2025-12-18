<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Verifying email...</p>
        </div>
        
        <div v-else-if="success" class="success-state">
          <div class="success-icon">
            <Icon name="check" :size="64" color="var(--color-success)" />
          </div>
          
          <h1 class="success-title">Email Verified!</h1>
          <p class="success-description">
            Your email address has been successfully verified.
          </p>
          
          <div class="success-actions">
            <router-link to="/profile">
              <Button>Go to Profile</Button>
            </router-link>
            <router-link to="/">
              <Button variant="outline">Home</Button>
            </router-link>
          </div>
        </div>
        
        <div v-else class="error-state">
          <div class="error-icon">
            <Icon name="error" :size="64" color="var(--color-danger)" />
          </div>
          
          <h1 class="error-title">Verification Failed</h1>
          <p class="error-description">
            {{ errorMessage || 'The verification link is invalid or has expired.' }}
          </p>
          
          <div class="error-actions">
            <router-link to="/profile">
              <Button>Go to Profile</Button>
            </router-link>
            <router-link to="/">
              <Button variant="outline">Home</Button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Icon from '@/components/common/Icon.vue';
import Button from '@/components/common/Button.vue';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref('');

const verifyEmail = async () => {
  const token = route.query.token;
  
  if (!token) {
    loading.value = false;
    success.value = false;
    errorMessage.value = 'No verification token provided';
    return;
  }
  
  try {
    const response = await fetch(`/api/users/verify-email/${token}`);
    const data = await response.json();
    
    if (response.ok) {
      success.value = true;
    } else {
      errorMessage.value = data.error || 'Verification failed';
    }
  } catch (error) {
    errorMessage.value = 'Network error. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  verifyEmail();
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
  max-width: 500px;
  margin: 0 auto;
  padding: var(--spacing-8);
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.loading-state,
.success-state,
.error-state {
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

.success-icon,
.error-icon {
  margin-bottom: var(--spacing-6);
}

.success-title,
.error-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-3);
}

.success-description,
.error-description {
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-6);
  line-height: 1.6;
}

.success-actions,
.error-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
}

@media (max-width: 576px) {
  .success-actions,
  .error-actions {
    flex-direction: column;
  }
}
</style>