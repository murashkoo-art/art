<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
        <div 
          class="modal-container" 
          :class="[`modal-${size}`, { 'modal-fullscreen': fullscreen }]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? `${modalId}-title` : null"
        >
          <div v-if="showHeader" class="modal-header">
            <slot name="header">
              <h2 v-if="title" :id="`${modalId}-title`" class="modal-title">
                {{ title }}
              </h2>
              <button 
                v-if="closable"
                class="modal-close" 
                @click="handleClose"
                aria-label="Закрыть"
                :disabled="disabled"
              >
                <Icon name="close" :size="24" />
              </button>
            </slot>
          </div>

          <div class="modal-content">
            <slot />
          </div>

          <div v-if="showFooter" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { watch , computed, onMounted, onUnmounted } from 'vue';
import Icon from '@/components/common/Icon.vue';
import { useBodyScrollLock } from '@/utils/modalUtils';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  closeOnEsc: {
    type: Boolean,
    default: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  preventBodyScroll: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:show', 'close', 'open', 'overlay-click']);

const { lockScroll, unlockScroll } = useBodyScrollLock();
const modalId = computed(() => `modal-${Math.random().toString(36).substr(2, 9)}`);

const handleClose = () => {
  if (!props.disabled) {
    emit('update:show', false);
    emit('close');
  }
};

const handleOverlayClick = () => {
  emit('overlay-click');
  if (props.closeOnOverlay && !props.disabled) {
    handleClose();
  }
};

const handleEscape = (event) => {
  if (event.key === 'Escape' && props.closeOnEsc && !props.disabled) {
    handleClose();
  }
};

onMounted(() => {
  if (props.closeOnEsc) {
    document.addEventListener('keydown', handleEscape);
  }
  
  if (props.show && props.preventBodyScroll) {
    lockScroll();
  }
});

onUnmounted(() => {
  if (props.closeOnEsc) {
    document.removeEventListener('keydown', handleEscape);
  }
  
  if (props.preventBodyScroll) {
    unlockScroll();
  }
});

// Блокировка прокрутки при открытии/закрытии
watch(() => props.show, (newVal) => {
  if (props.preventBodyScroll) {
    if (newVal) {
      lockScroll();
    } else {
      unlockScroll();
    }
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  padding: 1rem;
  animation: overlay-fade 0.2s ease-out;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modal-slide 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.modal-sm {
  width: 100%;
  max-width: 400px;
}

.modal-md {
  width: 100%;
  max-width: 600px;
}

.modal-lg {
  width: 100%;
  max-width: 800px;
}

.modal-xl {
  width: 100%;
  max-width: 1000px;
}

.modal-full {
  width: 95%;
  height: 95vh;
}

.modal-fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  max-height: 100vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.modal-close:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  min-height: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: translateY(-20px);
}

@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-slide {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    border-radius: 8px;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 1rem;
    flex-wrap: wrap;
  }
}
</style>