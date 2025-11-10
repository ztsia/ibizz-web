<script setup lang="ts">
import { computed } from 'vue';
import { Eye, Pencil } from '@vben/icons';

const props = defineProps<{
  isEditing: boolean;
  compact?: boolean;
}>();
const emit = defineEmits(['update:isEditing']);

const isEditing = computed({
  get: () => props.isEditing,
  set: (value) => emit('update:isEditing', value),
});

function setMode(editing: boolean) {
  isEditing.value = editing;
}

function toggleMode() {
  isEditing.value = !isEditing.value;
}
</script>

<template>
  <!-- Compact floating toggle (icon-only) when scrolled -->
  <button
    v-if="compact"
    class="fixed right-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
    style="top: 100px; z-index: 250"
    @click="toggleMode"
  >
    <Eye v-if="!isEditing" class="text-primary h-5 w-5" />
    <Pencil v-else class="text-primary h-5 w-5" />
  </button>

  <!-- Full sliding control when header is visible -->
  <div
    v-else
    class="bg-muted relative flex w-fit items-center rounded-lg border p-1"
  >
    <!-- Sliding background -->
    <div
      class="bg-background absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-md shadow-sm transition-transform duration-300 ease-in-out"
      :style="{
        transform: isEditing ? 'translateX(calc(100% + 4px))' : 'translateX(0)',
      }"
    ></div>

    <!-- View Button -->
    <button
      class="relative z-10 flex flex-1 items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-300"
      :class="!isEditing ? 'text-primary' : 'text-muted-foreground'"
      @click="setMode(false)"
    >
      <Eye class="mr-2 h-4 w-4" />
      View
    </button>

    <!-- Edit Button -->
    <button
      class="relative z-10 flex flex-1 items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-300"
      :class="isEditing ? 'text-primary' : 'text-muted-foreground'"
      @click="setMode(true)"
    >
      <Pencil class="mr-2 h-4 w-4" />
      Edit
    </button>
  </div>
</template>
