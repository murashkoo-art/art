<template>
  <div class="main-inner auth-page">
    <div class="container">
      <div class="auth-card" :style="{ maxWidth }">
        <div class="auth-header">
          <slot name="header">
            <h1 class="auth-title">{{ title }}</h1>
            <p v-if="subtitle" class="auth-subtitle">{{ subtitle }}</p>
          </slot>
        </div>
        
        <div class="auth-content">
          <slot />
        </div>
        
        <div v-if="$slots.footer" class="auth-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '400px'
  }
});
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  padding: var(--spacing-8) 0;
}

.auth-card {
  max-width: var(--auth-card-width, 400px);
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

.auth-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-2);
}

.auth-subtitle {
  color: var(--color-gray-600);
}

.auth-content {
  margin-bottom: var(--spacing-6);
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