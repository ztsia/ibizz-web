<template>
  <div class="flex gap-2">
    <Button variant="outline" @click="$emit('cancel')">Cancel</Button>
    <Button :disabled="disabled" @click="$emit('save')">Save</Button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Button } from '@vben-core/shadcn-ui';

// props and emits are used from the template; declare for types only
defineProps<{ disabled?: boolean }>();
defineEmits<{
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();
</script>
