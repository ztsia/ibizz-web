<template>
  <div class="cp204a-print-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204A:</span>
        <span class="font-bold">REVISION OF ESTIMATION OF TAX PAYABLE</span>
      </div>
    </div>

    <!-- 1st Revision -->
    <div class="mb-8">
      <h3 class="mb-4 text-lg font-semibold border-b">1st Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-48 font-medium">Application made before the 15th day of the sixth month</label>
          <div class="field-value">
            {{ formData['revision_1_application_made'] ? 'Yes' : 'No' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">CP204A Date</label>
          <div class="field-value">
            {{ formData['revision_1_date'] || '—' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_1_revised_estimated_tax']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Less Tax paid to date</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_1_less_tax_paid']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Balance estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_1_balance_estimated_tax']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised installment tax payment 6th to 11th installment @</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_1_revised_installment_6_11']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Final Installment</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_1_final_installment']) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 2nd Revision -->
    <div class="mb-8">
      <h3 class="mb-4 text-lg font-semibold border-b">2nd Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-48 font-medium">Application made before the 15th day of the ninth month</label>
          <div class="field-value">
            {{ formData['revision_2_application_made'] ? 'Yes' : 'No' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">CP204A Date</label>
          <div class="field-value">
            {{ formData['revision_2_date'] || '—' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_2_revised_estimated_tax']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Less Tax paid to date</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_2_less_tax_paid']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Balance estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_2_balance_estimated_tax']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised installment tax payment 9th to 11th installment @</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_2_revised_installment_9_11']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Final Installment</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_2_final_installment']) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Special Revision -->
    <div class="mb-8">
      <h3 class="mb-4 text-lg font-semibold border-b">Special Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-48 font-medium">Revision Type</label>
          <div class="field-value">
            {{ formData['special_revision_type'] || '—' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Application / CP205 Date</label>
          <div class="field-value">
            {{ formData['special_revision_date'] || '—' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['special_revision_revised_estimated_tax']) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3rd Revision -->
    <div class="mb-8">
      <h3 class="mb-4 text-lg font-semibold border-b">3rd Revision</h3>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-48 font-medium">Application made before the 15th day of the eleventh month</label>
          <div class="field-value">
            {{ formData['revision_3_application_made'] ? 'Yes' : 'No' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">CP204A Date</label>
          <div class="field-value">
            {{ formData['revision_3_date'] || '—' }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_3_revised_estimated_tax']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Less Tax paid to date</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_3_less_tax_paid']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Balance estimated tax payable</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_3_balance_estimated_tax']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Revised installment tax payment 11th installment @</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_3_revised_installment_11']) }}
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-48 font-medium">Final Installment</label>
          <div class="field-value">
            {{ formatNumber(formData['revision_3_final_installment']) }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <span class="font-bold">-- End of CP204A --</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatNumber } from '../../lookup/utils';

defineProps<{
  formData: Record<string, any>;
}>();
</script>

<style scoped>
.cp204a-print-template {
  line-height: 1.4;
}
.field-value {
  @apply ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}
@media print {
  .cp204a-print-template {
    font-size: 12px;
    color: black;
  }
}
</style>
