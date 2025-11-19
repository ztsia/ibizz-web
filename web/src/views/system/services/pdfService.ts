// web/src/services/pdfService.ts

/**
 * Calls the PDF generation microservice to generate a PDF document and returns the resulting Blob.
 * @param template The name of the HTML template to use for the PDF.
 * @param data The data payload to populate the template.
 * @returns A promise that resolves to the PDF Blob on success.
 * @throws Error if the request fails or the server returns an error.
 */
export async function generatePdf(
  template: string,
  data: Record<string, any>,
): Promise<Blob> {
  const endpoint = 'http://localhost:3000/generate-pdf';

  try {
    const payload = { template, data };
    console.log('PDF Service Payload:', JSON.stringify(payload, null, 2)); // Debug log

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to parse error message from JSON response
      const errorData = await response
        .json()
        .catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(
        errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    // Get the PDF blob from the response
    const blob = await response.blob();

    return blob;
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
