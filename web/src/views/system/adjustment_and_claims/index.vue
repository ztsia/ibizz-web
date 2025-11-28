<template>
  <div class="p-6">
    <h1 class="mb-6 text-3xl font-bold">Adjustment and Claims</h1>
    <div class="rounded-lg border p-4 shadow-sm">
      <h2 class="mb-4 text-xl font-semibold">Claims List</h2>
      <FormLookupInput
        :field="claimField"
        :form-data="formData"
        :is-edit-mode="true"
        @update:field="handleFieldUpdate"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import FormLookupInput from '../form_c/components/fields/FormLookupInput.vue';
import type { FormTemplateField } from '../form_c/types';

const formData = ref<Record<string, any>>({
  claims: [],
});

const claimField: FormTemplateField = {
  id: 'claims',
  label: 'claims',
  inputType: 'lookup',
  addForm: 'adjustment_claims_form',
  required: false,
  columns: [
    { key: 'print_sequence', type: 'string', label: 'Print Seq.' },
    { key: 'type', type: 'string', label: 'Type' },
    { key: 'type_of_tax_exempt', type: 'string', label: 'Type of Tax Exempt' },
    { key: 'claim_type', type: 'string', label: 'Claim Type' },
    { key: 'description', type: 'string', label: 'Description' },
    { key: 'amount', type: 'double', label: 'Amount' },
  ],
};

function handleFieldUpdate({
  fieldId,
  value,
}: {
  fieldId: string;
  value: any;
}) {
  formData.value[fieldId] = value;
}
</script>
