<template>
  <div class="form-container bg-white p-6 text-sm">
    <!-- Part A: Company Information Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Part A: Company Information
      </div>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Is the company required to prepare a Contemporaneous Transfer
            Pricing Documentation?</label
          >
          <input type="text" readonly class="form-input-readonly flex-1" />
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Manufacturing activities performed</label
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
          <label class="w-2/3 font-medium"
            >Characterization of manufacturing activity</label
          >
          <input type="text" readonly class="form-input-readonly flex-1" />
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Distribution activities performed</label
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
          <label class="w-2/3 font-medium"
            >Characterization of distribution activity</label
          >
          <input type="text" readonly class="form-input-readonly flex-1" />
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium">Service activities performed</label>
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
          <label class="w-2/3 font-medium"
            >Characterization of service activity</label
          >
          <input type="text" readonly class="form-input-readonly flex-1" />
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Business restructuring during the basis period</label
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
          <label class="w-2/3 font-medium"
            >State the nature of business restructuring</label
          >
          <input type="text" readonly class="form-input-readonly flex-1" />
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Performed any research and development activity</label
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
          <label class="w-2/3 font-medium"
            >State the types of R&D activity</label
          >
          <input type="text" readonly class="form-input-readonly flex-1" />
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Does the company own any trade/ brand name/ intellectual
            property?</label
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
          <label class="w-2/3 font-medium"
            >Has the company involved in any cash pooling activities?</label
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
          <label class="w-2/3 font-medium"
            >Role in the cash pooling activity</label
          >
          <div class="flex flex-1 items-center gap-4">
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> cash pool
              leader</label
            >
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> cash pool
              member</label
            >
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-2/3 font-medium"
            >Is the company a PE as defined under the TP Rules?</label
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
          <label class="w-2/3 font-medium"
            >Does the company make any interest, royalties and service payments
            to the company's head office?</label
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
          <label class="w-2/3 font-medium"
            >Has the company involved in any Cost Contribution Arrangement
            (CCA)</label
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
      </div>
    </div>

    <!-- Part B: Controlled Transactions Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        Part B: Controlled Transactions
      </div>
      <p class="mb-4">Controlled Transaction List</p>
      <table class="w-full border-collapse border border-gray-400 text-xs">
        <thead>
          <tr class="bg-gray-200">
            <th class="border border-gray-400 p-2">Transaction Type</th>
            <th class="border border-gray-400 p-2">
              Sales/Revenue (In Malaysia)
            </th>
            <th class="border border-gray-400 p-2">
              Sales/Revenue (Outside Malaysia)
            </th>
            <th class="border border-gray-400 p-2">
              Purchases/Expenditure (In Malaysia)
            </th>
            <th class="border border-gray-400 p-2">
              Purchases/Expenditure (Outside Malaysia)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
          </tr>
          <tr>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
            <td class="h-8 border border-gray-400 p-1"></td>
          </tr>
        </tbody>
      </table>
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
  @apply border border-gray-400 bg-white px-3 py-2 text-sm;
}
</style>
