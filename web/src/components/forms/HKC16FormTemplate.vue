<template>
  <div class="hk-c16-form mx-auto max-w-4xl bg-white p-6">
    <!-- Form Header -->
    <div class="form-header mb-4 bg-gray-600 p-2 text-white">
      <div class="flex items-center justify-between">
        <span class="text-sm font-bold">HK-C16:</span>
        <span class="flex-1 text-center text-sm font-bold"
          >COMPUTATION OF STATUTORY INCOME – RENTS</span
        >
      </div>
    </div>

    <!-- Basic Information Section -->
    <div class="basic-info mb-6">
      <div class="mb-4 grid grid-cols-1 gap-4">
        <div class="flex items-center">
          <label class="w-16 text-sm font-medium">Name</label>
          <div class="ml-2 h-8 flex-1 border border-gray-400"></div>
        </div>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-4">
        <div class="flex items-center">
          <label class="w-8 text-sm font-medium">TIN</label>
          <div class="ml-2 h-8 w-32 border border-gray-400"></div>
        </div>
        <div class="flex items-center">
          <label class="w-24 text-sm font-medium">Registration No.</label>
          <div class="ml-2 h-8 flex-1 border border-gray-400"></div>
        </div>
      </div>

      <div class="mb-6 flex justify-center">
        <div class="flex items-center">
          <label class="mr-2 text-sm font-medium">Year of Assessment</label>
          <div class="h-8 w-16 border border-gray-400"></div>
        </div>
      </div>
    </div>

    <!-- Section A1: Gross Rental Income -->
    <div class="section mb-6">
      <div class="mb-2 flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-2 text-sm font-bold">A1. GROSS RENTAL INCOME</span>
          <span class="text-xs text-gray-600">(from Appendix B5)</span>
        </div>
        <div class="h-8 w-32 border border-gray-400"></div>
      </div>
    </div>

    <!-- LESS: Allowable Expenses Section -->
    <div class="section mb-6">
      <div class="mb-4">
        <div class="mb-2 text-sm font-bold">LESS:</div>
        <div class="mb-3 text-sm font-bold">Allowable expenses:</div>
      </div>

      <!-- Allowable Expenses List -->
      <div class="mb-4 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="w-8 text-sm">(i)</span>
            <span class="ml-2 text-sm"
              >Interest expended on loan employed exclusively in the production
              of the above rental income</span
            >
          </div>
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="w-8 text-sm">(ii)</span>
            <span class="ml-2 text-sm">Assessment</span>
          </div>
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="w-8 text-sm">(iii)</span>
            <span class="ml-2 text-sm">Quit rent</span>
          </div>
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="w-8 text-sm">(iv)</span>
            <span class="ml-2 text-sm">Insurance</span>
          </div>
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>
      </div>

      <!-- Other Revenue Expenditure -->
      <div class="mb-4">
        <div class="mb-3 text-sm font-bold">Other revenue expenditure:</div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm">(v)</span>
              <span class="ml-2 text-sm">Maintenance and repairs</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm">(vi)</span>
              <span class="ml-2 text-sm">Renewal of tenancy agreement</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm">(vii)</span>
              <span class="ml-2 text-sm">Replacement of furnishings</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm">(viii)</span>
              <span class="ml-2 text-sm">………………………………………………………</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm">(ix)</span>
              <span class="ml-2 text-sm">………………………………………………………</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm">(x)</span>
              <span class="ml-2 text-sm">………………………………………………………</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section A2: Total Expenditure -->
    <div class="section mb-6">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-sm font-bold"
          >A2. Total Expenditure [A1(i) to A1(x)]</span
        >
        <div class="h-8 w-32 border border-gray-400"></div>
      </div>
    </div>

    <!-- Section A3: Adjusted Income -->
    <div class="section mb-6">
      <div class="mb-2 flex items-center justify-between">
        <div>
          <div class="text-sm font-bold">
            A3. ADJUSTED INCOME FROM RENTS (A1 – A2)
          </div>
          <div class="mt-1 text-xs text-gray-600">
            (Fill in '0' in this box if amount A2 exceeds amount A1)
          </div>
        </div>
        <div class="h-8 w-32 border border-gray-400"></div>
      </div>
    </div>

    <!-- Page Break Indicator -->
    <div class="my-6 text-center text-xs text-gray-500">HK-C16: 1/2</div>

    <!-- Page 2 Content -->
    <div class="page-2 mt-8">
      <!-- Section B: Computation of Statutory Income -->
      <div class="section mb-6">
        <div class="mb-4 text-sm font-bold">
          B. COMPUTATION OF STATUTORY INCOME FROM RENTS
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm font-bold">1.</span>
              <div class="ml-2">
                <span class="text-sm font-bold">ADD:</span>
                <span class="ml-2 text-sm">Balancing Charge</span>
                <span class="ml-2 text-xs text-gray-600"
                  >(paragraph 60 Schedule 3 of ITA 1967)</span
                >
              </div>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm font-bold">2.</span>
              <span class="ml-2 text-sm font-bold">TOTAL (A3 + B1)</span>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="w-8 text-sm font-bold">3.</span>
              <div class="ml-2">
                <span class="text-sm font-bold">LESS:</span>
                <span class="ml-2 text-sm"
                  >Industrial Building Allowance absorbed</span
                >
                <span class="ml-2 text-xs text-gray-600"
                  >(restricted to B2)</span
                >
              </div>
            </div>
            <div class="h-8 w-32 border border-gray-400"></div>
          </div>
        </div>
      </div>

      <!-- Section C -->
      <div class="section mb-6">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold"
            >C. STATUTORY INCOME FROM RENTS (B2 – B3)</span
          >
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>
      </div>

      <!-- Section D -->
      <div class="section mb-6">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold"
            >D. Total statutory income of rental from partnership</span
          >
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>
      </div>

      <!-- Section E -->
      <div class="section mb-6">
        <div class="flex items-center justify-between">
          <span class="text-sm font-bold"
            >E. TOTAL STATUTORY INCOME FROM RENTS (C + D)</span
          >
          <div class="h-8 w-32 border border-gray-400"></div>
        </div>
      </div>

      <!-- Page 2 Footer -->
      <div class="mt-8 text-center text-xs text-gray-500">HK-C16: 2/2</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-C16 Form Template Component
// Computation of Statutory Income - Rents
</script>

<style scoped>
.hk-c16-form {
  font-family: 'Arial', sans-serif;
  line-height: 1.4;
}

.form-header {
  background-color: #4a5568;
}

.section {
  border-collapse: collapse;
}

.border {
  border: 1px solid #4a5568;
}

/* Print styles */
@media print {
  .hk-c16-form {
    max-width: none;
    margin: 0;
    padding: 20px;
  }

  .page-2 {
    page-break-before: always;
  }
}
</style>
