<template>
  <div class="mt-4 flex items-center gap-4">
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
import { Button } from '@vben-core/shadcn-ui';
import { Loader2, FileText } from 'lucide-vue-next';
import { generatePdf } from '../../services/pdfService';
import { notifyError, notifySuccess } from '../../lookup/utils';

const props = defineProps<{
  template: string;
  dataProvider: () => Promise<Record<string, any>>;
  fileName: string;
}>();

const isGenerating = ref(false);
const isGenerated = ref(false);
const pdfBlob = ref<Blob | null>(null);

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
  pdfBlob.value = null;

  try {
    // Call the async data provider function to get fresh data
    const data = await props.dataProvider();
    const blob = await generatePdf(props.template, data);
    pdfBlob.value = blob;
    notifySuccess('PDF report has been generated and is ready for download.');
    isGenerated.value = true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    notifyError('Failed to generate PDF report.');
  } finally {
    isGenerating.value = false;
  }
}

function handleDownload() {
  if (!pdfBlob.value) {
    notifyError('No PDF to download. Please generate the report first.');
    return;
  }

  const url = window.URL.createObjectURL(pdfBlob.value);
  const a = document.createElement('a');
  a.href = url;
  a.download = props.fileName;
  document.body.append(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
  notifySuccess('PDF download started.');
}
</script>
