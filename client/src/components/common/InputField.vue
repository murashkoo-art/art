<template>
  <div class="input-field" :class="{ 'input-field-error': error, 'input-field-disabled': disabled }">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>
    
    <div class="input-wrapper" :class="{ 'input-wrapper-textarea': type === 'textarea' }">
      <div v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix" />
      </div>
      
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        :id="id"
        :type="type === 'textarea' ? 'text' : type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :rows="type === 'textarea' ? rows : null"
        :class="[
          'input-element',
          { 
            'input-with-prefix': $slots.prefix, 
            'input-with-suffix': $slots.suffix,
            'input-textarea': type === 'textarea'
          }
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <div v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix" />
      </div>
      
      <button
        v-if="clearable && modelValue"
        type="button"
        class="input-clear"
        @click="handleClear"
        aria-label="Clear input"
      >
        <Icon name="close" :size="16" />
      </button>
    </div>
    
    <div v-if="error" class="input-error-message">
      {{ error }}
    </div>
    
    <div v-if="hint && !error" class="input-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { nanoid } from 'nanoid';
import Icon from './Icon.vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  rows: {
    type: Number,
    default: 3
  }
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'clear']);

const id = computed(() => `input-${nanoid()}`);

const handleInput = (event) => {
  emit('update:modelValue', event.target.value);
};

const handleBlur = (event) => {
  emit('blur', event);
};

const handleFocus = (event) => {
  emit('focus', event);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('clear');
};
</script>

<style scoped>
.input-field {
  margin-bottom: var(--spacing-4);
}

.input-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: 500;
  color: var(--color-gray-700);
}

.input-required {
  color: var(--color-danger);
  margin-left: 2px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-element {
  width: 100%;
  padding: var(--spacing-3);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-gray-800);
  background-color: var(--color-white);
  border: 2px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  outline: none;
}

.input-element:hover:not(:disabled) {
  border-color: var(--color-gray-400);
}

.input-element:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.input-element::placeholder {
  color: var(--color-gray-500);
}

.input-element:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
  opacity: 0.7;
}

.input-with-prefix {
  padding-left: calc(var(--spacing-3) * 2 + 20px);
}

.input-with-suffix {
  padding-right: calc(var(--spacing-3) * 2 + 20px);
}

.input-prefix,
.input-suffix {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-500);
}

.input-prefix {
  left: var(--spacing-3);
}

.input-suffix {
  right: var(--spacing-3);
}

.input-clear {
  position: absolute;
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: var(--color-gray-500);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.input-clear:hover {
  color: var(--color-gray-700);
}

.input-error-message {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.input-hint {
  margin-top: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
}

.input-field-error .input-element {
  border-color: var(--color-danger);
}

.input-field-error .input-element:focus {
  box-shadow: 0 0 0 3px rgba(247, 37, 133, 0.1);
}

.input-field-disabled .input-element {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

.input-wrapper-textarea {
  align-items: flex-start;
}

.input-textarea {
  resize: vertical;
  min-height: 80px;
  padding: var(--spacing-3);
  line-height: 1.5;
}
</style>