<template>
  <div class="cp204-print-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204:</span>
        <span class="font-bold">ESTIMATION OF TAX PAYABLE</span>
      </div>
    </div>

    <!-- Fields -->
    <div class="space-y-4">
      <!-- Row 1 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">CP204 / CP205 Date</label>
        <div class="field-value w-1/2">
          {{ formData['cp204_cp205_date'] || '—' }}
        </div>
      </div>
      <!-- Row 2 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Estimated Revised for previous year</label
        >
        <div class="field-value w-1/2">
          {{ formatNumber(formData['estimated_revised_previous_year']) }}
        </div>
      </div>
      <!-- Row 3 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Estimated tax for current assessment year</label
        >
        <div class="field-value w-1/2">
          {{ formatNumber(formData['estimated_tax_current_year']) }}
        </div>
      </div>
      <!-- Row 4 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">S107A ACP (Non Resident)</label>
        <div class="field-value w-1/2">
          {{ formData['s107a_acp'] ? 'Yes' : 'No' }}
        </div>
      </div>
      <!-- Row 5 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Accounting Period</label>
        <div class="flex w-1/2 items-center">
          <div class="field-value-small">
            {{ formData['acc_period_from'] || '—' }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{ formData['acc_period_to'] || '—' }}
          </div>
        </div>
      </div>
      <!-- Row 6 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Basis Period</label>
        <div class="flex w-1/2 items-center">
          <div class="field-value-small">
            {{ formData['basis_period_from'] || '—' }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{ formData['basis_period_to'] || '—' }}
          </div>
        </div>
      </div>
      <!-- Row 7 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New company business commenced on</label
        >
        <div class="field-value w-1/2">
          {{ formData['new_company_commenced_on'] || '—' }}
        </div>
      </div>
      <!-- Row 8 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New Company with SME status only, TA</label
        >
        <div class="flex w-1/2 items-center">
          <div class="field-value-small">
            {{ formData['new_company_sme_status'] || '—' }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{ formData['new_company_sme_status_to'] || '—' }}
          </div>
        </div>
      </div>
      <!-- Row 9 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Financial year end</label>
        <div class="field-value w-1/2">
          {{ formData['financial_year_end'] || '—' }}
        </div>
      </div>
      <!-- Row 10 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">1 to 11 Installments</label>
        <div class="field-value w-1/2">
          {{ formatNumber(formData['installments_1_to_11']) }}
        </div>
      </div>
      <!-- Row 11 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Final installment</label>
        <div class="field-value w-1/2">
          {{ formatNumber(formData['final_installment']) }}
        </div>
      </div>
      <!-- Row 12 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New company or change of financial year end</label
        >
        <div class="field-value w-1/2">
          {{ formData['new_company_or_change_fye'] ? 'Yes' : 'No' }}
        </div>
      </div>
      <!-- Row 13 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Following assessment basis period</label
        >
        <div class="flex w-1/2 items-center">
          <div class="field-value-small">
            {{ formData['following_basis_period_from'] || '—' }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{ formData['following_basis_period_to'] || '—' }}
          </div>
        </div>
      </div>
      <!-- Row 14 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Next assessment basis period</label>
        <div class="flex w-1/2 items-center">
          <div class="field-value-small">
            {{ formData['next_basis_period_from'] || '—' }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{ formData['next_basis_period_to'] || '—' }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <span class="font-bold">-- End of CP204 --</span>
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
.cp204-print-template {
  line-height: 1.4;
}
.field-value {
  @apply ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}
.field-value-small {
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm;
}
@media print {
  .cp204-print-template {
    font-size: 12px;
    color: black;
  }
}
</style>
