<template>
  <div class="flex items-center gap-1">
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8"
      aria-label="Edit group"
      @click="onEdit"
    >
      <Pencil class="h-4 w-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
      aria-label="Delete group"
      @click="onDelete"
    >
      <Trash class="h-4 w-4" />
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { Button } from '@vben-core/shadcn-ui';
import { Pencil, Trash } from '@vben/icons';

const props = defineProps<{
  group: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'edit', group: Record<string, any>): void;
  (e: 'delete', group: Record<string, any>): void;
}>();

function onEdit() {
  emit('edit', props.group);
}

function onDelete() {
  emit('delete', props.group);
}
</script>
