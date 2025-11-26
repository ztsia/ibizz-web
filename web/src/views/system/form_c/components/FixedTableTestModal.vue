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

const open = () => {
  modalRef.value?.open('fixed_table_test_form');
};

const onSave = (payload: any) => {
  console.log('FixedTableTestModal saved:', payload);
  emit('save', payload);
};

defineExpose({ open });
</script>
