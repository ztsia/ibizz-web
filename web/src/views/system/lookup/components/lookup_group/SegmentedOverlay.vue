<template>
  <div
    v-if="show && position"
    ref="overlayRef"
    class="fixed z-[1200]"
    :style="{ top: position.top + 'px', left: position.left + 'px' }"
  >
    <Card class="flex items-center gap-2 p-2">
      <Button
        variant="outline"
        size="sm"
        data-test="edit-group-btn"
        @click="$emit('edit')"
      >
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        data-test="delete-group-btn"
        @click="$emit('delete')"
      >
        Delete
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        aria-label="Close segmented menu"
        title="Close"
        @click="$emit('close')"
      >
        ✕
      </Button>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Button, Card } from '@vben-core/shadcn-ui';

defineProps<{
  show: boolean;
  position: { top: number; left: number; width?: number } | null;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
  (e: 'close'): void;
}>();

const overlayRef = ref<HTMLElement | null>(null);

function handleClickAway(ev: any) {
  const el = overlayRef.value;
  if (el && !el.contains(ev.target)) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickAway, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickAway, true);
});
</script>
