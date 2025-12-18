<template>
  <header class="header">
    <div class="container">
      <div class="header-content">
        <router-link to="/" class="logo">
          <Icon name="logo" size="48"/>
          <span class="logo-text">Живопись</span>
        </router-link>

        <nav class="nav">
          <router-link to="/gallery" class="nav-link">
            Галерея
          </router-link>
          <router-link to="/about" class="nav-link">
            Об авторе
          </router-link>
          <template v-if="authStore.isAuthenticated">
            <div class="header-actions">
              <NotificationCenter />
              
              <div class="user-menu" ref="userMenuRef">
                <Button variant="outline" @click="toggleUserMenu">
                    <div class="user-avatar">
                      <span class="avatar-text">
                        {{ userInitials }}
                      </span>
                    </div>
                  {{ authStore.user?.username }}
                </Button>
                
                <div v-if="isUserMenuOpen" class="user-menu-dropdown">
                  <div class="user-info">
                    <div class="dropdown-avatar">
                      <span class="avatar-text">
                        {{ userInitials }}
                      </span>
                    </div>
                    <div class="dropdown-user-details">
                      <div class="dropdown-username">{{ authStore.user?.username }}</div>
                      <div class="dropdown-email">{{ authStore.user?.email }}</div>
                      <div class="dropdown-role">
                        <span :class="`role-badge role-${authStore.user?.role}`">
                          {{ authStore.user?.role }}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="dropdown-divider"></div>
                  
                  <router-link 
                    to="/profile" 
                    class="dropdown-item"
                    @click="closeUserMenu"
                  >
                    <Icon name="user" :size="24" />
                    <span>Профиль</span>
                  </router-link>
                  
                  <div class="dropdown-divider"></div>
                  <Button fullWidth="{{ true }}" variant="outline" @click="handleLogout" class="dropdown-item">
                    <Icon name="logout" :size="24" />
                    Выйти
                  </Button>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else>
            <router-link to="/login" class="nav-link">
              <Button variant="outline">Вход</Button>
            </router-link>
            <router-link to="/register" class="nav-link">
              <Button variant="ghost">Регистрация</Button>
            </router-link>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/common/Button.vue';
import NotificationCenter from '@/components/common/NotificationCenter.vue';
import Icon from '@/components/common/Icon.vue';

const authStore = useAuthStore();
const isUserMenuOpen = ref(false);
const userMenuRef = ref(null);

const userInitials = computed(() => {
  if (!authStore.user) return '?';
  
  const { first_name, last_name, username } = authStore.user;
  
  if (first_name && last_name) {
    return `${first_name[0]}${last_name[0]}`.toUpperCase();
  }
  
  if (first_name) {
    return first_name[0].toUpperCase();
  }
  
  return username ? username[0].toUpperCase() : '?';
});

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  closeUserMenu();
};


const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
};
</script>

<style scoped>
.header {
  background-color: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  padding: var(--spacing-4) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  position: relative;
  text-decoration: none;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.logo::before {
  content: '';
  width: 35px;
  height: 35px;
  background: var(--color-accent);
}

.logo-text {
  background: var(--color-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.nav-link {
  text-decoration: none;
  color: var(--color-gray-700);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  width: 300px;
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-gray-200);
  z-index: 1000;
  overflow: hidden;
}

.user-info {
  padding: var(--spacing-4);
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-weight: 600;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.dropdown-user-details {
  flex: 1;
  min-width: 0;
}

.dropdown-username {
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-base);
}

.dropdown-email {
  color: var(--color-gray-500);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-2);
  word-break: break-all;
}

.dropdown-role {
  display: inline-block;
}

.role-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-user {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.role-admin {
  background-color: var(--color-danger-light, #fce4ec);
  color: var(--color-danger);
}

.role-moderator {
  background-color: var(--color-info-light, #e3f2fd);
  color: var(--color-info);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-gray-200);
  margin: var(--spacing-2) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  text-decoration: none;
  color: var(--color-gray-700);
  font-weight: 500;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--color-gray-50);
}

.dropdown-item svg {
  color: var(--color-gray-500);
}


</style>