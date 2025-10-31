<template>
  <Teleport to="#__vben_main_content">
    <!-- Overlay -->
    <div
      v-if="visible"
      class="z-overlay fixed inset-0 bg-black/80"
      @click="onClose"
    ></div>

    <!-- Modal Content -->
    <div
      v-if="visible"
      class="z-popup bg-background fixed left-1/2 top-1/2 max-h-[90vh] w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto p-6 shadow-lg outline-none sm:max-w-[600px] sm:rounded-xl"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex flex-col gap-y-1.5 text-center sm:text-left">
        <h2 class="text-lg font-semibold leading-none tracking-tight">
          {{ modalTitle }}
        </h2>
        <p class="text-muted-foreground text-sm">
          Create or edit a lookup group. Provide a title and define its columns
          and code format.
        </p>
      </div>
      <Form @submit="onSave">
        <div class="grid gap-4 py-4">
          <FormField name="title">
            <FormItem class="mb-4">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  name="title"
                  :modelValue="values.title"
                  @update:modelValue="(v) => setValues({ title: v })"
                  data-test="addgroup-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="short_description">
            <FormItem class="mb-4">
              <FormLabel>Short description</FormLabel>
              <FormControl>
                <Textarea
                  name="short_description"
                  :modelValue="values.short_description"
                  @update:modelValue="
                    (v) => setValues({ short_description: v })
                  "
                  rows="2"
                  data-test="addgroup-desc"
                />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Only show code/columns editing when allowed (add mode always allows edits) -->
          <div v-if="effectiveAllowEditColumns" class="space-y-4">
            <FormField name="include_code">
              <FormItem class="flex flex-row gap-x-2">
                <FormControl>
                  <Checkbox
                    name="include_code"
                    :checked="codeEnabled"
                    @update:checked="codeEnabled = $event"
                  />
                </FormControl>
                <div class="space-y-1 leading-none">
                  <FormLabel>Include code column</FormLabel>
                </div>
              </FormItem>
            </FormField>

            <div
              v-if="codeEnabled && effectiveAllowEditColumns"
              class="space-y-2"
            >
              <div class="flex items-center gap-3">
                <FormField name="code_format" class="flex-1">
                  <FormItem>
                    <FormLabel>Code format</FormLabel>
                    <Select
                      :modelValue="values.code_format"
                      @update:modelValue="
                        (val) => setValues({ code_format: val })
                      "
                      name="code_format"
                    >
                      <FormControl>
                        <SelectTrigger data-test="addgroup-codeformat">
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          v-for="item in codePresets"
                          :key="item"
                          :value="item"
                        >
                          {{ item }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </FormField>

                <div class="w-[220px]">
                  <div class="grid grid-cols-2 gap-2">
                    <template v-if="values.code_format === 'Alphanumeric'">
                      <FormField name="alpha_count">
                        <FormItem>
                          <FormLabel>Alpha</FormLabel>
                          <FormControl>
                            <Input
                              name="alpha_count"
                              type="number"
                              v-model.number="alphaCount"
                              data-test="alpha-count"
                            />
                          </FormControl>
                        </FormItem>
                      </FormField>
                      <FormField name="num_count">
                        <FormItem>
                          <FormLabel>Numeric</FormLabel>
                          <FormControl>
                            <Input
                              name="num_count"
                              type="number"
                              v-model.number="numCount"
                              data-test="num-count"
                            />
                          </FormControl>
                        </FormItem>
                      </FormField>
                    </template>
                    <template v-else>
                      <FormField name="single_count">
                        <FormItem class="col-span-2">
                          <FormLabel>Chars</FormLabel>
                          <FormControl>
                            <Input
                              name="single_count"
                              type="number"
                              v-model.number="singleCount"
                              data-test="single-count"
                            />
                          </FormControl>
                        </FormItem>
                      </FormField>
                    </template>
                  </div>
                </div>
              </div>
              <div class="text-muted-foreground text-sm">
                Example: <code data-test="code-example">{{ exampleCode }}</code>
              </div>
            </div>

            <div class="mt-4 space-y-2">
              <div class="mb-2 flex items-center justify-between">
                <h4 class="text-lg font-semibold">Columns</h4>
              </div>

              <FormField name="columns_schema">
                <FormItem>
                  <ColumnChips
                    id="columns_schema_input"
                    :modelValue="values.columns_schema"
                    @update:modelValue="(v) => setValues({ columns_schema: v })"
                    :allow-edit="effectiveAllowEditColumns"
                    :code-enabled="codeEnabled"
                    @remove="removeColumn"
                  />
                </FormItem>
              </FormField>

              <!-- Add column row: label input, type select, add button -->
              <div class="flex items-center gap-2">
                <FormField name="new_col_label" class="flex-1">
                  <FormItem>
                    <FormLabel class="sr-only">New Column Label</FormLabel>
                    <FormControl>
                      <Input
                        name="new_col_label"
                        v-model="newCol.label"
                        placeholder="Column name"
                        data-test="new-column-name"
                      />
                    </FormControl>
                  </FormItem>
                </FormField>
                <FormField name="new_col_type">
                  <FormItem>
                    <FormLabel class="sr-only">New Column Type</FormLabel>
                    <Select v-model="newCol.type" name="new_col_type">
                      <FormControl>
                        <SelectTrigger
                          class="w-[140px]"
                          data-test="new-column-type"
                        >
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          v-for="item in columnTypes"
                          :key="item"
                          :value="item"
                        >
                          {{ item }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-test="add-column-btn"
                  @click="addColumnFromInput"
                >
                  Add column
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div
          class="flex flex-col-reverse justify-end gap-x-2 sm:flex-row sm:justify-end sm:space-x-2"
        >
          <Button type="button" variant="ghost" @click="onClose">Cancel</Button>
          <Button type="submit" data-test="addgroup-save">Save</Button>
        </div>
      </Form>
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
import { slugify, generateCodeRegex } from '../../utils';
import { ColumnChips } from '..';

import {
  Button,
  Checkbox,
  // DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  modelValue?: boolean;
  initial?: any;
  allowEditColumns?: boolean;
  mode?: 'add' | 'edit' | string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'save', payload: any): void;
  (e: 'close'): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

interface LookupColumn {
  key: string;

  label: string;

  type: string;

  hidden?: boolean;

  required?: boolean;
}

const defaultColumns: LookupColumn[] = [
  { key: 'code', label: 'Code', type: 'number' },

  { key: 'label', label: 'Label', type: 'text' },
];

const form = useForm({
  initialValues: {
    title: '',

    short_description: '',

    code_format: 'Alphanumeric',

    columns_schema: structuredClone(defaultColumns),
  } as {
    title: string;

    short_description: string;

    code_format: string;

    columns_schema: LookupColumn[];
  },
});
const { handleSubmit, setValues, values, setFieldError } = form;

function populateFromInitial(init: any) {
  if (!init) return;
  const initialValues = {
    title: init.title || '',
    short_description: init.short_description || '',
    code_format: init.code_format || 'Alphanumeric',
    columns_schema: Array.isArray(init.columns_schema)
      ? structuredClone(init.columns_schema)
      : structuredClone(defaultColumns),
  };
  setValues(initialValues);
  codeEnabled.value = (initialValues.columns_schema || []).some(
    (c: any) => (c.key || c.name) === 'code' && !c.hidden,
  );
}

const codePresets = ['Alphanumeric', 'Numeric', 'Alphabetic'];
const columnTypes = ['text', 'number', 'date'];

const alphaCount = ref<number>(2);
const numCount = ref<number>(2);
const singleCount = ref<number>(3);

const codeEnabled = ref<boolean>(true);

const effectiveAllowEditColumns = computed(() =>
  props.mode === 'add' ? true : !!props.allowEditColumns,
);

function addVisibleCodeColumn() {
  const cols = [...(values.columns_schema || [])];
  const existing = cols.find((c: any) => (c.key || c.name) === 'code');
  if (existing) {
    existing.hidden = false;
    existing.type = existing.type || 'number';
    setValues({ columns_schema: cols });
    return;
  }
  setValues({
    columns_schema: [
      { key: 'code', label: 'Code', type: 'number', required: true },
      ...cols,
    ],
  });
}

function removeVisibleCodeColumn() {
  const cols = [...(values.columns_schema || [])];
  const idx = cols.findIndex((c: any) => (c.key || c.name) === 'code');
  if (idx !== -1) {
    cols.splice(idx, 1);
    setValues({ columns_schema: cols });
  }
}

watch(codeEnabled, (v) => {
  if (v) addVisibleCodeColumn();
  else removeVisibleCodeColumn();
});

const exampleCode = computed(() => {
  const fmt = values.code_format;
  if (fmt === 'Alphanumeric') {
    const a = Math.max(0, Number(alphaCount.value) || 0);
    const n = Math.max(0, Number(numCount.value) || 0);
    return 'A'.repeat(a) + '0'.repeat(n);
  }
  const count = Number(singleCount.value) || 0;
  if (fmt === 'Numeric') return '0'.repeat(count);
  if (fmt === 'Alphabetic') return 'A'.repeat(count);
  return '';
});

watch(
  () => props.initial,
  (v) => {
    if (props.mode === 'edit' && v) {
      populateFromInitial(v);
    }
  },
  { immediate: true },
);

const modalTitle = computed(() =>
  props.mode === 'edit' ? 'Edit Lookup Group' : 'Add Lookup Group',
);

watch(
  visible,
  (val) => {
    if (!val) return;
    if (props.mode === 'add') {
      setValues({
        title: '',
        short_description: '',
        code_format: 'Alphanumeric',
        columns_schema: structuredClone(defaultColumns),
      });
      alphaCount.value = 2;
      numCount.value = 2;
      singleCount.value = 3;
      codeEnabled.value = true;
    }
  },
  { immediate: true },
);

const newCol = ref({ label: '', type: 'text' });

function addColumnFromInput() {
  if (!newCol.value.label) return;
  const currentCols = [...(values.columns_schema || [])];
  currentCols.push({
    key: slugify(newCol.value.label) || `col${currentCols.length + 1}`,
    label: newCol.value.label,
    type: newCol.value.type || 'text',
  });
  setValues({ columns_schema: currentCols });
  newCol.value.label = '';
  newCol.value.type = 'text';
}

function removeColumn(idx: number) {
  const currentCols = [...(values.columns_schema || [])];
  if (idx >= 0 && idx < currentCols.length) {
    currentCols.splice(idx, 1);
    setValues({ columns_schema: currentCols });
  }
}

function onClose() {
  emit('close');
  visible.value = false;
}

const submitLogic: SubmissionHandler = async (formValues, _actions) => {
  if (!formValues.title) {
    setFieldError('title', 'Title is required');
    return;
  }

  const payload = toRaw(formValues);
  payload.slug = slugify(payload.title);
  payload.code_format = codeEnabled.value ? payload.code_format : null;
  payload.code_regex = codeEnabled.value
    ? generateCodeRegex(
        payload.code_format,
        alphaCount.value,
        numCount.value,
        singleCount.value,
      )
    : null;
  emit('save', payload);
  visible.value = false;
};

const onSave = handleSubmit(submitLogic);
</script>
