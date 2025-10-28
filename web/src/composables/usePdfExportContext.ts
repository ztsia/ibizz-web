import { ref, provide, inject, readonly } from 'vue';
import type { InjectionKey } from 'vue';

/**
 * PDF Export Context for managing PDF rendering mode
 * This context allows components to detect when they're being rendered for PDF export
 * and switch from input elements to pure text elements for better alignment
 */

export interface PdfExportContext {
  isPdfExport: boolean;
  enablePdfMode: () => void;
  disablePdfMode: () => void;
}

// Injection key for PDF export context
const PDF_EXPORT_CONTEXT_KEY: InjectionKey<PdfExportContext> =
  Symbol('pdf-export-context');

/**
 * Composable for providing PDF export context
 * Use this in parent components that need to control PDF export mode
 */
export function providePdfExportContext() {
  const isPdfExport = ref(false);

  const enablePdfMode = () => {
    isPdfExport.value = true;
  };

  const disablePdfMode = () => {
    isPdfExport.value = false;
  };

  const context: PdfExportContext = {
    isPdfExport: readonly(isPdfExport).value,
    enablePdfMode,
    disablePdfMode,
  };

  provide(PDF_EXPORT_CONTEXT_KEY, context);

  return {
    isPdfExport: readonly(isPdfExport),
    enablePdfMode,
    disablePdfMode,
  };
}

/**
 * Composable for consuming PDF export context
 * Use this in child components that need to detect PDF export mode
 */
export function usePdfExportContext() {
  const context = inject(PDF_EXPORT_CONTEXT_KEY);

  if (!context) {
    // Return default context if not provided
    return {
      isPdfExport: ref(false),
      enablePdfMode: () => {},
      disablePdfMode: () => {},
    };
  }

  return context;
}

/**
 * Reactive composable for PDF export detection
 * Returns a reactive boolean that components can use in templates
 */
export function useIsPdfExport() {
  const context = usePdfExportContext();
  return ref(context.isPdfExport);
}
