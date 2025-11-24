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
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Company Name" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reference no. (Registration no.)</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Registration No." />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">TIN</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="TIN" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">CbCR e-mail</label>
          <template v-if="!isPdfExport">
            <input type="email" readonly class="form-input-readonly" placeholder="email@example.com" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of MNE Group</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="MNE Group Name" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Accounting period from</label>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Accounting period to</label>
          <template v-if="!isPdfExport">
            <input
              type="text"
              readonly
              class="form-input-readonly"
              placeholder="DD/MM/YYYY"
            />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Number of constituent entities in Malaysia</label
          >
          <template v-if="!isPdfExport">
            <input type="number" readonly class="form-input-readonly" placeholder="0" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Number of constituent entities outside Malaysia</label
          >
          <template v-if="!isPdfExport">
            <input type="number" readonly class="form-input-readonly" placeholder="0" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Status of reporting entity</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Status" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
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
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Ultimate Holding Entity Name" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country of residence</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Country" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
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
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Company Name" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reference no. (Registration no.)</label
          >
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Registration No." />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">TIN</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="TIN" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">E-mail</label>
          <template v-if="!isPdfExport">
            <input type="email" readonly class="form-input-readonly" placeholder="email@example.com" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
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
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Reporting Entity Name" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country of residence</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Country" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">TIN</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="TIN" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Accounting period of reporting entity from</label
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
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Accounting period of reporting entity to</label
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
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm">DD/MM/YYYY</div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of MNE Group</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="MNE Group Name" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Status of reporting entity</label>
          <template v-if="!isPdfExport">
            <input type="text" readonly class="form-input-readonly" placeholder="Status" />
          </template>
          <template v-else>
            <div class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// This component is a read-only visual template.
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

