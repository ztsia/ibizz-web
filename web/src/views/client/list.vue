<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemClient } from './data';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteClient, getClientList, updateClient } from '#/api/system/client';
import { getEnhancedClientById } from '#/api/system/iBizzClient';
import { useRouter } from 'vue-router';
import { useTaxFilingStore } from '#/store';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const router = useRouter();
const taxFilingStore = useTaxFilingStore();

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: false,
  centered: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  class: 'client-form-modal-wrapper',
});

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
          return await getClientList({
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
  } as VxeTableGridOptions<SystemClient>,
});

function onActionClick(e: OnActionClickParams<SystemClient>) {
  switch (e.code) {
    case 'start-tax-filing': {
      onStartTaxFiling(e.row);
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
    case 'view': {
      onView(e.row);
      break;
    }
  }
}

/**
 * 将Antd的Modal.confirm封装为promise，方便在异步函数中调用。
 * @param content 提示内容
 * @param title 提示标题
 */
function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('已取消'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(newStatus: string, row: SystemClient) {
  const status: Recordable<string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  };
  try {
    await confirm(
      `Are you sure you want to change ${row.name}'s status to 【${status[newStatus]}】?`,
      `Change Status`,
    );
    await updateClient(row.id, { status: newStatus as 'ACTIVE' | 'INACTIVE' });
    return true;
  } catch {
    return false;
  }
}

async function onStartTaxFiling(row: SystemClient) {
  try {
    // Fetch complete client data using the enhanced client API
    const enhancedClient = await getEnhancedClientById(row.id);
    
    // Set complete client information in store and navigate to tax filing workflow
    taxFilingStore.setClientForTaxFiling(enhancedClient);
    
    router.push('/tax-filing/create');
    message.success(`Starting tax filing workflow for ${enhancedClient.basicParticulars.companyName}`);
  } catch (error) {
    console.error('Failed to fetch enhanced client data:', error);
    message.error('Failed to load client information. Please try again.');
  }
}

function onView(row: SystemClient) {
  // View client details
  message.info(`Viewing client: ${row.name} from ${row.company}`);
}

function onEdit(row: SystemClient) {
  formModalApi.setData(row).open();
}

function onDelete(row: SystemClient) {
  const hideLoading = message.loading({
    content: `Deleting ${row.name}...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteClient(row.id)
    .then(() => {
      message.success({
        content: `Successfully deleted ${row.name}`,
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
  formModalApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal @success="onRefresh" />
    <Grid table-title="Client Management">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          Create Client
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<style scoped>
.client-form-modal-wrapper :deep(.vben-modal) {
  max-width: 900px;
}

.client-form-modal-wrapper :deep(.vben-modal-content) {
  max-height: 80vh;
  overflow-y: auto;
}
</style>