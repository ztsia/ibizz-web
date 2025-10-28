<script lang="ts" setup>
import type { Recordable } from '@vben/types';
import type { TaxFiling, UploadedFile } from './types';
import type { FileItem } from '#/types/shared';
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  DownloadOutlined,
  PlusOutlined,
  RobotOutlined,
  UploadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons-vue';
import { Button, message, Modal } from 'ant-design-vue';

import DocumentUploadModal from './components/DocumentUploadModal.vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteTaxFiling, getTaxFilingList, updateTaxFiling } from './data';
import { useColumns, useGridFormSchema } from './data';

const router = useRouter();

// Upload modal state
const uploadModalVisible = ref(false);
const selectedTaxFiling = ref<TaxFiling | null>(null);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    resizable: false,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getTaxFilingList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<TaxFiling>,
});

function onActionClick(e: OnActionClickParams<TaxFiling>) {
  switch (e.code) {
    case 'upload': {
      onUpload(e.row);
      break;
    }
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'workflow': {
      onWorkflow(e.row);
      break;
    }
    case 'view': {
      onView(e.row);
      break;
    }
  }
}

/**
 * Wrap Antd's Modal.confirm as promise for easier use in async functions.
 * @param content Prompt content
 * @param title Prompt title
 */
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('Cancelled'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

/**
 * Status switch is about to change
 * @param newStatus Expected status value to change to
 * @param row Row data
 * @returns Return false to abort change, return other values (undefined, true) to allow change
 */
async function onStatusChange(newStatus: string, row: TaxFiling) {
  const status: Recordable<string> = {
    draft: 'Draft',
    file_uploaded: 'File Uploaded',
    file_classified: 'File Classified',
    data_extracted: 'Data Extracted',
    data_validated: 'Data Validated',
    preview_generated: 'Preview Generated',
    user_confirmed: 'User Confirmed',
    analysis_complete: 'Analysis Complete',
    completed: 'Completed',
    error: 'Error',
  };
  try {
    await confirm(
      `Are you sure you want to change ${row.clientName}'s status to 【${status[newStatus]}】?`,
      `Change Status`,
    );
    await updateTaxFiling(row.id, { status: newStatus as TaxFiling['status'] });
    return true;
  } catch {
    return false;
  }
}

function onView(row: TaxFiling) {
  // View tax filing details
  message.info(`Viewing tax filing: ${row.clientName}`);
}

function onEdit(row: TaxFiling) {
  router.push(`/tax-filing/edit/${row.id}`);
}

function onWorkflow(row: TaxFiling) {
  router.push(`/tax-filing/workflow/${row.id}`);
}

function onDelete(row: TaxFiling) {
  const hideLoading = message.loading({
    content: `Deleting ${row.clientName}...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteTaxFiling(row.id)
    .then(() => {
      message.success({
        content: `Successfully deleted ${row.clientName}`,
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  router.push('/tax-filing/create');
}

function onAITaxFiling() {
  router.push('/tax-filing/ai-chat');
}

function onExport() {
  message.info('Export functionality will be implemented');
}

function onImport() {
  message.info('Import functionality will be implemented');
}

function onBulkWorkflow() {
  message.info('Bulk workflow processing will be implemented');
}

function onUpload(row: TaxFiling) {
  selectedTaxFiling.value = row;
  uploadModalVisible.value = true;
}

async function onUploadComplete(files: FileItem[]) {
  if (!selectedTaxFiling.value) return;

  try {
    // Convert FileItem[] to UploadedFile[] format
    const uploadedFiles: any[] = files.map(file => ({
      id: file.uid,
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || '',
      uploadedAt: new Date().toISOString(),
      classification: file.classification
    }));

    // Update the tax filing with the new files
    const updatedTaxFiling = {
      ...selectedTaxFiling.value,
      uploadedFiles: [...selectedTaxFiling.value.uploadedFiles, ...uploadedFiles],
      status: 'file_uploaded' as TaxFiling['status'],
      updatedAt: new Date().toISOString()
    };

    await updateTaxFiling(selectedTaxFiling.value.id, updatedTaxFiling);

    message.success(`Successfully uploaded ${files.length} file(s) for ${selectedTaxFiling.value?.clientName}`);

    // Refresh the grid to show updated data
    onRefresh();
  } catch (error) {
    message.error('Failed to save uploaded files');
    console.error('Upload save error:', error);
  } finally {
    // Reset selection
    selectedTaxFiling.value = null;
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="Tax Filing Management">
      <template #toolbar-tools>
        <div class="flex gap-2">
          <Button type="primary" @click="onAITaxFiling">
            <RobotOutlined class="mr-1" />
            AI Tax Filing
          </Button>
          
          <Button type="default" @click="onCreate">
            <PlusOutlined class="mr-1" />
            Traditional Filing
          </Button>
        </div>
      </template>
    </Grid>

    <!-- Document Upload Modal -->
    <DocumentUploadModal
      v-model:visible="uploadModalVisible"
      :tax-filing="selectedTaxFiling"
      @upload-complete="onUploadComplete"
    />
  </Page>
</template>

<style scoped>
.tax-filing-form-modal-wrapper {
  min-width: 600px;
}
</style>
