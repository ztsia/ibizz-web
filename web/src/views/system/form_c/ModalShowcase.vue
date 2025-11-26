<template>
  <div class="p-6">
    <h1 class="mb-6 text-3xl font-bold">Form C Modals Showcase</h1>

    <div class="space-y-4">
      <Button @click="openCp204Modal">Open CP204 Form Modal</Button>
      <Button @click="openOtherParticularsModal"
        >Open Other Particulars Modal</Button
      >
      <Button @click="openGenericFormModal"
        >Open Adjustment and Claims Modal</Button
      >
    </div>

    <!-- Render the CP204Modal component, but keep it hidden initially -->
    <CP204Modal ref="cp204ModalRef" />
    <OtherParticularsModal ref="otherParticularsModalRef" />
    <GenericFormModal ref="genericFormModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Button } from '@vben-core/shadcn-ui';
import CP204Modal from '../../tax-filing/components/shared/CP204Modal.vue';
import OtherParticularsModal from '../../tax-filing/components/shared/OtherParticularsModal.vue';
import GenericFormModal from './components/GenericFormModal.vue';

// Ref to access the CP204Modal component instance
const cp204ModalRef = ref<InstanceType<typeof CP204Modal> | null>(null);

const openCp204Modal = () => {
  if (cp204ModalRef.value) {
    cp204ModalRef.value.open();
  }
};

// Ref to access the OtherParticularsModal component instance
const otherParticularsModalRef = ref<InstanceType<
  typeof OtherParticularsModal
> | null>(null);

const openOtherParticularsModal = () => {
  if (otherParticularsModalRef.value) {
    otherParticularsModalRef.value.open();
  }
};

// Ref to access the GenericFormModal component instance
const genericFormModalRef = ref<InstanceType<typeof GenericFormModal> | null>(
  null,
);

const openGenericFormModal = () => {
  if (genericFormModalRef.value) {
    genericFormModalRef.value.open('adjustment_claims_form');
  }
};
</script>
