<template>
  <FormLookupItemModal>
    <template #title>
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          {{ modeTitle }}
        </h2>
        <p class="text-muted-foreground text-sm">
          Fill in the details for the lookup item. Click save when you're done.
        </p>
      </div>
    </template>
    <template #default>
      <form @submit.prevent="onSave" id="lookup-item-form">
        <div class="grid max-h-[70vh] grid-cols-2 gap-4 overflow-y-auto p-4">
          <div
            v-if="duplicateError"
            class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {{ duplicateError }}
          </div>
          <FormField v-for="col in columns" :key="col.name" :name="col.name">
            <FormItem class="mb-4">
              <FormLabel :for="col.name" class="mb-1 block">{{
                fieldLabels[col.name]
              }}</FormLabel>
              <FormControl>
                <template
                  v-if="getColumnFieldType(col, currentGroup) === 'boolean'"
                >
                  <RadioGroup
                    v-model="form.columns[col.name]"
                    class="flex space-x-4"
                  >
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem :id="`${col.name}-yes`" value="yes" />
                      <Label :for="`${col.name}-yes`">Yes</Label>
                    </div>
                    <div class="flex items-center space-x-2">
                      <RadioGroupItem :id="`${col.name}-no`" value="no" />
                      <Label :for="`${col.name}-no`">No</Label>
                    </div>
                  </RadioGroup>
                </template>
                <template v-else-if="isLookup(col)">
                  <LookupSelect
                    :id="col.name"
                    v-model="form.columns[col.name]"
                    :lookup-slug="getColumnFieldType(col, currentGroup)"
                    :required="col.required"
                    v-bind="fieldAttributes(col)"
                    data-test="item-field"
                  />
                </template>
                <template
                  v-else-if="
                    getColumnFieldType(col, currentGroup) === 'currency'
                  "
                >
                  <InputNumber
                    :id="col.name"
                    v-model:value="form.columns[col.name]"
                    :formatter="
                      (value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    style="width: 100%"
                    class="h-10"
                    :required="col.required"
                    v-bind="fieldAttributes(col)"
                    data-test="item-field"
                  />
                </template>
                <template
                  v-else-if="
                    String(col.type || '').toLowerCase() === 'text' &&
                    col.multiline
                  "
                >
                  <Textarea
                    :id="col.name"
                    v-model="form.columns[col.name]"
                    :rows="3"
                    :required="col.required"
                    v-bind="fieldAttributes(col)"
                    data-test="item-field"
                  />
                </template>
                <template v-else>
                  <Input
                    :id="col.name"
                    v-model="form.columns[col.name]"
                    :type="
                      ['int', 'double', 'month', 'year', 'number'].includes(
                        getColumnFieldType(col, currentGroup),
                      )
                        ? 'number'
                        : 'text'
                    "
                    :required="col.required"
                    v-bind="fieldAttributes(col)"
                    data-test="item-field"
                  />
                </template>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>
      </form>
    </template>
    <template #footer>
      <div
        class="flex flex-col-reverse justify-end gap-x-2 sm:flex-row sm:justify-end sm:space-x-2"
      >
        <Button type="button" variant="ghost" @click="onClose">Cancel</Button>
        <Button type="submit" form="lookup-item-form">Save</Button>
      </div>
    </template>
  </FormLookupItemModal>
</template>

<script lang="ts" setup>
import { ref, toRaw, computed } from 'vue';
import { message, InputNumber } from 'ant-design-vue';
import { useForm } from 'vee-validate';
import {
  suggestNextCode,
  generateCodeRegex,
  generateExampleCode,
  getFieldLabel,
  getFieldType as getColumnFieldType,
} from '../../../lookup/utils';
import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@vben-core/shadcn-ui';

import { useVbenModal } from '@vben/common-ui';

import { LookupSelect } from '../../../shared_components';

const emit = defineEmits<{
  (e: 'save', payload: any): void;
}>();

const [FormLookupItemModal, modalApi] = useVbenModal({
  title: '',
  width: '700px',
  maskClosable: false,
  showConfirmButton: false,
  showCancelButton: false,
  class: 'lookup-item-form-modal',
});

const { handleSubmit, setValues, setFieldError } = useForm();

const dbColumns = ref<Record<string, any>>({});
const duplicateError = ref('');
const form = ref<{ columns: Record<string, any> }>({ columns: {} });

const currentColumns = ref<any[]>([]);
const currentInitial = ref<any>(null);
const currentGroupId = ref<string | null>(null);
const currentGroup = ref<any>(null);

const columns = computed(() =>
  (currentColumns.value || []).filter((c) => c && c.name),
);

function resetFormFromData() {
  const isEdit = !!currentInitial.value?.id;
  form.value.columns = Object.fromEntries(
    columns.value.map((c) => {
      let value;
      if (isEdit) {
        value = currentInitial.value?.columns?.[c.name] ?? '';
      } else {
        const ty = getColumnFieldType(c, currentGroup.value);
        switch (ty) {
          case 'month': {
            value = new Date().getMonth() + 1;
            break;
          }
          case 'year': {
            value = new Date().getFullYear();
            break;
          }
          case 'boolean': {
            value = 'no';
            break;
          }
          default: {
            value = '';
          }
        }
      }
      return [c.name, value];
    }),
  );
  setValues({ ...form.value.columns });
}

async function loadDbColumns() {
  const svc = await import('../../services/formLookupManager.service');
  const tbl = await svc.getTableColumns(currentGroupId.value || null);
  if (Array.isArray(tbl)) {
    tbl.forEach((r: any) => {
      if (r && r.column_name) dbColumns.value[r.column_name] = r.data_type;
    });
  }
}

async function loadSuggestedCode() {
  if (currentInitial.value && currentInitial.value.id) return;
  const codeCol = columns.value.find((c: any) => c.name === 'code');
  if (!codeCol) return;
  const grp = currentGroup.value || null;
  if (!grp) return;

  if (form.value.columns.code) return;

  const fmt = grp.code_format || null;
  const regexStr = grp.code_regex || null;

  const patternOrFormat =
    regexStr ||
    generateCodeRegex(fmt, grp.alpha_count, grp.num_count, grp.single_count) ||
    fmt ||
    '';

  if (fmt === 'Free Text') {
    return;
  }

  async function fetchItemsForScan() {
    try {
      const svc = await import('../../services/formLookupManager.service');
      const res = await svc.listItems(currentGroupId.value || null, {
        page: 1,
        perPage: 1000,
      });
      return Array.isArray(res) ? res : res?.items || [];
    } catch {
      return [];
    }
  }

  const items = await fetchItemsForScan();
  const existing = (items || [])
    .map((it: any) => String(it?.columns?.code || ''))
    .filter(Boolean);

  try {
    const suggested = suggestNextCode(patternOrFormat, existing);
    if (suggested) {
      form.value.columns.code = suggested;
    }
  } catch (error) {
    console.error('loadSuggestedCode: error during suggestion', error);
  }
}

const modeTitle = computed(() =>
  currentInitial.value && currentInitial.value.id ? 'Edit Item' : 'Add Item',
);

function isLookup(col: any) {
  const ty = getColumnFieldType(col, currentGroup.value);
  return ![
    'int',
    'double',
    'month',
    'year',
    'string',
    'number',
    'text',
    'boolean',
    'currency',
  ].includes(ty);
}

function fieldAttributes(col: any) {
  const ty = getColumnFieldType(col, currentGroup.value);
  const attrs: Record<string, any> = {};
  if (isLookup(col)) {
    attrs['lookup-slug'] = ty;
  } else {
    if (ty === 'currency') {
      attrs.step = '0.01';
    }
    if (ty === 'double') {
      attrs.step = '0.0001';
      attrs.onInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = target.value || '';
        if (value.includes('.')) {
          const parts = value.split('.');
          if (parts[1] && parts[1].length > 4) {
            parts[1] = parts[1].slice(0, 4);
            target.value = parts.join('.');
          }
        }
      };
    }
    if (ty === 'int') {
      attrs.step = 1;
      attrs.onKeydown = (e: KeyboardEvent) => {
        if (['.', ','].includes(e.key)) {
          e.preventDefault();
        }
      };
    }
    if (ty === 'month') {
      attrs.min = 1;
      attrs.max = 12;
      attrs.step = 1;
      attrs.onInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.value.length > 2) {
          target.value = target.value.slice(0, 2);
        }
      };
    }
    if (ty === 'year') {
      attrs.min = 1000;
      attrs.max = 9999;
      attrs.step = 1;
      attrs.onInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.value.length > 4) {
          target.value = target.value.slice(0, 4);
        }
      };
    }
  }
  return attrs;
}

const fieldLabels = computed(() => {
  const result: Record<string, string> = {};
  for (const col of columns.value) {
    result[col.name] = getFieldLabel(col, currentGroup.value, dbColumns.value);
  }
  return result;
});

const onSave = handleSubmit(async (_values: Record<string, any>) => {
  duplicateError.value = '';
  let hasError = false;
  for (const col of columns.value) {
    if (
      col.required &&
      (form.value.columns[col.name] === null ||
        form.value.columns[col.name] === undefined ||
        form.value.columns[col.name] === '')
    ) {
      setFieldError(col.name, 'Required');
      hasError = true;
    }
  }
  if (hasError) return;

  const codeCol = columns.value.find((c: any) => c.name === 'code');
  if (
    codeCol &&
    form.value.columns.code &&
    currentGroup.value &&
    currentGroup.value.code_regex
  ) {
    try {
      const re = new RegExp(currentGroup.value.code_regex);
      if (!re.test(String(form.value.columns.code))) {
        const example =
          generateExampleCode(currentGroup.value.code_regex) || 'invalid';
        setFieldError('code', `Code must match pattern (e.g. ${example})`);
        return;
      }
    } catch {
      console.warn(
        'Invalid code_regex on group',
        currentGroup.value?.code_regex,
      );
    }
  }

  if (form.value.columns.code) {
    try {
      const svc = await import('../../services/formLookupManager.service');
      const found = await svc.findItemsByCode(
        currentGroupId.value || null,
        form.value.columns.code,
      );
      const items = Array.isArray(found) ? found : [];
      const duplicate = items.some(
        (it: any) =>
          it.id !== currentInitial.value?.id &&
          it.columns?.code === form.value.columns.code,
      );
      if (duplicate) {
        duplicateError.value = `An item with code "${form.value.columns.code}" already exists in this group.`;
        return;
      }
    } catch {
      // ignore
    }
  }

  emit('save', {
    id: currentInitial.value?.id,
    columns: toRaw(form.value.columns),
  });
  message.success('Lookup item saved successfully.');
  modalApi.close();
});

function onClose() {
  modalApi.close();
}

function open(data: {
  initial?: any;
  columns?: any[];
  group?: any;
  groupId?: string | null;
}) {
  currentInitial.value = data.initial || null;
  currentColumns.value = data.columns || [];
  currentGroup.value = data.group || null;
  currentGroupId.value = data.groupId || null;

  resetFormFromData();
  loadDbColumns().catch(() => {});
  loadSuggestedCode().catch(() => {});

  // modalApi.setTitle(modeTitle.value); // REMOVED
  modalApi.open();
}

defineExpose({ open });
</script>
