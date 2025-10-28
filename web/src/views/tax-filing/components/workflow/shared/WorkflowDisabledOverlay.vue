<template>
  <div
    v-if="disabled"
    class="absolute inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
  >
    <div class="text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center">
        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <p class="font-medium">{{ title || 'Workflow Processed' }}</p>
      <p class="text-sm opacity-75">
        {{
          message ||
          'This step has been completed and cannot be processed again'
        }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  disabled: boolean;
  title?: string;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Workflow Processed',
  message: 'This step has been completed and cannot be processed again',
});
</script>
