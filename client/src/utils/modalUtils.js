// Хук для управления состоянием модальных окон
export const useModal = (initialState = false) => {
  const isOpen = ref(initialState);
  
  const open = () => {
    isOpen.value = true;
  };
  
  const close = () => {
    isOpen.value = false;
  };
  
  const toggle = () => {
    isOpen.value = !isOpen.value;
  };
  
  return {
    isOpen,
    open,
    close,
    toggle
  };
};

// Конфигурация модальных окон
export const modalConfig = {
  sizes: {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    full: '95vw'
  },
  
  transitions: {
    fade: 'fade 0.3s ease-in-out',
    slide: 'slide 0.3s ease-in-out'
  },
  
  zIndex: {
    base: 1000,
    overlay: 1050,
    modal: 1100
  }
};

// Миксин для модальных окон (для Options API)
export const modalMixin = {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:show', 'close', 'open'],
  
  data() {
    return {
      internalShow: this.show
    };
  },
  
  watch: {
    show(newVal) {
      this.internalShow = newVal;
    },
    
    internalShow(newVal) {
      this.$emit('update:show', newVal);
      if (newVal) {
        this.$emit('open');
      } else {
        this.$emit('close');
      }
    }
  },
  
  methods: {
    openModal() {
      this.internalShow = true;
    },
    
    closeModal() {
      this.internalShow = false;
    },
    
    toggleModal() {
      this.internalShow = !this.internalShow;
    },
    
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.closeModal();
      }
    },
    
    handleEscapeKey(event) {
      if (event.key === 'Escape' && this.closeOnEsc) {
        this.closeModal();
      }
    }
  },
  
  mounted() {
    if (this.closeOnEsc) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }
  },
  
  beforeUnmount() {
    if (this.closeOnEsc) {
      document.removeEventListener('keydown', this.handleEscapeKey);
    }
  }
};

// Утилита для блокировки прокрутки body при открытом модальном окне
export const useBodyScrollLock = () => {
  const lockScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px'; // Для компенсации scrollbar
  };
  
  const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };
  
  return {
    lockScroll,
    unlockScroll
  };
};