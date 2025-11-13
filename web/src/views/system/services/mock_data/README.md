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
- **`options` (Array<Object>, Optional):** Required for `select`, `radio`, and `checkbox` types. This is an array of `{ label: String, value: String }` objects.
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
- **`"countries"` / `"states"`**: These are special-purpose lookup slugs that render a pre-configured `LookupSelect` component for selecting countries or states.
- **`"lookup"`**: Renders a generic, searchable `FormLookupInput` component. The `label` of the field is used as the `slug` to fetch the correct lookup data from the backend (e.g., a `label` of `"labuan-entities"` will fetch data for that lookup).

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
