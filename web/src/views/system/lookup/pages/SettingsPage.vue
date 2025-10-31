<template>
  <div class="p-8">
    <card-grid :items="categories">
      <template #default="{ item }">
        <settings-card
          :id="item.id"
          :title="item.title"
          :description="item.description"
          :icon="item.icon"
          :color="item.color"
          @select="handleSelect"
        />
      </template>
    </card-grid>

    <div
      v-if="snackbarVisible"
      class="fixed bottom-4 right-4 flex items-center justify-between rounded-lg bg-gray-800 p-4 text-white shadow-lg"
    >
      <span>{{ snackbarMessage }}</span>
      <button
        @click="snackbarVisible = false"
        class="ml-4 text-white hover:text-gray-300"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { CardGrid, SettingsCard } from '../components';
import { categories } from './categories';

// Optional component name for tooling
try {
  defineOptions?.({ name: 'SettingsPage' });
} catch {
  /* ignore */
}

const router = useRouter();
const snackbarVisible = ref(false);
const snackbarMessage = ref('');

function handleSelect(payload: any) {
  if (payload && payload.id && router && typeof router.push === 'function') {
    router
      .push({ name: 'SettingsCategory', params: { category: payload.id } })
      .catch(() => {});
    return;
  }
  // fallback: show snackbar with selection info
  snackbarMessage.value = `Selected: ${payload?.title || ''}`;
  snackbarVisible.value = true;
}
</script>
