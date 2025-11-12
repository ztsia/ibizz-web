<template>
  <div v-if="isVisible" class="space-y-2">
    <Label v-if="!field.isLabelHidden" :for="field.id">{{ field.label }}</Label>

    <!-- EDIT MODE -->
    <template v-if="isEditMode">
      <!-- Countries/States with LookupSelect -->
      <LookupSelect
        v-if="field.inputType === 'countries' || field.inputType === 'states'"
        v-model="fieldValue"
        :lookup-slug="
          field.inputType === 'countries' ? 'country-code' : 'state-code'
        "
      />

      <!-- Lookup fields -->
      <FormLookupInput
        v-else-if="field.inputType === 'lookup'"
        :field="field"
        :form-data="formData"
        :is-edit-mode="isEditMode"
      />

      <!-- ItemList -->
      <FormItemList
        v-else-if="field.inputType === 'itemList'"
        :field="field"
        :form-data="formData"
        :is-edit-mode="isEditMode"
        @update:field="onUpdateField"
      />

      <!-- Readonly note -->
      <ReadonlyNoteField
        v-else-if="field.inputType === 'readonly_note'"
        :field="field"
        :form-data="formData"
      />

      <!-- Text, Number, Email, Date -->
      <Input
        v-else-if="
          ['text', 'number', 'email', 'date'].includes(field.inputType)
        "
        :id="field.id"
        :type="field.inputType"
        v-model="fieldValue"
      />

      <!-- Radio buttons -->
      <RadioGroup v-else-if="field.inputType === 'radio'" v-model="fieldValue">
        <div :class="radioLayoutClass">
          <div
            class="flex items-center space-x-2"
            v-for="option in field.options"
            :key="option.value"
          >
            <RadioGroupItem
              :value="option.value"
              :id="`${field.id}-${option.value}`"
            />
            <Label
              :for="`${field.id}-${option.value}`"
              class="cursor-pointer font-normal"
              >{{ option.label }}</Label
            >
          </div>
        </div>
      </RadioGroup>

      <!-- Checkboxes -->
      <div v-else-if="field.inputType === 'checkbox'" class="space-y-2">
        <div
          class="flex items-center space-x-2"
          v-for="option in field.options"
          :key="option.value"
        >
          <Checkbox
            :id="`${field.id}-${option.value}`"
            :checked="isChecked(option.value)"
            @update:checked="
              (checked) => onCheckboxChange(option.value, checked)
            "
          />
          <Label
            :for="`${field.id}-${option.value}`"
            class="cursor-pointer font-normal"
            >{{ option.label }}</Label
          >
        </div>
      </div>

      <!-- Select dropdown -->
      <Select v-else-if="field.inputType === 'select'" v-model="fieldValue">
        <SelectTrigger :id="field.id">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>

    <!-- VIEW MODE -->
    <template v-else>
      <!-- Readonly note (shown in both modes) -->
      <ReadonlyNoteField
        v-if="field.inputType === 'readonly_note'"
        :field="field"
        :form-data="formData"
      />

      <!-- ItemList in view mode -->
      <FormItemList
        v-else-if="field.inputType === 'itemList'"
        :field="field"
        :form-data="formData"
        :is-edit-mode="false"
        @update:field="onUpdateField"
      />

      <!-- Lookup fields in view mode -->
      <FormLookupInput
        v-else-if="field.inputType === 'lookup'"
        :field="field"
        :form-data="formData"
        :is-edit-mode="false"
      />

      <!-- All other fields use ViewField -->
      <ViewField
        v-else
        :field="field"
        :form-data="formData"
        :is-edit-mode="false"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue';
import type { FormTemplateField } from '../../types';
import { useShowIfEngine } from '../../composables';
// SFC imports: some TS setups don't expose default export types for .vue files.
import ViewField from './ViewField.vue';
import FormLookupInput from '../form_lookup/FormLookupInput.vue';
import ReadonlyNoteField from './ReadonlyNoteField.vue';
import FormItemList from '../FormItemList.vue';
import { LookupSelect } from '../../../shared_components';
import {
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
}>();

const emit = defineEmits(['update:field']);

const formDataRef = toRef(props, 'formData');
const { isVisible } = useShowIfEngine(props.field.show_if, formDataRef);

const fieldValue = computed({
  get: () => props.formData[props.field.id],
  set: (value) => emit('update:field', { fieldId: props.field.id, value }),
});

// Layout class for radio groups: two-option radios should render in a row
const radioLayoutClass = computed(() => {
  const opts = props.field.options;
  if (!opts || !Array.isArray(opts)) return 'flex flex-col space-y-2';
  return opts.length === 2
    ? 'flex items-center space-x-6'
    : 'flex flex-col space-y-2';
});

const onUpdateField = (payload: { fieldId: string; value: any }) => {
  emit('update:field', payload);
};

const onCheckboxChange = (value: string, checked: boolean) => {
  const currentValues = Array.isArray(fieldValue.value) ? fieldValue.value : [];
  const newValues = checked
    ? [...currentValues, value]
    : currentValues.filter((v) => v !== value);
  fieldValue.value = newValues;
};

const isChecked = (value: string): boolean => {
  return Array.isArray(fieldValue.value) && fieldValue.value.includes(value);
};
</script>
