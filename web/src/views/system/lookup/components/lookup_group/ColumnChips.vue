<template>
  <div class="mb-3">
    <VueDraggable
      v-model="internalList"
      item-key="key"
      :animation="180"
      class="flex flex-wrap items-center"
      tag="div"
      :disabled="!allowEdit"
      filter=".non-draggable-code"
    >
      <div
        v-for="(element, index) in internalList"
        :key="element.key || index"
        :class="[
          'm-1',
          {
            'cursor-grab':
              (element.key || element.name) !== 'code' &&
              !element.hidden &&
              allowEdit,
            'non-draggable-code': (element.key || element.name) === 'code',
          },
        ]"
      >
        <template v-if="element.hidden">
          <div class="hidden-chip-placeholder" aria-hidden="true"></div>
        </template>
        <template v-else-if="allowEdit">
          <Badge variant="secondary" class="flex items-center gap-1 pl-3 pr-1">
            <span>{{ element.label }}</span>
            <Button
              v-if="(element.key || element.name) !== 'code'"
              variant="ghost"
              size="icon"
              class="h-4 w-4 rounded-full"
              aria-label="Remove chip"
              @click="emitRemove(index)"
            >
              <X class="h-3 w-3" />
            </Button>
          </Badge>
        </template>
        <template v-else>
          <Badge variant="secondary" class="pl-3 pr-3">
            {{ element.label }}
          </Badge>
        </template>
      </div>
    </VueDraggable>

    <div v-if="!allowEdit" class="mt-2 text-xs text-gray-500">
      Columns cannot be changed because the backing table contains records.
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { X } from '@vben/icons';
import { Badge, Button } from '@vben-core/shadcn-ui';
import { VueDraggable } from 'vue-draggable-plus';

const props = defineProps<{
  modelValue?: any[];
  allowEdit?: boolean;
  codeEnabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: any[]): void;
  (e: 'remove', index: number): void;
}>();

const internalList = computed({
  get: () => {
    const list = (props.modelValue || []).filter(
      (c: any) => (c.key || c.name) !== 'code',
    );
    if (props.codeEnabled) {
      const codeColumn = {
        key: 'code',
        label: 'Code',
        type: 'text',
        required: true,
      }; // Assuming default properties for code column
      list.unshift(codeColumn);
    }
    return list;
  },
  set: (v: any[]) => emit('update:modelValue', v),
});

function emitRemove(index: number) {
  emit('remove', index);
}
</script>

<style>
.hidden-chip-placeholder {
  width: 0px;
  height: 0px;
  display: inline-block;
}
</style>
