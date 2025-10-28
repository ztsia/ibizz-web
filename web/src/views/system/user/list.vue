<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemUser } from './data';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { Page, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, getUserList, updateUser } from '#/api/system/user';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: false,
  centered: true,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  class: 'user-form-modal-wrapper',
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
          return await getUserList({
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
  } as VxeTableGridOptions<SystemUser>,
});

function onActionClick(e: OnActionClickParams<SystemUser>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'reset': {
      onReset(e.row);
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
async function onStatusChange(newStatus: string, row: SystemUser) {
  const status: Recordable<string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  };
  try {
    await confirm(
      `Are you sure you want to change ${row.name}'s status to 【${status[newStatus]}】?`,
      `Change Status`,
    );
    await updateUser(row.id, { status: newStatus as 'ACTIVE' | 'INACTIVE' });
    return true;
  } catch {
    return false;
  }
}

function onView(row: SystemUser) {
  // View user details
  message.info(`Viewing user: ${row.name}`);
}

function onEdit(row: SystemUser) {
  formModalApi.setData(row).open();
}

function onReset(row: SystemUser) {
  confirm(
    `Are you sure you want to reset password for ${row.name}?`,
    'Reset Password',
  )
    .then(() => {
      message.success(`Password reset for ${row.name}`);
    })
    .catch(() => {
      // User cancelled
    });
}

function onDelete(row: SystemUser) {
  const hideLoading = message.loading({
    content: `Deleting ${row.name}...`,
    duration: 0,
    key: 'action_process_msg',
  });
  deleteUser(row.id)
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
    <Grid table-title="User Management">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          Create User
        </Button>
      </template>
    </Grid>
  </Page>
</template>
