<template>
  <div
    class="bg-muted/50 text-foreground/80 rounded-md p-3 text-sm italic"
    tabindex="-1"
    aria-readonly="true"
  >
    {{ value }}
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  field: { id: string };
  formData: Record<string, any>;
}>();

const value = computed(() => props.formData[props.field.id]);
</script>
