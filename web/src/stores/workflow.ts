import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TaxFiling, ExtractedData } from '../views/tax-filing/types';
import { updateTaxFiling } from '../views/tax-filing/data';

export interface WorkflowState {
  currentTaxFilingId: string | null;
  extractedData: Record<string, ExtractedData>; // keyed by tax filing ID
  isProcessing: boolean;
  lastSavedAt: Record<string, string>; // keyed by tax filing ID
  isDirty: Record<string, boolean>; // keyed by tax filing ID
}

export const useWorkflowStore = defineStore('workflow', () => {
  // State
  const currentTaxFilingId = ref<string | null>(null);
  const extractedData = ref<Record<string, ExtractedData>>({});
  const isProcessing = ref(false);
  const lastSavedAt = ref<Record<string, string>>({});
  const isDirty = ref<Record<string, boolean>>({});

  // Getters
  const currentExtractedData = computed(() => {
    if (!currentTaxFilingId.value) return null;
    return extractedData.value[currentTaxFilingId.value] || null;
  });

  const isCurrentWorkflowDirty = computed(() => {
    if (!currentTaxFilingId.value) return false;
    return isDirty.value[currentTaxFilingId.value] || false;
  });

  const getCurrentLastSavedAt = computed(() => {
    if (!currentTaxFilingId.value) return null;
    return lastSavedAt.value[currentTaxFilingId.value] || null;
  });

  // Actions
  function setCurrentTaxFiling(taxFilingId: string) {
    currentTaxFilingId.value = taxFilingId;
  }

  function initializeExtractedData(taxFilingId: string, data?: ExtractedData) {
    if (data) {
      extractedData.value[taxFilingId] = data;
      isDirty.value[taxFilingId] = false;
      lastSavedAt.value[taxFilingId] = new Date().toISOString();
    } else if (!extractedData.value[taxFilingId]) {
      extractedData.value[taxFilingId] = {
        files: [],
        personalInfo: null,
        incomeData: null,
        rawData: {},
        extractedAt: new Date().toISOString()
      };
      isDirty.value[taxFilingId] = false;
    }
  }

  function updateExtractedData(taxFilingIdOrData: string | Partial<ExtractedData>, data?: Partial<ExtractedData>) {
    let targetTaxFilingId: string;
    let targetData: Partial<ExtractedData>;

    // Handle overloaded function - if first param is data object, use current tax filing ID
    if (typeof taxFilingIdOrData === 'string') {
      targetTaxFilingId = taxFilingIdOrData;
      targetData = data!;
    } else {
      // If no current tax filing ID, create a default one
      if (!currentTaxFilingId.value) {
        currentTaxFilingId.value = 'default-tax-filing';
      }
      targetTaxFilingId = currentTaxFilingId.value;
      targetData = taxFilingIdOrData;
    }

    if (!extractedData.value[targetTaxFilingId]) {
      initializeExtractedData(targetTaxFilingId);
    }

    extractedData.value[targetTaxFilingId] = {
      ...extractedData.value[targetTaxFilingId],
      ...targetData,
      extractedAt: new Date().toISOString()
    };

    isDirty.value[targetTaxFilingId] = true;
  }

  function updateFileExtractedData(taxFilingId: string, fileIndex: number, fileData: any) {
    if (!extractedData.value[taxFilingId]) {
      initializeExtractedData(taxFilingId);
    }

    if (!extractedData.value[taxFilingId].files) {
      extractedData.value[taxFilingId].files = [];
    }

    extractedData.value[taxFilingId].files[fileIndex] = {
      ...extractedData.value[taxFilingId].files[fileIndex],
      extractedData: fileData,
      extractedAt: new Date().toISOString()
    };

    isDirty.value[taxFilingId] = true;
  }

  async function saveExtractedData(taxFilingId: string): Promise<boolean> {
    if (!extractedData.value[taxFilingId] || !isDirty.value[taxFilingId]) {
      return true;
    }

    try {
      isProcessing.value = true;

      await updateTaxFiling(taxFilingId, {
        extractedData: extractedData.value[taxFilingId],
        status: 'data_extracted'
      });

      isDirty.value[taxFilingId] = false;
      lastSavedAt.value[taxFilingId] = new Date().toISOString();

      return true;
    } catch (error) {
      console.error('Failed to save extracted data:', error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  }

  async function autoSave(taxFilingId: string, debounceMs: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (isDirty.value[taxFilingId]) {
          await saveExtractedData(taxFilingId);
        }
        resolve();
      }, debounceMs);
    });
  }

  function clearWorkflowData(taxFilingId: string) {
    delete extractedData.value[taxFilingId];
    delete isDirty.value[taxFilingId];
    delete lastSavedAt.value[taxFilingId];
  }

  function resetCurrentWorkflow() {
    if (currentTaxFilingId.value) {
      clearWorkflowData(currentTaxFilingId.value);
    }
  }

  // Initialize with hardcoded data
  function initializeWithHardcodedData() {
    const defaultTaxFilingId = 'default-tax-filing';
    currentTaxFilingId.value = defaultTaxFilingId;

    // Directly hardcoded data instead of calling function
    const hardcodedData = {
      extractedAt: new Date().toISOString(),
      personalInfo: {
        name: 'ABCD Corporation Sdn Bhd',
        address: '123 Business Street, Corporate City, Kuala Lumpur 50450',
        registrationNumber: '201901012345',
        taxFileNumber: 'C12345678'
      },
      incomeData: {
        totalIncome: 2450000,
        businessIncome: 2450000,
        otherIncome: 25000
      },
      taxCalculations: {
        taxableIncome: 335000,
        taxOwed: 80400
      },
      rawData: {
        'Management Accounts.xlsx': {
          'Income Statement': {
            'Revenue': {
              'Total Revenue': 2450000
            },
            'Operating Expenses': {
              'Gross Profit': 980000,
              'Operating Expenses': {
                'Total Operating Expenses': 580000,
                'Depreciation': 65000
              }
            },
            'Other Income/Expenses': {
              'Interest Income': 15000,
              'Dividend Income': 10000
            },
            'Net Income Before Tax': 335000,
            'Income Tax Expense': 80400,
            'Net Income': 254600
          },
          'Balance Sheet': {
            'Total Assets': 1850000,
            'Total Liabilities': 920000,
            'Shareholders Equity': {
              'Total Shareholders Equity': 930000
            }
          },
          'Cash Flow Statement': {
            'Operating Activities': {
              'Net Cash from Operating Activities': 350000
            },
            'Investing Activities': {
              'Net Cash from Investing Activities': -150000
            },
            'Financing Activities': {
              'Net Cash from Financing Activities': -130000
            }
          }
        }
      }
    };

    initializeExtractedData(defaultTaxFilingId, hardcodedData);
  }

  // Batch operations
  function getWorkflowSummary(taxFilingId: string) {
    return {
      hasData: !!extractedData.value[taxFilingId],
      isDirty: isDirty.value[taxFilingId] || false,
      lastSavedAt: lastSavedAt.value[taxFilingId] || null,
      fileCount: extractedData.value[taxFilingId]?.files?.length || 0
    };
  }

  // Hardcoded data for Management Accounts.xlsx - matches TaxComputationVisualization.vue
  function getManagementAccountsData(): ExtractedData {
    return {
      extractedAt: new Date().toISOString(),
      personalInfo: {
        name: 'ABCD Corporation Sdn Bhd',
        address: '123 Business Street, Corporate City, Kuala Lumpur 50450',
        registrationNumber: '201901012345',
        taxFileNumber: 'C12345678'
      },
      incomeData: {
        totalIncome: 2450000,
        businessIncome: 2450000,
        otherIncome: 25000
      },
      taxCalculations: {
        taxableIncome: 335000,
        taxOwed: 80400
      },
      rawData: {
        'Management Accounts.xlsx': {
          'Income Statement': {
            'Revenue': {
              'Total Revenue': 2450000
            },
            'Operating Expenses': {
              'Gross Profit': 980000,
              'Operating Expenses': {
                'Total Operating Expenses': 580000,
                'Depreciation': 65000
              }
            },
            'Other Income/Expenses': {
              'Interest Income': 15000,
              'Dividend Income': 10000
            },
            'Net Income Before Tax': 335000,
            'Income Tax Expense': 80400,
            'Net Income': 254600
          },
          'Balance Sheet': {
            'Total Assets': 1850000,
            'Total Liabilities': 920000,
            'Shareholders Equity': {
              'Total Shareholders Equity': 930000
            }
          },
          'Cash Flow Statement': {
            'Operating Activities': {
              'Net Cash from Operating Activities': 350000
            },
            'Investing Activities': {
              'Net Cash from Investing Activities': -150000
            },
            'Financing Activities': {
              'Net Cash from Financing Activities': -130000
            }
          }
        }
      }
    };
  }

  return {
    // State
    currentTaxFilingId,
    extractedData,
    isProcessing,
    lastSavedAt,
    isDirty,

    // Getters
    currentExtractedData,
    isCurrentWorkflowDirty,
    getCurrentLastSavedAt,

    // Actions
    setCurrentTaxFiling,
    initializeExtractedData,
    updateExtractedData,
    updateFileExtractedData,
    saveExtractedData,
    autoSave,
    clearWorkflowData,
    resetCurrentWorkflow,
    getWorkflowSummary,
    getManagementAccountsData,
    initializeWithHardcodedData
  };
});
