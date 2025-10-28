import { reactive, computed } from 'vue';

export interface FinancialItem {
  name: string;
  value: string;
  adjustmentType?: string;
}

export interface IncomeStatementData {
  sales: FinancialItem[];
  costOfSales: FinancialItem[];
  otherIncome: FinancialItem[];
  operatingExpenses: FinancialItem[];
}

export interface BalanceSheetData {
  nonCurrentAssets: FinancialItem[];
  currentAssets: FinancialItem[];
  currentLiabilities: FinancialItem[];
  nonCurrentLiabilities: FinancialItem[];
  equity: FinancialItem[];
}

export function useFinancialData() {
  // Reactive data for editable forms
  const incomeStatementData = reactive<IncomeStatementData>({
    sales: [{ name: 'SALES', value: '27,471,218' }],
    costOfSales: [
      { name: 'OPENING STOCK - FINISHED GOODS', value: '2,500.00' },
      { name: 'MANUFACTURING COST B / F', value: '23,375.00' },
      { name: 'RETURNS INWARDS', value: '0' },
      { name: 'CLOSING STOCK - FINISHED GOODS', value: '2,477.00' },
    ],
    otherIncome: [
      { name: 'UNREALISED GAIN/LOSS OF FOREIGN EXCHANGE', value: '(31,246)' },
      { name: 'FIXED DEPOSIT INTEREST INCOME', value: '20,059' },
      { name: 'DIVIDEND RECEIVED', value: '5,733' },
      { name: 'INSURANCE CLAIM', value: '23,401' },
      { name: 'SALE OF SCRAP', value: '455,707' },
      { name: 'SUNDRY RECEIVED', value: '0' },
      { name: 'MISC INCOME', value: '37,939' },
      { name: 'RENTAL RECEIVED', value: '0' },
      { name: 'GST BAD DEBT RECOVER', value: '0' },
      { name: 'GAIN ON DISPOSAL SHORT TERM MONEY MARKET INVESTMENT', value: '0' },
      { name: 'GAIN ON DISPOSAL OF FIXED ASSETS', value: '8,150' },
      { name: 'LOSS ON DISPOSAL OF FIXED ASSETS', value: '0' },
    ],
    operatingExpenses: [
      { name: 'ADVERTISING & PROMOTION', value: '15,000', adjustmentType: '' },
      { name: 'AUDIT FEE', value: '8,500', adjustmentType: '' },
      { name: 'BANK CHARGES', value: '2,350', adjustmentType: '' },
      { name: 'DEPRECIATION', value: '125,000', adjustmentType: 'disallowable' },
      { name: 'INSURANCE', value: '18,500', adjustmentType: '' },
      { name: 'OFFICE SUPPLIES', value: '5,200', adjustmentType: '' },
      {
        name: 'PROFESSIONAL FEES',
        value: '12,000',
        adjustmentType: 'disallowable',
      },
      { name: 'RENT', value: '36,000', adjustmentType: '' },
      { name: 'SALARIES & WAGES', value: '180,000', adjustmentType: '' },
      { name: 'UTILITIES', value: '8,400', adjustmentType: '' },
    ],
  });

  const balanceSheetData = reactive<BalanceSheetData>({
    nonCurrentAssets: [
      { name: 'PROPERTY, PLANT & EQUIPMENT', value: '2,850,000' },
      { name: 'INTANGIBLE ASSETS', value: '150,000' },
      { name: 'INVESTMENT IN SUBSIDIARIES', value: '500,000' },
    ],
    currentAssets: [
      { name: 'INVENTORIES', value: '1,250,000' },
      { name: 'TRADE RECEIVABLES', value: '850,000' },
      { name: 'OTHER RECEIVABLES', value: '125,000' },
      { name: 'PREPAYMENTS', value: '75,000' },
      { name: 'CASH AND BANK BALANCES', value: '2,200,000' },
    ],
    currentLiabilities: [
      { name: 'TRADE PAYABLES', value: '650,000' },
      { name: 'OTHER PAYABLES', value: '180,000' },
      { name: 'ACCRUALS', value: '120,000' },
      { name: 'TAX PAYABLE', value: '350,000' },
      { name: 'SHORT-TERM BORROWINGS', value: '200,000' },
    ],
    nonCurrentLiabilities: [
      { name: 'LONG-TERM BORROWINGS', value: '1,200,000' },
      { name: 'DEFERRED TAX LIABILITIES', value: '100,000' },
    ],
    equity: [
      { name: 'SHARE CAPITAL', value: '1,000,000' },
      { name: 'RETAINED EARNINGS', value: '4,200,000' },
    ],
  });

  // Methods for adding new rows
  const addNewRow = (section: string) => {
    let newRow: FinancialItem;

    switch (section) {
      case 'sales': {
        newRow = { name: 'NEW ITEM', value: '0' };
        incomeStatementData.sales.push(newRow);
        break;
      }
      case 'costOfSales': {
        newRow = { name: 'NEW ITEM', value: '0' };
        incomeStatementData.costOfSales.push(newRow);
        break;
      }
      case 'otherIncome': {
        newRow = { name: 'NEW ITEM', value: '0' };
        incomeStatementData.otherIncome.push(newRow);
        break;
      }
      case 'operatingExpenses': {
        newRow = { name: 'NEW ITEM', value: '0', adjustmentType: '' };
        incomeStatementData.operatingExpenses.push(newRow);
        break;
      }
      case 'nonCurrentAssets': {
        newRow = { name: 'NEW ITEM', value: '0' };
        balanceSheetData.nonCurrentAssets.push(newRow);
        break;
      }
      case 'currentAssets': {
        newRow = { name: 'NEW ITEM', value: '0' };
        balanceSheetData.currentAssets.push(newRow);
        break;
      }
      case 'currentLiabilities': {
        newRow = { name: 'NEW ITEM', value: '0' };
        balanceSheetData.currentLiabilities.push(newRow);
        break;
      }
      case 'nonCurrentLiabilities': {
        newRow = { name: 'NEW ITEM', value: '0' };
        balanceSheetData.nonCurrentLiabilities.push(newRow);
        break;
      }
      case 'equity': {
        newRow = { name: 'NEW ITEM', value: '0' };
        balanceSheetData.equity.push(newRow);
        break;
      }
    }
  };

  // Computed totals for synchronization
  const totalSales = computed(() => {
    return incomeStatementData.sales.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalCostOfSales = computed(() => {
    return incomeStatementData.costOfSales.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalOtherIncome = computed(() => {
    return incomeStatementData.otherIncome.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalOperatingExpenses = computed(() => {
    return incomeStatementData.operatingExpenses.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const grossProfit = computed(() => totalSales.value - totalCostOfSales.value);
  const netProfit = computed(
    () =>
      grossProfit.value + totalOtherIncome.value - totalOperatingExpenses.value,
  );

  const totalNonCurrentAssets = computed(() => {
    return balanceSheetData.nonCurrentAssets.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalCurrentAssets = computed(() => {
    return balanceSheetData.currentAssets.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalAssets = computed(
    () => totalNonCurrentAssets.value + totalCurrentAssets.value,
  );

  const totalCurrentLiabilities = computed(() => {
    return balanceSheetData.currentLiabilities.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalNonCurrentLiabilities = computed(() => {
    return balanceSheetData.nonCurrentLiabilities.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalEquity = computed(() => {
    return balanceSheetData.equity.reduce((sum, item) => {
      const value = Number.parseFloat(item.value.replaceAll(/[^\d.-]/g, '')) || 0;
      return sum + value;
    }, 0);
  });

  const totalLiabilitiesAndEquity = computed(
    () =>
      totalCurrentLiabilities.value +
      totalNonCurrentLiabilities.value +
      totalEquity.value,
  );

  // Format number for display
  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return {
    // Data
    incomeStatementData,
    balanceSheetData,
    
    // Methods
    addNewRow,
    formatNumber,
    
    // Computed values
    totalSales,
    totalCostOfSales,
    totalOtherIncome,
    totalOperatingExpenses,
    grossProfit,
    netProfit,
    totalNonCurrentAssets,
    totalCurrentAssets,
    totalAssets,
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
  };
}