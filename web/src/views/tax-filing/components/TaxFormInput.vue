<template>
  <div class="tax-form-input-wrapper" :class="wrapperClass">
    <Input
      v-model:value="inputValue"
      :class="inputClass"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :maxlength="maxlength"
      :type="type"
      @blur="handleBlur"
      @focus="handleFocus"
      @input="handleInput"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Input } from 'ant-design-vue';

interface Props {
  modelValue?: string | number;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  maxlength?: number;
  type?: 'text' | 'number';
  size?: 'small' | 'medium' | 'large';
  textAlign?: 'left' | 'center' | 'right';
  variant?: 'table' | 'standard' | 'borderless';
  width?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'blur', event: Event): void;
  (e: 'focus', event: Event): void;
  (e: 'input', event: Event): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  readonly: false,
  disabled: false,
  type: 'text',
  size: 'medium',
  textAlign: 'left',
  variant: 'standard',
  width: '100%',
});

const emit = defineEmits<Emits>();

const inputValue = ref(props.modelValue);

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue;
  },
);

// Watch for internal changes and emit
watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue);
});

// Computed classes for wrapper
const wrapperClass = computed(() => {
  const classes = ['tax-form-input-container'];

  if (props.size > 0) {
    classes.push(`tax-form-input-container--${props.size}`);
  }

  if (props.variant) {
    classes.push(`tax-form-input-container--${props.variant}`);
  }

  return classes;
});

// Computed classes for input
const inputClass = computed(() => {
  const classes = ['tax-form-input-enhanced'];

  if (props.textAlign) {
    classes.push(`tax-form-input-enhanced--${props.textAlign}`);
  }

  if (props.size > 0) {
    classes.push(`tax-form-input-enhanced--${props.size}`);
  }

  if (props.variant) {
    classes.push(`tax-form-input-enhanced--${props.variant}`);
  }

  return classes;
});

// Event handlers
const handleBlur = (event: Event) => {
  emit('blur', event);
};

const handleFocus = (event: Event) => {
  emit('focus', event);
};

const handleInput = (event: Event) => {
  emit('input', event);
};
</script>

<style scoped>
/* Enhanced Input Container with Flexbox */
.tax-form-input-wrapper {
  display: flex;
  align-items: center;
  width: v-bind('props.width');
  position: relative;
}

.tax-form-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 32px;
  position: relative;
}

/* Size Variants for Container */
.tax-form-input-container--small {
  min-height: 24px;
}

.tax-form-input-container--medium {
  min-height: 32px;
}

.tax-form-input-container--large {
  min-height: 40px;
}

/* Variant Styles for Container */
.tax-form-input-container--table {
  min-height: 20px;
  padding: 1px;
}

.tax-form-input-container--borderless {
  border: none;
  background: transparent;
}

/* Enhanced Input Styling */
:deep(.tax-form-input-enhanced) {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;

  /* Flexbox for perfect vertical centering */
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;

  /* Custom line-height and padding for better text positioning */
  line-height: 1 !important;
  padding: 0 8px !important;
  height: 100% !important;

  /* Remove default Ant Design input styling that interferes */
  box-shadow: none !important;
}

/* Text Alignment Variants */
:deep(.tax-form-input-enhanced--left) {
  text-align: left !important;
  justify-content: flex-start !important;
}

:deep(.tax-form-input-enhanced--center) {
  text-align: center !important;
  justify-content: center !important;
}

:deep(.tax-form-input-enhanced--right) {
  text-align: right !important;
  justify-content: flex-end !important;
}

/* Size Variants */
:deep(.tax-form-input-enhanced--small) {
  font-size: 12px !important;
  padding: 0 6px !important;
  min-height: 22px !important;
}

:deep(.tax-form-input-enhanced--medium) {
  font-size: 14px !important;
  padding: 0 8px !important;
  min-height: 30px !important;
}

:deep(.tax-form-input-enhanced--large) {
  font-size: 16px !important;
  padding: 0 12px !important;
  min-height: 38px !important;
}

/* Variant Styles */
:deep(.tax-form-input-enhanced--table) {
  font-size: 12px !important;
  padding: 0 4px !important;
  min-height: 18px !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.tax-form-input-enhanced--borderless) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.tax-form-input-enhanced--standard) {
  border: 1px solid #d9d9d9 !important;
  background: white !important;
}

/* Focus States */
:deep(.tax-form-input-enhanced:focus) {
  border-color: #1890ff !important;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
  outline: none !important;
}

:deep(.tax-form-input-enhanced--table:focus) {
  border: 1px solid #1890ff !important;
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.2) !important;
}

/* Hover States */
:deep(.tax-form-input-enhanced:hover:not(:focus)) {
  border-color: #40a9ff !important;
}

/* Disabled States */
:deep(.tax-form-input-enhanced:disabled) {
  background-color: #f5f5f5 !important;
  border-color: #d9d9d9 !important;
  color: rgba(0, 0, 0, 0.25) !important;
  cursor: not-allowed !important;
}

/* Readonly States */
:deep(.tax-form-input-enhanced[readonly]) {
  background-color: #fafafa !important;
  border-color: #d9d9d9 !important;
  cursor: default !important;
}

/* PDF Export Optimizations */
@media print {
  .tax-form-input-wrapper {
    break-inside: avoid;
  }

  :deep(.tax-form-input-enhanced) {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    border: 1px solid #666 !important;
    background: white !important;
    font-size: 10px !important;
    line-height: 1 !important;
    padding: 1px 3px !important;
    min-height: 14px !important;
  }

  :deep(.tax-form-input-enhanced--table) {
    border: none !important;
    background: transparent !important;
    font-size: 9px !important;
    padding: 0 2px !important;
    min-height: 12px !important;
  }

  /* Ensure text alignment is preserved in PDF */
  :deep(.tax-form-input-enhanced--right) {
    text-align: right !important;
  }

  :deep(.tax-form-input-enhanced--center) {
    text-align: center !important;
  }

  :deep(.tax-form-input-enhanced--left) {
    text-align: left !important;
  }
}
</style>
