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
        <div class="field-value">
          {{
            getDisplayValue('cp204_cp205_date', formData['cp204_cp205_date'])
          }}
        </div>
      </div>
      <!-- Row 2 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Estimated Revised for previous year</label
        >
        <div class="field-value">
          {{
            formatNumber(
              getDisplayValue(
                'estimated_revised_previous_year',
                formData['estimated_revised_previous_year'],
              ),
            )
          }}
        </div>
      </div>
      <!-- Row 3 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Estimated tax for current assessment year</label
        >
        <div class="field-value">
          {{
            formatNumber(
              getDisplayValue(
                'estimated_tax_current_year',
                formData['estimated_tax_current_year'],
              ),
            )
          }}
        </div>
      </div>
      <!-- Row 4 -->
      <div class="flex items-center">
        <Checkbox
          :checked="!!formData['s107a_acp']"
          disabled
          class="print-checkbox"
        />
        <label class="ml-2 font-medium">S107A ACP (Non Resident)</label>
      </div>
      <!-- Row 5 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Accounting Period</label>
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue('acc_period_from', formData['acc_period_from'])
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{ getDisplayValue('acc_period_to', formData['acc_period_to']) }}
          </div>
        </div>
      </div>
      <!-- Row 6 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Basis Period</label>
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'basis_period_from',
                formData['basis_period_from'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue('basis_period_to', formData['basis_period_to'])
            }}
          </div>
        </div>
      </div>
      <!-- Row 7 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New company business commenced on</label
        >
        <div class="field-value">
          {{
            getDisplayValue(
              'new_company_commenced_on',
              formData['new_company_commenced_on'],
            )
          }}
        </div>
      </div>
      <!-- Row 8 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >New Company with SME status only, TA</label
        >
        <div class="ml-4 flex flex-1 items-center">
          <div class="field-value-small">
            {{
              getDisplayValue(
                'new_company_sme_status',
                formData['new_company_sme_status'],
              )
            }}
          </div>
          <span class="mx-2 font-medium">To</span>
          <div class="field-value-small">
            {{
              getDisplayValue(
                'new_company_sme_status_to',
                formData['new_company_sme_status_to'],
              )
            }}
          </div>
        </div>
      </div>
      <!-- Row 9 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Financial year end</label>
        <div class="field-value">
          {{
            getDisplayValue(
              'financial_year_end',
              formData['financial_year_end'],
            )
          }}
        </div>
      </div>
      <!-- Row 10 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">1 to 11 Installments</label>
        <div class="field-value">
          {{
            formatNumber(
              getDisplayValue(
                'installments_1_to_11',
                formData['installments_1_to_11'],
              ),
            )
          }}
        </div>
      </div>
      <!-- Row 11 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Final installment</label>
        <div class="field-value">
          {{
            formatNumber(
              getDisplayValue(
                'final_installment',
                formData['final_installment'],
              ),
            )
          }}
        </div>
      </div>
    </div>

    <!-- New section: New company or change of financial year end -->
    <div class="mb-12 mt-8">
      <h3 class="mb-4 border-b text-lg font-semibold">
        New company or change of financial year end
      </h3>
      <div class="space-y-4">
        <!-- Fields for this section -->
        <div class="flex items-center">
          <label class="w-1/2 font-medium"
            >Following assessment basis period</label
          >
          <div class="ml-4 flex flex-1 items-center">
            <div class="field-value-small">
              {{
                getDisplayValue(
                  'following_basis_period_from',
                  formData['following_basis_period_from'],
                )
              }}
            </div>
            <span class="mx-2 font-medium">To</span>
            <div class="field-value-small">
              {{
                getDisplayValue(
                  'following_basis_period_to',
                  formData['following_basis_period_to'],
                )
              }}
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/2 font-medium">Next assessment basis period</label>
          <div class="ml-4 flex flex-1 items-center">
            <div class="field-value-small">
              {{
                getDisplayValue(
                  'next_basis_period_from',
                  formData['next_basis_period_from'],
                )
              }}
            </div>
            <span class="mx-2 font-medium">To</span>
            <div class="field-value-small">
              {{
                getDisplayValue(
                  'next_basis_period_to',
                  formData['next_basis_period_to'],
                )
              }}
            </div>
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
import { Checkbox } from '@vben-core/shadcn-ui';
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
.cp204-print-template {
  line-height: 1.4;
}
.field-value {
  @apply ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}
.field-value-small {
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm;
}
.print-checkbox {
  @apply h-4 w-4 border-2 border-gray-700;
}
@media print {
  .cp204-print-template {
    font-size: 12px;
    color: black;
  }
}
</style>
