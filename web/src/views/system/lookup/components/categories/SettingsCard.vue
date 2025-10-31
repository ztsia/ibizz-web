<template>
  <Card
    :class="[
      'settings-card',
      'flex h-full w-full cursor-pointer flex-col transition-all duration-200 ease-in-out hover:-translate-y-0.5',
      'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      { 'cursor-not-allowed opacity-60': disabled },
    ]"
    @click="handleSelect"
    role="button"
    :aria-disabled="disabled"
  >
    <CardHeader class="p-4">
      <div class="mb-2 flex items-center">
        <VbenIcon :icon="icon" class="mr-3" size="32" />
        <CardTitle class="break-words text-lg font-semibold">{{
          clampedTitle
        }}</CardTitle>
      </div>
    </CardHeader>
    <CardContent class="flex-grow">
      <p class="break-words text-sm text-gray-600">{{ clampedDescription }}</p>
    </CardContent>
  </Card>
</template>

<script lang="ts" setup>
import type { Component } from 'vue';
import { computed } from 'vue';
import {
  VbenIcon,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  id?: string;
  title: string;
  description?: string;
  icon?: string | Component;
  color?: string;
  disabled?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', payload?: any): void;
  (e: 'activate'): void;
}>();

/**
 * Compute a shortened title for display (max ~48 chars).
 * Returns an empty string when `props.title` is falsy.
 */
const clampedTitle = computed(() => {
  if (!props.title) return '';
  return props.title.length > 48 ? `${props.title.slice(0, 48)}…` : props.title;
});

/**
 * Compute a shortened description for display (max ~120 chars).
 * Returns an empty string when `props.description` is falsy.
 */
const clampedDescription = computed(() => {
  if (!props.description) return '';
  return props.description.length > 120
    ? `${props.description.slice(0, 120)}…`
    : props.description;
});

/**
 * Handle activation (click) on the card.
 *
 * Behaviour: emits `select` with the card id/title unless disabled.
 */
function handleSelect() {
  if (props.disabled) return;
  emit('select', { id: props.id || '', title: props.title });
}

/**
 * Programmatic activation handler - emits `activate` unless disabled.
 */
function _handleActivate() {
  if (props.disabled) return;
  emit('activate');
}
</script>
