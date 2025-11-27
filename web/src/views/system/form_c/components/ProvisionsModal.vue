<template>
  <GenericFormModal ref="modalRef" @save="onSave" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import GenericFormModal from './GenericFormModal.vue';

const emit = defineEmits<{
  (e: 'save', payload: any): void;
}>();

const modalRef = ref<InstanceType<typeof GenericFormModal> | null>(null);

const open = (formId?: string) => {
  modalRef.value?.open(formId || 'provisions_form');
};

const onSave = (payload: any) => {
  emit('save', payload);
};

defineExpose({ open });
</script>
