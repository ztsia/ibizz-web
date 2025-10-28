<template>
  <div class="form-container bg-white p-6">
    <!-- Form Header -->
    <div class="mb-6 text-center">
      <div class="bg-gray-800 p-2 text-sm font-bold text-white">
        HK-PC9: COMPUTATION OF STATUTORY INCOME FOR INSURANCE BUSINESS
      </div>
    </div>

    <!-- Basic Information Section -->
    <div class="mb-6">
      <!-- Name Field -->
      <div class="mb-4">
        <div class="flex items-center">
          <label class="mr-2 w-16 font-medium">Name</label>
          <input
            type="text"
            readonly
            placeholder="Enter name"
            class="flex-1 border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- TIN and Registration No -->
      <div class="mb-4 grid grid-cols-2 gap-4">
        <div class="flex items-center">
          <label class="mr-2 w-8 font-medium">TIN</label>
          <input
            type="text"
            readonly
            maxlength="12"
            placeholder="Enter TIN"
            class="flex-1 border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-center">
          <label class="mr-2 font-medium">Registration No.</label>
          <input
            type="text"
            readonly
            maxlength="15"
            placeholder="Enter registration number"
            class="flex-1 border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Year of Assessment -->
      <div class="mb-4 flex items-center">
        <label class="mr-2 font-medium">Year of Assessment</label>
        <input
          type="text"
          readonly
          maxlength="4"
          placeholder="YYYY"
          class="w-24 border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Page 1: Main Computation Table -->
    <div class="mb-8">
      <table class="w-full border-collapse border border-gray-400 text-xs">
        <!-- Table Header -->
        <thead>
          <tr>
            <th
              class="w-32 border border-gray-400 bg-gray-100 p-2 text-left font-medium"
            >
              Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              1<br />Life<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              2<br />Shareholders<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              3<br />Life<br />Re-insurance<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              4<br />General<br />Insurance<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              5<br />Re-insurance<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              TOTAL<br />(2 to 5)
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- A1: Adjusted Income -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              A1. Adjusted<br />Income
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr>
            <td
              class="border border-gray-400 p-1 text-xs text-gray-600"
              colspan="7"
            >
              ADD:
            </td>
          </tr>

          <!-- A2: Balancing Charge -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              A2. Balancing<br />Charge
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- A3: TOTAL -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">A3. TOTAL</td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- LESS Section -->
          <tr>
            <td
              class="border border-gray-400 bg-gray-100 p-2 font-medium"
              colspan="7"
            >
              LESS:
            </td>
          </tr>

          <!-- B: Capital Allowance absorbed -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              B. Capital<br />Allowance<br />absorbed
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr>
            <td
              class="border border-gray-400 p-1 text-xs text-gray-600"
              colspan="7"
            >
              (Restricted to the amount in A3)
            </td>
          </tr>

          <!-- C: Statutory Income -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              C. Statutory<br />Income
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr>
            <td
              class="border border-gray-400 p-1 text-xs text-gray-600"
              colspan="7"
            >
              (Fill in '0' if no Statutory Income)
            </td>
          </tr>

          <!-- D: Insurance loss brought forward -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              D. Insurance loss<br />brought<br />forward
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr>
            <td
              class="border border-gray-400 p-1 text-xs text-gray-600"
              colspan="7"
            >
              (With effect from year of assessment 1995, the insurance business
              loss is restricted to the fund only)
            </td>
          </tr>

          <!-- LESS Section -->
          <tr>
            <td
              class="border border-gray-400 bg-gray-100 p-2 font-medium"
              colspan="7"
            >
              LESS:
            </td>
          </tr>

          <!-- E: Loss brought forward -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              E. Loss brought<br />forward
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 bg-gray-200 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 bg-gray-200 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- F: Subtotal -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">F. Subtotal</td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- ADD Section -->
          <tr>
            <td
              class="border border-gray-400 bg-gray-100 p-2 font-medium"
              colspan="7"
            >
              ADD:
            </td>
          </tr>

          <!-- G: Other income -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              G. Other income
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- H: Total -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">H. Total</td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- LESS Section -->
          <tr>
            <td
              class="border border-gray-400 bg-gray-100 p-2 font-medium"
              colspan="7"
            >
              LESS:
            </td>
          </tr>

          <!-- J: Current year -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              J. Current year
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- K: TOTAL -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">K. TOTAL</td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- LESS Section -->
          <tr>
            <td
              class="border border-gray-400 bg-gray-100 p-2 font-medium"
              colspan="7"
            >
              LESS:
            </td>
          </tr>

          <!-- L: Approved donation -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              L. Approved<br />donation
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>

          <!-- M: Chargeable Income -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium">
              M. Chargeable<br />Income
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form Footer Page 1 -->
    <div class="mb-8 text-center text-xs font-medium">HK-PC9 1/2</div>

    <!-- Page Break -->
    <div class="page-break"></div>

    <!-- Page 2: Additional Sections -->
    <div class="mb-8">
      <!-- Section N: Division of Chargeable Income -->
      <table class="mb-6 w-full border-collapse border border-gray-400 text-xs">
        <thead>
          <tr>
            <th
              class="w-32 border border-gray-400 bg-gray-100 p-2 text-left font-medium"
            >
              Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              1<br />Life<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              2<br />Shareholders<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              3<br />Life<br />Re-insurance<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              4<br />General<br />Insurance<br />Fund
            </th>
            <th
              class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
            >
              5<br />Re-insurance<br />Fund
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- N: Division of Chargeable Income -->
          <tr>
            <td class="border border-gray-400 p-2 font-medium" rowspan="2">
              N. Division of<br />Chargeable<br />Income<br />Tax rate
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
          </tr>
          <tr>
            <td class="border border-gray-400 bg-gray-100 p-1 text-center">
              8%
            </td>
            <td class="border border-gray-400 bg-gray-100 p-1 text-center">
              24%
            </td>
            <td class="border border-gray-400 bg-gray-100 p-1 text-center">
              24%
            </td>
            <td class="border border-gray-400 bg-gray-100 p-1 text-center">
              24%
            </td>
            <td class="border border-gray-400 bg-gray-100 p-1 text-center">
              <div class="text-xs">
                (For other income<br />Chargeable income<br />from insurance<br />business)<br />8%
                or 24%
              </div>
            </td>
          </tr>
          <tr>
            <td
              class="border border-gray-400 p-1 text-xs text-gray-600"
              colspan="6"
            >
              *) Year 1st to Fund 5
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Section P: Losses carried forward -->
      <table class="mb-6 w-full border-collapse border border-gray-400 text-xs">
        <tbody>
          <tr>
            <td class="w-32 border border-gray-400 p-2 font-medium">
              P. Losses carried<br />forward
            </td>
            <td class="w-40 border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="flex-1 border border-gray-400 p-1"></td>
          </tr>
        </tbody>
      </table>

      <!-- Section Q: Loss carried forward -->
      <table class="mb-6 w-full border-collapse border border-gray-400 text-xs">
        <tbody>
          <tr>
            <td class="w-32 border border-gray-400 p-2 font-medium">
              Q. Loss carried<br />forward
            </td>
            <td class="w-40 border border-gray-400 p-1">
              <input
                type="number"
                readonly
                placeholder="0.00"
                class="w-full border-0 text-right text-xs focus:outline-none"
              />
            </td>
            <td class="flex-1 border border-gray-400 p-1"></td>
          </tr>
        </tbody>
      </table>

      <!-- Section R: ADJUSTMENT OF CAPITAL ALLOWANCE -->
      <div class="mb-6">
        <div class="border border-gray-400 bg-gray-100 p-2 text-sm font-bold">
          R. ADJUSTMENT OF CAPITAL ALLOWANCE
        </div>
        <table class="w-full border-collapse border border-gray-400 text-xs">
          <thead>
            <tr>
              <th
                class="w-32 border border-gray-400 bg-gray-100 p-2 text-left font-medium"
              >
                Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                1<br />Life<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                2<br />Shareholders<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                3<br />Life<br />Re-insurance<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                4<br />General<br />Insurance<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                5<br />Re-insurance<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                TOTAL<br />(2 to 5)
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- R1: Balance brought forward -->
            <tr>
              <td class="border border-gray-400 p-2 font-medium">
                R1. Balance brought<br />forward
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section S: SUMMARY OF NUMBERS OF EMPLOYEES AND ANNUAL OPERATING EXPENDITURE -->
      <div class="mb-6">
        <div class="border border-gray-400 bg-gray-100 p-2 text-sm font-bold">
          S. SUMMARY OF NUMBERS OF EMPLOYEES AND ANNUAL OPERATING EXPENDITURE
        </div>
        <table class="w-full border-collapse border border-gray-400 text-xs">
          <thead>
            <tr>
              <th
                class="w-32 border border-gray-400 bg-gray-100 p-2 text-left font-medium"
              >
                Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                1<br />Life<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                2<br />Shareholders<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                3<br />Life<br />Re-insurance<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                4<br />General<br />Insurance<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                5<br />Re-insurance<br />Fund
              </th>
              <th
                class="w-20 border border-gray-400 bg-gray-100 p-2 text-center font-medium"
              >
                TOTAL<br />(2 to 5)
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- S1: Number of employees -->
            <tr>
              <td class="border border-gray-400 p-2 font-medium">
                S1. Number of<br />employees
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
            </tr>

            <!-- S2: Annual operating expenditure (RM) -->
            <tr>
              <td class="border border-gray-400 p-2 font-medium">
                S2. Annual operating<br />expenditure as per<br />Audited
                Report<br />(RM)
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
            </tr>

            <!-- S3: Annual operating expenditure (%) -->
            <tr>
              <td class="border border-gray-400 p-2 font-medium">
                S3. Annual operating<br />expenditure as per<br />Audited
                Report<br />(%)
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
              <td class="border border-gray-400 p-1">
                <input
                  type="number"
                  readonly
                  placeholder="0.00"
                  class="w-full border-0 text-right text-xs focus:outline-none"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Notes Section -->
      <div class="mb-6 text-xs">
        <div class="mb-2 font-bold">
          Notes: Division of Chargeable Income is computed as follows:
        </div>
        <div class="ml-4">
          <div>Statutory Income ÷ Chargeable Income</div>
          <div>Total Statutory Income</div>
        </div>
      </div>
    </div>

    <!-- Form Footer Page 2 -->
    <div class="text-center text-xs font-medium">HK-PC9 2/2</div>
  </div>
</template>

<script setup lang="ts">
// HK-PC9 Form Template for Insurance Business
</script>

<style scoped>
.form-container {
  max-width: 210mm;
  margin: 0 auto;
  background: white;
  font-family: Arial, sans-serif;
}

.page-break {
  page-break-before: always;
  border-top: 2px dashed #ccc;
  margin: 2rem 0;
  padding-top: 2rem;
}

@media print {
  .page-break {
    border-top: none;
    margin: 0;
    padding-top: 0;
  }
}
</style>
