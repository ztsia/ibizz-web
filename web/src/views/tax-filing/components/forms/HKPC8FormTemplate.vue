<template>
  <div class="hk-pc8-form-template bg-white p-6 text-sm">
    <!-- Form Header -->
    <div class="mb-6">
      <div class="bg-gray-600 px-4 py-2 text-center text-white">
        <span class="font-bold">
          HK-PC8: COMPUTATION OF STATUTORY INCOME FOR SEA AND AIR TRANSPORT
          BUSINESS CARRIED ON BY A NON-RESIDENT OPERATOR
        </span>
      </div>
    </div>

    <!-- Basic Information Section -->
    <div class="mb-6 space-y-4">
      <!-- Name Field -->
      <div class="flex items-center">
        <label class="w-16 font-medium">Name</label>
        <div class="ml-4 flex-1">
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="w-full border border-gray-400 px-2 py-1 text-sm focus:outline-none"
              placeholder="Enter company name"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-full border border-gray-400 px-2 py-1 text-sm"
            >
              Enter company name
            </div>
          </template>
        </div>
      </div>

      <!-- TIN and Registration No -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="w-16 font-medium">TIN</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="12"
                class="w-32 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="000000000000"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-center text-sm"
              >
                000000000000
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Registration No.</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="15"
                class="w-40 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="000000000000000"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-center text-sm"
              >
                000000000000000
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Business and Year of Assessment -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="font-medium">Business</label>
          <div class="ml-4 flex space-x-2">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center">
              <template v-if="!isPdfExport">
                <input
                  type="checkbox"
                  disabled
                  class="h-4 w-4 border border-gray-400"
                />
              </template>
              <template v-else>
                <div class="pdf-text-only h-4 w-4 border border-gray-400"></div>
              </template>
              <span class="mt-1 text-xs">{{ i }}</span>
            </div>
          </div>
          <div class="ml-4">
            <div class="text-xs text-red-600">
              ▲ Enter 'X' in the relevant box
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Year of Assessment</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="4"
                class="w-16 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="2024"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-16 border border-gray-400 px-2 py-1 text-center text-sm"
              >
                2024
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Type of Business Activity and Business Code -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <label class="font-medium">Type of<br />Business Activity</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                class="h-8 w-80 border border-gray-400 px-2 py-1 text-sm focus:outline-none"
                placeholder="Enter business activity"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only h-8 w-80 border border-gray-400 px-2 py-1 text-sm"
              >
                Enter business activity
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="font-medium">Business Code</label>
          <div class="ml-4">
            <template v-if="!isPdfExport">
              <input
                type="text"
                readonly
                maxlength="5"
                class="w-20 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
                placeholder="00000"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-20 border border-gray-400 px-2 py-1 text-center text-sm"
              >
                00000
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Page 1: Section 1 -->
    <div class="mb-8">
      <div class="mb-4 bg-gray-500 p-2 font-semibold text-white">
        1. COMPUTATION OF STATUTORY INCOME UNDER SUBSECTION 54(4)
      </div>

      <!-- Section 1A -->
      <div class="mb-6">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center">
            <span class="mr-4 font-bold">1A.</span>
            <span>(i) Gross income in foreign currency</span>
          </div>
          <div class="flex space-x-4">
            <div class="flex flex-col items-center">
              <template v-if="!isPdfExport">
                <input
                  type="text"
                  readonly
                  class="w-32 border border-gray-400 px-2 py-1 text-center text-sm focus:outline-none"
                  placeholder="Type of foreign currency"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-center text-sm"
                >
                  Type of foreign currency
                </div>
              </template>
              <span class="mt-1 text-xs text-gray-600"
                >(type of foreign currency)</span
              >
            </div>
            <div class="flex flex-col items-center">
              <template v-if="!isPdfExport">
                <input
                  type="number"
                  readonly
                  class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
                >
                  0.00
                </div>
              </template>
              <span class="mt-1 text-xs text-gray-600">(amount of income)</span>
            </div>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <div class="ml-8">
            <span>(ii) Rate of conversion to Ringgit Malaysia</span>
            <div class="text-xs text-gray-600">
              (refer to Appendix C, if necessary)
            </div>
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.0000"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.0000
              </div>
            </template>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <div class="ml-8">
            <span
              >(iii) Rate of conversion to Ringgit Malaysia [1A(i) x
              1A(ii)]</span
            >
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Section 1B -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-4 font-bold">1B.</span>
          <span>Statutory Income</span>
          <div class="ml-2 text-xs text-gray-600">
            [5% of Gross Income derived from Malaysia in RM]
          </div>
        </div>
        <div>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
      </div>

      <div class="mb-2">
        <span class="font-medium">LESS:</span>
      </div>

      <!-- Section 1C -->
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center">
          <span class="mr-4 font-bold">1C.</span>
          <span>Income exempted under Avoidance</span><br />
          <span class="ml-8">of Double Taxation Agreement</span>
          <div class="ml-2 text-xs text-gray-600">(if relevant)</div>
        </div>
        <div>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
      </div>

      <!-- Section 1D -->
      <div
        class="mb-4 flex items-center justify-between border-t border-gray-400 pt-4"
      >
        <div class="flex items-center">
          <span class="mr-4 font-bold">1D.</span>
          <span class="font-medium">TAXABLE STATUTORY INCOME (1B - 1C)</span>
        </div>
        <div>
          <input
            type="number"
            readonly
            class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <!-- Page Break -->
    <div class="my-8 border-t-2 border-dashed border-gray-400"></div>
    <div class="mb-4 text-center font-bold">HK-PC8 1/3</div>
    <div class="my-8 border-t-2 border-dashed border-gray-400"></div>

    <!-- Page 2: Section 2 -->
    <div class="mb-8">
      <div class="mb-4 bg-gray-500 p-2 font-semibold text-white">
        2. COMPUTATION OF STATUTORY INCOME UNDER SUBSECTION 54(4)
      </div>
      <div class="mb-4 text-sm text-gray-700">
        (Acceptable Certificate can be obtained from the tax authority of the
        country in which the operator is resident)
      </div>

      <!-- Certificate Information -->
      <div class="mb-6 space-y-3">
        <div class="flex items-center justify-between">
          <span>Country of residence of operator</span>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="w-48 border border-gray-400 px-2 py-1 text-sm focus:outline-none"
              placeholder="Enter country"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-48 border border-gray-400 px-2 py-1 text-sm"
            >
              Enter country
            </div>
          </template>
        </div>
        <div class="text-xs text-gray-600">
          (use the Country Code in Appendix E)
        </div>

        <div class="flex items-center justify-between">
          <span>Date of certificate</span>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-sm focus:outline-none"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-sm"
            >
              DD/MM/YYYY
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between">
          <span>Type of foreign currency</span>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-sm focus:outline-none"
              placeholder="Currency"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-sm"
            >
              Currency
            </div>
          </template>
        </div>

        <div class="flex items-center justify-between">
          <span>Rate of conversion to Ringgit Malaysia</span>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.0000"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
            >
              0.0000
            </div>
          </template>
        </div>
        <div class="text-xs text-gray-600">
          (refer to Appendix C, if necessary)
        </div>
      </div>

      <!-- Information from Ratio Certificate -->
      <div class="mb-6">
        <div class="mb-3 font-semibold">INFORMATION FROM RATIO CERTIFICATE</div>

        <div class="mb-4 flex items-center justify-between">
          <span class="font-bold">2A.</span>
          <span>Income from wherever derived</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <span class="font-bold">2B.</span>
          <div class="flex items-center">
            <span>Adjusted Income/Adjusted Loss</span>
            <template v-if="!isPdfExport">
              <input
                type="checkbox"
                disabled
                class="ml-4 h-4 w-4 border border-gray-400"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only ml-4 h-4 w-4 border border-gray-400"
              ></div>
            </template>
            <span class="ml-2 text-xs">Enter 'X' if value is negative</span>
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <span class="font-bold">2C.</span>
          <span
            >Depreciation allowance allowed by the above country's tax
            authority</span
          >
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Computation of World Income -->
      <div class="mb-6">
        <div class="mb-3 bg-gray-200 p-2 font-semibold">
          COMPUTATION OF WORLD INCOME
        </div>

        <div class="mb-4 flex items-center justify-between">
          <span>Adjusted Income</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
        <div class="text-xs text-gray-600">(amount from 2B)</div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <span>Depreciation allowance</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
        <div class="text-xs text-gray-600">(amount from 2C)</div>

        <div
          class="mb-4 flex items-center justify-between border-t border-gray-400 pt-2"
        >
          <span class="font-medium">TOTAL</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="mb-4 flex items-center justify-between">
          <span>Refund/Business returns</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div
          class="mb-4 flex items-center justify-between border-t border-gray-400 pt-2"
        >
          <span class="font-bold">2D.</span>
          <span class="font-medium">World Income</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Additional Sections -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="font-bold">2E.</span>
          <span>Income derived from Malaysia</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
        <div class="text-xs text-gray-600">
          (before deducting reimbursement items)
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold">2F.</span>
          <span>Gross Income from wherever derived</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
        <div class="text-xs text-gray-600">(amount from 2A)</div>

        <div class="flex items-center justify-between">
          <span class="font-bold">2G.</span>
          <div class="flex items-center">
            <span>(i) Statutory Income</span>
            <div class="mx-2 flex items-center space-x-1">
              <span>(2D</span>
              <span>×</span>
              <div class="flex flex-col items-center">
                <span class="text-xs">2E</span>
                <hr class="w-6 border-black" />
                <span class="text-xs">2F</span>
              </div>
              <span>)</span>
            </div>
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="ml-8">
            <span>(ii) Rate of conversion to Ringgit Malaysia</span>
            <div class="text-xs text-gray-600">
              (refer to Appendix C, if necessary)
            </div>
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.0000"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.0000
              </div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold">2H.</span>
          <span>Statutory Income in Ringgit Malaysia [2G(i) x 2G(ii)]</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold">2I.</span>
          <span>Income under Avoidance of Double Taxation Agreement</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold">2K.</span>
          <span>Statutory Income (2H - 2I)</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="mb-2">
          <span class="font-medium">LESS:</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold">2L.</span>
          <span>Losses brought forward</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-400 pt-4"
        >
          <span class="font-bold">2M.</span>
          <span class="font-medium">Taxable Statutory Income (2K - 2L)</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Break -->
    <div class="my-8 border-t-2 border-dashed border-gray-400"></div>
    <div class="mb-4 text-center font-bold">HK-PC8 2/3</div>
    <div class="my-8 border-t-2 border-dashed border-gray-400"></div>

    <!-- Page 3: Sections 3 & 4 -->
    <div class="mb-8">
      <!-- Section 3 -->
      <div class="mb-6">
        <div class="mb-4 bg-gray-500 p-2 font-semibold text-white">
          3. COMPUTATION OF ADJUSTED LOSSES I (COMPUTED ADJUSTED LOSS IN COUNTRY
          OF RESIDENT)
        </div>

        <div class="mb-4 bg-gray-200 p-2 font-semibold">
          COMPUTATION OF WORLD LOSS
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>Adjusted Loss</span>
            <div>
              <template v-if="!isPdfExport">
                <input
                  type="number"
                  readonly
                  class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
                >
                  0.00
                </div>
              </template>
            </div>
          </div>
          <div class="text-xs text-gray-600">(amount from 2B)</div>

          <div class="mb-2">
            <span class="font-medium">ADD:</span>
          </div>

          <div class="flex items-center justify-between">
            <span>Depreciation allowance</span>
            <div>
              <template v-if="!isPdfExport">
                <input
                  type="number"
                  readonly
                  class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
                >
                  0.00
                </div>
              </template>
            </div>
          </div>
          <div class="text-xs text-gray-600">(amount from 2C)</div>

          <div
            class="flex items-center justify-between border-t border-gray-400 pt-2"
          >
            <span class="font-bold">3D.</span>
            <span class="font-medium">World Loss</span>
            <div>
              <template v-if="!isPdfExport">
                <input
                  type="number"
                  readonly
                  class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                  placeholder="0.00"
                />
              </template>
              <template v-else>
                <div
                  class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
                >
                  0.00
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="font-bold">3E.</span>
          <span>Income derived from Malaysia</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="font-bold">3F.</span>
          <span>Gross Income from wherever derived</span>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
        <div class="text-xs text-gray-600">(amount from 2A)</div>

        <div class="flex items-center justify-between">
          <span class="font-bold">3G.</span>
          <div class="flex items-center">
            <span>(i) Adjusted Loss</span>
            <div class="mx-2 flex items-center space-x-1">
              <span>(3D</span>
              <span>×</span>
              <div class="flex flex-col items-center">
                <span class="text-xs">3E</span>
                <hr class="w-6 border-black" />
                <span class="text-xs">3F</span>
              </div>
              <span>)</span>
            </div>
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="ml-8">
            <span>(ii) Rate of conversion to Ringgit Malaysia</span>
            <div class="text-xs text-gray-600">
              (refer to Appendix C, if necessary)
            </div>
          </div>
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.0000"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-32 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.0000
              </div>
            </template>
          </div>
        </div>

        <div
          class="flex items-center justify-between border-t border-gray-400 pt-4"
        >
          <span class="font-bold">3H.</span>
          <span class="font-medium"
            >Adjusted Loss in Ringgit Malaysia [3G(i) x 3G(ii)]</span
          >
          <div>
            <template v-if="!isPdfExport">
              <input
                type="number"
                readonly
                class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
                placeholder="0.00"
              />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-40 border border-gray-400 px-2 py-1 text-right text-sm"
              >
                0.00
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Section 4 -->
      <div class="mt-8">
        <div class="mb-4 bg-gray-500 p-2 font-semibold text-white">
          4. COMPUTATION OF ADJUSTED LOSSES II (DEPRECIATION ALLOWANCE EXCEEDING
          ADJUSTED INCOME IN COUNTRY OF RESIDENT)
        </div>

        <div class="mb-4 bg-gray-200 p-2 font-semibold">
          COMPUTATION OF WORLD LOSS
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>Depreciation allowance</span>
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div class="text-xs text-gray-600">(amount from 2C)</div>

          <div class="mb-2">
            <span class="font-medium">ADD:</span>
          </div>

          <div class="flex items-center justify-between">
            <span>Adjusted Loss</span>
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div class="text-xs text-gray-600">(amount from 2B)</div>

          <div
            class="flex items-center justify-between border-t border-gray-400 pt-2"
          >
            <span class="font-bold">4D.</span>
            <span class="font-medium">World Loss</span>
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-bold">4E.</span>
            <span>Income derived from Malaysia</span>
            <input
              type="number"
              readonly
              class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="font-bold">4F.</span>
            <span>Gross Income from wherever derived</span>
            <input
              type="number"
              readonly
              class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
          <div class="text-xs text-gray-600">(amount from 2A)</div>

          <div class="flex items-center justify-between">
            <span class="font-bold">4G.</span>
            <div class="flex items-center">
              <span>(i) Adjusted Loss</span>
              <div class="mx-2 flex items-center space-x-1">
                <span>(4D</span>
                <span>×</span>
                <div class="flex flex-col items-center">
                  <span class="text-xs">4E</span>
                  <hr class="w-6 border-black" />
                  <span class="text-xs">4F</span>
                </div>
                <span>)</span>
              </div>
            </div>
            <input
              type="number"
              readonly
              class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="ml-8">
              <span>(ii) Rate of conversion to Ringgit Malaysia</span>
              <div class="text-xs text-gray-600">
                (refer to Appendix C, if necessary)
              </div>
            </div>
            <input
              type="number"
              readonly
              class="w-32 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.0000"
            />
          </div>

          <div
            class="flex items-center justify-between border-t border-gray-400 pt-4"
          >
            <span class="font-bold">4H.</span>
            <span class="font-medium"
              >Adjusted Loss in Ringgit Malaysia [4G(i) x 4G(ii)]</span
            >
            <input
              type="number"
              readonly
              class="w-40 border border-gray-400 px-2 py-1 text-right text-sm focus:outline-none"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Form Footer -->
    <div class="mt-8 text-center">
      <span class="font-bold">HK-PC8 3/3</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
// HK-PC8 Form Template - Computation of Statutory Income for Sea and Air Transport Business
// Carried on by a Non-Resident Operator
// This is a comprehensive 3-page form with complex calculations and currency conversions
import { usePdfExportContext } from '../../../../composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
/* Print-friendly styles */
@media print {
  .hk-pc8-form-template {
    font-size: 12px;
    color: black;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .hk-pc8-form-template {
    padding: 1rem;
    font-size: 10px;
  }
}

.hk-pc8-form-template {
  /* Ensure consistent spacing and typography */
  line-height: 1.4;
}
</style>
