<template>
  <div
    v-if="isVisible"
    class="w-full"
    :class="{
      'sm:col-span-2':
        field.inputType === 'lookup' || field.inputType === 'itemList',
    }"
  >
    <div
      v-if="field.inputType !== 'lookup' && !props.compact"
      class="mb-2 min-h-[24px]"
    >
      <Label
        v-if="!field.isLabelHidden && field.inputType !== 'lookup'"
        :for="field.id"
        >{{ field.label }}</Label
      >
    </div>

    <!-- Lookup fields (handle both edit/view modes internally) -->
    <div
      v-if="field.inputType === 'lookup'"
      :class="{ 'border-destructive rounded-md border': error }"
    >
      <FormLookupInput
        :field="field"
        :form-data="formData"
        :is-edit-mode="isEditMode"
        @update:field="onUpdateField"
      />
    </div>

    <!-- ItemList (handle both edit/view modes internally) -->
    <div
      v-else-if="field.inputType === 'itemList'"
      :class="{ 'border-destructive rounded-md border': error }"
    >
      <FormItemList
        :field="field"
        :form-data="formData"
        :is-edit-mode="isEditMode"
        @update:field="onUpdateField"
      />
    </div>

    <!-- Readonly note (handle both edit/view modes internally) -->
    <ReadonlyNoteField
      v-else-if="field.inputType === 'readonly_note'"
      :field="field"
      :form-data="formData"
    />

    <!-- All other fields: switch between input and view component -->
    <template v-else>
      <!-- EDIT MODE -->
      <template v-if="isEditMode">
        <!-- Countries/States with LookupSelect -->
        <LookupSelect
          v-if="field.inputType === 'countries' || field.inputType === 'states'"
          v-model="fieldValue"
          :lookup-slug="
            field.inputType === 'countries' ? 'country-code' : 'state-code'
          "
          :class="{ 'border-destructive': error }"
        />

        <!-- Text, Number, Email, Date -->
        <Input
          v-else-if="
            ['text', 'number', 'email', 'date'].includes(field.inputType)
          "
          :id="field.id"
          :type="field.inputType"
          v-model="fieldValue"
          :class="{ 'border-destructive': error }"
        />

        <InputNumber
          v-else-if="field.inputType === 'currency'"
          :id="field.id"
          v-model:value="fieldValue"
          :formatter="
            (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          "
          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
          style="width: 100%"
          class="h-10"
          :class="{ 'border-destructive': error }"
        />

        <!-- Radio buttons -->
        <div
          v-else-if="field.inputType === 'radio'"
          class="rounded-md"
          :class="{ 'border-destructive border p-2': error }"
        >
          <RadioGroup v-model="fieldValue">
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
        </div>
        <!-- Checkboxes -->
        <div
          v-else-if="field.inputType === 'checkbox'"
          class="space-y-2 rounded-md"
          :class="{ 'border-destructive border p-2': error }"
        >
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
          <SelectTrigger
            :id="field.id"
            :class="{ 'border-destructive': error }"
          >
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent class="max-h-60">
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
        <ViewField :field="field" :form-data="formData" :is-edit-mode="false" />
      </template>
    </template>

    <p v-if="error" class="text-destructive text-sm font-medium">{{ error }}</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef, watch } from 'vue';
import type { FormTemplateField } from '../../types';
import { useShowIfEngine } from '../../composables';
// SFC imports: some TS setups don't expose default export types for .vue files.
import ViewField from './ViewField.vue';
import FormLookupInput from './FormLookupInput.vue';
import ReadonlyNoteField from './ReadonlyNoteField.vue';
import FormItemList from './FormItemList.vue';
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
import { InputNumber } from 'ant-design-vue';

const props = defineProps<{
  field: FormTemplateField;
  formData: Record<string, any>;
  isEditMode: boolean;
  error?: string;
  compact?: boolean;
}>();

watch(
  () => props.field,
  (newField) => {
    console.log('FormField received field:', newField);
  },
  { immediate: true, deep: true },
);

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
