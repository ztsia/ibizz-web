<template>
  <template v-if="field.inputType === 'boolean'">
    <div class="flex items-center space-x-2">
      <Checkbox :id="`${field.id}-view`" :checked="rawValue" disabled />
      <Label :for="`${field.id}-view`" class="font-normal">{{
        field.label
      }}</Label>
    </div>
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

const safeString = (val: any) => {
  try {
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return String(val);
  } catch (e) {
    console.error('Error converting to string:', val, e);
    return '';
  }
};

const displayValue = computed(() => {
  const field = props.field as any;
  const v = rawValue.value;

  // Radios and selects: show the option label for the stored value
  if (
    (field.inputType === 'radio' || field.inputType === 'select') &&
    Array.isArray(field.options)
  ) {
    const opt = field.options.find((o: any) => safeString(o.value) === safeString(v));
    return opt ? opt.label : (v ?? '');
  }

  // Checkboxes (multi-select): map values to labels
  if (
    field.inputType === 'checkbox' &&
    Array.isArray(v) &&
    Array.isArray(field.options)
  ) {
    const labels = v.map((val: any) => {
      const opt = field.options.find(
        (o: any) => safeString(o.value) === safeString(val),
      );
      return opt ? opt.label : safeString(val);
    });
    return labels.join(', ');
  }

  // Currency: format with thousand separators and parentheses for negative
  if (field.inputType === 'currency') {
    const num = Number(v);
    if (Number.isNaN(num)) return safeString(v);
    const absVal = Math.abs(num).toLocaleString('en-US');
    return num < 0 ? `(${absVal})` : absVal;
  }

  // Numbers: format with thousand separators
  if (field.inputType === 'number') {
    return formatNumber(v);
  }

  // Fallback: show raw value
  if (v === null || v === undefined || v === '') return '';
  if (Array.isArray(v)) return v.join(', ');
  return safeString(v);
});
</script>
