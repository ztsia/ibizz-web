import { ref, readonly, nextTick } from 'vue';
import html2pdf from 'html2pdf.js';
import { message } from 'ant-design-vue';
import type { MalaysianTaxWorksheet } from '#/store';
import { providePdfExportContext } from './usePdfExportContext';

export interface ExportOptions {
  format: 'pdf' | 'excel';
  filename?: string;
  quality?: number;
}

export function usePdfExport() {
  const isExporting = ref(false);

  // Provide PDF export context for child components
  const { isPdfExport, enablePdfMode, disablePdfMode } =
    providePdfExportContext();

  /**
   * Export form template to PDF
   */
  const exportToPdf = async (
    worksheet: MalaysianTaxWorksheet,
    options: ExportOptions = { format: 'pdf' },
  ): Promise<void> => {
    if (isExporting.value) {
      message.warning('Export is already in progress');
      return;
    }

    try {
      isExporting.value = true;
      message.loading({
        content: `Exporting ${worksheet.code} to PDF...`,
        key: 'export',
      });

      // Enable PDF mode to switch to text-only rendering
      enablePdfMode();

      // Wait for DOM to update with text elements
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Find the form template element
      const formElement = document.querySelector('.form-content-wrapper');
      if (!formElement) {
        throw new Error(
          'Form template not found. Please open the form preview first.',
        );
      }

      // Clone the element to avoid modifying the original
      const clonedElement = formElement.cloneNode(true) as HTMLElement;

      // Apply print-friendly styles
      clonedElement.style.width = '210mm'; // A4 width
      clonedElement.style.maxWidth = '210mm';
      clonedElement.style.fontSize = '12px';
      clonedElement.style.lineHeight = '1.4';
      clonedElement.style.color = '#000';
      clonedElement.style.background = '#fff';

      // Remove any interactive elements or hover effects
      const interactiveElements = clonedElement.querySelectorAll(
        String.raw`button, .hover\:, [class*="hover:"]`,
      );
      interactiveElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      // Hide any remaining input elements that weren't replaced with text
      const inputElements = clonedElement.querySelectorAll(
        'input, textarea, select',
      );
      inputElements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        // Only hide if it doesn't have a corresponding text element
        if (!htmlEl.closest('.pdf-text-only')) {
          htmlEl.style.display = 'none';
        }
      });

      // Configure PDF options
      const pdfOptions = {
        margin: [10, 10, 10, 10], // top, right, bottom, left in mm
        filename:
          options.filename ||
          `${worksheet.code}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: options.quality || 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
      };

      // Generate and download PDF
      await html2pdf().set(pdfOptions).from(clonedElement).save();

      message.success({
        content: `${worksheet.code} exported successfully!`,
        key: 'export',
        duration: 3,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      message.error({
        content: `Failed to export ${worksheet.code}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key: 'export',
        duration: 5,
      });
    } finally {
      // Disable PDF mode to restore normal rendering
      disablePdfMode();
      isExporting.value = false;
    }
  };

  /**
   * Export form data to Excel (placeholder implementation)
   */
  const exportToExcel = async (
    worksheet: MalaysianTaxWorksheet,
    options: ExportOptions = { format: 'excel' },
  ): Promise<void> => {
    if (isExporting.value) {
      message.warning('Export is already in progress');
      return;
    }

    try {
      isExporting.value = true;
      message.loading({
        content: `Exporting ${worksheet.code} to Excel...`,
        key: 'export',
      });

      // TODO: Implement Excel export functionality
      // This would typically involve:
      // 1. Extracting form data
      // 2. Creating Excel workbook with libraries like xlsx or exceljs
      // 3. Formatting the data appropriately
      // 4. Downloading the file

      // For now, show a placeholder message
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate processing

      message.info({
        content: `Excel export for ${worksheet.code} is not yet implemented`,
        key: 'export',
        duration: 3,
      });
    } catch (error) {
      console.error('Excel export error:', error);
      message.error({
        content: `Failed to export ${worksheet.code} to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key: 'export',
        duration: 5,
      });
    } finally {
      isExporting.value = false;
    }
  };

  /**
   * Main export function that handles both PDF and Excel formats
   */
  const exportWorksheet = async (
    worksheet: MalaysianTaxWorksheet,
    format: 'pdf' | 'excel' = 'pdf',
    customOptions?: Partial<ExportOptions>,
  ): Promise<void> => {
    const options: ExportOptions = {
      format,
      ...customOptions,
    };

    if (format === 'pdf') {
      await exportToPdf(worksheet, options);
    } else if (format === 'excel') {
      await exportToExcel(worksheet, options);
    } else {
      message.error('Unsupported export format');
    }
  };

  /**
   * Check if form template is available for export
   */
  const isFormTemplateAvailable = (worksheetCode: string): boolean => {
    const availableTemplates = [
      'HK-E',
      'HK-E1',
      'HK-E2',
      'HK-C16',
      'HK-PC1',
      'HK-PC1A',
      'HK-PC2',
      'HK-PC3',
      'HK-PC4',
      'HK-PC5',
      'HK-PC6',
      'HK-PC7',
      'HK-PC8',
      'HK-PC9',
      'RK-T',
      'RK-S',
      'CP-204',
      'CP-204A',
      'CP-204B',
      'OP-MAIN',
      'OP-CT',
      'OP-LABUAN',
      'OP-CBCR',
    ];
    return availableTemplates.includes(worksheetCode);
  };

  return {
    isExporting: readonly(isExporting),
    isPdfExport: readonly(isPdfExport),
    exportWorksheet,
    exportToPdf,
    exportToExcel,
    isFormTemplateAvailable,
  };
}

export type UsePdfExportReturn = ReturnType<typeof usePdfExport>;
