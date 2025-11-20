<template>
  <div class="cp204b-form-template bg-white p-6 text-sm">
    <div class="mb-6">
      <div
        class="flex items-center justify-between bg-gray-600 px-4 py-2 text-white"
      >
        <span class="font-bold">CP204B:</span>
        <span class="font-bold"
          >NOTIFICATION OF CHANGE IN ACCOUNTING PERIOD</span
        >
      </div>
    </div>

    <div class="space-y-4">
      <!-- Row 1 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">CP204B Date</label>
        <input
          type="text"
          readonly
          placeholder="DD/MM/YYYY"
          class="field-value-input"
        />
      </div>
      <!-- Row 2 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Current accounting period</label>
        <div class="ml-4 flex flex-1 items-center">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
          <span class="mx-2 font-medium">To</span>
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
        </div>
      </div>
      <!-- Row 3 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">New accounting period</label>
        <div class="ml-4 flex flex-1 items-center">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
          <span class="mx-2 font-medium">To</span>
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
        </div>
      </div>
      <!-- Row 4 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Current assessment year basis period</label
        >
        <div class="ml-4 flex flex-1 items-center">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
          <span class="mx-2 font-medium">To</span>
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
        </div>
      </div>
      <!-- Row 5 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium"
          >Following assessment basis period</label
        >
        <div class="ml-4 flex flex-1 items-center">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
          <span class="mx-2 font-medium">To</span>
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
        </div>
      </div>
      <!-- Row 6 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Next assessment basis period</label>
        <div class="ml-4 flex flex-1 items-center">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
          <span class="mx-2 font-medium">To</span>
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="field-value-small-input"
          />
        </div>
      </div>
      <!-- Row 7 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Previous estimated tax payable</label>
        <input
          type="number"
          readonly
          placeholder="0.00"
          class="field-value-input"
        />
      </div>
      <!-- Row 8 -->
      <div class="flex items-center">
        <label class="w-1/2 font-medium">Revised estimated tax payable</label>
        <input
          type="number"
          readonly
          placeholder="0.00"
          class="field-value-input"
        />
      </div>
    </div>

    <div class="mt-8 text-center">
      <span class="font-bold">-- End of CP204B --</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// This component is a read-only visual template.
</script>

<style scoped>
.cp204b-form-template {
  line-height: 1.4;
}

.field-value-input {
  /* New class for input elements */
  @apply ml-4 flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}

.field-value-small-input {
  /* New class for small input elements */
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm;
}

@media print {
  .cp204b-form-template {
    font-size: 12px;
    color: black;
  }
}
</style>
