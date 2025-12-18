<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">
            <Icon name="logo" size="48"/>
            Живопись
          </h3>
          <p class="footer-description">
            Информационно справочная система художественной галереи
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-heading">Ссылки</h4>
          <ul class="footer-links">
            <li><router-link to="/">Главная</router-link></li>
            <li><router-link to="/profile">Галерея</router-link></li>
            <li><router-link to="/profile">Мой Профиль</router-link></li>
            <li><router-link to="/about">Об авторе</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-heading">Юридические</h4>
          <ul class="footer-links">
            <li><a href="#" @click.prevent>Политика Конфиденциальности</a></li>
            <li><a href="#" @click.prevent>Политика использования файлов cookie</a></li>
          </ul>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} инф-Живопись.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';
import Icon from '@/components/common/Icon.vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: var(--color-gray-900);
  color: var(--color-white);
  padding: var(--spacing-12) 0 var(--spacing-6);
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
}

.footer-section {
  margin-bottom: var(--spacing-4);
}

.footer-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: var(--color-gray-400);
  line-height: 1.6;
}

.footer-heading {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-4);
  color: var(--color-white);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-2);
}

.footer-links a {
  color: var(--color-gray-400);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-gray-800);
  text-align: center;
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
}
</style>