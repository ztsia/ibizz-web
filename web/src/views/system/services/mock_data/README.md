# Form Template Engine: A Developer's Guide

This document is the definitive guide to creating and managing dynamic, multi-page forms using the `form_template.json` file. The entire form structure, from page layout to individual field validation and conditional logic, is defined here. The frontend components read this blueprint and render the form accordingly, making this file the single source of truth.

---

## 1. High-Level Structure (`FormTemplate`)

The root of the JSON is an array of `FormTemplate` objects. Each object represents a complete form.

- **`_id` (String, Required):** A unique identifier for the form template (e.g., `"form_c_2025_example"`).
- **`formName` (String, Required):** The human-readable name of the form (e.g., `"Company Return Form C (Example)"`).
- **`yearOfAssessment` (Number, Required):** The tax year this form applies to.
- **`pages` (Array<Page Object>, Required):** An ordered array of **Page Objects**. This array defines the multi-page structure of the form.

---

## 2. Page Object

Each object in the `pages` array represents a single page in the form's progression.

- **`id` (String, Required):** A unique identifier for the page (e.g., `"page_controlled_transactions"`).
- **`title` (String, Required):** The title displayed at the top of the page.
- **`show_if` (Object | null):** Defines the condition for this entire page to be visible. If `null`, the page is always included. (See **Conditional Logic** below).
- **`sections` (Array<Section Object>, Required):** An ordered array of **Section Objects** that will be rendered on this page.

---

## 3. Section Object

Each object in the `sections` array defines a collapsible accordion panel within a page.

- **`part` (String, Required):** A unique ID for the section, used internally (e.g., `"CT_Part_A"`).
- **`title` (String, Required):** The text displayed on the accordion header.
- **`show_if` (Object | null):** If `null`, the section is always shown. If an object, it defines the condition for this section to appear.
- **`fields` (Array<Field Object>, Required):** An ordered array of **Field Objects** that will be rendered inside this section.

---

## 4. Field Object (The Core Component)

This is the most important object, defining a single form input and its behavior.

- **`id` (String, Required):** The unique identifier for the field. **This is critical**, as it directly maps to the key in the `FormSubmission`'s data object.
- **`label` (String, Required):** The human-readable text for the form label.
- **`inputType` (String, Required):** A key that tells the frontend what component to render. See the **Input Types Guide** below for a full list.
- **`required` (Boolean, Optional):** If `true`, the field must have a value for the form to be valid.
- **`isLabelHidden` (Boolean, Optional):** If `true`, the `<label>` element will not be rendered. Useful for layout purposes, like subsequent lines of an address field.
- **`show_if` (Object | null, Optional):** If `null`, the field is always shown (within its parent section/page). If an object, it defines the condition for this field to appear.
- **`options` (Object, Optional):** This object is used to configure complex input types such as `select`, `radio`, `checkbox`, and `fixed_table`. Its structure depends on the `inputType`.
- **`lookupSlug` (String, Optional):** Used with `inputType: "lookup"`. Specifies the slug to fetch data from the backend.
- **`addForm` (String, Optional):** Used with `inputType: "lookup"`. Specifies a form template ID to open in a modal when adding a new item.
- **`readonly` (Boolean, Optional):** If `true`, the field is rendered in a read-only state.
- **`defaultValue` (Any, Optional):** Sets the initial value of the field.
- **`conditionalSign` (Object, Optional):** Used to automatically toggle the sign of a numeric value based on another field's value. _(Currently supported in `fixed_table` columns)_.
  - `watchField` (String): The ID of the field to watch.
  - `negateWhen` (Array<String>): Values of `watchField` that should cause this field's value to be negative.
  - `positiveWhen` (Array<String>): Values of `watchField` that should cause this field's value to be positive.

---

## 5. Input Types Guide (`inputType`)

### Simple Inputs

These render a standard `shadcn/ui` `<Input>` component.

- `"text"`
- `"number"`
- `"email"`
- `"date"`

### Option-Based Inputs

These require an `options` array in the Field Object (or inside `options` property).

- **`"select"`**: Renders a dropdown menu.
- **`"radio"`**: Renders a radio button group.
- **`"checkbox"`**: Renders a group of checkboxes. The saved value in the form submission will be an **array** of the selected `value` strings.

### Specialized Inputs

- **`"readonly_note"`**: Renders a simple, non-editable text block. It does not store any data.
- **`"boolean"`**: Renders a single `Checkbox` with the label positioned to its right. This is ideal for simple "Yes/No" or "On/Off" toggles where the value is stored as a `true` or `false` boolean.
- **`"currency"`**: Renders a numeric input (`InputNumber`) specifically for handling monetary values. It automatically formats the displayed value with thousand separators (e.g., "1,000,000") and handles parsing of the formatted string back to a number.
- **`"countries"` / `"states"`**: These are special-purpose lookup slugs that render a pre-configured `LookupSelect` component for selecting countries or states.
- **`"lookup"`**: Renders a generic, searchable `FormLookupInput` component.
  - **`lookupSlug`**: The slug to fetch data from (e.g., `"labuan-entities"`).
  - **`addForm`**: (Optional) ID of another form template to open in a modal for creating new entries.
- **`"placeholder"`**: A special layout-only field. It renders an empty, invisible, full-width container. Its sole purpose is to act as a spacer to push subsequent fields to the next row in a multi-column layout.

### Complex Input: `fixed_table`

The `"fixed_table"` input type provides a highly flexible and dynamic table structure, allowing for fixed rows, dynamic rows, and powerful cell-level formulas.

**`options` Object for `fixed_table`:**

- **`columns` (Array<Column Definition>, Required):** An array of objects, where each object defines a table column and behaves like a simplified Field Object for the cells within that column.
  - `id` (String, Required): The unique identifier for the column. This is used as the key for data within each row object.
  - `label` (String, Required): The header text for the column.
  - `inputType` (String, Required): The input type for cells in this column (e.g., `"text"`, `"number"`, `"currency"`, `"select"`).
  - **`unique` (Boolean, Optional):** If `true`, ensures that the value selected in this column is unique across all rows in the table. This is particularly useful for "Key" columns in dynamic lists (e.g., ensuring a "Transaction Type" is only selected once).
  - `readonly` (Boolean, Optional): If `true`, cells in this column will be read-only.
  - `defaultValue` (Any, Optional): The default value for new cells created in this column.
  - `options` (Array, Optional): Used for `select` inputs to define the dropdown choices.
    - `disabledFields` (Array<String>, Optional): Used in `select` options. If selected, it disables the specified columns in the same row.

- **`fixedRows` (Array<Row Data Object>, Optional):** An array of data objects, each representing a row that is _permanently_ part of the table. These rows cannot be removed by the user.
- **`allowAddRow` (Boolean, Optional):** If `true`, an "Add Row" button will be displayed, allowing users to append new rows to the table. Defaults to `false`.
- **`initialRows` (Number, Optional):** If no `fixedRows` are defined and no existing data is provided, this specifies how many empty rows should be displayed initially. Defaults to `0`.

**Formulas in `fixed_table`:**

Cells within a `fixed_table` can have their values dynamically calculated using formulas. A formula is defined by placing a special object `{ "formula": "FORMULA_STRING" }` as the cell's value in either `fixedRows` data or a column's `defaultValue`.

- **Intra-row Formulas**: `"{quantity} * {price}"`
- **Columnar Formulas**: `"SUM(ABOVE)"`
- **External Data Formulas**: `"FALLBACK(fieldId1, fieldId2)"`
- **Native Functions**:
  - `SUM(tableData, colId)`: Sums all values in a column.
  - `SUMIF(tableData, checkColId, checkValue, sumColId)`: Sums values where a condition is met.
  - `SUM_POSITIVE(tableData, colId)`: Sums only positive values.
  - `SUM_NEGATIVE(tableData, colId)`: Sums only negative values.

**Example `fixed_table` Field:**

```json
{
  "id": "controlled_transactions",
  "label": "Controlled Transaction List",
  "inputType": "fixed_table",
  "options": {
    "allowAddRow": true,
    "columns": [
      {
        "id": "transaction_type",
        "label": "Transaction Type",
        "inputType": "select",
        "unique": true,
        "options": [
          {
            "value": "sales",
            "label": "Sales",
            "disabledFields": ["purchases"]
          },
          {
            "value": "purchases",
            "label": "Purchases",
            "disabledFields": ["sales"]
          }
        ]
      },
      { "id": "sales", "label": "Sales Amount", "inputType": "currency" },
      {
        "id": "purchases",
        "label": "Purchases Amount",
        "inputType": "currency"
      }
    ]
  }
}
```

---

## 6. Conditional Logic (`show_if`)

The `show_if` object provides powerful conditional rendering for pages, sections, and fields.

### Basic Condition

- **`fieldId` (String):** The `id` of the field to check.
- **`operator` (String):** `"equals"`, `"not_equals"`, `"gt"`, `"gte"`, `"lt"`, `"lte"`.
- **`value` (String | Number):** The value to check against.

> **Example:** `{ "fieldId": "labuan_payment", "operator": "equals", "value": "yes" }`

### Complex (Nested) Condition

- **`operator` (String):** `"or"` or `"and"`.
- **`conditions` (Array<Object>):** An array where each object is a **Basic Condition** object.

---

## 7. Form Submission Data

The `form_submission.json` file stores the actual user-entered data. Its structure is a simple key-value map where the keys **must exactly match** the `id` attributes of the fields defined in the `form_template.json`.

---

## 8. System Architecture & Integration

The form system is built on a centralized architecture that separates data (templates) from logic (services) and presentation (components).

### Core Services

1.  **`generic_form_service.ts`**: The primary entry point for form operations.
    - **Purpose**: Manages form templates and submissions.
    - **Key Functions**: `getFormContext(formId)`, `saveFormSubmission(data)`.
    - **Integration**: Connects to the backend API to fetch JSON templates and persist user data.

2.  **`formLookupManager.service.ts`**: Handles isolated lookup data.
    - **Purpose**: Manages form-specific lookup tables (e.g., "Claims List", "Provisions").
    - **Key Functions**: `listItems(slug)`, `createItem(slug, data)`.
    - **Integration**: Connects to a dedicated lookup API to ensure form data is isolated from system-wide lookups.

### Component Usage

The **`GenericFormModal`** is the universal container for all forms.

```vue
<template>
  <GenericFormModal ref="modalRef" />
</template>

<script setup>
import { ref } from 'vue';
import { GenericFormModal } from '@/views/system/form_c/components';

const modalRef = ref(null);

// Open any form by its ID
function openForm() {
  modalRef.value?.open('form_c_2025');
}
</script>
```

### Registering a New Form

1.  **Define Template**: Add a new `FormTemplate` object to `generic_form_template.json`.
2.  **Define ID**: Ensure the `id` (e.g., `"my_new_form"`) is unique.
3.  **Open**: Call `GenericFormModal.open('my_new_form')`.

No new Vue files are needed for standard forms! The system automatically renders pages, sections, and fields based on your JSON definition.
