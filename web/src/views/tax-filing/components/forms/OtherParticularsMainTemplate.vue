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
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Reference no. (registration no.)</label
          >
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Tax Identification No. (TIN)</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Incorporated in Malaysia</label>
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
          <label class="w-1/3 font-medium">Labuan entity's TIN</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country of residence</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Employer's TIN</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Status of business</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Commencement date of operations (dd/mm/yyyy)</label
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
            >Accounting period from (dd/mm/yyyy)</label
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
            >Accounting period to (dd/mm/yyyy)</label
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
            >Basis period from (dd/mm/yyyy)</label
          >
          <input
            type="text"
            readonly
            class="form-input-readonly"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Basis period to (dd/mm/yyyy)</label>
          <input
            type="text"
            readonly
            class="form-input-readonly"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div class="flex items-start">
          <label class="w-1/3 font-medium"
            >Company with paid-up ordinary share capital not exceeding RM2.5
            million...</label
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
          <label class="w-1/3 font-medium"
            >Company established for the issuance of asset-backed
            securities</label
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
          <label class="w-1/3 font-medium">Company limited by guarantee</label>
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
          <label class="w-1/3 font-medium">Controlled company</label>
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
          <label class="w-1/3 font-medium"
            >Foreign company without share capital</label
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
          <label class="w-1/3 font-medium">Federal/State Statutory Body</label>
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
          <label class="w-1/3 font-medium"
            >Permanent Establishment in Malaysia</label
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
          <label class="w-1/3 font-medium"
            >Substantial change in shareholding and subsection 44(5A)
            applies</label
          >
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Claim/Surrender loss under the Group Relief provision</label
          >
          <input type="text" readonly class="form-input-readonly" />
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
            <input type="text" readonly class="form-input-readonly w-full" />
            <input type="text" readonly class="form-input-readonly w-full" />
            <input type="text" readonly class="form-input-readonly w-full" />
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Postcode</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Town</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">State</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Country</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Address in G1 is the tax agent's address</label
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
          <label class="w-1/3 font-medium"
            >Method of payment for tax refund</label
          >
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Name of bank</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Bank account no.</label>
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Bank identification no.</label>
          <input type="text" readonly class="form-input-readonly" />
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
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> Yes</label
            >
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> No</label
            >
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >The company issues dividend certificates/vouchers to individual
            shareholders</label
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
          <label class="w-1/3 font-medium"
            >The number of individual shareholders who received dividends
            exceeding RM100,000</label
          >
          <input
            type="number"
            readonly
            class="form-input-readonly"
            placeholder="0"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Foreign equity in comparison with paid-up capital (%)</label
          >
          <input
            type="number"
            readonly
            class="form-input-readonly"
            placeholder="0"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Government Linked Company (GLC)</label
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
          <label class="w-1/3 font-medium"
            >Company listed on Bursa Malaysia</label
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
          <label class="w-1/3 font-medium">Has holding company</label>
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
          <label class="w-1/3 font-medium"
            >Carry out controlled transactions under section 139 and 140A</label
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
          <label class="w-1/3 font-medium"
            >Subject to interest restriction under section 140C</label
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
          <label class="w-1/3 font-medium">Has Advance Ruling</label>
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
          <label class="w-1/3 font-medium"
            >Has Advance Pricing Arrangement</label
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
          <label class="w-1/3 font-medium"
            >Compliance with Advance Pricing Arrangement</label
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
          <label class="w-1/3 font-medium"
            >Material difference in tax arrangement compared to Advance Pricing
            Arrangement</label
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
        <div class="bg-gray-100 p-2 text-gray-700">
          Financial particulars of company (Fill in the required appendix)
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Has subsidiary company(ies) or related entity(ies) in the Federal
            Territory of Labuan</label
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
          <label class="w-1/3 font-medium"
            >Made payments to Labuan entity(ies)</label
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
          <input type="text" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Year of Assessment (for preceding year)</label
          >
          <input type="number" readonly class="form-input-readonly" />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium">Amount (for preceding year)</label>
          <input
            type="number"
            readonly
            class="form-input-readonly"
            placeholder="0.00"
          />
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Made payments in the basis period which are subject to withholding
            tax...</label
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
          <label class="w-1/3 font-medium"
            >Disposal of capital asset under Income Tax Act 1967</label
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
          <label class="w-1/3 font-medium"
            >Disposal of capital asset declared to IRBM</label
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
          <label class="w-1/3 font-medium"
            >Disposal of asset under the Real Property Gains Tax Act 1976</label
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
          <label class="w-1/3 font-medium"
            >Disposal of asset declared to IRBM</label
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
          <label class="w-1/3 font-medium">Carry on E-commerce</label>
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
          <label class="w-1/3 font-medium">E-Commerce business model</label>
          <div class="flex flex-1 flex-wrap items-center gap-4">
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" /> Online
              sales/services</label
            >
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" /> Online
              advertising</label
            >
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" /> Cloud
              computing</label
            >
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" /> Payment
              services</label
            >
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" /> Digital
              currency/digital token</label
            >
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" />
              e-Hailing/p-Hailing</label
            >
            <label class="flex items-center"
              ><input type="checkbox" disabled class="mr-2" /> Other</label
            >
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Subject to Income Tax (Country-by-Country Reporting) Rules
            2016</label
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
          <label class="w-1/3 font-medium"
            >Subject as a reporting entity/non-reporting entity</label
          >
          <div class="flex flex-1 items-center gap-4">
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> Reporting
              entity</label
            >
            <label class="flex items-center"
              ><input type="radio" disabled class="mr-2" /> Non-reporting
              entity</label
            >
          </div>
        </div>
        <div class="flex items-center">
          <label class="w-1/3 font-medium"
            >Has financial account(s) at financial institution(s) outside
            Malaysia</label
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
          <label class="w-1/3 font-medium"
            >Company has implemented tax governance framework</label
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
          <label class="w-1/3 font-medium"
            >Company participates in IRBM's tax governance program</label
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
          <label class="w-1/3 font-medium"
            >Subject to Domestic Top-up Tax or Multinational Top-up Tax under
            Part XI of the Income Tax Act 1967</label
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
          <label class="w-1/3 font-medium"
            >Name of the Ultimate Parent Entity and its Jurisdiction (Use
            country code)</label
          >
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
