<template>
  <template v-if="field.inputType === 'boolean'">
    <Checkbox :checked="rawValue" disabled />
  </template>
  <template v-else>
    <div class="text-muted-foreground text-sm">{{ displayValue || '—' }}</div>
  </template>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { FormTemplateField } from '../../types';
import { formatNumber } from '../../../lookup/utils';
import { Checkbox } from '@vben-core/shadcn-ui';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
}>();

const rawValue = computed(() => props.formData[props.field.id]);

const displayValue = computed(() => {
  const field = props.field as any;
  const v = rawValue.value;

  // Radios and selects: show the option label for the stored value
  if (
    (field.inputType === 'radio' || field.inputType === 'select') &&
    Array.isArray(field.options)
  ) {
    const opt = field.options.find((o: any) => String(o.value) === String(v));
    return opt ? opt.label : v ?? '';
  }

  // Checkboxes (multi-select): map values to labels
  if (
    field.inputType === 'checkbox' &&
    Array.isArray(v) &&
    Array.isArray(field.options)
  ) {
    const labels = v.map((val: any) => {
      const opt = field.options.find(
        (o: any) => String(o.value) === String(val),
      );
      return opt ? opt.label : String(val);
    });
    return labels.join(', ');
  }

  // Currency and numbers: format with thousand separators
  if (field.inputType === 'currency' || field.inputType === 'number') {
    return formatNumber(v);
  }

  // Fallback: show raw value
  if (v === null || v === undefined || v === '') return '';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
});
</script>
