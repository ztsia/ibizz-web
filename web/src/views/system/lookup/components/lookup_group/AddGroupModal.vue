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
      class="z-popup bg-background fixed left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 p-6 shadow-lg outline-none sm:max-w-[600px] sm:rounded-xl"
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
        <div class="grid max-h-[70vh] gap-4 overflow-y-auto p-4">
          <FormField name="title">
            <FormItem class="mb-4">
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  name="title"
                  :modelValue="values.title"
                  @update:modelValue="(v) => setValues({ title: v })"
                  :class="{ 'border-destructive': errors.title }"
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
                    >
                      <SelectTrigger data-test="addgroup-codeformat">
                        <SelectValue placeholder="Select a format" />
                      </SelectTrigger>
                      <SelectContent class="z-50">
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
                <div class="relative w-[220px]">
                  <div
                    class="grid gap-2"
                    :class="{
                      'grid-cols-[1fr_auto_1fr]':
                        values.code_format === 'Alphanumeric',
                      'grid-cols-2': values.code_format !== 'Alphanumeric',
                    }"
                  >
                    <template v-if="values.code_format === 'Alphanumeric'">
                      <template v-if="alphanumericOrder === 'alpha-first'">
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          class="self-end"
                          @click="
                            alphanumericOrder =
                              alphanumericOrder !== 'numeric-first'
                                ? 'numeric-first'
                                : 'alpha-first'
                          "
                        >
                          <IconArrowLeftRight class="h-4 w-4" />
                        </Button>
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
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          class="self-end"
                          @click="
                            alphanumericOrder =
                              alphanumericOrder !== 'numeric-first'
                                ? 'numeric-first'
                                : 'alpha-first'
                          "
                        >
                          <IconArrowLeftRight class="h-4 w-4" />
                        </Button>
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
                      </template>
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
                        :class="{ 'border-destructive': isNewColLabelInvalid }"
                        data-test="new-column-name"
                      />
                    </FormControl>
                  </FormItem>
                </FormField>
                <FormField name="new_col_type">
                  <FormItem>
                    <FormLabel class="sr-only">New Column Type</FormLabel>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button
                          variant="outline"
                          class="w-[140px] justify-between"
                          :class="{ 'border-destructive': isNewColTypeInvalid }"
                          data-test="new-column-type"
                        >
                          {{ newCol.type ? newCol.type : 'Select a type' }}
                          <IconifyIcon
                            name="lucide:chevron-down"
                            class="h-4 w-4 opacity-50"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent class="z-50 w-[140px]">
                        <template
                          v-for="item in dynamicColumnTypes"
                          :key="item.label"
                        >
                          <DropdownMenuGroup
                            v-if="item.submenu && item.submenu.length > 0"
                          >
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>
                                {{ item.label }}
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent class="z-50">
                                <DropdownMenuItem
                                  v-for="subItem in item.submenu"
                                  :key="subItem.value"
                                  :disabled="subItem.disabled"
                                  @click="newCol.type = subItem.value"
                                >
                                  {{ subItem.label }}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </DropdownMenuGroup>
                          <DropdownMenuItem
                            v-else
                            :value="item.value"
                            :disabled="item.disabled"
                            @click="newCol.type = item.value"
                          >
                            {{ item.label }}
                          </DropdownMenuItem>
                        </template>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormItem>
                </FormField>
                <Button
                  type="button"
                  variant="secondary"
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
        <X class="h-4 w-4" />
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, watch, toRaw, computed, onMounted } from 'vue';
import { slugify, generateCodeRegex, generateExampleCode } from '../../utils';
import { ColumnChips } from '..';
import { IconArrowLeftRight, X } from '@vben/icons';
import { listGroups } from '../../services/lookupGroups.service';

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
  Textarea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  { key: 'code', label: 'Code', type: 'number', required: true },

  { key: 'label', label: 'Label', type: 'string' },
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
  validationSchema: {
    title: (value: string) => {
      if (!value?.trim()) return 'Title is required';
      return true;
    },
  },
  validateOnBlur: true,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
});
const { handleSubmit, setValues, values, errors, resetForm } = form;

function populateFromInitial(init: any) {
  if (!init) return;
  const rawInit = toRaw(init);
  const initialValues = {
    title: rawInit.title || '',
    short_description: rawInit.short_description || '',
    code_format: rawInit.code_format || 'Alphanumeric',
    columns_schema: Array.isArray(rawInit.columns_schema)
      ? structuredClone(rawInit.columns_schema)
      : structuredClone(defaultColumns),
  };
  setValues(initialValues);
  alphanumericOrder.value = rawInit.alphanumeric_order || 'alpha-first';
  codeEnabled.value = (initialValues.columns_schema || []).some(
    (c: any) => (c.key || c.name) === 'code' && !c.hidden,
  );
}

const codePresets = ['Alphanumeric', 'Numeric', 'Alphabetic'];

interface ColumnTypeOption {
  label: string;
  value?: string;
  submenu?: ColumnTypeOption[];
}

const baseColumnTypes: ColumnTypeOption[] = [
  { label: 'String', value: 'string' },
  {
    label: 'Number',
    submenu: [
      { label: 'Integer', value: 'int' },
      { label: 'Float', value: 'double' },
    ],
  },
  {
    label: 'Date',
    submenu: [
      { label: 'Month', value: 'month' },
      { label: 'Year', value: 'year' },
    ],
  },
  {
    label: 'Others',
    submenu: [{ label: 'Loading...', value: 'loading', disabled: true }], // This will be populated dynamically
  },
];

const dynamicColumnTypes = ref<ColumnTypeOption[]>([]);

async function fetchAndPopulateLookupGroups() {
  console.log('fetchAndPopulateLookupGroups called');
  try {
    const groups = await listGroups(); // Call listGroups without categoryId
    console.log('listGroups response:', groups); // Log the groups directly
    const othersOption = baseColumnTypes.find((opt) => opt.label === 'Others');
    console.log('othersOption:', othersOption);
    if (othersOption && othersOption.submenu) {
      othersOption.submenu =
        groups.length > 0
          ? groups.map((group: any) => ({
              label: group.title,
              value: group.slug,
            }))
          : [
              {
                label: 'No lookup groups found',
                value: 'no-groups',
                disabled: true,
              },
            ];
    }
    dynamicColumnTypes.value = [...baseColumnTypes];
    console.log('dynamicColumnTypes after update:', dynamicColumnTypes.value);
  } catch (error) {
    console.error('Error fetching lookup groups:', error);
    dynamicColumnTypes.value = [...baseColumnTypes]; // Fallback
    console.log(
      'dynamicColumnTypes after error fallback:',
      dynamicColumnTypes.value,
    );
  }
}

onMounted(() => {
  fetchAndPopulateLookupGroups();
});

const alphaCount = ref<number>(2);
const numCount = ref<number>(2);
const singleCount = ref<number>(3);

const codeEnabled = ref<boolean>(true);

const effectiveAllowEditColumns = computed(
  () => props.mode === 'add' || props.allowEditColumns,
);

function addVisibleCodeColumn() {
  const cols = [...(values.columns_schema || [])];
  const existing = cols.find((c: any) => (c.key || c.name) === 'code');
  if (existing) {
    existing.hidden = false;
    existing.type = existing.type || 'number';
    existing.required = true; // Added this line
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

const alphanumericOrder = ref<'alpha-first' | 'numeric-first'>('alpha-first');

const exampleCode = computed(() => {
  const fmt = values.code_format;
  const generatedRegex = generateCodeRegex(
    fmt,
    alphaCount.value,
    numCount.value,
    singleCount.value,
    alphanumericOrder.value,
  );
  return generatedRegex ? generateExampleCode(generatedRegex) : null;
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
      resetForm();
      alphaCount.value = 2;
      numCount.value = 2;
      singleCount.value = 3;
      alphanumericOrder.value = 'alpha-first';
      codeEnabled.value = true;
      newCol.value.label = '';
      newCol.value.type = '';
    }
  },
  { immediate: true },
);

const newCol = ref({ label: '', type: '' });
const isNewColLabelInvalid = ref(false);
const isNewColTypeInvalid = ref(false);

watch(
  () => newCol.value.label,
  (val) => {
    if (val) isNewColLabelInvalid.value = false;
  },
);
watch(
  () => newCol.value.type,
  (val) => {
    if (val) isNewColTypeInvalid.value = false;
  },
);

function addColumnFromInput() {
  isNewColLabelInvalid.value = !newCol.value.label;
  isNewColTypeInvalid.value = !newCol.value.type;
  if (isNewColLabelInvalid.value || isNewColTypeInvalid.value) {
    return;
  }

  const currentCols = [...(values.columns_schema || [])];
  currentCols.push({
    key: slugify(newCol.value.label) || `col${currentCols.length + 1}`,
    label: newCol.value.label,
    type: newCol.value.type,
  });
  setValues({ columns_schema: currentCols });
  newCol.value.label = '';
  newCol.value.type = '';
  isNewColLabelInvalid.value = false;
  isNewColTypeInvalid.value = false;
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
  const payload = toRaw(formValues);
  payload.slug = slugify(payload.title);
  payload.code_format = codeEnabled.value ? payload.code_format : null;
  payload.code_regex = codeEnabled.value
    ? generateCodeRegex(
        payload.code_format,
        alphaCount.value,
        numCount.value,
        singleCount.value,
        alphanumericOrder.value,
      )
    : null;
  if (codeEnabled.value) {
    payload.alpha_count = alphaCount.value;
    payload.num_count = numCount.value;
    payload.single_count = singleCount.value;
    payload.alphanumeric_order = alphanumericOrder.value;
  }
  // Apply single column required rule
  if (payload.columns_schema && payload.columns_schema.length === 1) {
    payload.columns_schema[0].required = true;
  }

  emit('save', payload);
  visible.value = false;
};

const onSave = handleSubmit(submitLogic);
</script>
