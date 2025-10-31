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
      <Button variant="outline" @click="openLookup">Lookup</Button>
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
                @dblclick="onTabDblClick(g, $event)"
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
          <span class="hidden">{{ activeGroupTitle }}</span>
        </div>
      </CardContent>
    </Card>

    <!-- Lookup table for the active group -->
    <div v-if="activeGroup" class="mt-4">
      <LookupTable
        :group="activeGroup"
        :group-id="activeGroup.slug"
        :columns="activeGroupColumns"
        :items="[]"
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

    <!-- segmented overlay dropdown (positioned) -->
    <div
      v-if="showSegmented && segmentedPos"
      ref="segmentedOverlayRef"
      class="fixed z-[1200]"
      :style="{ top: segmentedPos.top + 'px', left: segmentedPos.left + 'px' }"
    >
      <Card class="flex items-center gap-2 p-2">
        <Button
          variant="outline"
          size="sm"
          data-test="edit-group-btn"
          @click="openEditGroup"
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          data-test="delete-group-btn"
          @click="openDeleteGroup"
        >
          Delete
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          aria-label="Close segmented menu"
          title="Close"
          @click="hideSegmented"
        >
          ✕
        </Button>
      </Card>
    </div>

    <!-- Add/Edit Group modal (AddGroupModal component) -->
    <Teleport to="#__vben_main_content">
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  listItems,
  ensureTableForGroup,
} from '../services';
import { AddGroupModal, LookupTable, DeleteConfirm } from '../components';
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

const route = useRoute();
const router = useRouter();
const category = computed(() => normalizeCategory());

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
const activeTab = ref<string>((route.params.group as string) || '');
const showSegmented = ref<boolean>(false);
const canEditColumns = ref<boolean>(true);
const showDeleteGroupModal = ref<boolean>(false);
const segmentedPos = ref<{ top: number; left: number; width?: number } | null>(
  null,
);
const segmentedOverlayRef = ref<HTMLElement | null>(null);

let _segmentedClickHandler: any = null;

const categoryObj = computed(() =>
  categories.find((c) => c.id === category.value),
);

const displayTitle = computed(() =>
  categoryObj.value ? categoryObj.value.title : category.value || '',
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

const activeGroupTitle = computed(() =>
  activeGroup.value ? (activeGroup.value.title || '').toUpperCase() : '',
);

async function loadGroups() {
  loading.value = true;
  error.value = null;
  try {
    const res = await listGroups(normalizeCategory());
    groups.value = Array.isArray(res) ? res : [];
    if (!route.params.group) {
      activeTab.value = groups.value.length > 0 ? groups.value[0]!.slug : '';
      if (activeTab.value) {
        router.replace({
          name: 'LookupCategory',
          params: { category: normalizeCategory(), group: activeTab.value },
        });
      }
    }
  } catch (error_: any) {
    console.error('Failed to load groups for category', category.value, error_);
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

async function onTabDblClick(g: any, ev: any) {
  if (!g || g.slug !== activeTab.value) return;

  try {
    const res = await listItems(g.slug, { page: 1, perPage: 1 });
    canEditColumns.value = !(Array.isArray(res) && res.length > 0);
  } catch {
    canEditColumns.value = false;
  }

  try {
    const rect = ev?.currentTarget?.getBoundingClientRect();
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

function hideSegmented() {
  showSegmented.value = false;
  segmentedPos.value = null;
}

function attachSegmentedClickAway() {
  if (_segmentedClickHandler) return;
  _segmentedClickHandler = (ev: any) => {
    const el = segmentedOverlayRef.value;
    if (el && !el.contains(ev.target)) {
      hideSegmented();
    }
  };
  document.addEventListener('mousedown', _segmentedClickHandler, true);
}

function detachSegmentedClickAway() {
  if (!_segmentedClickHandler) return;
  document.removeEventListener('mousedown', _segmentedClickHandler, true);
  _segmentedClickHandler = null;
}

watch(
  () => route.params.category,
  () => {
    loadGroups();
  },
);

watch(activeTab, (newVal) => {
  hideSegmented();
  if (!newVal) return;
  router.push({
    name: 'LookupCategory',
    params: { category: normalizeCategory(), group: newVal },
  });
});

watch(showSegmented, (val) => {
  if (val) attachSegmentedClickAway();
  else detachSegmentedClickAway();
});

onMounted(() => {
  loadGroups();
});

function updateDocumentTitle() {
  const categoryLabel = displayTitle.value || category.value || 'Lookup';
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

onBeforeUnmount(() => {
  detachSegmentedClickAway();
});

function normalizeCategory(): string {
  const v = route.params.category as unknown;
  if (Array.isArray(v)) return String(v[0] || '');
  return String(v ?? '');
}

function openLookup() {
  router.push({ name: 'Lookup' });
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
  hideSegmented();
}

function openDeleteGroup() {
  if (!activeGroup.value) return;
  showDeleteGroupModal.value = true;
  hideSegmented();
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
      category_id: normalizeCategory(),
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
  const originalGroupId = activeGroup.value.id;
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
    await loadGroups();
    const refreshedById =
      groups.value.find((g) => g.id === originalGroupId) || null;
    if (refreshedById?.slug) {
      activeTab.value = refreshedById.slug;
      router.replace({
name: 'LookupCategory',
      });
    } else if (updated?.slug) {
      activeTab.value = updated.slug;
      router.replace({
        name: 'SettingsCategory',
        params: { category: normalizeCategory(), group: updated.slug },
      });
    }
    if (
      canEditColumns.value &&
      (updates.columns_schema || updates.code_format)
    ) {
      const targetSlug =
        refreshedById?.slug || updated?.slug || activeTab.value;
      const refreshed = groups.value.find((g) => g.slug === targetSlug) || null;
      if (refreshed) await ensureTableForGroup(refreshed);
    }
  } catch (error_) {
    console.error('Failed to update group', error_);
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
