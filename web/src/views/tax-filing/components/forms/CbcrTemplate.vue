<template>
  <div class="form-container bg-white p-6 text-sm">
    <!-- Notification as a Reporting Entity Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Notification as a Reporting Entity
      </div>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of company</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reference no. (Registration no.)</label
          >
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">TIN</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">CbCR e-mail</label>
          <input type="email" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of MNE Group</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Accounting period from</label>
          <input
            type="text"
            readonly
            class="form-input-readonly"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Accounting period to</label>
          <input
            type="text"
            readonly
            class="form-input-readonly"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Number of constituent entities in Malaysia</label
          >
          <input type="number" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Number of constituent entities outside Malaysia</label
          >
          <input type="number" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Status of reporting entity</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Information of ultimate holding entity</label
          >
          <div class="flex flex-1 items-center gap-4">
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> Same as item G11a in
              Appendix Item G11</label
            >
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> Other than item G11a
              in Appendix Item G11</label
            >
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Name of ultimate holding entity</label
          >
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country of residence</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
      </div>
    </div>

    <!-- Notification as a Non-Reporting Entity Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Notification as a Non-Reporting Entity
      </div>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of company</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reference no. (Registration no.)</label
          >
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">TIN</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">E-mail</label>
          <input type="email" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reporting entity information is the same as item G11a in Appendix
            Item G11</label
          >
          <div class="flex flex-1 items-center gap-4">
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> Yes</label
            >
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> No</label
            >
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of reporting entity</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country of residence</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">TIN</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Accounting period of reporting entity from</label
          >
          <input
            type="text"
            readonly
            class="form-input-readonly"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Accounting period of reporting entity to</label
          >
          <input
            type="text"
            readonly
            class="form-input-readonly"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of MNE Group</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Status of reporting entity</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// This component is a read-only visual template.
</script>

<style scoped>
.form-container {
  font-family: Arial, sans-serif;
}

.form-input-readonly {
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}
</style>
