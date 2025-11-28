# Form System Migration & Merge Guide

## Overview

This guide outlines the steps to merge the consolidated form system into the main codebase. The system has been refactored to use a centralized architecture, replacing ad-hoc implementations with a data-driven approach.

## Key Components

| Component | Path | Description |
| --- | --- | --- |
| **Service Layer** | `web/src/views/system/services/generic_form_service.ts` | Centralized service for form templates and submissions. |
| **Lookup Manager** | `web/src/views/system/form_c/services/formLookupManager.service.ts` | Manages isolated, form-specific lookup tables. |
| **Template Store** | `generic_form_template.json` | Single source of truth for all form definitions. |
| **Modal Component** | `GenericFormModal.vue` | Universal modal for rendering any form based on its template ID. |

## Backend Requirements

### 1. MongoDB Schema Design

We will use a **Single Collection Strategy** for each major entity type.

#### A. Collection: `form_templates`

Stores the JSON definitions of forms.

```json
{
  "_id": "ObjectId(...)",
  "id": "form_c_2025", // Unique String ID used by frontend
  "yearOfAssessment": 2025,
  "formName": "Company Return Form C",
  "pages": [
    {
      "id": "page_main",
      "title": "Adjustment and Claims",
      "sections": [
        {
          "part": "header_info",
          "title": "Company Information",
          "fields": [
            {
              "id": "year",
              "label": "Year",
              "inputType": "text",
              "readonly": true,
              "defaultValue": "2025"
            }
            // ... more fields
          ]
        }
        // ... more sections
      ]
    }
    // ... more pages
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### B. Collection: `form_submissions`

Stores the actual user-entered data.

```json
{
  "_id": "ObjectId(...)",
  "submissionId": "sub_12345", // Unique String ID
  "templateId": "form_c_2025", // Reference to form_templates.id
  "year": 2025,
  "data": {
    "company_name": "Acme Corp",
    "tax_ref_no": "1234567890"
    // ... key-value map matching field IDs
  },
  "status": "draft", // e.g., draft, submitted
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

#### C. Collection: `form_lookup_tables`

Stores isolated lookup data for forms. Each document represents one lookup table.

```json
{
  "_id": "ObjectId(...)",
  "slug": "form_lookup_claims", // Unique identifier
  "title": "Claims List",
  "columns_schema": [
    { "key": "code", "type": "string", "label": "Code" },
    { "key": "description", "type": "string", "label": "Description" }
  ],
  "rows": [
    {
      "id": "row_1",
      "code": "C1",
      "description": "Claim Type 1"
    }
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### 2. API Endpoints

Implement the following endpoints to support the service layer.

#### Form Service (`generic_form_service.ts`)

| Function | Endpoint | Method | Payload |
| --- | --- | --- | --- |
| `getFormTemplate` | `/api/forms/templates/:id` | GET | - |
| `saveFormSubmission` | `/api/forms/submissions` | POST | `{ submissionId, templateId, data, ... }` |
| `getFormSubmission` | `/api/forms/submissions/:id` | GET | - |
| `getSubmissionByYear` | `/api/forms/submissions/year/:year` | GET | - |
| `getLatestSubmission` | `/api/forms/submissions/latest` | GET | - |

#### Lookup Manager (`formLookupManager.service.ts`)

| Function | Endpoint | Method | Payload |
| --- | --- | --- | --- |
| `listItems` | `/api/form-lookup/data/:slug` | GET | Query params: `page`, `perPage`, `q` |
| `getItem` | `/api/form-lookup/data/:slug/:id` | GET | - |
| `createItem` | `/api/form-lookup/data/:slug` | POST | `{ ...itemData }` |
| `updateItem` | `/api/form-lookup/data/:slug/:id` | PUT | `{ ...updates }` |
| `deleteItem` | `/api/form-lookup/data/:slug/:id` | DELETE | - |
| `deleteItems` | `/api/form-lookup/data/:slug/batch-delete` | POST | `{ ids: [] }` |

## Frontend Integration Steps

1. **Verify Environment**: Ensure `VITE_API_URL` is configured correctly.
2. **Replace Mocks**:
   - In `generic_form_service.ts`, replace `delay()` and `submissionsStore` with actual `axios` or `fetch` calls to the endpoints above.
   - In `formLookupManager.service.ts`, replace the in-memory `db` logic with API calls.
3. **Migrate Data**:
   - Import `generic_form_template.json` into the `form_templates` database table.
   - Import `generic_form_submission.json` into the `form_submissions` table (if preserving mock data).
   - Import `form_lookup_data.json` into the `form_lookup_tables` collection.

## 3. Data Import

The provided JSON files are already formatted as arrays of documents matching the schemas above.

**To initialize the database:**

1.  **Form Templates**:

    ```bash
    mongoimport --db <your_db_name> --collection form_templates --file generic_form_template.json --jsonArray
    ```

2.  **Lookup Tables**:

    ```bash
    mongoimport --db <your_db_name> --collection form_lookup_tables --file form_lookup_data.json --jsonArray
    ```

3.  **Form Submissions** (Optional - for dev data):
    ```bash
    mongoimport --db <your_db_name> --collection form_submissions --file generic_form_submission.json --jsonArray
    ```

## 4. Validation

After merging, verify the following flows:

1. **Form Loading**: Open `CP204Modal` and ensure it loads the template from the API.
2. **Submission**: Save a form and verify the data persists in the backend.
3. **Lookups**: Open the "Claims" table in `AdjustmentClaimsModal` and verify you can add/edit items via the API.
