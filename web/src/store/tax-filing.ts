import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import type { EnhancedSystemClient } from '#/api/system/iBizzClient';
import type { UploadedFile } from '../views/tax-filing/types/workflow-types';
import {
  extractExcelDataApi,
  extractDividendIncomeDataApi,
  extractInterestIncomeDataApi,
  extractRentalIncomeDataApi,
} from '#/api/ai/document';

// Keep legacy interface for backward compatibility
export interface ClientInfo {
  company?: string;
  email?: string;
  id: string;
  name: string;
}

// Financial data interfaces
export interface FinancialItem {
  id: string; // Unique identifier for the financial item
  description: string;
  amount: number;
  sheet_source: string;
  type:
    | 'sales'
    | 'direct-cost'
    | 'other-income'
    | 'operating-expense'
    | 'current-asset'
    | 'non-current-asset'
    | 'intangible-asset'
    | 'current-liability'
    | 'capital'
    | 'long-term-liability'
    | 'intangible-assets'
    | 'current-assets'
    | 'non-current-assets'
    | 'current-liabilities'
    | 'non-current-liabilities';
  editable?: boolean;
}

// Extracted item interface based on sample.json structure
export interface ExtractedItem {
  id: string;
  description: string;
  amount: number;
  sheet_source: string;
  section: string;
  section_order: number;
  item_order: number;
  adjustment_type: 'normal' | 'less' | 'add';
  editable: boolean;
}

// Sheet mapping interface
export interface SheetMapping {
  name: string;
  type: 'Profit & Loss' | 'Balance Sheet';
}

// Deduction item interface for items within adjustment notes
export interface DeductionItem {
  id: string; // Unique identifier for the deduction item
  description: string;
  amount: number;
  type: 'disallowable' | 'claimable';
  section?: string; // Tax section reference (e.g., 'S39', 'S60F')
  editable?: boolean;
}

// Adjustment note interface
export interface AdjustmentNote {
  id: string; // Unique identifier for the note
  itemId?: string; // Optional reference to the financial item this note belongs to
  date: string;
  payee: string;
  s390: boolean;
  s60f: boolean;
  absorb: number;
  amount: number;
  description: string;
  deductionItems?: DeductionItem[]; // Optional deduction items within this adjustment note
}

// Adjustments and claims data interface
export interface AdjustmentsClaimsData {
  disallowableExpenses: DeductionItem[];
  claimOnDeduction: DeductionItem[];
}

export interface ExtractedData {
  income: number;
  withholding: number;
  deductions: number;
  expenses: FinancialItem[];
  tradingPLExpenses: FinancialItem[];
  manufacturingExpenses: FinancialItem[];
}

export interface ReviewStatus {
  itemId: string;
  reviewed: boolean;
  reviewedAt?: Date;
  critical: boolean;
}

// Dividend income interface
export interface DividendIncomeItem {
  id: string;
  nameOfCorporation: string;
  warrantNo: string;
  date: string;
  yearEndDate: string;
  gross: number;
  taxRate: number;
  taxAtSource: number;
  net: number;
  regrössRate: number;
  reitTaxable: boolean;
  singleTierDividend: boolean;
}

// Interest income interface
export interface InterestIncomeItem {
  id: string;
  assetDescription: string;
  amount: number;
  deemedInterest: boolean;
  taxExempt: boolean;
  chargeableIncome: boolean;
  year?: number;
  month?: string;
}

// Rental income interface
export interface RentalIncomeItem {
  id: string;
  descriptionOfProperty: string;
  date: string;
  grossRent: number;
  netRent: number;
  type: string;
  address1: string;
  address2?: string;
  postcode: string;
  townCity: string;
  state: string;
  assessment: number;
  quitRent: number;
  insurance: number;
  bankInterest: number;
  repairs: number;
  managementFees: number;
  partnershipRental: boolean;
  interestIncurred: number;
  claimCA: boolean;
  setOffRentalLoss: boolean;
  setOffCategory: boolean;
}

// Capital allowance interface
export interface CapitalAllowanceItem {
  id: string;
  description: string;
  assetType: 'plant-machinery' | 'motor-vehicle' | 'it-equipment' | 'other';
  cost: number;
  dateAcquired: string;
  allowanceRate: number;
  currentYearAllowance: number;
  accumulatedAllowance: number;
  netBookValue: number;
  category?: string;
  location?: string;
  serialNumber?: string;
  supplier?: string;
}

export const useTaxFilingStore = defineStore('tax-filing', () => {
  const selectedClient = ref<EnhancedSystemClient | null>(null);
  const isFromClientList = ref(false);

  // Uploaded files state
  const uploadedFiles = ref<UploadedFile[]>([]);

  // Loading state for API operations
  const isLoadingFinancialData = ref(false);
  const financialDataError = ref<string | null>(null);

  // Financial data state
  const extractedData = ref<ExtractedData>({
    income: 0,
    withholding: 0,
    deductions: 0,
    expenses: [],
    tradingPLExpenses: [],
    manufacturingExpenses: [],
  });

  const reviewStatuses = ref<Map<string, ReviewStatus>>(new Map());

  // Adjustment notes state - indexed by expense index
  const adjustmentNotes = ref<Record<string, AdjustmentNote[]>>({});

  // Adjustments and claims data state
  const adjustmentsClaimsData = ref<AdjustmentsClaimsData>({
    disallowableExpenses: [],
    claimOnDeduction: [],
  });

  // Dividend income state
  const dividendIncomeItems = ref<DividendIncomeItem[]>([
    {
      id: '1',
      nameOfCorporation: 'SunMall Berhad',
      warrantNo: '1234',
      date: '2024-05-04',
      yearEndDate: '2024-12-31',
      gross: 4000,
      taxRate: 0,
      taxAtSource: 0,
      net: 4000,
      regrössRate: 0,
      reitTaxable: false,
      singleTierDividend: true,
    },
    {
      id: '2',
      nameOfCorporation: 'Moon Berhad',
      warrantNo: '4567',
      date: '2024-07-24',
      yearEndDate: '2024-12-31',
      gross: 1300,
      taxRate: 0,
      taxAtSource: 0,
      net: 1300,
      regrössRate: 0,
      reitTaxable: false,
      singleTierDividend: true,
    },
    {
      id: '3',
      nameOfCorporation: 'Sun REIT',
      warrantNo: '1234',
      date: '2024-03-04',
      yearEndDate: '2024-12-31',
      gross: 433,
      taxRate: 0,
      taxAtSource: 0,
      net: 433,
      regrössRate: 0,
      reitTaxable: true,
      singleTierDividend: false,
    },
  ]);

  // Interest income state
  const interestIncomeItems = ref<InterestIncomeItem[]>([
    {
      id: '1',
      assetDescription: 'FIXED DEPOSIT',
      amount: 20_058,
      deemedInterest: false,
      taxExempt: false,
      chargeableIncome: true,
      year: 2024,
      month: 'March',
    },
    {
      id: '2',
      assetDescription: 'DIRECTOR',
      amount: 222,
      deemedInterest: true,
      taxExempt: false,
      chargeableIncome: true,
      year: 2024,
      month: 'July',
    },
  ]);

  // Rental income state
  const rentalIncomeItems = ref<RentalIncomeItem[]>([
    {
      id: '1',
      descriptionOfProperty: 'Factory',
      date: '2024-03-01',
      grossRent: 37_939,
      netRent: 33_541,
      type: '1-STOREY FACTORY',
      address1: 'Lot 18, Jalan Kemuning Prima',
      address2: '',
      postcode: '40400',
      townCity: 'Shah Alam',
      state: 'SELANGOR',
      assessment: 2828,
      quitRent: 282,
      insurance: 1288,
      bankInterest: 0,
      repairs: 0,
      managementFees: 0,
      partnershipRental: true,
      interestIncurred: 0,
      claimCA: false,
      setOffRentalLoss: false,
      setOffCategory: false,
    },
  ]);

  // Capital allowance state
  const capitalAllowanceItems = ref<CapitalAllowanceItem[]>([
    {
      id: '1',
      description: 'Manufacturing Equipment - CNC Machine',
      assetType: 'plant-machinery',
      cost: 250_000,
      dateAcquired: '2024-01-15',
      allowanceRate: 20,
      currentYearAllowance: 50_000,
      accumulatedAllowance: 50_000,
      netBookValue: 200_000,
      category: 'Manufacturing',
      location: 'Factory Floor A',
      serialNumber: 'CNC-2024-001',
      supplier: 'Industrial Machinery Sdn Bhd',
    },
    {
      id: '2',
      description: 'Company Vehicle - Toyota Camry',
      assetType: 'motor-vehicle',
      cost: 150_000,
      dateAcquired: '2024-02-20',
      allowanceRate: 20,
      currentYearAllowance: 30_000,
      accumulatedAllowance: 30_000,
      netBookValue: 120_000,
      category: 'Transportation',
      location: 'Head Office',
      serialNumber: 'TC-2024-002',
      supplier: 'Toyota Malaysia',
    },
    {
      id: '3',
      description: 'Server Equipment - Dell PowerEdge',
      assetType: 'it-equipment',
      cost: 80_000,
      dateAcquired: '2024-03-10',
      allowanceRate: 20,
      currentYearAllowance: 16_000,
      accumulatedAllowance: 16_000,
      netBookValue: 64_000,
      category: 'IT Infrastructure',
      location: 'Server Room',
      serialNumber: 'PE-2024-003',
      supplier: 'Dell Technologies Malaysia',
    },
  ]);

  const pLItems = ref<FinancialItem[]>([]);

  const bSItems = ref<FinancialItem[]>([]);

  // New extracted items state
  const pAndLStatementItems = ref<ExtractedItem[]>([]);
  const balanceSheetItems = ref<ExtractedItem[]>([]);

  // Sheet mapping based on includedSheets structure
  const sheetMapping = ref<SheetMapping[]>([
    { name: 'Trading P&L', type: 'Profit & Loss' },
    { name: 'Balance Sheet', type: 'Balance Sheet' },
  ]);

  function setClientForTaxFiling(client: EnhancedSystemClient | ClientInfo) {
    selectedClient.value = client as EnhancedSystemClient;
    isFromClientList.value = true;
    sessionStorage.setItem(
      'tax-filing-client-info',
      JSON.stringify(selectedClient.value),
    );
  }

  /**
   * Clear client information
   */
  function clearClientInfo() {
    selectedClient.value = null;
    isFromClientList.value = false;
    sessionStorage.removeItem('tax-filing-client-info');
  }

  /**
   * Consume client info from sessionStorage (for route guard)
   * Returns the client info and clears it from storage
   */
  function consumeClientInfo(): EnhancedSystemClient | null {
    const stored = sessionStorage.getItem('tax-filing-client-info');
    if (stored) {
      sessionStorage.removeItem('tax-filing-client-info');
      try {
        const parsed = JSON.parse(stored);
        // Handle legacy ClientInfo format
        if ('name' in parsed && !('basicParticulars' in parsed)) {
          const legacyClient = parsed as ClientInfo;
          const enhancedClient: EnhancedSystemClient = {
            id: legacyClient.id,
            basicParticulars: {
              companyName: legacyClient.name,
              registrationNumber: '',
              incorporationDate: '',
              companyType: 'SDN BHD',
              taxIdentificationNumber: '',
              ssmNumber: '',
            },
            companyParticulars: {
              registeredAddress: {
                address: '',
                city: '',
                state: '',
                postcode: '',
                country: 'Malaysia',
              },
              businessAddress: {
                address: '',
                city: '',
                state: '',
                postcode: '',
                country: 'Malaysia',
              },
              contactDetails: {
                phone: '',
                email: legacyClient.email || '',
              },
              msicCode: '',
              msicDescription: '',
              principalActivities: '',
              businessNature: '',
              paidUpCapital: 0,
              authorizedCapital: 0,
              financialYearEnd: '',
              commencementDate: '',
            },
            financialData: {
              revenue: 0,
              grossProfit: 0,
              netProfit: 0,
              totalAssets: 0,
              totalLiabilities: 0,
              shareholdersEquity: 0,
              cashFlow: 0,
              previousYearRevenue: 0,
              previousYearProfit: 0,
            },
            taxInformation: {
              previousYearTaxPaid: 0,
              estimatedTaxPayable: 0,
              installmentPayments: 0,
              taxExemptions: [],
              incentivesApplied: [],
              witholdingTaxPaid: 0,
            },
            status: 'ACTIVE',
            createdTime: new Date().toISOString(),
            lastModifiedTime: new Date().toISOString(),
            lastContactTime: new Date().toISOString(),
          };
          return enhancedClient;
        }
        return parsed as EnhancedSystemClient;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Computed properties for financial data
  const allFinancialItems = computed(() => {
    const items = [...pLItems.value, ...bSItems.value];
    return [
      ...items,
      ...extractedData.value.expenses,
      ...extractedData.value.tradingPLExpenses,
      ...extractedData.value.manufacturingExpenses,
    ];
  });

  const plItems = computed(() => {
    return [
      ...pLItems.value,
      ...extractedData.value.expenses,
      ...extractedData.value.tradingPLExpenses,
    ];
  });

  const bsItems = computed(() => {
    return bSItems.value;
  });

  // Review status computed properties for each statement type
  const plReviewStatus = computed(() => {
    const items = plItems.value;
    const totalItems = items.length;
    let reviewedItems = 0;

    items.forEach((item, index) => {
      const itemId = `${item.type}-${index}`;
      const status = reviewStatuses.value.get(itemId);
      if (status?.reviewed) {
        reviewedItems++;
      }
    });

    const allReviewed = totalItems > 0 && reviewedItems === totalItems;
    return allReviewed ? 'reviewed' : reviewedItems > 0 ? 'partial' : 'pending';
  });

  // Computed property to check if all items (both P&L and BS) are reviewed
  const allItemsReviewed = computed(() => {
    return (
      plReviewStatus.value === 'reviewed' && bsReviewStatus.value === 'reviewed'
    );
  });

  const bsReviewStatus = computed(() => {
    const items = bsItems.value;
    const totalItems = items.length;
    let reviewedItems = 0;

    items.forEach((item, index) => {
      const itemId = `${item.type}-${index}`;
      const status = reviewStatuses.value.get(itemId);
      if (status?.reviewed) {
        reviewedItems++;
      }
    });

    const allReviewed = totalItems > 0 && reviewedItems === totalItems;
    return allReviewed ? 'reviewed' : reviewedItems > 0 ? 'partial' : 'pending';
  });

  // Capital allowance computed properties
  const capitalAllowanceTotals = computed(() => {
    const items = capitalAllowanceItems.value;
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const totalCurrentYearAllowance = items.reduce(
      (sum, item) => sum + item.currentYearAllowance,
      0,
    );
    const totalAccumulatedAllowance = items.reduce(
      (sum, item) => sum + item.accumulatedAllowance,
      0,
    );
    const totalNetBookValue = items.reduce(
      (sum, item) => sum + item.netBookValue,
      0,
    );

    return {
      totalCost,
      totalCurrentYearAllowance,
      totalAccumulatedAllowance,
      totalNetBookValue,
      totalItems: items.length,
    };
  });

  // Capital allowance by asset type
  const capitalAllowanceByType = computed(() => {
    const items = capitalAllowanceItems.value;
    const byType = {
      'plant-machinery': { items: [], totalCost: 0, totalAllowance: 0 },
      'motor-vehicle': { items: [], totalCost: 0, totalAllowance: 0 },
      'it-equipment': { items: [], totalCost: 0, totalAllowance: 0 },
      other: { items: [], totalCost: 0, totalAllowance: 0 },
    };

    items.forEach((item) => {
      byType[item.assetType].items.push(item);
      byType[item.assetType].totalCost += item.cost;
      byType[item.assetType].totalAllowance += item.currentYearAllowance;
    });

    return byType;
  });

  // Financial data management methods
  const updateExtractedData = (data: Partial<ExtractedData>) => {
    extractedData.value = { ...extractedData.value, ...data };
  };

  const addExpenseItem = (
    item: FinancialItem,
    category:
      | 'expenses'
      | 'tradingPLExpenses'
      | 'manufacturingExpenses' = 'expenses',
  ) => {
    extractedData.value[category].push(item);
  };

  const updateExpenseItem = (
    index: number,
    item: FinancialItem,
    category:
      | 'expenses'
      | 'tradingPLExpenses'
      | 'manufacturingExpenses' = 'expenses',
  ) => {
    if (index >= 0 && index < extractedData.value[category].length) {
      extractedData.value[category][index] = item;
    }
  };

  const removeExpenseItem = (
    index: number,
    category:
      | 'expenses'
      | 'tradingPLExpenses'
      | 'manufacturingExpenses' = 'expenses',
  ) => {
    if (index >= 0 && index < extractedData.value[category].length) {
      extractedData.value[category].splice(index, 1);
    }
  };

  const updateHardcodedItem = (
    index: number,
    item: FinancialItem,
    type: 'pl' | 'bs' = 'pl',
  ) => {
    const targetArray = type === 'pl' ? pLItems.value : bSItems.value;
    if (index >= 0 && index < targetArray.length) {
      targetArray[index] = item;
    }
  };

  // Review status management
  const setReviewStatus = (itemId: string, status: Partial<ReviewStatus>) => {
    const existing = reviewStatuses.value.get(itemId) || {
      itemId,
      reviewed: false,
      critical: false,
    };
    reviewStatuses.value.set(itemId, { ...existing, ...status });
  };

  const getReviewStatus = (itemId: string): ReviewStatus | undefined => {
    return reviewStatuses.value.get(itemId);
  };

  const markAllAsReviewed = (
    statementType?: 'profit-loss' | 'balance-sheet',
  ) => {
    if (!statementType) {
      // Mark all items as reviewed if no statement type specified
      reviewStatuses.value.forEach((status, itemId) => {
        reviewStatuses.value.set(itemId, {
          ...status,
          reviewed: true,
          reviewedAt: new Date(),
        });
      });
      return;
    }

    // Get relevant items based on statement type
    const relevantItems =
      statementType === 'profit-loss' ? plItems.value : bsItems.value;

    // Mark only items relevant to the current statement type
    relevantItems.forEach((item, index) => {
      const itemId = `${item.type}-${index}`;
      const existingStatus = reviewStatuses.value.get(itemId);

      if (existingStatus) {
        // Update existing status
        reviewStatuses.value.set(itemId, {
          ...existingStatus,
          reviewed: true,
          reviewedAt: new Date(),
        });
      } else {
        // Initialize new status if it doesn't exist
        const critical = item.amount >= 50_000;
        reviewStatuses.value.set(itemId, {
          itemId,
          reviewed: true,
          critical,
          reviewedAt: new Date(),
        });
      }
    });
  };

  const initializeReviewStatuses = (items: FinancialItem[]) => {
    items.forEach((item, index) => {
      const itemId = `${item.type}-${index}`;
      const critical = item.amount >= 50_000;
      if (!reviewStatuses.value.has(itemId)) {
        setReviewStatus(itemId, {
          itemId,
          reviewed: false,
          critical,
        });
      }
    });
  };

  const clearFinancialData = () => {
    extractedData.value = {
      income: 0,
      withholding: 0,
      deductions: 0,
      expenses: [],
      tradingPLExpenses: [],
      manufacturingExpenses: [],
    };
    reviewStatuses.value.clear();
  };

  const resetReviewStatuses = () => {
    reviewStatuses.value.clear();
    // Re-initialize review statuses for all items
    initializeReviewStatuses([...pLItems.value, ...bSItems.value]);
  };

  // Add methods for manual item management
  const addPLItem = (item: FinancialItem) => {
    // Check if item already exists to avoid duplicates
    const existingIndex = pLItems.value.findIndex(existing => existing.id === item.id);
    if (existingIndex !== -1) {
      // Update existing item
      pLItems.value[existingIndex] = item;
    } else {
      // Add new item
      pLItems.value.push(item);
    }
  };

  const addBSItem = (item: FinancialItem) => {
    // Check if item already exists to avoid duplicates
    const existingIndex = bSItems.value.findIndex(existing => existing.id === item.id);
    if (existingIndex !== -1) {
      // Update existing item
      bSItems.value[existingIndex] = item;
    } else {
      // Add new item
      bSItems.value.push(item);
    }
  };

  const removePLItem = (index: number) => {
    if (index >= 0 && index < pLItems.value.length) {
      pLItems.value.splice(index, 1);
    }
  };

  const removeBSItem = (index: number) => {
    if (index >= 0 && index < bSItems.value.length) {
      bSItems.value.splice(index, 1);
    }
  };

  const clearAllItems = () => {
    pLItems.value.length = 0;
    bSItems.value.length = 0;
    clearFinancialData();
  };

  // Add methods for additive operations (append instead of replace)
  const addPLItemsFromUpload = (items: FinancialItem[], replaceMode = false) => {
    if (replaceMode) {
      // Clear existing uploaded items (keep manual entry items)
      pLItems.value = pLItems.value.filter(item => 
        item.sheet_source?.includes('Manual Entry')
      );
    }
    
    items.forEach(item => {
      // Mark as uploaded data
      const uploadedItem = {
        ...item,
        sheet_source: item.sheet_source || 'Uploaded Document',
      };
      addPLItem(uploadedItem);
    });
  };

  const addBSItemsFromUpload = (items: FinancialItem[], replaceMode = false) => {
    if (replaceMode) {
      // Clear existing uploaded items (keep manual entry items)
      bSItems.value = bSItems.value.filter(item => 
        item.sheet_source?.includes('Manual Entry')
      );
    }
    
    items.forEach(item => {
      // Mark as uploaded data
      const uploadedItem = {
        ...item,
        sheet_source: item.sheet_source || 'Uploaded Document',
      };
      addBSItem(uploadedItem);
    });
  };

  // Method to merge manual entry data with uploaded data
  const mergeFinancialData = (uploadedData: Partial<ExtractedData>, replaceMode = false) => {
    if (replaceMode) {
      // Replace mode: clear existing uploaded data but keep manual entry
      extractedData.value.expenses = extractedData.value.expenses.filter(item => 
        item.sheet_source?.includes('Manual Entry')
      );
      extractedData.value.tradingPLExpenses = extractedData.value.tradingPLExpenses.filter(item => 
        item.sheet_source?.includes('Manual Entry')
      );
      extractedData.value.manufacturingExpenses = extractedData.value.manufacturingExpenses.filter(item => 
        item.sheet_source?.includes('Manual Entry')
      );
    }

    // Add uploaded data
    if (uploadedData.expenses) {
      uploadedData.expenses.forEach(item => {
        const uploadedItem = {
          ...item,
          sheet_source: item.sheet_source || 'Uploaded Document',
        };
        extractedData.value.expenses.push(uploadedItem);
      });
    }

    if (uploadedData.tradingPLExpenses) {
      uploadedData.tradingPLExpenses.forEach(item => {
        const uploadedItem = {
          ...item,
          sheet_source: item.sheet_source || 'Uploaded Document',
        };
        extractedData.value.tradingPLExpenses.push(uploadedItem);
      });
    }

    if (uploadedData.manufacturingExpenses) {
      uploadedData.manufacturingExpenses.forEach(item => {
        const uploadedItem = {
          ...item,
          sheet_source: item.sheet_source || 'Uploaded Document',
        };
        extractedData.value.manufacturingExpenses.push(uploadedItem);
      });
    }

    // Update other fields
    if (uploadedData.income !== undefined) {
      extractedData.value.income = uploadedData.income;
    }
    if (uploadedData.withholding !== undefined) {
      extractedData.value.withholding = uploadedData.withholding;
    }
    if (uploadedData.deductions !== undefined) {
      extractedData.value.deductions = uploadedData.deductions;
    }
  };

  // Method to check if manual entry data exists
  const hasManualEntryData = computed(() => {
    const manualPLItems = pLItems.value.filter(item => 
      item.sheet_source?.includes('Manual Entry')
    );
    const manualBSItems = bSItems.value.filter(item => 
      item.sheet_source?.includes('Manual Entry')
    );
    const manualExpenses = extractedData.value.expenses.filter(item => 
      item.sheet_source?.includes('Manual Entry')
    );
    
    return manualPLItems.length > 0 || manualBSItems.length > 0 || manualExpenses.length > 0;
  });

  // Method to get data source summary
  const getDataSourceSummary = computed(() => {
    const manualPLCount = pLItems.value.filter(item => 
      item.sheet_source?.includes('Manual Entry')
    ).length;
    const uploadedPLCount = pLItems.value.filter(item => 
      !item.sheet_source?.includes('Manual Entry')
    ).length;
    
    const manualBSCount = bSItems.value.filter(item => 
      item.sheet_source?.includes('Manual Entry')
    ).length;
    const uploadedBSCount = bSItems.value.filter(item => 
      !item.sheet_source?.includes('Manual Entry')
    ).length;

    return {
      manual: {
        plItems: manualPLCount,
        bsItems: manualBSCount,
        total: manualPLCount + manualBSCount,
      },
      uploaded: {
        plItems: uploadedPLCount,
        bsItems: uploadedBSCount,
        total: uploadedPLCount + uploadedBSCount,
      },
    };
  });

  // Capital allowance management methods
  const addCapitalAllowanceItem = (item: CapitalAllowanceItem) => {
    capitalAllowanceItems.value.push(item);
  };

  const updateCapitalAllowanceItem = (
    itemId: string,
    updatedItem: CapitalAllowanceItem,
  ) => {
    const index = capitalAllowanceItems.value.findIndex(
      (item) => item.id === itemId,
    );
    if (index !== -1) {
      capitalAllowanceItems.value[index] = updatedItem;
    }
  };

  const removeCapitalAllowanceItem = (itemId: string) => {
    const index = capitalAllowanceItems.value.findIndex(
      (item) => item.id === itemId,
    );
    if (index !== -1) {
      capitalAllowanceItems.value.splice(index, 1);
    }
  };

  const getCapitalAllowanceItems = () => {
    return capitalAllowanceItems.value;
  };

  const getCapitalAllowanceItemById = (itemId: string) => {
    return capitalAllowanceItems.value.find((item) => item.id === itemId);
  };

  const clearCapitalAllowanceItems = () => {
    capitalAllowanceItems.value.length = 0;
  };

  // Helper functions for extracted items management
  const getItemsBySheetType = (
    type: 'Profit & Loss' | 'Balance Sheet',
  ): ExtractedItem[] => {
    return type === 'Profit & Loss'
      ? pAndLStatementItems.value
      : balanceSheetItems.value;
  };

  const getItemsBySheetName = (sheetName: string): ExtractedItem[] => {
    const mapping = sheetMapping.value.find((m) => m.name === sheetName);
    if (!mapping) return [];
    return getItemsBySheetType(mapping.type);
  };

  const addExtractedItem = (item: ExtractedItem) => {
    const mapping = sheetMapping.value.find(
      (m) => m.name === item.sheet_source,
    );
    if (!mapping) return;

    if (mapping.type === 'Profit & Loss') {
      pAndLStatementItems.value.push(item);
    } else {
      balanceSheetItems.value.push(item);
    }
  };

  const updateExtractedItem = (itemId: string, updatedItem: ExtractedItem) => {
    const mapping = sheetMapping.value.find(
      (m) => m.name === updatedItem.sheet_source,
    );
    if (!mapping) return;

    const targetArray =
      mapping.type === 'Profit & Loss'
        ? pAndLStatementItems.value
        : balanceSheetItems.value;
    const index = targetArray.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      targetArray[index] = updatedItem;
    }
  };

  const removeExtractedItem = (
    itemId: string,
    sheetType: 'Profit & Loss' | 'Balance Sheet',
  ) => {
    const targetArray =
      sheetType === 'Profit & Loss'
        ? pAndLStatementItems.value
        : balanceSheetItems.value;
    const index = targetArray.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      targetArray.splice(index, 1);
    }
  };

  const setExtractedItems = (items: ExtractedItem[]) => {
    // Clear existing items
    pAndLStatementItems.value = [];
    balanceSheetItems.value = [];

    // Distribute items based on sheet_source
    items.forEach((item) => {
      addExtractedItem(item);
    });
  };

  const getAllExtractedItems = (): ExtractedItem[] => {
    return [...pAndLStatementItems.value, ...balanceSheetItems.value];
  };

  const updateSheetMapping = (mappings: SheetMapping[]) => {
    sheetMapping.value = mappings;
  };

  // Comprehensive reset function for complete state reset
  // Adjustment notes management
  const addAdjustmentNote = (itemIdOrKey: string, note: AdjustmentNote) => {
    if (!adjustmentNotes.value[itemIdOrKey]) {
      adjustmentNotes.value[itemIdOrKey] = [];
    }
    adjustmentNotes.value[itemIdOrKey].push(note);
  };

  const removeAdjustmentNote = (itemIdOrKey: string, noteIndex: number) => {
    if (
      adjustmentNotes.value[itemIdOrKey] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex]
    ) {
      adjustmentNotes.value[itemIdOrKey].splice(noteIndex, 1);
      if (adjustmentNotes.value[itemIdOrKey].length === 0) {
        const { [itemIdOrKey]: _, ...rest } = adjustmentNotes.value;
        adjustmentNotes.value = rest;
      }
    }
  };

  const updateAdjustmentNote = (
    itemIdOrKey: string,
    noteIndex: number,
    note: AdjustmentNote,
  ) => {
    if (
      adjustmentNotes.value[itemIdOrKey] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex]
    ) {
      adjustmentNotes.value[itemIdOrKey][noteIndex] = note;
    }
  };

  const getAdjustmentNotes = (itemIdOrKey: string): AdjustmentNote[] => {
    return adjustmentNotes.value[itemIdOrKey] || [];
  };

  const getAllAdjustmentNotes = (): Record<string, AdjustmentNote[]> => {
    const result: Record<string, AdjustmentNote[]> = {};

    // Process all adjustment notes
    Object.entries(adjustmentNotes.value).forEach(([itemIdOrKey, notes]) => {
      const processedNotes = notes.map((note) => {
        // For bound notes (not standalone), ensure itemId is set
        if (itemIdOrKey !== 'standalone') {
          return {
            ...note,
            itemId: itemIdOrKey,
          };
        }
        // For standalone notes, keep as is (itemId may be undefined)
        return note;
      });

      result[itemIdOrKey] = processedNotes;
    });

    return result;
  };

  const clearAdjustmentNotes = (itemIdOrKey?: string) => {
    if (itemIdOrKey === undefined) {
      adjustmentNotes.value = {};
    } else {
      const { [itemIdOrKey]: _, ...rest } = adjustmentNotes.value;
      adjustmentNotes.value = rest;
    }
  };

  // Add standalone adjustment note (not linked to any financial item)
  const addStandaloneAdjustmentNote = (note: AdjustmentNote) => {
    const standaloneKey = 'standalone';
    addAdjustmentNote(standaloneKey, note);
  };

  // Get standalone adjustment notes
  const getStandaloneAdjustmentNotes = (): AdjustmentNote[] => {
    return getAdjustmentNotes('standalone');
  };

  // Add deduction item to an adjustment note
  const addDeductionItem = (
    itemIdOrKey: string,
    noteIndex: number,
    deductionItem: DeductionItem,
  ) => {
    if (
      adjustmentNotes.value[itemIdOrKey] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex]
    ) {
      if (!adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems) {
        adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems = [];
      }
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems!.push(
        deductionItem,
      );
    }
  };

  // Remove deduction item from an adjustment note
  const removeDeductionItem = (
    itemIdOrKey: string,
    noteIndex: number,
    deductionIndex: number,
  ) => {
    if (
      adjustmentNotes.value[itemIdOrKey] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems &&
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems![
        deductionIndex
      ]
    ) {
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems!.splice(
        deductionIndex,
        1,
      );
    }
  };

  // Update deduction item in an adjustment note
  const updateDeductionItem = (
    itemIdOrKey: string,
    noteIndex: number,
    deductionIndex: number,
    deductionItem: DeductionItem,
  ) => {
    if (
      adjustmentNotes.value[itemIdOrKey] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex] &&
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems &&
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems![
        deductionIndex
      ]
    ) {
      adjustmentNotes.value[itemIdOrKey][noteIndex].deductionItems![
        deductionIndex
      ] = deductionItem;
    }
  };

  // Adjustments and claims data management
  const addAdjustmentItem = (
    type: 'disallowableExpenses' | 'claimOnDeduction',
  ) => {
    const newItem: DeductionItem = {
      id: `${type === 'disallowableExpenses' ? 'disallow' : 'claim'}-${Date.now()}`,
      description: 'New Item',
      amount: 0,
      type: type === 'disallowableExpenses' ? 'disallowable' : 'claimable',
      editable: true,
    };
    adjustmentsClaimsData.value[type].push(newItem);
  };

  const removeAdjustmentItem = (
    type: 'disallowableExpenses' | 'claimOnDeduction',
    index: number,
  ) => {
    adjustmentsClaimsData.value[type].splice(index, 1);
  };

  const updateAdjustmentItem = (
    type: 'disallowableExpenses' | 'claimOnDeduction',
    index: number,
    updatedItem: DeductionItem,
  ) => {
    if (adjustmentsClaimsData.value[type][index]) {
      adjustmentsClaimsData.value[type][index] = updatedItem;
    }
  };

  const getAdjustmentsClaimsData = () => {
    return adjustmentsClaimsData.value;
  };

  const clearAdjustmentsClaimsData = () => {
    adjustmentsClaimsData.value = {
      disallowableExpenses: [],
      claimOnDeduction: [],
    };
  };

  // Session storage functionality
  const STORAGE_KEY = 'tax-filing-store-state';

  const saveToSessionStorage = () => {
    try {
      const stateToSave = {
        selectedClient: selectedClient.value,
        isFromClientList: isFromClientList.value,
        extractedData: extractedData.value,
        reviewStatuses: [...reviewStatuses.value.entries()],
        adjustmentNotes: adjustmentNotes.value,
        adjustmentsClaimsData: adjustmentsClaimsData.value,
        dividendIncomeItems: dividendIncomeItems.value,
        interestIncomeItems: interestIncomeItems.value,
        rentalIncomeItems: rentalIncomeItems.value,
        pLItems: pLItems.value,
        bSItems: bSItems.value,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn(
        'Failed to save tax filing store state to session storage:',
        error,
      );
    }
  };

  const loadFromSessionStorage = () => {
    try {
      const savedState = sessionStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Restore state
        selectedClient.value = parsedState.selectedClient || null;
        isFromClientList.value = parsedState.isFromClientList || false;
        extractedData.value = parsedState.extractedData || {
          income: 0,
          withholding: 0,
          deductions: 0,
          expenses: [],
          tradingPLExpenses: [],
          manufacturingExpenses: [],
        };

        // Restore review statuses from array format
        if (parsedState.reviewStatuses) {
          reviewStatuses.value = new Map(parsedState.reviewStatuses);
        }

        adjustmentNotes.value = parsedState.adjustmentNotes || {};

        // Restore adjustments and claims data
        if (parsedState.adjustmentsClaimsData) {
          adjustmentsClaimsData.value = parsedState.adjustmentsClaimsData;
        }

        // Restore dividend income items
        if (parsedState.dividendIncomeItems) {
          dividendIncomeItems.value = parsedState.dividendIncomeItems;
        }

        // Restore interest income items
        if (parsedState.interestIncomeItems) {
          interestIncomeItems.value = parsedState.interestIncomeItems;
        }

        // Restore rental income items
        if (parsedState.rentalIncomeItems) {
          rentalIncomeItems.value = parsedState.rentalIncomeItems;
        }

        // Only restore hardcoded items if they exist in saved state
        if (parsedState.pLItems) {
          pLItems.value = parsedState.pLItems;
        }
        if (parsedState.bSItems) {
          bSItems.value = parsedState.bSItems;
        }

        return true;
      }
    } catch (error) {
      console.warn(
        'Failed to load tax filing store state from session storage:',
        error,
      );
    }
    return false;
  };

  const clearSessionStorage = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn(
        'Failed to clear tax filing store state from session storage:',
        error,
      );
    }
  };

  // Load financial data from API
  const loadExtractedDataFromApi = async (file: File) => {
    try {
      isLoadingFinancialData.value = true;
      financialDataError.value = null;

      const result = await extractExcelDataApi({ document: file });

      // Handle sample.json structure: { success: boolean, data: { data: ExtractedItem[] } }
      // or nested structure: { success: boolean, data: { sheetData: { [sheetName]: { sections: { [sectionName]: { items: ExtractedItem[] } } } } } }
      let extractedItems: ExtractedItem[] = [];

      if (result && 'data' in result) {
        const responseData = (result as any).data;

        // Check if it's the flat data array structure
        if (Array.isArray(responseData.data)) {
          extractedItems = responseData.data;
        }
        // Check if it's the nested sheetData structure
        else if (responseData.sheetData) {
          // Extract items from nested sheetData structure
          Object.values(responseData.sheetData).forEach((sheetData: any) => {
            if (sheetData.sections) {
              Object.values(sheetData.sections).forEach((section: any) => {
                if (section.items && Array.isArray(section.items)) {
                  extractedItems.push(...section.items);
                }
              });
            }
          });
        }
        // Fallback to direct data array
        else if (Array.isArray(responseData)) {
          extractedItems = responseData;
        }
      } else {
        // Handle direct API response
        extractedItems = (result as any) || [];
      }

      // Clear existing items
      pAndLStatementItems.value = [];
      balanceSheetItems.value = [];

      // Map and categorize extracted items
      extractedItems.forEach((item: any) => {
        const extractedItem: ExtractedItem = {
          id: item.id,
          description: item.description,
          amount: item.amount,
          sheet_source: item.sheet_source,
          section: item.section,
          section_order: item.section_order,
          item_order: item.item_order,
          adjustment_type: item.adjustment_type,
          editable: item.editable ?? true,
        };

        // Use the helper function to properly categorize items
        addExtractedItem(extractedItem);
      });

      console.log('Financial data loaded successfully:', {
        pAndLItems: pAndLStatementItems.value.length,
        balanceSheetItems: balanceSheetItems.value.length,
        totalItems: extractedItems.length,
      });
    } catch (error) {
      console.error('Error loading financial data from API:', error);
      financialDataError.value =
        error instanceof Error
          ? error.message
          : 'Failed to load financial data';
    } finally {
      isLoadingFinancialData.value = false;
    }
  };

  // Load financial data from API
  const loadFinancialDataFromApi = async (file: File) => {
    try {
      isLoadingFinancialData.value = true;
      financialDataError.value = null;

      const result = await extractExcelDataApi({ document: file });

      // The API returns data in the format: { data: { data: FinancialItem[] } }
      // But based on sample.json, it's actually { success: boolean, data: { data: FinancialItem[] } }
      // We need to handle both the API response and the sample data structure
      let financialItems: FinancialItem[] = [];

      // Handle both sample.json structure and direct API response
      financialItems =
        result && 'data' in result
          ? (result as any).data || [] // Handle sample.json structure where data is nested
          : (result as any) || []; // Handle direct API response

      // Clear existing items
      pLItems.value = [];
      bSItems.value = [];

      // Map financial items to appropriate categories
      financialItems.forEach((item: any) => {
        const financialItem: FinancialItem = {
          id: item.id,
          description: item.description,
          amount: item.amount,
          sheet_source: item.sheet_source,
          type: mapApiTypeToStoreType(item.type),
          editable: item.editable ?? true,
        };

        // Categorize items based on sheet_source
        if (item.sheet_source === 'Trading P&L') {
          pLItems.value.push(financialItem);
        } else if (item.sheet_source === 'Balance Sheet') {
          bSItems.value.push(financialItem);
        }
      });

      console.log('Financial items:', bSItems.value);
      // Initialize review statuses for loaded items
      initializeReviewStatuses([...pLItems.value, ...bSItems.value]);

      console.log('Financial data loaded successfully:', {
        plItems: pLItems.value.length,
        bsItems: bSItems.value.length,
      });
    } catch (error) {
      console.error('Error loading financial data from API:', error);
      financialDataError.value =
        error instanceof Error
          ? error.message
          : 'Failed to load financial data';
    } finally {
      isLoadingFinancialData.value = false;
    }
  };

  // Extract dividend income data from API
  const extractDividendIncomeFromApi = async (file: File) => {
    try {
      isLoadingFinancialData.value = true;
      financialDataError.value = null;

      const result = await extractDividendIncomeDataApi({ document: file });

      // Handle API response and extract dividend income items
      let extractedItems: any[] = [];

      extractedItems =
        result && 'data' in result
          ? (result as any).data || []
          : (result as any) || [];

      // Map extracted items to DividendIncomeItem format
      extractedItems.forEach((item: any) => {
        const dividendItem: DividendIncomeItem = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          nameOfCorporation: item.nameOfCorporation || item.corporation || '',
          warrantNo: item.warrantNo || item.warrant || '',
          date: item.date || '',
          yearEndDate: item.yearEndDate || item.yearEnd || '',
          gross: Number(item.gross) || 0,
          taxRate: Number(item.taxRate) || 0,
          taxAtSource: Number(item.taxAtSource) || 0,
          net: Number(item.net) || 0,
          regrössRate: Number(item.regrössRate) || 0,
          reitTaxable: Boolean(item.reitTaxable) || false,
          singleTierDividend: Boolean(item.singleTierDividend) || false,
        };

        dividendIncomeItems.value.push(dividendItem);
      });

      console.log('Dividend income data extracted successfully:', {
        extractedItems: extractedItems.length,
        totalItems: dividendIncomeItems.value.length,
      });
    } catch (error) {
      console.error('Error extracting dividend income data from API:', error);
      financialDataError.value =
        error instanceof Error
          ? error.message
          : 'Failed to extract dividend income data';
    } finally {
      isLoadingFinancialData.value = false;
    }
  };

  // Extract interest income data from API
  const extractInterestIncomeFromApi = async (file: File) => {
    try {
      isLoadingFinancialData.value = true;
      financialDataError.value = null;

      const result = await extractInterestIncomeDataApi({ document: file });

      // Handle API response and extract interest income items
      let extractedItems: any[] = [];

      extractedItems =
        result && 'data' in result
          ? (result as any).data || []
          : (result as any) || [];

      // Map extracted items to InterestIncomeItem format
      extractedItems.forEach((item: any) => {
        const interestItem: InterestIncomeItem = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          assetDescription: item.assetDescription || item.asset || 'OTHER',
          amount: Number(item.amount) || 0,
          deemedInterest: Boolean(item.deemedInterest) || false,
          taxExempt: Boolean(item.taxExempt) || false,
          chargeableIncome: Boolean(item.chargeableIncome) || false,
          year: Number(item.year) || new Date().getFullYear(),
          month: item.month || 'January',
        };

        interestIncomeItems.value.push(interestItem);
      });

      console.log('Interest income data extracted successfully:', {
        extractedItems: extractedItems.length,
        totalItems: interestIncomeItems.value.length,
      });
    } catch (error) {
      console.error('Error extracting interest income data from API:', error);
      financialDataError.value =
        error instanceof Error
          ? error.message
          : 'Failed to extract interest income data';
    } finally {
      isLoadingFinancialData.value = false;
    }
  };

  // Extract rental income data from API
  const extractRentalIncomeFromApi = async (file: File) => {
    try {
      isLoadingFinancialData.value = true;
      financialDataError.value = null;

      const result = await extractRentalIncomeDataApi({ document: file });

      // Handle API response and extract rental income items
      let extractedItems: any[] = [];

      extractedItems =
        result && 'data' in result
          ? (result as any).data || []
          : (result as any) || [];

      // Map extracted items to RentalIncomeItem format
      extractedItems.forEach((item: any) => {
        const rentalItem: RentalIncomeItem = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
          descriptionOfProperty:
            item.descriptionOfProperty || item.description || '',
          date: item.date || '',
          grossRent: Number(item.grossRent) || 0,
          netRent: Number(item.netRent) || 0,
          type: item.type || '1-STOREY FACTORY',
          address1: item.address1 || item.address || '',
          address2: item.address2 || '',
          postcode: item.postcode || '',
          townCity: item.townCity || item.city || '',
          state: item.state || 'SELANGOR',
          assessment: Number(item.assessment) || 0,
          quitRent: Number(item.quitRent) || 0,
          insurance: Number(item.insurance) || 0,
          bankInterest: Number(item.bankInterest) || 0,
          repairs: Number(item.repairs) || 0,
          managementFees: Number(item.managementFees) || 0,
          partnershipRental: Boolean(item.partnershipRental) || false,
          interestIncurred: Number(item.interestIncurred) || 0,
          claimCA: Boolean(item.claimCA) || false,
          setOffRentalLoss: Boolean(item.setOffRentalLoss) || false,
          setOffCategory: Boolean(item.setOffCategory) || false,
        };

        rentalIncomeItems.value.push(rentalItem);
      });

      console.log('Rental income data extracted successfully:', {
        extractedItems: extractedItems.length,
        totalItems: rentalIncomeItems.value.length,
      });
    } catch (error) {
      console.error('Error extracting rental income data from API:', error);
      financialDataError.value =
        error instanceof Error
          ? error.message
          : 'Failed to extract rental income data';
    } finally {
      isLoadingFinancialData.value = false;
    }
  };

  // Helper function to map API types to store types
  const mapApiTypeToStoreType = (apiType: string): FinancialItem['type'] => {
    switch (apiType) {
      case 'sales':
      case 'direct-cost':
      case 'other-income':
      case 'operating-expense': {
        return apiType;
      }
      case 'current-assets': {
        return 'current-asset';
      } // Map plural to singular
      case 'non-current-assets': {
        return 'non-current-asset';
      } // Map plural to singular
      case 'assets': {
        return 'current-asset';
      } // Default assets to current-asset
      case 'liabilities': {
        return 'current-liability';
      } // Default liabilities to current-liability
      case 'equity': {
        return 'capital';
      } // Map equity to capital
      default: {
        return 'operating-expense';
      } // Default fallback
    }
  };

  // Helper function to check if item is P&L
  const isPLItem = (type: FinancialItem['type']): boolean => {
    return [
      'sales',
      'direct-cost',
      'other-income',
      'operating-expense',
    ].includes(type);
  };

  // Helper function to check if item is Balance Sheet
  const isBSItem = (type: FinancialItem['type']): boolean => {
    return [
      'current-asset',
      'non-current-asset',
      'intangible-asset',
      'current-liability',
      'capital',
      'long-term-liability',
      'intangible-assets',
      'current-assets',
      'non-current-assets',
      'current-liabilities',
      'non-current-liabilities',
    ].includes(type);
  };

  // Auto-save state changes
  watch(
    [
      selectedClient,
      isFromClientList,
      extractedData,
      reviewStatuses,
      adjustmentNotes,
      adjustmentsClaimsData,
      dividendIncomeItems,
      interestIncomeItems,
      rentalIncomeItems,
    ],
    () => {
      saveToSessionStorage();
    },
    { deep: true },
  );

  // Load state on store initialization
  loadFromSessionStorage();

  // Dividend income management methods
  const addDividendIncomeItem = (item: DividendIncomeItem) => {
    dividendIncomeItems.value.push(item);
  };

  const updateDividendIncomeItem = (
    id: string,
    updatedItem: DividendIncomeItem,
  ) => {
    const index = dividendIncomeItems.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      dividendIncomeItems.value[index] = updatedItem;
    }
  };

  const removeDividendIncomeItem = (id: string) => {
    const index = dividendIncomeItems.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      dividendIncomeItems.value.splice(index, 1);
    }
  };

  const getDividendIncomeItems = () => {
    return dividendIncomeItems.value;
  };

  const clearDividendIncomeItems = () => {
    dividendIncomeItems.value = [];
  };

  // Interest income management methods
  const addInterestIncomeItem = (item: InterestIncomeItem) => {
    interestIncomeItems.value.push(item);
  };

  const updateInterestIncomeItem = (
    id: string,
    updatedItem: InterestIncomeItem,
  ) => {
    const index = interestIncomeItems.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      interestIncomeItems.value[index] = updatedItem;
    }
  };

  const removeInterestIncomeItem = (id: string) => {
    const index = interestIncomeItems.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      interestIncomeItems.value.splice(index, 1);
    }
  };

  const getInterestIncomeItems = () => {
    return interestIncomeItems.value;
  };

  const clearInterestIncomeItems = () => {
    interestIncomeItems.value = [];
  };

  // Rental income management methods
  const addRentalIncomeItem = (item: RentalIncomeItem) => {
    rentalIncomeItems.value.push(item);
  };

  const updateRentalIncomeItem = (
    id: string,
    updatedItem: RentalIncomeItem,
  ) => {
    const index = rentalIncomeItems.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      rentalIncomeItems.value[index] = updatedItem;
    }
  };

  const removeRentalIncomeItem = (id: string) => {
    const index = rentalIncomeItems.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      rentalIncomeItems.value.splice(index, 1);
    }
  };

  const getRentalIncomeItems = () => {
    return rentalIncomeItems.value;
  };

  const clearRentalIncomeItems = () => {
    rentalIncomeItems.value = [];
  };

  // Computed properties for dividend totals
  const dividendTotals = computed(() => {
    const items = dividendIncomeItems.value;
    return {
      totalInterestIncurred: 0, // This would be calculated based on business logic
      totalGross: items.reduce((sum, item) => sum + item.gross, 0),
      totalTax: items.reduce((sum, item) => sum + item.taxAtSource, 0),
      totalNet: items.reduce((sum, item) => sum + item.net, 0),
    };
  });

  // Computed properties for interest totals
  const interestTotals = computed(() => {
    const items = interestIncomeItems.value;
    return {
      totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
      chargeableAmount: items
        .filter((item) => item.chargeableIncome)
        .reduce((sum, item) => sum + item.amount, 0),
      exemptAmount: items
        .filter((item) => item.taxExempt)
        .reduce((sum, item) => sum + item.amount, 0),
    };
  });

  // Computed properties for rental totals
  const rentalTotals = computed(() => {
    const items = rentalIncomeItems.value;
    return {
      totalGrossRent: items.reduce((sum, item) => sum + item.grossRent, 0),
      totalNetRent: items.reduce((sum, item) => sum + item.netRent, 0),
      totalExpenses: items.reduce(
        (sum, item) =>
          sum +
          item.assessment +
          item.quitRent +
          item.insurance +
          item.bankInterest +
          item.repairs +
          item.managementFees,
        0,
      ),
    };
  });

  // Uploaded files management methods
  const setUploadedFiles = (files: UploadedFile[]) => {
    uploadedFiles.value = files;
  };

  const addUploadedFile = (file: UploadedFile) => {
    uploadedFiles.value.push(file);
  };

  const removeUploadedFile = (index: number) => {
    uploadedFiles.value.splice(index, 1);
  };

  const clearUploadedFiles = () => {
    uploadedFiles.value = [];
  };

  const getUploadedFiles = () => {
    return uploadedFiles.value;
  };

  const resetAllState = () => {
    // Reset client selection
    selectedClient.value = null;
    isFromClientList.value = false;

    // Clear uploaded files
    clearUploadedFiles();

    // Reset financial data
    extractedData.value = {
      income: 0,
      withholding: 0,
      deductions: 0,
      expenses: [],
      tradingPLExpenses: [],
      manufacturingExpenses: [],
    };

    // Clear all review statuses
    reviewStatuses.value.clear();

    // Clear adjustment notes
    adjustmentNotes.value = {};

    // Clear adjustments and claims data
    clearAdjustmentsClaimsData();

    // Clear dividend income items
    clearDividendIncomeItems();

    // Clear interest income items
    clearInterestIncomeItems();

    // Clear rental income items
    clearRentalIncomeItems();

    // Clear capital allowance items
    clearCapitalAllowanceItems();

    // Re-initialize review statuses for hardcoded items
    initializeReviewStatuses([...pLItems.value, ...bSItems.value]);

    // Clear session storage
    clearSessionStorage();
  };

  return {
    selectedClient,
    isFromClientList,
    setClientForTaxFiling,
    clearClientInfo,
    consumeClientInfo,
    // Uploaded files state
    uploadedFiles,
    setUploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    clearUploadedFiles,
    getUploadedFiles,
    // Financial data state
    extractedData,
    reviewStatuses,
    pLItems,
    bSItems,
    adjustmentNotes,
    adjustmentsClaimsData,
    // Extracted items state
    pAndLStatementItems,
    balanceSheetItems,
    sheetMapping,
    // API loading state
    isLoadingFinancialData,
    financialDataError,
    loadFinancialDataFromApi,
    // Dividend income state
    dividendIncomeItems,
    dividendTotals,
    // Interest income state
    interestIncomeItems,
    interestTotals,
    // Rental income state
    rentalIncomeItems,
    rentalTotals,
    // Capital allowance state
    capitalAllowanceItems,
    capitalAllowanceTotals,
    capitalAllowanceByType,
    // Computed properties
    allFinancialItems,
    plItems,
    bsItems,
    plReviewStatus,
    bsReviewStatus,
    allItemsReviewed,
    // Financial data methods
    updateExtractedData,
    addExpenseItem,
    updateExpenseItem,
    removeExpenseItem,
    updateHardcodedItem,
    // Review status methods
    setReviewStatus,
    getReviewStatus,
    markAllAsReviewed,
    initializeReviewStatuses,
    clearFinancialData,
    resetReviewStatuses,
    addPLItem,
    addBSItem,
    removePLItem,
    removeBSItem,
    clearAllItems,
    addPLItemsFromUpload,
    addBSItemsFromUpload,
    mergeFinancialData,
    hasManualEntryData,
    getDataSourceSummary,
    resetAllState,
    // Dividend income methods
    addDividendIncomeItem,
    updateDividendIncomeItem,
    removeDividendIncomeItem,
    getDividendIncomeItems,
    clearDividendIncomeItems,
    // Interest income methods
    addInterestIncomeItem,
    updateInterestIncomeItem,
    removeInterestIncomeItem,
    getInterestIncomeItems,
    clearInterestIncomeItems,
    // Rental income methods
    addRentalIncomeItem,
    updateRentalIncomeItem,
    removeRentalIncomeItem,
    getRentalIncomeItems,
    clearRentalIncomeItems,
    // Capital allowance methods
    addCapitalAllowanceItem,
    updateCapitalAllowanceItem,
    removeCapitalAllowanceItem,
    getCapitalAllowanceItems,
    getCapitalAllowanceItemById,
    clearCapitalAllowanceItems,
    // Auto-extraction methods
    extractDividendIncomeFromApi,
    extractInterestIncomeFromApi,
    extractRentalIncomeFromApi,
    // Adjustment notes methods
    addAdjustmentNote,
    removeAdjustmentNote,
    updateAdjustmentNote,
    getAdjustmentNotes,
    getAllAdjustmentNotes,
    clearAdjustmentNotes,
    addStandaloneAdjustmentNote,
    getStandaloneAdjustmentNotes,
    // Deduction items methods
    addDeductionItem,
    removeDeductionItem,
    updateDeductionItem,
    // Adjustments and claims methods
    addAdjustmentItem,
    removeAdjustmentItem,
    updateAdjustmentItem,
    getAdjustmentsClaimsData,
    clearAdjustmentsClaimsData,
    // Session storage methods
    saveToSessionStorage,
    loadFromSessionStorage,
    clearSessionStorage,
    // Extracted items methods
    getItemsBySheetType,
    getItemsBySheetName,
    addExtractedItem,
    updateExtractedItem,
    removeExtractedItem,
    setExtractedItems,
    getAllExtractedItems,
    updateSheetMapping,
  };
});
