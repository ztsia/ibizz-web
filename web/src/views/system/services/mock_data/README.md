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
- **`options` (Object, Optional):** This object is used to configure complex input types such as `select`, `radio`, `checkbox`, `itemList`, and `fixed_table`. Its structure depends on the `inputType`.
- **`itemStructure` (Object, Optional):** **Required only for `inputType: "itemList"`**. Defines the columns and behavior of the list.
- **`allowRepeating` (Boolean, Optional):** **Used only with `inputType: "itemList"`**. If `true`, the same option from the `key` dropdown can be selected in multiple rows. If `false` or omitted, each key can only be used once.

---

## 5. Input Types Guide (`inputType`)

### Simple Inputs

These render a standard `shadcn/ui` `<Input>` component.

- `"text"`
- `"number"`
- `"email"`
- `"date"`

### Option-Based Inputs

These require an `options` array in the Field Object.

- **`"select"`**: Renders a dropdown menu.
- **`"radio"`**: Renders a radio button group.
- **`"checkbox"`**: Renders a group of checkboxes. The saved value in the form submission will be an **array** of the selected `value` strings.

### Specialized Inputs

- **`"readonly_note"`**: Renders a simple, non-editable text block. It does not store any data.
- **`"boolean"`**: Renders a single `Checkbox` with the label positioned to its right. This is ideal for simple "Yes/No" or "On/Off" toggles where the value is stored as a `true` or `false` boolean.
- **`"currency"`**: Renders a numeric input (`InputNumber`) specifically for handling monetary values. It automatically formats the displayed value with thousand separators (e.g., "1,000,000") and handles parsing of the formatted string back to a number.
- **`"countries"` / `"states"`**: These are special-purpose lookup slugs that render a pre-configured `LookupSelect` component for selecting countries or states.
- **`"lookup"`**: Renders a generic, searchable `FormLookupInput` component. The `label` of the field is used as the `slug` to fetch the correct lookup data from the backend (e.g., a `label` of `"labuan-entities"` will fetch data for that lookup).
- **`"placeholder"`**: A special layout-only field. It renders an empty, invisible, full-width container. Its sole purpose is to act as a spacer to push subsequent fields to the next row in a multi-column layout, allowing for more complex form arrangements. It does not store any data and is not visible to the user.

### Complex Input: `itemList`

The `"itemList"` input type is for creating a table-like structure where users can add multiple rows of related data. It is defined by the `itemStructure` object.

**`itemStructure` Object:**

- **`key` (Object, Required):** Defines the first column of the list, which is always a dropdown selector.
  - `id` (String): The property name for the selected key in the row's data object (e.g., `"payment_type"`).
  - `label` (String): The column header for the key dropdown.
  - `options` (Array, Required): An array of dropdown options.
    - `value` (String): The value stored in the data for this option.
    - `label` (String): The text displayed in the dropdown.
    - `disabledFields` (Array<String>, Optional): A powerful feature to disable specific `value` columns in that row based on the key selected. The strings in the array must match the `id` of the `value` fields to be disabled.

- **`values` (Array<Field Object>, Required):** Defines the subsequent columns in the row. Each object in this array is a simplified Field Object.
  - `id` (String): The property name for this column's data within the row object.
  - `label` (String): The column header.
  - `inputType` (String): The input type for this column's cells (e.g., `"text"`, `"number"`).
  - `required` (Boolean): If `true`, this cell must have a value if a `key` has been selected for the row.

**Example `itemList` Field:**

```json
{
  "id": "labuan_payments",
  "label": "Payment to Labuan List",
  "inputType": "itemList",
  "allowRepeating": true,
  "itemStructure": {
    "key": {
      "id": "payment_type",
      "label": "Type of Payment",
      "options": [
        { "value": "interest", "label": "Interest payment" },
        { "value": "lease", "label": "Lease rental" }
      ]
    },
    "values": [
      {
        "id": "total",
        "label": "Total of Payment (RM)",
        "inputType": "number",
        "required": true
      },
      {
        "id": "allowed",
        "label": "Amounts Allowed for Deduction (RM)",
        "inputType": "number",
        "required": true
      }
    ]
  }
}
```

**Resulting Data Structure in `FormSubmission`:**

```json
{
  "labuan_payments": [
    {
      "key": "interest",
      "values": {
        "total": 5000,
        "allowed": 5000
      }
    },
    {
      "key": "lease",
      "values": {
        "total": 12000,
        "allowed": 10000
      }
    }
  ]
}
```

### Complex Input: `fixed_table`

The `"fixed_table"` input type provides a highly flexible and dynamic table structure, allowing for fixed rows, dynamic rows, and powerful cell-level formulas.

**`options` Object for `fixed_table`:**

- **`columns` (Array<Column Definition>, Required):** An array of objects, where each object defines a table column and behaves like a simplified Field Object for the cells within that column.
  - `id` (String, Required): The unique identifier for the column. This is used as the key for data within each row object.
  - `label` (String, Required): The header text for the column.
  - `inputType` (String, Required): The input type for cells in this column (e.g., `"text"`, `"number"`, `"currency"`, `"select"`). This reuses the rendering logic of other `inputType`s.
  - `readonly` (Boolean, Optional): If `true`, cells in this column will be read-only regardless of edit mode or if they contain a formula.
  - `defaultValue` (Any, Optional): The default value for new cells created in this column (e.g., when adding a new row). This can also be a formula object (see **Formulas** below).
- **`fixedRows` (Array<Row Data Object>, Optional):** An array of data objects, each representing a row that is _permanently_ part of the table. These rows cannot be removed by the user. Each object should have keys matching the `id`s of the `columns`. Cell values can be formula objects. To render a cell in a fixed row as a blank, non-interactive space, set its value to `null` in the JSON definition.
- **`allowAddRow` (Boolean, Optional):** If `true`, an "Add Row" button will be displayed, allowing users to append new rows to the table. Defaults to `false`.
- **`initialRows` (Number, Optional):** If no `fixedRows` are defined and no existing data is provided for the field, this specifies how many empty rows should be displayed initially. Defaults to `0`.

**Formulas in `fixed_table`:**

Cells within a `fixed_table` can have their values dynamically calculated using formulas. A formula is defined by placing a special object `{ "formula": "FORMULA_STRING" }` as the cell's value in either `fixedRows` data or a column's `defaultValue`. Formula cells are always rendered as read-only.

- **Intra-row Formulas**: Perform calculations using values from other cells within the same row.
  - **Syntax**: Use column `id`s enclosed in curly braces to reference values.
  - **Example**: `"{quantity} * {price}"` (calculates the product of the 'quantity' and 'price' in the current row).
- **Columnar Formulas**: Perform aggregate calculations based on values in the same column.
  - **Syntax**: `SUM(ABOVE)`
  - **Description**: Calculates the sum of all numeric values in the cells directly above the current cell within the same column. Useful for running totals or subtotals.
- **External Data Formulas**: Perform lookups against the main form data, outside of the current table.
  - **Syntax**: `FALLBACK(fieldId1, fieldId2, ...)`
  - **Description**: Looks up each `fieldId` in the main form data object in order and returns the value of the first field that exists and has a value. This is useful for creating fallback chains (e.g., use a revised value if present, otherwise use the original).

**Example `fixed_table` Field:**

```json
{
  "id": "project_expenses",
  "label": "Project Expenses Breakdown",
  "inputType": "fixed_table",
  "options": {
    "allowAddRow": true,
    "initialRows": 1,
    "columns": [
      { "id": "item", "label": "Expense Item", "inputType": "text" },
      { "id": "cost", "label": "Cost (RM)", "inputType": "currency" },
      {
        "id": "tax_rate",
        "label": "Tax Rate (%)",
        "inputType": "number",
        "defaultValue": 6
      },
      {
        "id": "total_cost",
        "label": "Total Cost (RM)",
        "inputType": "currency",
        "readonly": true,
        "defaultValue": { "formula": "{cost} * (1 + {tax_rate} / 100)" }
      }
    ],
    "fixedRows": [
      { "item": "Consulting Fees", "cost": 5000, "tax_rate": 0 },
      { "item": "Software Licenses", "cost": 2500, "tax_rate": 10 },
      {
        "item": "Sub-total (fixed)",
        "cost": { "formula": "SUM(ABOVE)" },
        "tax_rate": null,
        "total_cost": { "formula": "SUM(ABOVE)" }
      }
    ]
  }
}
```

---

## 6. Conditional Logic (`show_if`)

The `show_if` object provides powerful conditional rendering for pages, sections, and fields.

### Basic Condition

This is the simplest form, checking one field against a value.

- **`fieldId` (String):** The `id` of the field to check.
- **`operator` (String):** The comparison to perform. Currently supports `"equals"` and `"not_equals"`.
- **`value` (String | Number):** The value to check against.

> **Example:** `{ "fieldId": "labuan_payment", "operator": "equals", "value": "yes" }` This means: "Show this item ONLY IF the field 'labuan_payment' has a value of 'yes'".

### Complex (Nested) Condition

For more complex logic, you can use `and` or `or` operators with an array of conditions.

- **`operator` (String):** Must be `"or"` or `"and"`.
- **`conditions` (Array<Object>):** An array where each object is a **Basic Condition** object.

> **Example:**
>
> ```json
> "show_if": {
>   "operator": "or",
>   "conditions": [
>     { "fieldId": "labuan_subsidiary", "operator": "equals", "value": "yes" },
>     { "fieldId": "labuan_payment", "operator": "equals", "value": "yes" }
>   ]
> }
> ```
>
> This means: "Show this item IF 'labuan_subsidiary' is 'yes' OR 'labuan_payment' is 'yes'".

---

## 7. Form Submission Data

The `form_submission.json` file stores the actual user-entered data. Its structure is a simple key-value map where the keys **must exactly match** the `id` attributes of the fields defined in the `form_template.json`. This direct mapping is what links the data to its definition.
