<template>
  <div class="flex items-center gap-4 mt-4">
    <div class="flex items-center">
      <Checkbox
        id="print-selected"
        v-model:checked="printSelectedOnly"
        :disabled="isGenerating"
      />
      <label for="print-selected" class="ml-2 text-sm font-medium">
        Print selected items only
      </label>
    </div>
    <Button
      :disabled="isGenerating"
      @click="isGenerated ? handleDownload() : handleGeneratePdf()"
    >
      <Loader2 v-if="isGenerating" class="mr-2 h-4 w-4 animate-spin" />
      <FileText v-else class="mr-2 h-4 w-4" />
      {{ buttonText }}
    </Button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Button, Checkbox } from '@vben-core/shadcn-ui';
import { Loader2, FileText } from 'lucide-vue-next';
import { generatePdfReport } from '../../../services/pdfService';
import * as lookupService from '../../../services';
import { notifyError, notifySuccess } from '../../../lookup/utils/index';

const props = defineProps<{
  title: string;
  submissionYear: number;
  headers: any[];
  lookupSlug: string;
  selectedRowIds: string[];
}>();

const printSelectedOnly = ref(false);
const isGenerating = ref(false);
const isGenerated = ref(false);

const buttonText = computed(() => {
  if (isGenerating.value) {
    return 'Generating...';
  }
  if (isGenerated.value) {
    return 'Download PDF';
  }
  return 'Generate PDF';
});

async function handleGeneratePdf() {
  isGenerating.value = true;
  isGenerated.value = false;

  try {
    // 1. Fetch all items
    const result = await lookupService.listItems(props.lookupSlug, {
      perPage: 9999, // Fetch all items
    });
    const rawRows = Array.isArray(result) ? result : result?.items || [];

    // 2. Transform rows to match PDF service schema: { id, columns: {...} }
    const allRows = rawRows.map((row: any) => {
      // If row already has a 'columns' property, use it directly (avoid double nesting)
      if (row.columns && typeof row.columns === 'object') {
        return {
          id: row.id || row._id || String(Math.random()),
          columns: row.columns,
        };
      }
      // Otherwise, extract id and put everything else into columns
      const { id, _id, ...columns } = row;
      return {
        id: id || _id || String(Math.random()),
        columns,
      };
    });

    // 3. Transform headers to match PDF service schema: { key, label } only
    const headers = props.headers.map((h: any) => ({
      key: h.name || h.key,
      label: h.label,
    }));

    // 4. Assemble payload
    const payload = {
      title: props.title,
      submissionYear: props.submissionYear,
      printSelectedOnly: printSelectedOnly.value,
      headers,
      allRows,
      selectedRowIds: props.selectedRowIds,
    };

    // DEBUG: Log payload to verify structure
    console.log('=== PDF Payload Debug ===');
    console.log('title:', payload.title, typeof payload.title);
    console.log('submissionYear:', payload.submissionYear, typeof payload.submissionYear);
    console.log('printSelectedOnly:', payload.printSelectedOnly, typeof payload.printSelectedOnly);
    console.log('headers:', payload.headers);
    console.log('selectedRowIds:', payload.selectedRowIds);
    console.log('allRows sample:', payload.allRows.slice(0, 2));
    console.log('Full payload:', JSON.stringify(payload, null, 2));

    // 4. Call generation service
    await generatePdfReport(payload);
    notifySuccess('PDF report has been generated.');
    isGenerated.value = true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    notifyError('Failed to generate PDF report.');
  } finally {
    isGenerating.value = false;
  }
}

function handleDownload() {
  // For now, this button does nothing as per the plan.
  notifySuccess('Download functionality is not yet implemented.');
}
</script>
