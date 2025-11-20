# PDF Generation Microservice

This microservice generates PDF documents from a JSON payload by dynamically populating HTML templates.

## Table of Contents

- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
  - [POST /generate-pdf](#post-generate-pdf)
  - [GET /health](#get-health)
- [Frontend Integration Guide](#frontend-integration-guide)
  - [Handling the PDF Response](#handling-the-pdf-response)
  - [Example with `fetch`](#example-with-fetch)
  - [Example with `axios`](#example-with-axios)
- [Available Templates](#available-templates)
  - [`table-template`](#table-template)
  - [`cp204-template`](#cp204-template)
  - [`cp204a-template`](#cp204a-template)
  - [`cp204b-template`](#cp204b-template)
- [Testing](#testing)

## Getting Started

To run this service locally, follow these steps:

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```
2.  **Start the service**: `bash     pnpm start     ` The service will be available at `http://localhost:3000`.

## How It Works

The service operates on a simple principle: you send a request specifying a `template` name and a `data` payload. The service finds the corresponding HTML template, injects your data into it, and returns a rendered PDF.

The root of your request body must contain two properties:

- `template`: The name of the template file (without the `.html` extension) located in the `src/templates` directory.
- `data`: A JSON object containing the specific data required by that template.

## API Reference

### `POST /generate-pdf`

This is the main endpoint for generating a PDF document.

**Request Body**:

```json
{
  "template": "<template_name>",
  "data": { ... }
}
```

**Responses**:

- **`200 OK`**: Successfully generated the PDF. The response body will be the PDF file as a binary blob with a `Content-Type` of `application/pdf`.
- **`400 Bad Request`**: The request was invalid. This can happen if the `template` name is missing or invalid, or if the `data` payload does not match the schema for the requested template. The response body will contain a JSON object with a descriptive error message.
- **`500 Internal Server Error`**: An unexpected error occurred on the server, such as a problem reading the template file or an issue during PDF rendering.

### `GET /health`

A standard health check endpoint.

- **`200 OK`**: Returns `{"status": "ok"}` if the service is running.

## Frontend Integration Guide

When you call the `/generate-pdf` endpoint, you will receive a PDF file in the form of a Blob (Binary Large Object). Your frontend code is responsible for handling this blob, for example, by opening it in a new tab or triggering a download.

### Handling the PDF Response

The key steps for handling the response are:

1. Make a `POST` request with the correct `template` and `data` payload.
2. Check if the response was successful (e.g., status code 200). If not, parse the JSON error message from the response body.
3. If successful, get the response body as a `blob()`.
4. Create an object URL from the blob using `URL.createObjectURL()`.
5. Use the object URL to either open a new browser tab or create and click a temporary anchor (`<a>`) element to trigger a download.
6. **Important**: Revoke the object URL using `URL.revokeObjectURL()` after use to free up memory.

### Example with `fetch`

This example shows a complete flow, including loading and error states.

```javascript
async function generateAndDownloadPdf(templateName, templateData) {
  // 1. Set a loading state in your UI
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('http://localhost:3000/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: templateName,
        data: templateData,
      }),
    });

    // 2. Handle unsuccessful responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || 'PDF generation failed');
    }

    // 3. Get the PDF blob
    const blob = await response.blob();

    // 4. Create a URL and trigger a download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${templateName}-report.pdf`; // Set a dynamic filename
    document.body.appendChild(a);
    a.click();

    // 5. Clean up the URL and element
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (err) {
    // 6. Handle any errors during the process
    console.error('Error generating PDF:', err);
    setError(err.message);
  } finally {
    // 7. Unset the loading state
    setLoading(false);
  }
}
```

### Example with `axios`

If you are using `axios`, make sure to set the `responseType` to `'blob'`.

```javascript
import axios from 'axios';

async function generateAndOpenPdf(templateName, templateData) {
  setLoading(true);
  setError(null);

  try {
    const response = await axios.post(
      'http://localhost:3000/generate-pdf',
      {
        template: templateName,
        data: templateData,
      },
      {
        responseType: 'blob', // This is crucial!
      },
    );

    // Create a URL and open the PDF in a new tab
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: 'application/pdf' }),
    );
    window.open(url, '_blank');

    // Clean up the URL after a short delay
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (err) {
    let errorMessage = 'An unknown error occurred.';
    // Axios puts the error response in err.response
    if (err.response && err.response.data) {
      // Since responseType is 'blob', we need to read it as text
      const errorJson = await err.response.data.text();
      const errorObj = JSON.parse(errorJson);
      errorMessage = errorObj.error.message;
    }
    console.error('Error generating PDF:', errorMessage);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
}
```

## Available Templates

### `table-template`

Generates a PDF with a title, subtitle, and a dynamic table.

**Template Name**: `table-template`

**Data Payload Example**:
```json
{
  "title": "List of Payments" (string),
  "submissionYear": 2025 (number),
  "printSelectedOnly": false (boolean),
  "headers": [
    { "key": "payee_name" (string), "label": "Payee Name" (string) },
    { "key": "invoice_date" (string), "label": "Invoice Date" (string) }
  ] (Array<{ key: string, label: string }>),
  "selectedRowIds": [] (Array<string>),
  "allRows": [
    {
      "id": "row-id-1" (string),
      "columns": { "payee_name": "Supplier A" (string), "invoice_date": "2025-01-15" (string) }
    } (object),
    {
      "id": "row-id-2" (string),
      "columns": { "payee_name": "Supplier B" (string), "invoice_date": "2025-02-20" (string) }
    } (object)
  ] (Array<{ id: string, columns: object }>)
}
```

### `cp204-template`

Generates a CP204 form ("Estimation of Tax Payable"). For checkboxes, pass the string `"checked"` to mark as checked, otherwise an empty string `""` or omit the field. All other fields expect string values.

**Template Name**: `cp204-template`

**Data Payload Example**:
```json
{
  "cp204_cp205_date": "2025-01-15" (string),
  "estimated_revised_previous_year": "15,000.00" (string),
  "estimated_tax_current_year": "20,000.00" (string),
  "s107a_acp_checked": "checked" (string: "checked" | ""),
  "acc_period_from": "2024-01-01" (string),
  "acc_period_to": "2024-12-31" (string),
  "basis_period_from": "2024-01-01" (string),
  "basis_period_to": "2024-12-31" (string),
  "new_company_commenced_on": "N/A" (string),
  "new_company_sme_status": "N/A" (string),
  "new_company_sme_status_to": "N/A" (string),
  "financial_year_end": "2024-12-31" (string),
  "installments_1_to_11": "1,818.18" (string),
  "final_installment": "1,818.18" (string),
  "following_basis_period_from": "" (string),
  "following_basis_period_to": "" (string),
  "next_basis_period_from": "" (string),
  "next_basis_period_to": "" (string)
}
```

### `cp204a-template`

Generates a CP204A form ("Revision of Estimation of Tax Payable").

**Template Name**: `cp204a-template`

**Data Payload Example**:
```json
{
  "revision_1_application_made_checked": "checked" (string: "checked" | ""),
  "revision_1_date": "2025-06-10" (string),
  "revision_1_revised_estimated_tax": "25,000.00" (string),
  "revision_1_less_tax_paid": "9,090.90" (string),
  "revision_1_balance_estimated_tax": "15,909.10" (string),
  "revision_1_revised_installment_6_11": "2,651.52" (string),
  "revision_1_final_installment": "2,651.50" (string),
  "revision_2_application_made_checked": "" (string: "checked" | ""),
  "revision_2_date": "" (string),
  "revision_2_revised_estimated_tax": "" (string),
  "revision_2_less_tax_paid": "" (string),
  "revision_2_balance_estimated_tax": "" (string),
  "revision_2_revised_installment_9_11": "" (string),
  "revision_2_final_installment": "" (string),
  "special_revision_type": "" (string),
  "special_revision_date": "" (string),
  "special_revision_revised_estimated_tax": "" (string),
  "revision_3_application_made_checked": "" (string: "checked" | ""),
  "revision_3_date": "" (string),
  "revision_3_revised_estimated_tax": "" (string),
  "revision_3_less_tax_paid": "" (string),
  "revision_3_balance_estimated_tax": "" (string),
  "revision_3_revised_installment_11": "" (string),
  "revision_3_final_installment": "" (string)
}
```

### `cp204b-template`

Generates a CP204B form ("Notification of Change in Accounting Period").

**Template Name**: `cp204b-template`

**Data Payload Example**:
```json
{
  "cp204b_date": "2025-07-01" (string),
  "cp204b_current_acc_from": "2024-01-01" (string),
  "cp204b_current_acc_to": "2024-12-31" (string),
  "cp204b_new_acc_from": "2024-04-01" (string),
  "cp204b_new_acc_to": "2025-03-31" (string),
  "cp204b_current_basis_from": "2024-01-01" (string),
  "cp204b_current_basis_to": "2024-12-31" (string),
  "cp204b_following_basis_from": "2025-04-01" (string),
  "cp204b_following_basis_to": "2026-03-31" (string),
  "cp204b_next_basis_from": "" (string),
  "cp204b_next_basis_to": "" (string),
  "cp204b_previous_estimated_tax": "20,000.00" (string),
  "cp204b_revised_estimated_tax": "22,000.00" (string)
}
```

## Testing

Run the full test suite, including integration and performance tests:

```bash
pnpm test
```
