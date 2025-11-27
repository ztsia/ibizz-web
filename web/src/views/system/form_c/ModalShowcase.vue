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
      <Button @click="openProvisionsModal">Open Provisions Modal</Button>
      <Button @click="openOtherIncomeModal">Open Other Income Modal</Button>
    </div>

    <!-- Render the CP204Modal component, but keep it hidden initially -->
    <CP204Modal ref="cp204ModalRef" />
    <OtherParticularsModal ref="otherParticularsModalRef" />
    <AdjustmentClaimsModal ref="adjustmentClaimsModalRef" />
    <ProvisionsModal ref="provisionsModalRef" />
    <OtherIncomeModal ref="otherIncomeModalRef" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Button } from '@vben-core/shadcn-ui';
import CP204Modal from '../../tax-filing/components/shared/CP204Modal.vue';
import OtherParticularsModal from '../../tax-filing/components/shared/OtherParticularsModal.vue';
import AdjustmentClaimsModal from './components/AdjustmentClaimsModal.vue';
import ProvisionsModal from './components/ProvisionsModal.vue';
import OtherIncomeModal from './components/OtherIncomeModal.vue';

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

// Ref to access the AdjustmentClaimsModal component instance
const adjustmentClaimsModalRef = ref<InstanceType<
  typeof AdjustmentClaimsModal
> | null>(null);

const openGenericFormModal = () => {
  if (adjustmentClaimsModalRef.value) {
    adjustmentClaimsModalRef.value.open('adjustment_claims_form');
  }
};

const openProvisionsModal = () => {
  if (provisionsModalRef.value) {
    provisionsModalRef.value.open();
  }
};

// Ref to access the ProvisionsModal component instance
const provisionsModalRef = ref<InstanceType<typeof ProvisionsModal> | null>(
  null,
);

// Ref to access the OtherIncomeModal component instance
const otherIncomeModalRef = ref<InstanceType<typeof OtherIncomeModal> | null>(
  null,
);

const openOtherIncomeModal = () => {
  if (otherIncomeModalRef.value) {
    otherIncomeModalRef.value.open();
  }
};


</script>
