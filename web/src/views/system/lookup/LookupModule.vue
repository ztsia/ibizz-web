<template>
  <div>
    <LookupMenu v-if="currentView === 'menu'" @select="showCategory" />
    <CategoryPage
      v-if="currentView === 'category'"
      :category="selectedCategory"
      @back="showMenu"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LookupMenu from './pages/LookupMenu.vue';
import CategoryPage from './pages/CategoryPage.vue';

const currentView = ref('menu');
const selectedCategory = ref<string | null>(null);

function showCategory(category: any) {
  if (category && category.id) {
    selectedCategory.value = category.id;
    currentView.value = 'category';
  }
}

function showMenu() {
  selectedCategory.value = null;
  currentView.value = 'menu';
}
</script>
