<template>
  <div class="main-inner">
    <div class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">инф-Живопись.</h1>
          <p class="hero-description">
            Информационно справочная система художественной галереи
          </p>
        </div>
      </div>
    </div>
    <div class="action-hero-content">
      <div class="container">
        <div v-if="!authStore.isAuthenticated" class="hero-actions">
            <router-link to="/login">
              <Button size="lg">Войти</Button>
            </router-link>
            <router-link to="/register">
              <Button variant="outline" size="lg">Зарегистрироваться</Button>
            </router-link>
          </div>
          
          <div v-else class="hero-actions">
            <router-link to="/profile">
              <Button size="lg">Мой профиль</Button>
            </router-link>
          </div>
      </div>
          
    </div>
    <div class="features">
      <div class="container">
        <h2 class="features-title">Функции</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <Icon name="user" :size="48" />
            </div>
            <h3 class="feature-title">Профили пользователей</h3>
            <p class="feature-description">
              Полноценные профили пользователей с настраиваемой информацией и поддержкой аватаров.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
             <Icon name="roles" :size="48" />
            </div>
            <h3 class="feature-title">Разделение ролей пользователей</h3>
            <p class="feature-description">
              Гибкое управление доступом на основе ролей.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/common/Button.vue';
import Icon from '@/components/common/Icon.vue';
const authStore = useAuthStore();
</script>

<style scoped>
@import "@/styles/home.css";
</style>