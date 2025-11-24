# PDF Export Guide for Form Templates

## Quick Reference

To make form fields visible in exported PDFs, wrap each `<input>` with conditional rendering that switches between interactive inputs and printable divs.

## Step-by-Step Implementation

### 1. Add PDF Export Context (Script Section)

```vue
<script lang="ts" setup>
import { usePdfExportContext } from '#/composables/usePdfExportContext';

const { isPdfExport } = usePdfExportContext();
</script>
```

### 2. Wrap Each Input Field (Template Section)

**Before (not visible in PDF):**

```vue
<input
  type="text"
  readonly
  placeholder="Enter value"
  class="your-input-class"
/>
```

**After (visible in PDF with borders):**

```vue
<template v-if="!isPdfExport">
  <input
    type="text"
    readonly
    placeholder="Enter value"
    class="your-input-class"
  />
</template>
<template v-else>
  <div
    class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
  >
    Enter value
  </div>
</template>
```

### 3. Field Type Examples

#### Text Input (Left-aligned)

```vue
<template v-if="!isPdfExport">
  <input type="text" readonly class="form-input" />
</template>
<template v-else>
  <div
    class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-left text-sm"
  ></div>
</template>
```

#### Number Input (Right-aligned)

```vue
<template v-if="!isPdfExport">
  <input type="number" readonly placeholder="0.00" class="form-input" />
</template>
<template v-else>
  <div
    class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-right text-sm"
  >
    0.00
  </div>
</template>
```

#### Date Input

```vue
<template v-if="!isPdfExport">
  <input type="text" readonly placeholder="DD/MM/YYYY" class="form-input" />
</template>
<template v-else>
  <div
    class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
  >
    DD/MM/YYYY
  </div>
</template>
```

#### Small/Centered Input (e.g., in table cells)

```vue
<template v-if="!isPdfExport">
  <input type="text" readonly class="small-input" />
</template>
<template v-else>
  <div
    class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm"
  ></div>
</template>
```

#### Input with Specific Width

```vue
<template v-if="!isPdfExport">
  <input type="text" readonly class="w-32 border border-gray-400 px-2" />
</template>
<template v-else>
  <div
    class="pdf-text-only w-32 border border-gray-400 bg-white px-2 text-sm"
  ></div>
</template>
```

### 4. Add CSS Support (Style Section)

Add this to your component's `<style scoped>` section:

```vue
<style scoped>
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
```

## Important Rules

### ✅ DO:

- Use `pdf-text-only` class on all PDF divs (required for export tool recognition)
- Use **inline Tailwind classes** for borders: `border border-gray-400`
- Use `bg-white` to ensure white background
- Include placeholder text/values in PDF divs (e.g., "0.00", "DD/MM/YYYY")
- Match text alignment: `text-left`, `text-center`, `text-right`
- Use `flex-1` for full-width fields or specific width classes like `w-32`

### ❌ DON'T:

- Don't use custom CSS classes for borders (won't render in PDF)
- Don't leave PDF divs empty (include placeholder/default content)
- Don't use `@apply` in scoped styles (use inline Tailwind classes instead)
- Don't nest template blocks
- Don't forget the `v-else` template

## Complete Example

```vue
<template>
  <div class="form-container bg-white p-6 text-sm">
    <!-- Section Header -->
    <div class="mb-4 bg-gray-600 px-4 py-2 font-bold text-white">
      Form Section Title
    </div>

    <!-- Text Field -->
    <div class="flex items-center">
      <label class="w-1/3 font-medium">Company Name</label>
      <template v-if="!isPdfExport">
        <input
          type="text"
          readonly
          class="flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
        />
      </template>
      <template v-else>
        <div
          class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-sm"
        ></div>
      </template>
    </div>

    <!-- Number Field -->
    <div class="flex items-center">
      <label class="w-1/3 font-medium">Amount</label>
      <template v-if="!isPdfExport">
        <input
          type="number"
          readonly
          placeholder="0.00"
          class="flex-1 border border-gray-400 bg-white px-3 py-2 text-right text-sm"
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

    <!-- Date Range -->
    <div class="flex items-center">
      <label class="w-1/3 font-medium">Period</label>
      <div class="flex flex-1 items-center gap-2">
        <template v-if="!isPdfExport">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm"
          />
        </template>
        <template v-else>
          <div
            class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm"
          >
            DD/MM/YYYY
          </div>
        </template>
        <span class="font-medium">To</span>
        <template v-if="!isPdfExport">
          <input
            type="text"
            readonly
            placeholder="DD/MM/YYYY"
            class="flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm"
          />
        </template>
        <template v-else>
          <div
            class="pdf-text-only flex-1 border border-gray-400 bg-white px-3 py-2 text-center text-sm"
          >
            DD/MM/YYYY
          </div>
        </template>
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

.pdf-text-only {
  display: inline-block;
  line-height: 1.4;
  color: #000;
}

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
```

## Troubleshooting

### Fields Not Visible in PDF

1. **Check `isPdfExport` is imported** - Verify script has `usePdfExportContext`
2. **Check class name** - Must use `pdf-text-only` (not `pdf-text-standard` or custom names)
3. **Check inline classes** - Borders must be inline Tailwind classes, not CSS
4. **Check for nested templates** - Each input should have ONE `v-if` and ONE `v-else`

### Borders Not Showing

1. **Use inline classes** - `border border-gray-400` in the div markup
2. **Add print CSS** - Include `@media print` rules for `.border-gray-400`
3. **Check scoped styles** - PDF classes should be in scoped style section

### Content Cut Off

1. **Add page break control** - Use `page-break-inside: avoid` on container
2. **Reduce content height** - Split long forms into multiple pages
3. **Adjust PDF margins** - Check `usePdfExport.ts` margin settings

## Testing

After implementing:

1. Open form in worksheet preview
2. Click PDF export button
3. Verify all fields show with visible borders
4. Check text alignment matches form layout
5. Verify placeholder text appears in empty fields

## Reference Files

Working examples:

- `web/src/views/tax-filing/components/forms/CbcrTemplate.vue`
- `web/src/views/tax-filing/components/forms/CP204FormTemplate.vue`
- `Reference/HKPC1FormTemplate.vue`
- `Reference/RKTFormTemplate.vue`
