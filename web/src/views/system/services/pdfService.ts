// web/src/services/pdfService.ts

export interface PdfReportPayload {
  title: string;
  submissionYear: number;
  printSelectedOnly: boolean;
  headers: Array<{ key: string; label: string }>;
  selectedRowIds: string[];
  allRows: Array<{ id: string; columns: Record<string, any> }>;
}

/**
 * Calls the PDF generation microservice to generate a PDF report and triggers a download.
 * @param payload The data required to generate the report.
 * @returns A promise that resolves to true on success.
 * @throws Error if the request fails or the server returns an error.
 */
export async function generatePdfReport(payload: PdfReportPayload): Promise<boolean> {
  const endpoint = 'http://localhost:3000/generate-pdf';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to parse error message from JSON response
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Get the PDF blob from the response
    const blob = await response.blob();

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.title.replace(/\s+/g, '_')}_${payload.submissionYear}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
