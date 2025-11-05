<template>
  <div class="p-4">
    <!-- CategoryPage template: main container for lookup category -->
    <div class="mb-4 flex items-center justify-between">
      <!-- Header: title, description, and top-right Lookup button -->
      <div>
        <h1 class="text-xl font-semibold" data-test="category-title">
          {{ displayTitle }}
        </h1>
        <p class="text-sm text-gray-500" data-test="category-description">
          {{ categoryObj?.description || '' }}
        </p>
      </div>
      <Button variant="outline" @click="openLookup">Lookup Menu</Button>
    </div>

    <Card>
      <CardHeader class="px-1 py-1">
        <div class="flex items-center justify-between">
          <Tabs v-model="activeTab" class="flex-1">
            <TabsList class="overflow-x-auto">
              <TabsTrigger
                v-for="g in groups"
                :key="g.slug"
                :value="g.slug"
                class="group-tab"
                data-test="group-tab"
                @contextmenu.prevent="onTabContextMenu(g, $event)"
              >
                <div class="text-left">
                  <span class="font-medium">{{ g.title }}</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <Button
              variant="ghost"
              class="add-group-btn"
              data-test="add-group-btn"
              @click="openAddGroup"
            >
              <span class="add-btn-label">Add Group</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="pt-0">
        <div v-if="activeGroup">
          <p class="text-sm text-gray-500" data-test="group-tab-desc">
            {{ activeGroup.short_description || '' }}
          </p>
        </div>

        <!-- Status area (loading / error / empty state) -->

        <div>
          <div v-if="loading">Loading groups…</div>
          <div v-else-if="error" class="text-red-600" data-test="groups-error">
            Failed to load groups: {{ error }}
            <Button
              variant="ghost"
              size="sm"
              data-test="retry-groups"
              @click="loadGroups"
            >
              Retry
            </Button>
          </div>
          <div v-else-if="groups.length === 0">No groups in this category.</div>
        </div>
      </CardContent>
    </Card>

    <!-- Lookup table for the active group -->
    <div v-if="activeGroup" class="mt-4">
      <LookupTable
        :group="activeGroup"
        :group-id="activeGroup.slug"
        :columns="activeGroupColumns"
        :items="items"
        has-pager
      />
    </div>
    <!-- End lookup table -->

    <!-- Delete group confirmation uses shared DeleteConfirm component -->
    <DeleteConfirm
      v-model="showDeleteGroupModal"
      title="Confirm delete group"
      message="Are you sure you want to delete this lookup group? This action cannot be undone."
      :target-label="activeGroup ? activeGroup.title || activeGroup.slug : ''"
      @confirm="confirmDeleteGroup"
      @cancel="showDeleteGroupModal = false"
    />

    <!-- Add/Edit Group modal (AddGroupModal component) -->
    <Teleport to="body">
      <SegmentedOverlay
        :show="showSegmented"
        :position="segmentedPos"
        @edit="openEditGroup"
        @delete="openDeleteGroup"
        @close="showSegmented = false"
      />
      <AddGroupModal
        :modelValue="showAddGroup"
        @update:modelValue="showAddGroup = $event"
        :initial="editInitial"
        :allow-edit-columns="canEditColumns"
        :mode="isEditingGroup ? 'edit' : 'add'"
        @save="onGroupModalSave"
        @close="
          () => {
            isEditingGroup = false;
            editInitial = null;
          }
        "
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  listItems,
  ensureTableForGroup,
} from '../../services';
import {
  AddGroupModal,
  LookupTable,
  DeleteConfirm,
  SegmentedOverlay,
} from '../components';
import { categories } from './categories';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@vben-core/shadcn-ui';

const props = defineProps<{
  category: string;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

interface LookupGroup {
  id: string;
  slug: string;
  title: string;
  short_description?: string;
  columns_schema?: any[];
  code_format?: string | null;
  code_regex?: string | null;
  status?: string;
}

const groups = ref<LookupGroup[]>([]);
const loading = ref(false);
const error = ref<any>(null);
const activeTab = ref('');
const showSegmented = ref<boolean>(false);
const segmentedPos = ref<{ top: number; left: number; width?: number } | null>(
  null,
);
const showDeleteGroupModal = ref(false);
const canEditColumns = ref(false);

const categoryObj = computed(() =>
  categories.find((c) => c.id === props.category),
);

const displayTitle = computed(() =>
  categoryObj.value ? categoryObj.value.title : props.category || '',
);

// Add Group modal state
const showAddGroup = ref(false);
const isEditingGroup = ref(false);
const editInitial = ref<Record<string, any> | null>(null);

// pending group id generator
let _tempId = 0;

const activeGroup = computed<LookupGroup | null>(
  () =>
    groups.value.find((g) => g.slug === activeTab.value) ||
    groups.value[0] ||
    null,
);

const items = ref<any[]>([]);

async function loadItems() {
  if (!activeGroup.value) return;
  try {
    const res = await listItems(activeGroup.value.slug);
    items.value = Array.isArray(res) ? res : [];
  } catch (error_) {
    console.error(
      'Failed to load items for group',
      activeGroup.value.slug,
      error_,
    );
    items.value = [];
  }
}

watch(activeGroup, () => {
  loadItems();
});

async function loadGroups() {
  loading.value = true;
  error.value = null;
  try {
    const res = await listGroups(props.category);
    groups.value = Array.isArray(res) ? res : [];
    if (groups.value.length > 0) {
      activeTab.value = groups.value[0]!.slug;
    }
  } catch (error_: any) {
    console.error('Failed to load groups for category', props.category, error_);
    const raw =
      (error_ && (error_.message || error_.statusText || String(error_))) ||
      'Unknown error';
    const normalized = String(raw).trim();
    error.value = normalized.toLowerCase().includes('failed to fetch')
      ? 'failed to fetch'
      : normalized.replaceAll(/^"|"$/g, '');
    groups.value = [];
  } finally {
    loading.value = false;
  }
}

async function onTabContextMenu(g: any, ev: MouseEvent) {
  if (!g || g.slug !== activeTab.value) return;

  try {
    const res = await listItems(g.slug, { page: 1, perPage: 1 });
    canEditColumns.value = !(Array.isArray(res) && res.length > 0);
  } catch {
    canEditColumns.value = false;
  }

  try {
    const target = ev.target as HTMLElement;
    const triggerEl = target.closest('[data-test="group-tab"]');
    const rect = triggerEl?.getBoundingClientRect();
    segmentedPos.value = rect
      ? {
          top: rect.bottom + window.scrollY + 6,
          left: rect.left + window.scrollX,
          width: rect.width,
        }
      : null;
  } catch {
    segmentedPos.value = null;
  }
  showSegmented.value = true;
}

watch(
  () => props.category,
  () => {
    loadGroups();
  },
);

onMounted(() => {
  loadGroups();
});

function updateDocumentTitle() {
  const categoryLabel = displayTitle.value || props.category || 'Lookup';
  const groupLabel = activeGroup.value
    ? activeGroup.value.title || activeGroup.value.slug
    : null;
  document.title =
    (groupLabel && `${categoryLabel} - ${groupLabel}`) || categoryLabel;
}

watch(
  [() => activeGroup.value?.id, () => displayTitle.value],
  () => {
    updateDocumentTitle();
  },
  { immediate: true },
);

function openLookup() {
  emit('back');
}

function openAddGroup() {
  isEditingGroup.value = false;
  editInitial.value = null;
  showAddGroup.value = true;
}

function openEditGroup() {
  if (!activeGroup.value) return;
  isEditingGroup.value = true;
  editInitial.value = activeGroup.value;
  showAddGroup.value = true;
  showSegmented.value = false;
}

function openDeleteGroup() {
  if (!activeGroup.value) return;
  showDeleteGroupModal.value = true;
  showSegmented.value = false;
}

async function confirmDeleteGroup() {
  if (!activeGroup.value) return;
  try {
    await deleteGroup(activeGroup.value.id);
    await loadGroups();
    showDeleteGroupModal.value = false;
    activeTab.value = groups.value.length > 0 ? groups.value[0]!.slug : '';
  } catch (error_) {
    console.error('Failed to delete group', error_);
    showDeleteGroupModal.value = false;
  }
}

async function handleAddGroupPayload(payload: any) {
  const tempSlug = `${payload.slug || payload.title.toLowerCase().replaceAll(/\s+/g, '-')}-pending-${++_tempId}`;
  const pendingGroup: LookupGroup = {
    id: `pending-${_tempId}`,
    slug: tempSlug,
    title: payload.title,
    short_description: payload.short_description,
    columns_schema: payload.columns_schema,
    code_format: payload.code_format,
    code_regex: payload.code_regex || null,
    status: 'pending',
  };
  groups.value.push(pendingGroup);
  activeTab.value = pendingGroup.slug;
  try {
    let created = await createGroup({
      category_id: props.category,
      slug: payload.slug || payload.title.toLowerCase().replaceAll(/\s+/g, '-'),
      title: payload.title,
      short_description: payload.short_description,
      columns_schema: payload.columns_schema,
      code_format: payload.code_format,
      code_regex: payload.code_regex || null,
    });
    if (!created || !created.slug) {
      await loadGroups();
      const expectedSlug =
        payload.slug || payload.title.toLowerCase().replaceAll(/\s+/g, '-');
      created = groups.value.find((g) => g.slug === expectedSlug) || created;
    }
    const idx = groups.value.findIndex((g) => g.id === pendingGroup.id);
    if (idx !== -1) groups.value.splice(idx, 1, created);
    try {
      await ensureTableForGroup(created);
      activeTab.value = created.slug;
    } catch {
      const g = groups.value.find(
        (x) => x.id === created.id || x.slug === created.slug,
      );
      if (g) g.status = 'pending_table';
      activeTab.value = created.slug;
    }
  } catch {
    const idx = groups.value.findIndex((g) => g.id === pendingGroup.id);
    if (idx !== -1) groups.value.splice(idx, 1);
    console.error('Failed to create group', payload);
  }
}

async function handleEditGroupPayload(payload: any) {
  if (!activeGroup.value) return;

  const updates: any = {
    title: payload.title,
    short_description: payload.short_description,
  };
  if (canEditColumns.value) {
    updates.columns_schema = payload.columns_schema;
    updates.code_format = payload.code_format || null;
    updates.code_regex = payload.code_regex || null;
  }

  try {
    let updated: any = await updateGroup(activeGroup.value.id, updates);
    if (Array.isArray(updated)) updated = updated[0] || null;

    if (updated && updated.id) {
      const index = groups.value.findIndex((g) => g.id === updated.id);
      if (index !== -1) {
        // The `updated` object from the API might be incomplete.
        // To ensure the UI has the full, correct data for reactivity,
        // we merge the original group data with the new payload from the form.
        const completeUpdatedGroup = {
          ...groups.value[index],
          ...payload,
          ...updated,
        };
        groups.value.splice(index, 1, completeUpdatedGroup);
      }

      activeTab.value = updated.slug;

      if (
        canEditColumns.value &&
        (updates.columns_schema || updates.code_format)
      ) {
        await ensureTableForGroup(updated);
      }
    } else {
      await loadGroups();
    }
  } catch (error_) {
    console.error('An error occurred during the update process:', error_);
  } finally {
    isEditingGroup.value = false;
    editInitial.value = null;
  }
}

function onGroupModalSave(payload: any) {
  if (isEditingGroup.value) return handleEditGroupPayload(payload);
  return handleAddGroupPayload(payload);
}

const activeGroupColumns = computed(() => {
  const g = activeGroup.value;
  if (!g || !Array.isArray(g.columns_schema)) return [];
  return g.columns_schema.map((c: any) => ({
    name: c.key || c.name || c.label,
    label: c.label || c.key || c.name,
    type: c.type || 'text',
    required: !!c.required,
    multiline: !!c.multiline,
  }));
});
</script>

<style scoped>
/* Scoped styles are removed as per the migration to Tailwind CSS. */
/* All styling is now handled by utility classes in the template. */
</style>
