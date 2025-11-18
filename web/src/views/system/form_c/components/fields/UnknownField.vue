<template>
  <div class="text-red-500">
    <p><strong>Unknown Field Type</strong></p>
    <p>
      Input Type: <code>{{ inputType }}</code>
    </p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  inputType: string;
}>();
</script>
