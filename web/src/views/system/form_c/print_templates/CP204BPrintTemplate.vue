<template>
  <div class="cp204b-print-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204B:</span>
        <span class="font-bold"
          >NOTIFICATION OF CHANGE IN ACCOUNTING PERIOD</span
        >
      </div>
    </div>

    <div class="space-y-4">
      <!-- Row 1 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">CP204B Date</label>
        <div class="field-value">
          {{ getDisplayValue('cp204b_date', formData['cp204b_date']) }}
        </div>
      </div>
      <!-- Row 2 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Current accounting period</label>
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_current_acc_from',
                formData['cp204b_current_acc_from'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_current_acc_to',
                formData['cp204b_current_acc_to'],
              )
            }}
          </div>
        </div>
      </div>
      <!-- Row 3 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">New accounting period</label>
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_new_acc_from',
                formData['cp204b_new_acc_from'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_new_acc_to',
                formData['cp204b_new_acc_to'],
              )
            }}
          </div>
        </div>
      </div>
      <!-- Row 4 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Current assessment year basis period</label
        >
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_current_basis_from',
                formData['cp204b_current_basis_from'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_current_basis_to',
                formData['cp204b_current_basis_to'],
              )
            }}
          </div>
        </div>
      </div>
      <!-- Row 5 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Following assessment basis period</label
        >
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_following_basis_from',
                formData['cp204b_following_basis_from'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_following_basis_to',
                formData['cp204b_following_basis_to'],
              )
            }}
          </div>
        </div>
      </div>
      <!-- Row 6 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Next assessment basis period</label>
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_next_basis_from',
                formData['cp204b_next_basis_from'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue(
                'cp204b_next_basis_to',
                formData['cp204b_next_basis_to'],
              )
            }}
          </div>
        </div>
      </div>
      <!-- Row 7 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Previous estimated tax payable</label>
        <div class="field-value">
          {{
            formatNumber(
              getDisplayValue(
                'cp204b_previous_estimated_tax',
                formData['cp204b_previous_estimated_tax'],
              ),
            )
          }}
        </div>
      </div>
      <!-- Row 8 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Revised estimated tax payable</label>
        <div class="field-value">
          {{
            formatNumber(
              getDisplayValue(
                'cp204b_revised_estimated_tax',
                formData['cp204b_revised_estimated_tax'],
              ),
            )
          }}
        </div>
      </div>
    </div>

    <div class="mt-8 text-center">
      <span class="font-bold">-- End of CP204B --</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatNumber } from '../../lookup/utils';
import type { FormTemplate } from '../../types';

const props = defineProps<{
  formData: Record<string, any>;
  template: FormTemplate | null;
}>();

const getDisplayValue = (fieldId: string, value: any) => {
  if (!props.template || value === undefined || value === null) {
    return value || '—';
  }

  for (const page of props.template.pages) {
    for (const section of page.sections) {
      const field = section.fields.find((f) => f.id === fieldId);
      if (
        field &&
        (field.inputType === 'select' || field.inputType === 'radio')
      ) {
        const option = field.options?.find((o) => o.value === value);
        return option ? option.label : value;
      }
    }
  }

  return value;
};
</script>

<style scoped>
.cp204b-print-template {
  line-height: 1.4;
}
.field-value {
  @apply ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}
.field-value-small {
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm;
}
@media print {
  .cp204b-print-template {
    font-size: 12px;
    color: black;
  }
}
</style>
