<template>
  <div class="form-container bg-white p-6 text-sm">
    <!-- Basic Particulars Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        PART: Basic Particulars
      </div>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of company</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reference no. (registration no.)</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Tax Identification No. (TIN)</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Incorporated in Malaysia</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Labuan entity's TIN</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country of residence</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Employer's TIN</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Status of business</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Commencement date of operations (dd/mm/yyyy)</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            >
              DD/MM/YYYY
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Accounting period from (dd/mm/yyyy)</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            >
              DD/MM/YYYY
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Accounting period to (dd/mm/yyyy)</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            >
              DD/MM/YYYY
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Basis period from (dd/mm/yyyy)</label
          >
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            >
              DD/MM/YYYY
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Basis period to (dd/mm/yyyy)</label>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            >
              DD/MM/YYYY
            </div>
          </template>
        </div>
        <div class="flex items-start">
          <label class="w-1/3 font-medium"
            >Company with paid-up ordinary share capital not exceeding RM2.5
            million...</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Company established for the issuance of asset-backed
            securities</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Company limited by guarantee</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Controlled company</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Foreign company without share capital</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Federal/State Statutory Body</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Permanent Establishment in Malaysia</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Substantial change in shareholding and subsection 44(5A)
            applies</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Claim/Surrender loss under the Group Relief provision</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
      </div>
    </div>

    <!-- Particulars of Company Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        PART G: Particulars of Company
      </div>
      <div class="space-y-4">
        <div class="flex items-start">
          <label class="w-1/3 font-medium">Correspondence address</label>
          <div class="flex-1 space-y-2">
            <template v-if="!isPdfExport">
              <input type="text" readonly class="form-input-readonly w-full" />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-full border border-gray-400 bg-white px-3 py-2 text-sm"
              ></div>
            </template>
            <template v-if="!isPdfExport">
              <input type="text" readonly class="form-input-readonly w-full" />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-full border border-gray-400 bg-white px-3 py-2 text-sm"
              ></div>
            </template>
            <template v-if="!isPdfExport">
              <input type="text" readonly class="form-input-readonly w-full" />
            </template>
            <template v-else>
              <div
                class="pdf-text-only w-full border border-gray-400 bg-white px-3 py-2 text-sm"
              ></div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Postcode</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Town</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">State</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Address in G1 is the tax agent's address</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Method of payment for tax refund</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of bank</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Bank account no.</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Bank identification no.</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="bg-gray-100 p-2 text-gray-700">
          Particulars of company directors (Fill in the required appendix)
        </div>
        <div class="bg-gray-100 p-2 text-gray-700">
          Particulars of company's major shareholders (Fill in the required
          appendix)
        </div>
        <div class="bg-gray-100 p-2 text-gray-700">
          Information of company's beneficial owner (Fill in the required
          appendix)
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >The company makes dividend payments to individual shareholders in
            the basis period</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >The company issues dividend certificates/vouchers to individual
            shareholders</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >The number of individual shareholders who received dividends
            exceeding RM100,000</label
          >
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="form-input-readonly"
              placeholder="0"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-right text-sm"
            >
              0
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Foreign equity in comparison with paid-up capital (%)</label
          >
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="form-input-readonly"
              placeholder="0"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-right text-sm"
            >
              0
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Government Linked Company (GLC)</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Company listed on Bursa Malaysia</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Has holding company</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Carry out controlled transactions under section 139 and 140A</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Subject to interest restriction under section 140C</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Has Advance Ruling</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Has Advance Pricing Arrangement</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Compliance with Advance Pricing Arrangement</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Material difference in tax arrangement compared to Advance Pricing
            Arrangement</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="bg-gray-100 p-2 text-gray-700">
          Financial particulars of company (Fill in the required appendix)
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Has subsidiary company(ies) or related entity(ies) in the Federal
            Territory of Labuan</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Made payments to Labuan entity(ies)</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Particulars Section -->
    <div class="mb-6">
      <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
        PART H: Other Particulars
      </div>
      <div class="space-y-4">
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Type of Income (for preceding year)</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Year of Assessment (for preceding year)</label
          >
          <template v-if="!isPdfExport">
            <input type="number" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Amount (for preceding year)</label>
          <template v-if="!isPdfExport">
            <input
              type="number"
              readonly
              class="form-input-readonly"
              placeholder="0.00"
            />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-right text-sm"
            >
              0.00
            </div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Made payments in the basis period which are subject to withholding
            tax...</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Disposal of capital asset under Income Tax Act 1967</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Disposal of capital asset declared to IRBM</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Disposal of asset under the Real Property Gains Tax Act 1976</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Disposal of asset declared to IRBM</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Carry on E-commerce</label>
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">E-Commerce business model</label>
          <div class="flex flex-1 flex-wrap items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" /> Online
                sales/services</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Online sales/services</span>
              </div>
            </template>
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" /> Online
                advertising</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Online advertising</span>
              </div>
            </template>
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" /> Cloud
                computing</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Cloud computing</span>
              </div>
            </template>
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" /> Payment
                services</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Payment services</span>
              </div>
            </template>
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" /> Digital
                currency/digital token</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Digital currency/digital token</span>
              </div>
            </template>
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" />
                e-Hailing/p-Hailing</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>e-Hailing/p-Hailing</span>
              </div>
            </template>
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="checkbox" disabled class="mr-2" /> Other</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Other</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Subject to Income Tax (Country-by-Country Reporting) Rules
            2016</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Subject as a reporting entity/non-reporting entity</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Reporting
                entity</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Non-reporting
                entity</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Reporting entity</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Non-reporting entity</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Has financial account(s) at financial institution(s) outside
            Malaysia</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Company has implemented tax governance framework</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Company participates in IRBM's tax governance program</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Subject to Domestic Top-up Tax or Multinational Top-up Tax under
            Part XI of the Income Tax Act 1967</label
          >
          <div class="flex flex-1 items-center gap-4">
            <template v-if="!isPdfExport">
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> Yes</label
              >
              <label class="flex items-center"
                ><input type="radio" disabled class="mr-2" /> No</label
              >
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>Yes</span>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="pdf-text-only h-4 w-4 border border-gray-400 bg-white"
                ></div>
                <span>No</span>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Name of the Ultimate Parent Entity and its Jurisdiction (Use
            country code)</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" />
          </template>
          <template v-else>
            <div
              class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
            ></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>

<style scoped>
.form-container {
  font-family: Arial, sans-serif;
}

.form-input-readonly {
  @apply flex-1 border border-gray-400 bg-white px-3 py-2 text-sm;
}

/* PDF export helper class */
.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}

/* Ensure borders are visible in PDF export */
@media print {
  .pdf-text-only {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .border-gray-400 {
    border-color: #000 !important;
  }
}
</style>
