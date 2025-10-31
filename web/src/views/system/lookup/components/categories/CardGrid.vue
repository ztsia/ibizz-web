<template>
  <div
    class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  >
    <div
      v-for="item in items"
      :key="item.id"
      data-test="grid-item"
      class="flex"
    >
      <slot :item="item" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import type { LookupCategory } from '../shared/types';

defineProps<{
  items: LookupCategory[];
}>();
</script>
