<template>
  <div class="p-6">
    <h1 class="mb-6 text-3xl font-bold">Form C Modals Showcase</h1>

    <div class="space-y-4">
      <Button @click="openCp204Modal">Open CP204 Form Modal</Button>
    </div>

    <!-- Render the CP204Modal component, but keep it hidden initially -->
    <CP204Modal ref="cp204ModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Button } from '@vben-core/shadcn-ui';
import { CP204Modal } from './modals'; // Import from the barrel export

// Ref to access the CP204Modal component instance
const cp204ModalRef = ref<InstanceType<typeof CP204Modal> | null>(null);

const openCp204Modal = () => {
  if (cp204ModalRef.value) {
    cp204ModalRef.value.open();
  }
};
</script>
