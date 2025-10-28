<template>
  <div class="pdf-form-field-wrapper">
    <!-- Text-only version for PDF export -->
    <span
      v-if="isPdfExport"
      :class="['pdf-text-only', textClass, alignmentClass, sizeClass]"
    >
      {{ displayValue }}
    </span>

    <!-- Input version for screen display -->
    <input
      v-else
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="disabled"
      :maxlength="maxlength"
      :class="['tax-form-input-base', inputClass, alignmentClass, sizeClass]"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePdfExportContext } from '#/composables/usePdfExportContext';

interface Props {
  modelValue?: string | number;
  type?: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  maxlength?: number;
  variant?: 'table' | 'standard' | 'small';
  textAlign?: 'left' | 'center' | 'right';
  customClass?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  readonly: false,
  disabled: false,
  variant: 'table',
  textAlign: 'right',
  customClass: '',
});

const emit = defineEmits<Emits>();

// Get PDF export context
const { isPdfExport } = usePdfExportContext();

// Computed classes based on variant and alignment
const textClass = computed(() => {
  switch (props.variant) {
    case 'table': {
      return 'pdf-text-table-cell';
    }
    case 'standard': {
      return 'pdf-text-standard';
    }
    case 'small': {
      return 'pdf-text-small';
    }
    default: {
      return 'pdf-text-table-cell';
    }
  }
});

const inputClass = computed(() => {
  const baseClasses = [];

  switch (props.variant) {
    case 'table': {
      baseClasses.push('w-full', 'border-0', 'bg-transparent', 'text-xs');
      break;
    }
    case 'standard': {
      baseClasses.push('border', 'border-gray-400', 'bg-white', 'text-sm');
      break;
    }
    case 'small': {
      baseClasses.push('border', 'border-gray-400', 'bg-white', 'text-xs');
      break;
    }
  }

  return baseClasses.join(' ');
});

const alignmentClass = computed(() => {
  switch (props.textAlign) {
    case 'left': {
      return 'text-left pdf-text-left';
    }
    case 'center': {
      return 'text-center pdf-text-center';
    }
    case 'right': {
      return 'text-right pdf-text-right';
    }
    default: {
      return 'text-right pdf-text-right';
    }
  }
});

const sizeClass = computed(() => {
  if (props.customClass) {
    return props.customClass;
  }

  switch (props.variant) {
    case 'table': {
      return 'px-1 py-1';
    }
    case 'standard': {
      return 'px-3 py-2';
    }
    case 'small': {
      return 'px-2 py-1';
    }
    default: {
      return 'px-1 py-1';
    }
  }
});

// Display value for text mode
const displayValue = computed(() => {
  if (
    props.modelValue === undefined ||
    props.modelValue === null ||
    props.modelValue === ''
  ) {
    return props.placeholder || '0.00';
  }

  // Format numbers for display
  if (props.type === 'number' && typeof props.modelValue === 'number') {
    return props.modelValue.toFixed(2);
  }

  return String(props.modelValue);
});

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('change', target.value);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};
</script>

<style scoped>
.pdf-form-field-wrapper {
  display: contents;
}

/* Ensure proper alignment in table cells */
td .pdf-form-field-wrapper,
th .pdf-form-field-wrapper {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
