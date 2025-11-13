<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      v-if="visible"
      class="fixed inset-0 z-50 bg-black/80"
      @click="onClose"
    ></div>

    <!-- Modal Content -->
    <div
      v-if="visible"
      class="bg-background fixed left-1/2 top-1/2 z-[60] w-full -translate-x-1/2 -translate-y-1/2 p-6 shadow-lg outline-none sm:max-w-[700px] sm:rounded-xl"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          {{ modeTitle }}
        </h2>
        <p class="text-muted-foreground text-sm">
          Fill in the details for the lookup item. Click save when you're done.
        </p>
      </div>
      <form @submit.prevent="onSave">
        <div class="grid grid-cols-2 max-h-[70vh] gap-4 overflow-y-auto py-4 pr-4">
          <div
            v-if="duplicateError"
            class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {{ duplicateError }}
          </div>
          <FormField v-for="col in columns" :key="col.name" :name="col.name">
            <FormItem class="mb-4">
              <FormLabel :for="col.name" class="block mb-1">{{ fieldLabels[col.name] }}</FormLabel>
              <FormControl>
                <template v-if="getColumnFieldType(col, props.group) === 'boolean'">
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
                    :lookup-slug="getColumnFieldType(col, props.group)"
                    :required="col.required"
                    v-bind="fieldAttributes(col)"
                    data-test="item-field"
                  />
                </template>
                <template
                  v-else-if="
                    String(col.type || '').toLowerCase() === 'text' && col.multiline
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
                        getColumnFieldType(col, props.group),
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

        <div
          class="flex flex-col-reverse justify-end gap-x-2 sm:flex-row sm:justify-end sm:space-x-2"
        >
          <Button type="button" variant="ghost" @click="onClose">Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
      <button
        type="button"
        class="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-accent-foreground text-foreground flex-center absolute right-3 top-3 h-6 w-6 rounded-full px-1 text-lg opacity-70 opacity-80 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        @click="onClose"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-x-icon lucide-x h-4 w-4"
        >
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, watch, toRaw, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useForm } from 'vee-validate';
import {
  suggestNextCode,
  generateCodeRegex,
  generateExampleCode,
  getFieldLabel,
  getFieldType as getColumnFieldType,
} from '../../utils';
import {
  Button,
  // DialogFooter, // Removed
  // DialogHeader, // Removed
  // DialogTitle, // Removed
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

import { LookupSelect } from '../../../shared_components';

const props = defineProps<{
  modelValue?: boolean;
  columns?: any[];
  initial?: any;
  groupId?: string | null;
  group?: {
    code_format?: string;
    code_regex?: string;
    alpha_count?: number;
    num_count?: number;
    single_count?: number;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'save', payload: any): void;
  (e: 'close'): void;
  (e: 'update:modelValue', v: boolean): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { handleSubmit, setValues, setFieldError } = useForm(); // Simplified useForm call for clarity

const dbColumns = ref<Record<string, any>>({});
const duplicateError = ref('');

const form = ref<{ columns: Record<string, any> }>({ columns: {} });

const columns = computed(() => props.columns || []);

function resetFormFromProps() {
  const isEdit = !!props.initial?.id;
  form.value.columns = Object.fromEntries(
    columns.value.map((c) => {
      let value;
      if (isEdit) {
        value = props.initial?.columns?.[c.name] ?? '';
      } else {
        const ty = getColumnFieldType(c, props.group);
        if (ty === 'month') {
          value = new Date().getMonth() + 1;
        } else if (ty === 'year') {
          value = new Date().getFullYear();
        } else if (ty === 'boolean') {
          value = 'no'; // Default to 'no' string
        } else {
          value = '';
        }
      }
      return [c.name, value];
    }),
  );
  setValues({ ...form.value.columns });
}

watch(() => props.initial, resetFormFromProps, { immediate: true });

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      resetFormFromProps();
      loadDbColumns().catch(() => {});
      loadSuggestedCode().catch(() => {});
    }
  },
);

async function loadDbColumns() {
  const svc = await import('../../../services');
  const tbl = await svc.getTableColumns(props.groupId || null);
  if (Array.isArray(tbl)) {
    tbl.forEach((r: any) => {
      if (r && r.column_name) dbColumns.value[r.column_name] = r.data_type;
    });
  }
}

async function loadSuggestedCode() {
  if (props.initial && props.initial.id) return;
  const codeCol = columns.value.find((c: any) => c.name === 'code');
  if (!codeCol) return;
  const grp = props.group || null;
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
    // For Free Text, we don't suggest next code, but show the example
    return; // Return after setting example for Free Text
  }

  async function fetchItemsForScan() {
    try {
      const svc = await import('../../../services');
      const res = await svc.listItems(props.groupId || null, {
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
    // fallthrough
  }
}

const modeTitle = computed(() =>
  props.initial && props.initial.id ? 'Edit Item' : 'Add Item',
);

function isLookup(col: any) {
  const ty = getColumnFieldType(col, props.group);
  return ![
    'int',
    'double',
    'month',
    'year',
    'string',
    'number',
    'text',
    'boolean',
  ].includes(ty);
}

function fieldAttributes(col: any) {
  const ty = getColumnFieldType(col, props.group);
  const attrs: Record<string, any> = {};
  if (isLookup(col)) {
    attrs['lookup-slug'] = ty;
  } else {
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
    result[col.name] = getFieldLabel(col, props.group, dbColumns.value);
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
    props.group &&
    props.group.code_regex
  ) {
    try {
      const re = new RegExp(props.group.code_regex);
      if (!re.test(String(form.value.columns.code))) {
        const example =
          generateExampleCode(props.group.code_regex) || 'invalid';
        setFieldError('code', `Code must match pattern (e.g. ${example})`);
        return;
      }
    } catch {
      console.warn('Invalid code_regex on group', props.group?.code_regex);
    }
  }

  if (form.value.columns.code) {
    try {
      const svc = await import('../../../services');
      const found = await svc.findItemsByCode(
        props.groupId || null,
        form.value.columns.code,
      );
      const items = Array.isArray(found) ? found : [];
      const duplicate = items.some(
        (it: any) =>
          it.id !== props.initial?.id &&
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

  emit('save', { columns: toRaw(form.value.columns) });
  message.success('Lookup item saved successfully.');
  visible.value = false;
});

function onClose() {
  visible.value = false;
  emit('close');
}
</script>
