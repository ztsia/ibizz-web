<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      v-if="visible"
      class="z-overlay fixed inset-0 bg-black/80"
      @click="onClose"
    ></div>

    <!-- Modal Content -->
    <div
      v-if="visible"
      class="z-popup bg-background fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 p-6 shadow-lg outline-none sm:max-w-[520px] sm:rounded-xl"
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
        <div class="grid gap-4 py-4">
          <div
            v-if="duplicateError"
            class="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {{ duplicateError }}
          </div>
          <FormField v-for="col in columns" :key="col.name" :name="col.name">
            <FormItem class="mb-4">
              <FormLabel :for="col.name">{{ fieldLabel(col) }}</FormLabel>
              <FormControl>
                <component
                  :is="fieldComponent(col)"
                  :id="col.name"
                  v-model="form.columns[col.name]"
                  :type="fieldType(col)"
                  :rows="col.type === 'text' && col.multiline ? 3 : undefined"
                  :required="col.required"
                  data-test="item-field"
                />
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
        class="data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:bg-accent hover:text-accent-foreground text-foreground/80 flex-center absolute right-3 top-3 h-6 w-6 rounded-full px-1 text-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
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
import { useForm } from 'vee-validate';
import {
  suggestNextCode,
  generateCodeRegex,
  generateExampleCode,
  getFieldType,
  getFieldLabel,
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
} from '@vben-core/shadcn-ui';

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
  form.value.columns = Object.fromEntries(
    columns.value.map((c) => [c.name, props.initial?.columns?.[c.name] ?? '']),
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
  dbColumns.value = {};
  try {
    const svc = await import('../../services');
    const tbl = await svc.getTableColumns(props.groupId || null);
    if (Array.isArray(tbl)) {
      tbl.forEach((r: any) => {
        if (r && r.column_name) dbColumns.value[r.column_name] = r.data_type;
      });
    }
  } catch {
    // ignore
  }
}

async function loadSuggestedCode() {
  console.log('loadSuggestedCode: props.group', props.group);
  if (props.initial && props.initial.id) return;
  const codeCol = columns.value.find((c: any) => c.name === 'code');
  if (!codeCol) return;
  const grp = props.group || null;
  if (!grp) return;

  if (form.value.columns.code) return;

  const fmt = grp.code_format || null;
  const regexStr = grp.code_regex || null;

  async function fetchItemsForScan() {
    try {
      const svc = await import('../../services');
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
  console.log('loadSuggestedCode: existing codes', existing);
  const patternOrFormat =
    regexStr ||
    generateCodeRegex(fmt, grp.alpha_count, grp.num_count, grp.single_count) ||
    fmt ||
    '';
  console.log('loadSuggestedCode: patternOrFormat', patternOrFormat);

  try {
    const suggested = suggestNextCode(patternOrFormat, existing);
    console.log('loadSuggestedCode: suggested code', suggested);
    if (suggested) {
      form.value.columns.code = suggested;
    }
  } catch (e) {
    console.error('loadSuggestedCode: error during suggestion', e);
    // fallthrough
  }
}

const modeTitle = computed(() =>
  props.initial && props.initial.id ? 'Edit Item' : 'Add Item',
);

function fieldComponent(col: any) {
  return col.type === 'text' && col.multiline ? Textarea : Input;
}
function fieldType(col: any) {
  return getFieldType(col, props.group);
}
function fieldLabel(col: any) {
  return getFieldLabel(col, props.group, dbColumns.value);
}

const onSave = handleSubmit(async (_values: Record<string, any>) => {
  duplicateError.value = '';
  let hasError = false;
  for (const col of columns.value) {
    if (col.required && !form.value.columns[col.name]) {
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
        setFieldError(
          'code',
          `Code must match pattern (e.g. ${generateExampleCode(props.group.code_regex) || 'invalid'})`,
        );
        return;
      }
    } catch {
      console.warn('Invalid code_regex on group', props.group?.code_regex);
    }
  }

  if (form.value.columns.code) {
    try {
      const svc = await import('../../services');
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
  visible.value = false;
});

function onClose() {
  visible.value = false;
  emit('close');
}
</script>
