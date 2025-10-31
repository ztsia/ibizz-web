<template>
  <div class="p-8">
    <h1>Profile</h1>
    <p>This is a placeholder profile page.</p>
  </div>
</template>

<script lang="ts" setup>
// Minimal profile placeholder page — no reactive state needed
// Use defineOptions if you want to set a component name for devtools
try {
  defineOptions?.({ name: 'ProfilePage' });
} catch {
  /* ignore */
}
</script>

<style scoped></style>
