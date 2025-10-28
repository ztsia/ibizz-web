<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import Quill from 'quill';

import 'quill/dist/quill.snow.css';

interface Props {
  height?: number | string;
  modelValue?: string;
  placeholder?: string;
  readonly?: boolean;
  theme?: 'bubble' | 'snow';
  toolbar?: any[];
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'blur'): void;
  (e: 'focus'): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Please enter content...',
  readonly: false,
  theme: 'snow',
  toolbar: () => [
    ['bold', 'italic', 'underline'],
    ['blockquote', 'code-block'],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ['clean'],
    ['link'],
  ],
  height: '200px',
});

const emit = defineEmits<Emits>();

const editorRef = ref<HTMLElement>();
let quillInstance: null | Quill = null;
let isInternalChange = false;

const initQuill = () => {
  if (!editorRef.value) return;

  const options = {
    theme: props.theme,
    placeholder: props.placeholder,
    readOnly: props.readonly,
    modules: {
      toolbar: props.toolbar,
    },
  };

  quillInstance = new Quill(editorRef.value, options);

  // Set initial content
  if (props.modelValue) {
    quillInstance.root.innerHTML = props.modelValue;
  }

  // Set height
  if (props.height) {
    const height =
      typeof props.height === 'number' ? `${props.height}px` : props.height;
    quillInstance.root.style.height = height;
  }

  // Listen for text changes
  quillInstance.on('text-change', () => {
    if (isInternalChange) return;

    const html = quillInstance!.root.innerHTML;
    const isEmpty = quillInstance!.getText().trim().length === 0;
    const value = isEmpty ? '' : html;

    emit('update:modelValue', value);
    emit('change', value);
  });

  // Listen for selection changes
  quillInstance.on('selection-change', (range) => {
    if (range) {
      emit('focus');
    } else {
      emit('blur');
    }
  });
};

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!quillInstance) return;

    const currentValue = quillInstance.root.innerHTML;
    if (newValue !== currentValue) {
      isInternalChange = true;
      quillInstance.root.innerHTML = newValue || '';
      isInternalChange = false;
    }
  },
);

// Watch for readonly changes
watch(
  () => props.readonly,
  (newValue) => {
    if (quillInstance) {
      quillInstance.enable(!newValue);
    }
  },
);

onMounted(() => {
  initQuill();
});

onBeforeUnmount(() => {
  if (quillInstance) {
    quillInstance = null;
  }
});

// Expose methods for external use
defineExpose({
  getQuill: () => quillInstance,
  focus: () => quillInstance?.focus(),
  blur: () => quillInstance?.blur(),
  clear: () => quillInstance?.setText(''),
  getHTML: () => quillInstance?.root.innerHTML || '',
  getText: () => quillInstance?.getText() || '',
  getLength: () => quillInstance?.getLength() || 0,
});
</script>

<template>
  <div class="quill-editor-wrapper">
    <div ref="editorRef" class="quill-editor"></div>
  </div>
</template>

<style scoped>
.quill-editor-wrapper {
  @apply w-full;
}

.quill-editor :deep(.ql-container) {
  @apply border-input;
}

.quill-editor :deep(.ql-toolbar) {
  @apply border-input border-b-0;
}

.quill-editor :deep(.ql-editor) {
  @apply min-h-[120px] text-sm;
}

.quill-editor :deep(.ql-editor.ql-blank::before) {
  @apply text-muted-foreground italic;
}

.quill-editor :deep(.ql-snow .ql-tooltip) {
  @apply z-50;
}
</style>
