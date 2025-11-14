# PDF Generation Microservice

This is a microservice for generating PDF reports from a JSON payload.

## Features

- Generate PDF reports from a JSON payload.
- Supports filtering of data.
- Stateless and scalable.

## API Documentation

### `POST /generate-pdf`

This is the main endpoint for generating a PDF report.

**Request Body**:

The request body must be a JSON object with the following structure:

```json
{
  "title": "string",
  "submissionYear": "number",
  "printSelectedOnly": "boolean",
  "headers": [
    {
      "key": "string",
      "label": "string"
    }
  ],
  "selectedRowIds": ["string"],
  "allRows": [
    {
      "id": "string",
      "columns": {
        "key": "string"
      }
    }
  ]
}
```

For a detailed schema, see `specs/001-pdf-generation-endpoint/contracts/openapi.yaml`.

**Example Payload**:

```json
{
  "title": "Labuan - List of Payments",
  "submissionYear": 2025,
  "printSelectedOnly": true,
  "headers": [
    { "key": "payee_name", "label": "Payee Name" },
    { "key": "invoice_date", "label": "Invoice Date" },
    { "key": "amount", "label": "Amount (MYR)" }
  ],
  "selectedRowIds": ["row-id-1", "row-id-3"],
  "allRows": [
    {
      "id": "row-id-1",
      "columns": {
        "payee_name": "Supplier A",
        "invoice_date": "2025-01-15",
        "amount": "1500.00"
      }
    },
    {
      "id": "row-id-2",
      "columns": {
        "payee_name": "Supplier B",
        "invoice_date": "2025-02-20",
        "amount": "3000.00"
      }
    },
    {
      "id": "row-id-3",
      "columns": {
        "payee_name": "Supplier C",
        "invoice_date": "2025-03-10",
        "amount": "500.00"
      }
    }
  ]
}
```

**Responses**:

- **`200 OK`**: Successfully generated PDF report. The response body will contain the PDF file as a binary blob.
- **`400 Bad Request`**: Invalid JSON payload. The response body will contain a JSON object with an error message.
- **`500 Internal Server Error`**: An error occurred on the server while generating the PDF.

**Frontend Implementation Guide**:

To call this endpoint from a frontend application, you can use the `fetch` API or a library like `axios`.

```javascript
const payload = {
  // ... your JSON payload here
};

fetch('http://localhost:3000/generate-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then((response) => {
    if (!response.ok) {
      return response.json().then((error) => {
        throw new Error(error.error.message);
      });
    }
    return response.blob();
  })
  .then((blob) => {
    // The PDF is attached in the response as a blob.
    // You can create a URL from the blob and open it in a new tab or download it.
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
  .catch((error) => {
    console.error('Error generating PDF:', error);
  });
```

### `GET /health`

This endpoint can be used to check the health of the service.

**Responses**:

- **`200 OK`**: The service is healthy. The response body will be a JSON object: `{"status": "ok"}`.

## Running the Service

1.  Install dependencies: `pnpm install`
2.  Start the service: `pnpm start`

The service will be running at `http://localhost:3000`.

## Testing

Run the tests with: `pnpm test`
