# Mock Data Documentation

This directory contains the mock JSON files for the form services. The data structures are defined as follows.

---

## 1. `FormTemplate` (e.g., `form_c_example.json`)

### Purpose

The `FormTemplate` is a JSON document that acts as the complete **blueprint** for rendering a dynamic form. It defines which sections to show, what fields are in each section, the type of input for each field, and all conditional logic. The frontend reads this document and builds the UI based on its structure.

### Top-Level Fields

- **`_id` (String):** A unique identifier for the form template (e.g., "form_c_2025").
- **`formName` (String):** The human-readable name of the form (e.g., "Company Return Form C").
- **`yearOfAssessment` (Number):** The tax year this form applies to (e.g., 2025).
- **`sections` (Array):** An ordered array of **Section Objects**. The order of objects in this array dictates the order they will appear in the UI.

### Section Object

Each object in the `sections` array defines a single collapsible accordion panel.

- **`part` (String):** A unique ID for the section, used as the accordion's value (e.g., "G", "Basic_Particulars").
- **`title` (String):** The text displayed on the accordion trigger (e.g., "Particulars of Company").
- **`show_if` (Object | null):** If `null`, the section is always shown. If an object, it defines the condition for this section to appear. (See **Conditional Logic** below).
- **`fields` (Array):** An ordered array of **Field Objects** that will be rendered inside this section.

### Field Object

Each object in the `fields` array defines a single form input.

- **`id` (String):** The unique identifier for this field (e.g., "G1_state", "H5a"). **This is the most important key**, as it directly maps to the key in the `FormSubmission`'s `formData` object.
- **`label` (String):** The human-readable text for the form label.
- **`inputType` (String):** A key that tells the frontend what component to render.
  - `"text"`, `"number"`, `"email"`, `"date"`: Renders a `shadcn/ui` **Input**.
  - `"radio"`: Renders a `shadcn/ui` **RadioGroup**. Requires an `options` array.
  - `"checkbox"`: Renders a `shadcn/ui` **Checkbox**. If it's a multi-select, it requires an `options` array.
  - `"select"`: Renders a `shadcn/ui` **Select**. Requires an `options` array.
  - `"readonly_note"`: Renders plain text, not an input (e.g., "Fill in the required appendix").
  - **(Any Other String):** If the string is not a standard type (e.g., `"states"`, `"countries"`), it is treated as a **lookup slug**. This will render the reusable `LookupSelect` component and pass this string to it.
- **`options` (Array<Object> | null):** An array of `{ label: String, value: String }` objects used to populate `radio`, `checkbox`, or `select` inputs.
- **`show_if` (Object | null):** If `null`, the field is always shown. If an object, it defines the condition for this field to appear.

### Conditional Logic (`show_if` Object)

The `show_if` object defines conditional visibility for sections or fields.

- **`fieldId` (String):** The `id` of the _other_ field this one depends on (e.g., "G7a").
- **`operator` (String):** The comparison to perform (e.g., `"equals"`, `"not_equals"`).
- **`value` (String | Number):** The value to check against (e.g., `"1"`).

> **Example:** `{ "fieldId": "G7a", "operator": "equals", "value": "yes" }` means "Show this field ONLY IF the field 'G7a' has a value of 'yes'".

---

## 2. `FormSubmission` (e.g., `submission_example.json`)

### Purpose

The `FormSubmission` document is a **record** that stores one user's (e.g., one company's) data for a _specific_ `FormTemplate`. It is a simple key-value store of the answers.

### Top-Level Fields

- **`_id` (String):** A unique identifier for the submission (e.g., "sub_xyz_sdn_bhd_2025").
- **`companyId` (String):** The ID of the company this submission belongs to.
- **`formTemplateId` (String):** The `_id` of the `FormTemplate` this data is based on (e.g., "form_c_2025_example"). This links the data to its "blueprint."
- **`status` (String):** The current state of the submission (e.g., `"draft"`, `"submitted"`, `"processing"`).
- **`formData` (Object):** This is the core data object.

### The `formData` Object

- **Structure:** A flat object of key-value pairs.
- **Keys:** The keys in this object **must exactly match** the `id` values defined in the corresponding `FormTemplate`'s `fields` array.
- **Values:** The values are the user's saved input.
  - For `text`, `radio`, `select`: A **String** or **Number**.
  - For multi-select `checkbox`: An **Array** of values (e.g., `["sales", "payment"]`).
