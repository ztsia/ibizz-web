<script lang="ts" setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useTaxFilingStore } from '#/store';
import { useFinancialData } from '#/composables/useFinancialData';
import { useVbenModal } from '@vben/common-ui';

import {
  UserOutlined,
  BankOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  DollarOutlined,
  HomeOutlined,
  PercentageOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileSearchOutlined,
  DatabaseOutlined,
} from '@ant-design/icons-vue';
import {
  Avatar,
  Tag,
  Divider,
  Button,
  Modal,
  Input,
  InputNumber,
  Checkbox,
  message,
} from 'ant-design-vue';
import ProfitLossStatementModal from './shared/ProfitLossStatementModal.vue';
import IncomeStatement from './IncomeStatement.vue';
import BalanceSheet from './BalanceSheet.vue';
import DividendIncomeModal from './shared/DividendIncomeModal.vue';
import InterestIncomeModal from './shared/InterestIncomeModal.vue';
import RentalIncomeModal from './shared/RentalIncomeModal.vue';
import CapitalAllowanceModal from './shared/CapitalAllowanceModal.vue';
import AdjustmentNotesModal from './AdjustmentNotesModal.vue';
import type {
  ClientSidebarProps as Props,
  ClientSidebarEmits as Emits,
} from '../types/component-types';

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  currentWorkflowStep: 0,
  stepResults: () => ({}),
  uploadedFiles: () => [],
});

const emit = defineEmits<Emits>();

const taxFilingStore = useTaxFilingStore();
const isCollapsed = ref(false);
const selectedSection = ref<any>(null);

// Initialize Vben modal for section details
const [SectionModal, sectionModalApi] = useVbenModal({
  title: 'Section Details',
  showConfirmButton: false,
  showCancelButton: false,
});

// Initialize Vben modal for adjustment notes
const [NotesToAccountModal, adjustmentNotesModalApi] = useVbenModal({
  title: 'Notes To Account',
  showConfirmButton: false,
  showCancelButton: false,
});

// Reactive modal state
const isAdjustmentNotesModalOpen = adjustmentNotesModalApi.useStore(
  (state) => state.isOpen,
);

// Initialize Vben modal for adjustments & claims
const [AdjustmentsClaimsModal, adjustmentsClaimsModalApi] = useVbenModal({
  title: 'Adjustments & Claims',
  showConfirmButton: false,
  showCancelButton: false,
});

// Modal state
const currentStatementType = ref<'profit-loss' | 'balance-sheet'>(
  'profit-loss',
);
const hasExtractionData = ref(false);
const statementModalRef = ref();

// Income Statement and Balance Sheet status - now computed from store
const tradingPLStatus = computed(() => {
  if (!hasExtractionData.value) return 'disabled';
  return taxFilingStore.plReviewStatus;
});

const balanceSheetStatus = computed(() => {
  if (!hasExtractionData.value) return 'disabled';
  return taxFilingStore.bsReviewStatus;
});

// Use shared financial data composable
const { incomeStatementData, formatNumber } = useFinancialData();

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};

// Helper function to get file type description
const getFileTypeDescription = (type?: string, name?: string): string => {
  if (type) {
    if (type.includes('pdf')) return 'PDF Document';
    if (
      type.includes('excel') ||
      type.includes('spreadsheet') ||
      name?.endsWith('.xlsx')
    )
      return 'Excel Spreadsheet';
    if (type.includes('word') || name?.endsWith('.docx'))
      return 'Word Document';
    if (
      type.includes('image') ||
      name?.endsWith('.jpg') ||
      name?.endsWith('.png')
    )
      return 'Image File';
  }
  return 'Document';
};

// Extraction detection function
const handleExtractionDetected = (data: any) => {
  console.log('Extraction detected in ClientSidebar:', data);

  // Enable Income Statement and Balance Sheet items by setting extraction data flag
  hasExtractionData.value = true;

  // Initialize review statuses for the financial items
  taxFilingStore.initializeReviewStatuses(taxFilingStore.allFinancialItems);
};

// Computed property for dynamic uploaded files
const dynamicUploadedFiles = computed(() => {
  // Use stepResults.upload if available, otherwise fall back to uploadedFiles prop
  const uploadData = props.stepResults?.upload;

  if (uploadData?.files && uploadData.files.length > 0) {
    // Use data from stepResults (already formatted)
    return {
      files: uploadData.files.map((file) => ({
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0], // Current date as fallback
        type: file.type,
        url: `/files/${file.name.toLowerCase().replaceAll(/\s+/g, '_')}`,
      })),
    };
  } else if (props.uploadedFiles && props.uploadedFiles.length > 0) {
    // Transform uploadedFiles prop to expected format
    return {
      files: props.uploadedFiles.map((file) => ({
        name: file.name,
        size: formatFileSize(file.size),
        uploadDate: new Date().toISOString().split('T')[0], // Current date as fallback
        type: getFileTypeDescription(file.type, file.name),
        url: `/files/${file.name.toLowerCase().replaceAll(/\s+/g, '_')}`,
      })),
    };
  } else {
    // Fallback to empty files array
    return {
      files: [],
    };
  }
});

// Modal state for adjustment notes
const selectedExpenseIndex = ref(-1);
const selectedExpense = ref(null);
const section39EligibilityData = ref(null);

// Search functionality
const searchQuery = ref('');
const selectedItemForDetails = ref(null);

// Filtered items based on search
const filteredIncomeStatementItems = computed(() => {
  if (!searchQuery.value) {
    return allIncomeStatementItems.value;
  }
  const query = searchQuery.value.toLowerCase();
  return allIncomeStatementItems.value.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query) ||
      (item.allowability && item.allowability.toLowerCase().includes(query)),
  );
});

// Income modal refs
const dividendModalRef = ref();
const interestModalRef = ref();
const rentalModalRef = ref();
const capitalAllowanceModalRef = ref();

// Use shared adjustment notes from store
const { addAdjustmentNote: getAllAdjustmentNotes } = taxFilingStore;

// Get adjustments and claims data from store
const {
  adjustmentsClaimsData,
  addAdjustmentItem: storeAddAdjustmentItem,
  removeAdjustmentItem: storeRemoveAdjustmentItem,
  pLItems,
  bSItems,
} = taxFilingStore;

// Modal states for CRUD operations
const showEditModal = ref(false);
const showViewModal = ref(false);
const editingNote = ref<any>(null);
const editingNoteKey = ref<string>('');
const editingNoteIndex = ref<number>(-1);
const viewingNote = ref<any>(null);

// Computed property to get all adjustment notes (both linked and standalone)
const allAdjustmentNotes = computed(() => {
  const allNotes = taxFilingStore.adjustmentNotes;
  const allNotesArray: Array<{
    noteId: string;
    itemId?: string;
    linkedItemName?: string;
    note: any;
    key: string;
    index: number;
  }> = [];

  // Add null check to prevent TypeError
  if (!allNotes) {
    return allNotesArray;
  }

  Object.entries(allNotes).forEach(([itemIdOrKey, notes]) => {
    notes.forEach((note, noteIndex) => {
      // Use the key directly for mapping instead of trying to resolve linkedItemName
      // The key represents the item this note is linked to
      let linkedItemName;

      if (itemIdOrKey !== 'standalone') {
        // For non-standalone notes, use the key to find the linked item
        const allFinancialItems = [...(pLItems || []), ...(bSItems || [])];
        const linkedItem = allFinancialItems.find(
          (item) => item.id === itemIdOrKey,
        );
        linkedItemName =
          linkedItem?.description || linkedItem?.name || `Item ${itemIdOrKey}`;
      }

      const noteData = {
        noteId: note.id,
        itemId: itemIdOrKey,
        linkedItemName,
        note,
        key: itemIdOrKey,
        index: noteIndex,
      };

      allNotesArray.push(noteData);
    });
  });

  return allNotesArray;
});

// Helper function to get item allowability (same as IncomeStatement.vue)
const getItemAllowability = (
  itemName: string,
  itemType: 'expense' | 'income' = 'expense',
) => {
  const name = itemName.toUpperCase();

  if (itemType === 'income') {
    // Income tax analysis
    if (
      name.includes('INSURANCE CLAIM') ||
      name.includes('SALE OF SCRAP') ||
      name.includes('RENTAL INCOME') ||
      name.includes('INTEREST RECEIVED') ||
      name.includes('DIVIDEND RECEIVED')
    ) {
      return 'taxable';
    }
    if (
      name.includes('GAIN ON DISPOSAL') ||
      name.includes('CAPITAL GAIN') ||
      name.includes('COMPENSATION')
    ) {
      return 'partial';
    }
    if (name.includes('EXEMPT DIVIDEND') || name.includes('LIFE INSURANCE')) {
      return 'exempt';
    }
    return 'taxable'; // Default for income
  }

  // Expense tax analysis
  if (
    name.includes('AUDIT') ||
    name.includes('PROFESSIONAL') ||
    name.includes('BANK CHARGES') ||
    name.includes('INSURANCE') ||
    name.includes('RENT') ||
    name.includes('UTILITIES') ||
    name.includes('SALARIES') ||
    name.includes('WAGES') ||
    name.includes('OFFICE SUPPLIES')
  ) {
    return 'allowed';
  }
  if (
    name.includes('ENTERTAINMENT') ||
    name.includes('PENALTY') ||
    name.includes('FINE') ||
    name.includes('DONATION') ||
    name.includes('GIFT')
  ) {
    return 'disallowed';
  }
  if (
    name.includes('DEPRECIATION') ||
    name.includes('ADVERTISING') ||
    name.includes('TRAINING')
  ) {
    return 'partial';
  }
  return 'allowed'; // Default for expenses
};

// Computed property to get ALL income statement items for comprehensive listing
const allIncomeStatementItems = computed(() => {
  const items: Array<{
    id: string;
    name: string;
    amount: number;
    type: 'sales' | 'direct-cost' | 'other-income' | 'operating-expense';
    section: string;
    allowability: string;
    notesCount: number;
  }> = [];

  // Get all P&L items from store
  const allPLItems = pLItems || [];

  // Add all items with their sections
  allPLItems.forEach((item) => {
    let section = '';
    let allowability = '';

    switch (item.type) {
      case 'sales': {
        section = 'Sales';
        allowability = 'taxable';
        break;
      }
      case 'direct-cost': {
        section = 'Cost of Sales';
        allowability = 'allowed';
        break;
      }
      case 'other-income': {
        section = 'Other Income';
        allowability = getItemAllowability(item.description || '', 'income');
        break;
      }
      case 'operating-expense': {
        section = 'Operating Expenses';
        allowability = getItemAllowability(item.description || '', 'expense');
        break;
      }
    }

    const notesCount = getAdjustmentNotesCount(item.id || '');

    items.push({
      id: item.id || `${item.type}-${Date.now()}`,
      name: item.description || 'Unnamed Item',
      amount: item.amount || 0,
      type: item.type,
      section,
      allowability,
      notesCount,
    });
  });

  return items;
});

// Computed property to get items that require adjustments (exempt income and disallowable expenses)
const adjustmentsClaimsItems = computed(() => {
  return allIncomeStatementItems.value.filter(
    (item) =>
      (item.type === 'other-income' && item.allowability === 'exempt') ||
      (item.type === 'operating-expense' && item.allowability === 'disallowed'),
  );
});

// Helper function to get adjustment notes count
const getAdjustmentNotesCount = (itemId: string): number => {
  const notes = taxFilingStore.getAdjustmentNotes(itemId);
  return notes ? notes.length : 0;
};

// Computed property to get adjustment notes filtered for Adjustments & Claims (only S.39(1) selected)
const adjustmentsClaimsNotes = computed(() => {
  return allAdjustmentNotes.value.filter(
    (adjustmentNote) => adjustmentNote.note.s390 === true,
  );
});

// CRUD operations for adjustment notes
const viewNote = (noteData: any) => {
  // Ensure we have valid note data
  if (!noteData || !noteData.note) {
    message.error('Invalid note data');
    return;
  }

  viewingNote.value = noteData;
  showViewModal.value = true;
};

const editNote = (noteData: any) => {
  editingNote.value = { ...noteData.note };
  editingNoteKey.value = noteData.key;
  editingNoteIndex.value = noteData.index;
  showEditModal.value = true;
};

const saveEditedNote = () => {
  if (
    editingNote.value &&
    editingNoteKey.value !== '' &&
    editingNoteIndex.value >= 0
  ) {
    taxFilingStore.updateAdjustmentNote(
      editingNoteKey.value,
      editingNoteIndex.value,
      editingNote.value,
    );
    message.success('Adjustment note updated successfully');
    showEditModal.value = false;
    editingNote.value = null;
    editingNoteKey.value = '';
    editingNoteIndex.value = -1;
  }
};

const deleteNote = (noteData: any) => {
  Modal.confirm({
    title: 'Delete Adjustment Note',
    content: `Are you sure you want to delete this adjustment note for "${noteData.note.description}"?`,
    okText: 'Yes, Delete',
    cancelText: 'Cancel',
    okType: 'danger',
    onOk() {
      taxFilingStore.removeAdjustmentNote(noteData.key, noteData.index);
      message.success('Adjustment note deleted successfully');
    },
  });
};

const cancelEdit = () => {
  showEditModal.value = false;
  editingNote.value = null;
  editingNoteKey.value = '';
  editingNoteIndex.value = -1;
};

const closeViewModal = () => {
  showViewModal.value = false;
  viewingNote.value = null;
};

// Add new adjustment note function
const addNewAdjustmentNote = () => {
  const newNote = {
    id: `note-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    payee: '',
    description: 'New Adjustment Note',
    amount: 0,
    absorb: 0,
    s390: true, // Default to S.39(1) selected for adjustments & claims
    s60f: false,
  };

  // Add as standalone note
  taxFilingStore.addStandaloneAdjustmentNote(newNote);
  message.success('New adjustment note added successfully');
};

// Watch for changes in adjustment notes to ensure reactivity
watch(
  () => taxFilingStore.adjustmentNotes,
  () => {
    // Force reactivity by triggering a re-computation
    // This ensures the UI updates when deduction items are added/modified
    nextTick(() => {
      // Trigger reactivity update
    });
  },
  { deep: true },
);

// Close adjustment modal
const closeAdjustmentModal = () => {
  adjustmentNotesModalApi.close();
  selectedExpenseIndex.value = -1;
};

// Open adjustments & claims modal
const openAdjustmentsClaimsModal = () => {
  adjustmentsClaimsModalApi.open();
};

// Handle item selection for details view
const selectItemForDetails = (item) => {
  selectedItemForDetails.value = item;
};

// Clear item selection
const clearItemSelection = () => {
  selectedItemForDetails.value = null;
};

// Get notes for selected item
const getSelectedItemNotes = computed(() => {
  if (!selectedItemForDetails.value) return [];
  return allAdjustmentNotes.value.filter(
    (note) => note.linkedItemName === selectedItemForDetails.value.name,
  );
});

// Close adjustments & claims modal
const closeAdjustmentsClaimsModal = () => {
  adjustmentsClaimsModalApi.close();
};

// Open adjustment notes for a specific item from the filtered list
const openItemAdjustmentNotes = (item: any) => {
  selectedExpenseIndex.value = item.id;
  selectedExpense.value = item;
  adjustmentNotesModalApi.open();
};

// Open adjustment notes modal with item data
const openAdjustmentNotesModal = (item?: any) => {
  if (item) {
    selectedExpense.value = item;
    selectedExpenseIndex.value = item.id || 0;
  } else {
    selectedExpenseIndex.value = 'standalone';
    selectedExpense.value = null;
  }
  adjustmentNotesModalApi.open();
};

// Income modal handlers
const handleDividendSave = (data: any) => {
  console.log('Dividend data saved:', data);
  // Handle saving dividend data to store
};

const handleInterestSave = (data: any) => {
  console.log('Interest data saved:', data);
  // Handle saving interest data to store
};

const handleRentalSave = (data: any) => {
  console.log('Rental data saved:', data);
  // Handle saving rental data to store
};

const handleCapitalAllowanceSave = (data: any) => {
  console.log('Capital allowance data saved:', data);
  // Data is automatically synced through the store in the modal
};

// Calculate totals for adjustments & claims
const adjustmentsClaimsTotals = computed(() => {
  // Calculate from existing adjustments claims data
  const totalDisallowable = adjustmentsClaimsData.disallowableExpenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalClaims = adjustmentsClaimsData.claimOnDeduction.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  // Add amounts from automatically filtered items
  const autoFilteredDisallowable = adjustmentsClaimsItems.value
    .filter((item) => item.type === 'disallowable-expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const autoFilteredExempt = adjustmentsClaimsItems.value
    .filter((item) => item.type === 'exempt-income')
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    totalDisallowable: totalDisallowable + autoFilteredDisallowable,
    totalClaims: totalClaims + autoFilteredExempt,
  };
});

// Section 39 eligibility computed property
const section39Eligibility = computed(() => {
  // Default to eligible for business expenses
  return {
    eligible: true,
    reason: 'Business expense eligible for Section 39(1) deduction',
  };
});

// Get expense name for the selected expense
const selectedExpenseName = computed(() => {
  if (
    selectedExpenseIndex.value >= 0 &&
    incomeStatementData.operatingExpenses[selectedExpenseIndex.value]
  ) {
    return incomeStatementData.operatingExpenses[selectedExpenseIndex.value]
      .name;
  }
  return '';
});

// Computed properties for item counts from tax-filing store
const dividendIncomeCount = computed(() => {
  return taxFilingStore.getDividendIncomeItems().length;
});

const interestIncomeCount = computed(() => {
  return taxFilingStore.getInterestIncomeItems().length;
});

const rentalIncomeCount = computed(() => {
  return taxFilingStore.getRentalIncomeItems().length;
});

const adjustmentsClaimsCount = computed(() => {
  const data = taxFilingStore.getAdjustmentsClaimsData();
  return data.disallowableExpenses.length + data.claimOnDeduction.length;
});

const notesToAccountCount = computed(() => {
  return allAdjustmentNotes.value.length;
});

const capitalAllowanceCount = computed(() => {
  return taxFilingStore.getCapitalAllowanceItems().length;
});

// Toggle sidebar collapse state
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('collapse-changed', isCollapsed.value);
};

// Sample data for different sections
const getSectionData = (type: string) => {
  // Return actual client data for client_information type
  if (type === 'client_information') {
    return taxFilingStore.selectedClient || {};
  }

  const sampleData: Record<string, any> = {
    basic_particulars: {
      companyName: 'Company Sdn Bhd',
      registrationNumber: '123456-A',
      incorporationDate: '2020-01-15',
      businessNature: 'Software Development',
      address: '123 Business Street, Kuala Lumpur',
    },
    company_particulars: {
      paidUpCapital: 'RM 1,000,000',
      authorizedCapital: 'RM 2,000,000',
      numberOfShares: '1,000,000',
      parValue: 'RM 1.00',
      financialYearEnd: '31 December 2024',
    },
    income_statement: {
      companyName: 'COMPANY SDN BHD',
      period: 'PROFIT & LOSS ACCOUNT FOR THE MONTH ENDED 31ST DEC 2024',
      revenue: {
        sales: '27,471,218',
        total: '27,471,218',
      },
      costOfSales: {
        openingStock: '2,850,761',
        manufacturingCost: '20,618,566',
        returnsInwards: '1,272',
        closingStock: '2,437,660',
        total: '21,032,939',
      },
      grossProfit: '6,438,279',
      otherIncome: [
        {
          name: 'UNREALISED GAIN/LOSS OF FOREIGN EXCHANGE',
          amount: '(31,246)',
        },
        { name: 'FIXED DEPOSIT INTEREST INCOME', amount: '20,059' },
        { name: 'DIVIDEND RECEIVED', amount: '5,733' },
        { name: 'INSURANCE CLAIM', amount: '23,401' },
        { name: 'SALE OF SCRAP', amount: '455,707' },
        { name: 'SUNDRY RECEIVED', amount: '0' },
        { name: 'MISC INCOME', amount: '37,939' },
        { name: 'RENTAL RECEIVED', amount: '0' },
        { name: 'GST BAD DEBT RECOVER', amount: '0' },
        {
          name: 'GAIN ON DISPOSAL SHORT TERM MONEY MARKET INVESTMENT',
          amount: '0',
        },
        { name: 'GAIN ON DISPOSAL OF FIXED ASSETS', amount: '8,150' },
        { name: 'LOSS ON DISPOSAL OF FIXED ASSETS', amount: '0' },
      ],
      totalOtherIncome: '6,958,021',
      operatingExpenses: [
        { name: 'AUDIT FEE', amount: '41,500' },
        { name: 'AGENT COMMISSION FEE', amount: 'RM 101,198' },
        { name: 'ADVERTISING', amount: '0' },
        { name: 'BAD DEBT', amount: '0' },
        { name: 'GST BAD DEBT RELIEF', amount: '0' },
        { name: 'BANK CHARGES', amount: '53,018' },
        { name: 'BANK OVERDRAFT INTEREST', amount: '490,714' },
        { name: 'BANKER ACCEPTANCE INTEREST', amount: '75,957' },
        { name: 'BANK LETTER OF CREDIT INTEREST', amount: '3,998' },
        { name: 'REVOLVING CREDIT INTEREST', amount: '0' },
        { name: 'BONUS', amount: '156,160' },
        { name: 'CLEANING EXPENSES', amount: '8,685' },
        { name: 'COURIER SERVICES', amount: '4,123' },
        { name: 'CONSULTATION FEE', amount: '10,300' },
        { name: 'DEPR OF BUILDING', amount: '299,233' },
        { name: 'DEPR OF LEASEHOLD LAND', amount: '20,968' },
        { name: 'DEPR OF BUILDING - HOUSE', amount: '29,707' },
        { name: 'DEPR OF RENOVATION FACTORY', amount: '218,505' },
        { name: 'DEPR OF RENOVATION OFFICE', amount: '5,668' },
        { name: 'DEPR OF RENOVATION HOUSE', amount: '1,890' },
        { name: 'DEPR OF OFFICE EQUIPMENT', amount: '54,367' },
        { name: 'DEPR OF FURNITURE & FITTINGS', amount: '7,220' },
        { name: 'DEPR OF MOTOR VEHICLE', amount: '197,224' },
      ],
      totalOperatingExpenses: '6,000,137',
      netProfitForYear: '957,886',
      taxation: '957,886',
      profitAttributableToShareholder: '0',
      dividend: '957,886',
      retainedProfitsForYear: '0',
    },
    balance_sheet: {
      nonCurrentAssets: [
        { name: 'Motor Vehicles at NBV', amount: '195,362' },
        { name: 'Plant & Machinery at NBV', amount: '0' },
        { name: 'Land & Building at NBV', amount: '26,318,092' },
        { name: 'Other Fixed Assets at NBV', amount: '9,770,664' },
        {
          name: 'Total Non-Current Assets',
          amount: '2,182,567',
          isTotal: true,
        },
      ],
      currentAssets: [
        { name: 'FA Purchase During The Year', amount: '0' },
        { name: 'FD Investment at cost', amount: '165,000' },
        { name: 'Inventories', amount: '6,583,292' },
        { name: 'Trade Receivable', amount: '6,302,284' },
        { name: 'Other Receivable', amount: '904,282' },
        { name: 'Loan To Directors', amount: '0' },
        { name: 'Cash & Bank Balance', amount: '1,419' },
        { name: 'Other Current Assets', amount: '2,189,567' },
        { name: 'Total Current Assets', amount: '15,973,844', isTotal: true },
      ],
      totalAssets: '52,823,162',
      liabilitiesAndEquity: [
        { name: 'Total Current Liabilities', amount: '21,662,255' },
        { name: 'Loan & Bill Payables', amount: '14,730,494' },
        { name: 'Trade Payables', amount: '1,978,905' },
        { name: 'Other Payables', amount: '113,003' },
        { name: 'Loan From Directors', amount: '138,980' },
        { name: 'Other Current Liabilities', amount: '4,750,873' },
        { name: 'Long Term Liabilities', amount: '2,480,000' },
        { name: 'Paid Up Capital at Beginning', amount: '0' },
        { name: 'Paid Up Capital at End', amount: '2,500,000' },
        { name: 'Accumulated Profit/Loss', amount: '22,585,995' },
        { name: 'Reserve Account', amount: '11,594,912' },
        {
          name: 'Total Liabilities & Equity',
          amount: '52,823,162',
          isTotal: true,
        },
      ],
    },
    uploaded_files: dynamicUploadedFiles.value,
  };
  return sampleData[type] || {};
};

// Handle section click
const handleSectionClick = (section: any) => {
  if (section.disabled) {
    return;
  }

  // Handle income modals
  if (section.name === 'Dividend Income') {
    dividendModalRef.value?.dividendIncomeModalApi.open();
    return;
  }

  if (section.name === 'Interest Income') {
    interestModalRef.value?.interestIncomeModalApi.open();
    return;
  }

  if (section.name === 'Rental') {
    rentalModalRef.value?.rentalIncomeModalApi.open();
    return;
  }

  if (section.name === 'Capital Allowance') {
    capitalAllowanceModalRef.value?.capitalAllowanceModalApi.open();
    return;
  }

  // Special handling for Adjustments & Claims
  if (section.name === 'Adjustments & Claims') {
    openAdjustmentsClaimsModal();
    return;
  }

  // Handle financial statements - only if extraction data is available
  if (section.name === 'Income Statement' || section.name === 'Balance Sheet') {
    if (hasExtractionData.value && !section.disabled) {
      // Set the appropriate statement type
      currentStatementType.value =
        section.name === 'Income Statement' ? 'profit-loss' : 'balance-sheet';
      // Use modal API to open the appropriate modal
      if (section.name === 'Income Statement') {
        statementModalRef.value?.openProfitLossModal();
      } else {
        statementModalRef.value?.openBalanceSheetModal();
      }
    } else {
      // Show message that extraction is needed first
      console.log('Please complete data extraction first');
    }
    return;
  }

  // Map section names to types for proper data handling
  const sectionTypeMap: Record<string, string> = {
    'Client Information': 'client_information',
    'Uploaded Files': 'uploaded_files',
    'Income Statement': 'income_statement',
    'Balance Sheet': 'balance_sheet',
    'Notes to Account': 'notes_to_account',
    'Adjustments & Claims': 'adjustments_claims',
    'Fixed Assets': 'fixed_assets',
    'Hire Purchase': 'hire_purchase',
    'Capital Allowance': 'capital_allowance',
    'Dividend Income': 'dividend_income',
    Rental: 'rental',
    'Interest Income': 'interest_income',
    'Tax Paid / Tax Exempt / Withholding Tax / Preceding Years Income':
      'tax_particulars',
    'Controlled Transaction': 'controlled_transaction',
    CbCR: 'cbcr',
    'Labuan Entities': 'labuan_entities',
    CP204: 'cp204',
  };

  const sectionType = sectionTypeMap[section.name] || 'default';
  const sectionData = getSectionData(sectionType);

  selectedSection.value = {
    ...section,
    type: sectionType,
    title: section.name,
    data: sectionData,
  };

  // Open the modal with the section title
  sectionModalApi.setState({ title: section.name });
  sectionModalApi.open();
};

// Close modal
const closeModal = () => {
  closeSectionModal();
};

// Close section modal
const closeSectionModal = async () => {
  // Reset component state
  selectedSection.value = null;

  // Ensure modal API is properly closed
  if (sectionModalApi.state.isOpen) {
    sectionModalApi.close();
  }

  // Wait for next tick to ensure state is updated
  await nextTick();
};

// File viewing function
const viewFile = (file: any) => {
  // For demo purposes, we'll show an alert. In a real app, this would open a file viewer
  alert(
    `Viewing file: ${file.name}\n\nThis would open a file viewer or preview modal in a real application.`,
  );
  // In a real implementation, you might:
  // - Open a new modal with file preview
  // - Navigate to a file viewer page
  // - Use a PDF viewer component for PDF files
  // - Show image preview for image files
};

// File download function
const downloadFile = (file: any) => {
  // For demo purposes, we'll show an alert. In a real app, this would trigger file download
  alert(
    `Downloading file: ${file.name}\n\nThis would trigger the file download in a real application.`,
  );
  // In a real implementation, you might:
  // - Create a download link and trigger it
  // - Make an API call to get the file download URL
  // - Use browser's download functionality
};

// Get selected client from store
const selectedClient = computed(() => taxFilingStore.selectedClient);

// Review status state for extracted data
const reviewStatus = ref({
  manufacturingAccount: 'pending',
  tradingPL: 'pending',
  balanceSheet: 'pending',
});

// Function to update review status (can be called from WorkflowExtract)
const updateReviewStatus = (
  item: string,
  status: 'pending' | 'reviewed' | 'approved',
) => {
  reviewStatus.value[item] = status;
};

// Event handlers for IncomeStatement and BalanceSheet components
const handleIncomeStatementChange = (data: any) => {
  console.log('Income Statement data changed:', data);
  // Handle income statement data changes
  // You can emit events or update store here if needed
};

const handleBalanceSheetChange = (data: any) => {
  console.log('Balance Sheet data changed:', data);
  // Handle balance sheet data changes
  // You can emit events or update store here if needed
};

const handleAdjustmentClick = (index: number) => {
  console.log('Adjustment clicked for expense index:', index);
  // Handle adjustment click - could open adjustment modal
  // This replaces the inline adjustment functionality
};

// Expose functions for external components
defineExpose({
  updateReviewStatus,
  handleExtractionDetected,
});

// Tax filing sections - show Income Statement and Balance Sheet by default
const taxSections = computed(() => {
  const sections = [
    {
      title: 'CLIENT INFORMATION',
      items: [
        { name: 'Client Information', icon: 'BankOutlined', hasView: true },
      ],
    },
    {
      title: 'FINANCIAL STATEMENTS',
      items: [
        {
          name: 'Income Statement',
          icon: 'FileTextOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 4,
          status: tradingPLStatus.value,
          pendingReview: tradingPLStatus.value === 'pending',
        },
        {
          name: 'Balance Sheet',
          icon: 'FileTextOutlined',
          hasView: true,
          status: balanceSheetStatus.value,
          disabled: props.currentWorkflowStep < 4,
          pendingReview: balanceSheetStatus.value === 'pending',
        },
      ],
    },
  ];

  sections.push(
    {
      title: 'TAX COMPUTATION',
      items: [
        {
          name: 'Adjustments & Claims',
          icon: 'CalculatorOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
          count: adjustmentsClaimsCount.value,
        },
        {
          name: 'Notes to Account',
          icon: 'FileTextOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
          count: notesToAccountCount.value,
        },
        {
          name: 'Fixed Assets',
          icon: 'HomeOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
        {
          name: 'Hire Purchase',
          icon: 'DollarOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
        {
          name: 'Capital Allowance',
          icon: 'PercentageOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
          count: capitalAllowanceCount.value,
        },
        {
          name: 'Dividend Income',
          icon: 'DollarOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 6,
          count: dividendIncomeCount.value,
        },
        {
          name: 'Rental',
          icon: 'HomeOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 6,
          count: rentalIncomeCount.value,
        },
        {
          name: 'Interest Income',
          icon: 'DollarOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 6,
          count: interestIncomeCount.value,
        },
      ],
    },
    {
      title: 'OTHER PARTICULARS',
      items: [
        {
          name: 'Tax Paid / Tax Exempt / Withholding Tax / Preceding Years Income',
          icon: 'PercentageOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
        {
          name: 'Controlled Transaction',
          icon: 'FileTextOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
        {
          name: 'CbCR',
          icon: 'FileTextOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
        {
          name: 'Labuan Entities',
          icon: 'BankOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
        {
          name: 'CP204',
          icon: 'FileTextOutlined',
          hasView: true,
          disabled: props.currentWorkflowStep < 5,
        },
      ],
    },
  );

  return sections;
});

const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    FileTextOutlined,
    BankOutlined,
    UserOutlined,
    DownloadOutlined,
    CalculatorOutlined,
    HomeOutlined,
    DollarOutlined,
    PercentageOutlined,
    FileSearchOutlined,
    DatabaseOutlined,
  };
  return iconMap[iconName] || FileTextOutlined;
};
</script>

<template>
  <div
    v-if="visible && selectedClient"
    :class="[
      'bg-card fixed right-0 z-40 border-l shadow-lg transition-all duration-300 ease-in-out',
      'bottom-0 top-[100px]',
      isCollapsed ? 'w-12' : 'w-80',
    ]"
  >
    <!-- Collapse Toggle Button -->
    <div class="absolute -left-10 top-4 z-50">
      <Button
        type="primary"
        size="small"
        class="rounded-l-lg rounded-r-none shadow-md"
        @click="toggleCollapse"
      >
        <MenuFoldOutlined v-if="!isCollapsed" />
        <MenuUnfoldOutlined v-if="isCollapsed" />
      </Button>
    </div>

    <!-- Sidebar Content -->
    <div v-if="!isCollapsed" class="h-full overflow-hidden">
      <!-- Client Header -->
      <div class="border-b p-4">
        <div class="mb-3 flex items-center gap-3">
          <Avatar :size="48" class="bg-blue-500">
            <template #icon>
              <BankOutlined />
            </template>
          </Avatar>
          <div class="flex-1">
            <h3 class="font-semibold">
              {{
                selectedClient.basicParticulars?.companyName ||
                selectedClient.company ||
                'N/A'
              }}
            </h3>
            <p class="text-sm">
              {{
                selectedClient.basicParticulars?.taxIdentificationNumber ||
                selectedClient.name ||
                'N/A'
              }}
            </p>
          </div>
        </div>
        <div class="text-center">
          <Tag color="blue" class="text-xs">YA 2025</Tag>
        </div>
      </div>

      <!-- Tax Sections -->
      <div class="h-full overflow-y-auto pb-32">
        <div v-for="section in taxSections" :key="section.title" class="p-4">
          <!-- Section Header -->
          <div class="mb-3">
            <h4 class="text-xs font-semibold uppercase">
              {{ section.title }}
            </h4>
          </div>

          <!-- Section Items -->
          <div class="space-y-2">
            <div
              v-for="item in section.items"
              :key="item.name"
              :class="[
                'group flex items-center justify-between rounded-lg p-2 transition-colors',
                item.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer hover:bg-gray-50',
              ]"
              @click="handleSectionClick(item)"
            >
              <div class="flex flex-1 items-center gap-2">
                <component :is="getIconComponent(item.icon)" class="text-sm" />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">{{ item.name }}</span>
                    <!-- Count Badge -->
                    <Tag
                      v-if="item.count !== undefined"
                      color="blue"
                      class="text-xs"
                    >
                      {{ item.count }}
                    </Tag>
                    <!-- Pending Review Tag -->
                    <Tag
                      v-if="item.pendingReview"
                      color="orange"
                      class="text-xs"
                    >
                      Pending
                    </Tag>
                    <!-- Review Status Tags -->
                    <Tag
                      v-else-if="item.status === 'reviewed'"
                      color="blue"
                      class="text-xs"
                    >
                      Reviewed
                    </Tag>
                    <Tag
                      v-else-if="item.status === 'approved'"
                      color="green"
                      class="text-xs"
                    >
                      Approved
                    </Tag>
                    <Tag
                      v-else-if="item.status === 'classified'"
                      color="purple"
                      class="text-xs"
                    >
                      Classified
                    </Tag>
                  </div>
                  <!-- Classification confidence -->
                  <div
                    v-if="item.confidence"
                    class="mt-1 text-xs text-gray-500"
                  >
                    Confidence: {{ item.confidence }}
                  </div>
                  <!-- Document types or detected items -->
                  <div v-if="item.types" class="mt-1 text-xs text-gray-600">
                    {{ item.types.join(', ') }}
                  </div>
                  <div v-if="item.detected" class="mt-1 text-xs text-gray-600">
                    {{ item.detected.join(', ') }}
                  </div>
                </div>
              </div>

              <!-- Action Icons -->
              <div
                class="flex items-center gap-1 opacity-0 group-hover:opacity-100"
              >
                <Button
                  v-if="item.hasView"
                  type="text"
                  size="small"
                  class="p-1"
                >
                  <EyeOutlined class="text-xs" />
                </Button>
                <Button
                  v-if="item.hasDownload"
                  type="text"
                  size="small"
                  class="p-1"
                >
                  <DownloadOutlined class="text-xs" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Divider between sections -->
          <Divider
            v-if="section !== taxSections[taxSections.length - 1]"
            class="my-4"
          />
        </div>
      </div>
    </div>

    <!-- Modal for Section Details -->
    <SectionModal>
      <div v-if="selectedSection" class="p-4">
        <!-- Client Information -->
        <div
          v-if="selectedSection.type === 'client_information'"
          class="space-y-6"
        >
          <!-- Basic Particulars -->
          <div class="rounded-lg border p-4">
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Basic Particulars
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Company Name</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.basicParticulars?.companyName || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Registration Number</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient?.basicParticulars?.registrationNumber ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Incorporation Date</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient?.basicParticulars?.incorporationDate || 'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Company Type</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.basicParticulars?.companyType || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Tax Identification Number</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient?.basicParticulars?.taxIdentificationNumber ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >SSM Number</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.basicParticulars?.ssmNumber || 'N/A' }}
                </div>
              </div>
              <div
                v-if="
                  selectedClient?.basicParticulars?.businessRegistrationNumber
                "
              >
                <label class="block text-sm font-medium text-gray-700"
                  >Business Registration Number</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient.basicParticulars.businessRegistrationNumber
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Company Particulars -->
          <div class="rounded-lg border p-4">
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Company Particulars
            </h4>
            <div class="space-y-4">
              <!-- Registered Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Registered Address</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient?.companyParticulars?.registeredAddress
                      ?.address || 'N/A'
                  }}<br />
                  {{
                    selectedClient?.companyParticulars?.registeredAddress
                      ?.city || ''
                  }}
                  {{
                    selectedClient?.companyParticulars?.registeredAddress
                      ?.postcode || ''
                  }}
                  {{
                    selectedClient?.companyParticulars?.registeredAddress
                      ?.state || ''
                  }}<br />
                  {{
                    selectedClient?.companyParticulars?.registeredAddress
                      ?.country || ''
                  }}
                </div>
              </div>

              <!-- Business Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Business Address</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient?.companyParticulars?.businessAddress
                      ?.address || 'N/A'
                  }}<br />
                  {{
                    selectedClient?.companyParticulars?.businessAddress?.city ||
                    ''
                  }}
                  {{
                    selectedClient?.companyParticulars?.businessAddress
                      ?.postcode || ''
                  }}
                  {{
                    selectedClient?.companyParticulars?.businessAddress
                      ?.state || ''
                  }}<br />
                  {{
                    selectedClient?.companyParticulars?.businessAddress
                      ?.country || ''
                  }}
                </div>
              </div>

              <!-- Contact Details -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Phone</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.contactDetails
                        ?.phone || 'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Email</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.contactDetails
                        ?.email || 'N/A'
                    }}
                  </div>
                </div>
                <div
                  v-if="selectedClient?.companyParticulars?.contactDetails?.fax"
                >
                  <label class="block text-sm font-medium text-gray-700"
                    >Fax</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClient.companyParticulars.contactDetails.fax }}
                  </div>
                </div>
                <div
                  v-if="
                    selectedClient?.companyParticulars?.contactDetails?.website
                  "
                >
                  <label class="block text-sm font-medium text-gray-700"
                    >Website</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient.companyParticulars.contactDetails.website
                    }}
                  </div>
                </div>
              </div>

              <!-- Business Information -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >MSIC Code</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClient?.companyParticulars?.msicCode || 'N/A' }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >MSIC Description</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.msicDescription ||
                      'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Principal Activities</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.principalActivities ||
                      'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Business Nature</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.businessNature ||
                      'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Paid Up Capital</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    RM
                    {{
                      selectedClient?.companyParticulars?.paidUpCapital?.toLocaleString() ||
                      'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Authorized Capital</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    RM
                    {{
                      selectedClient?.companyParticulars?.authorizedCapital?.toLocaleString() ||
                      'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Financial Year End</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.financialYearEnd ||
                      'N/A'
                    }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Commencement Date</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{
                      selectedClient?.companyParticulars?.commencementDate ||
                      'N/A'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Auditor Particulars -->
          <div
            v-if="selectedClient?.auditorParticulars"
            class="rounded-lg border p-4"
          >
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Auditor Particulars
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Firm Name</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.auditorParticulars.firmName || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Registration Number</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient.auditorParticulars.registrationNumber ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Partner in Charge</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient.auditorParticulars.partnerInCharge || 'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Audit Fee</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient.auditorParticulars.auditFee?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700"
                  >Address</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.auditorParticulars.address || 'N/A' }}<br />
                  {{ selectedClient.auditorParticulars.city || '' }}
                  {{ selectedClient.auditorParticulars.postcode || '' }}
                  {{ selectedClient.auditorParticulars.state || '' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Phone</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.auditorParticulars.phone || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Email</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.auditorParticulars.email || 'N/A' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tax Agent Particulars -->
          <div
            v-if="selectedClient?.taxAgentParticulars"
            class="rounded-lg border p-4"
          >
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Tax Agent Particulars
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Agent Name</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.taxAgentParticulars.agentName || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Registration Number</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{
                    selectedClient.taxAgentParticulars.registrationNumber ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Tax Agent Fee</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient.taxAgentParticulars.taxAgentFee?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700"
                  >Address</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.taxAgentParticulars.address || 'N/A'
                  }}<br />
                  {{ selectedClient.taxAgentParticulars.city || '' }}
                  {{ selectedClient.taxAgentParticulars.postcode || '' }}
                  {{ selectedClient.taxAgentParticulars.state || '' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Phone</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.taxAgentParticulars.phone || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Email</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient.taxAgentParticulars.email || 'N/A' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Data -->
          <div class="rounded-lg border p-4">
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Financial Data
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Revenue</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.revenue?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Gross Profit</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.grossProfit?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Net Profit</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.netProfit?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Total Assets</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.totalAssets?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Total Liabilities</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.totalLiabilities?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Shareholders Equity</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.shareholdersEquity?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Cash Flow</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.cashFlow?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Previous Year Revenue</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.previousYearRevenue?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Previous Year Profit</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.financialData?.previousYearProfit?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Tax Information -->
          <div class="rounded-lg border p-4">
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Tax Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Previous Year Tax Paid</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.taxInformation?.previousYearTaxPaid?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Estimated Tax Payable</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.taxInformation?.estimatedTaxPayable?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Installment Payments</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.taxInformation?.installmentPayments?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Withholding Tax Paid</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM
                  {{
                    selectedClient?.taxInformation?.witholdingTaxPaid?.toLocaleString() ||
                    'N/A'
                  }}
                </div>
              </div>
              <div v-if="selectedClient?.taxInformation?.cp204A">
                <label class="block text-sm font-medium text-gray-700"
                  >CP204A</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM {{ selectedClient.taxInformation.cp204A.toLocaleString() }}
                </div>
              </div>
              <div v-if="selectedClient?.taxInformation?.cp204">
                <label class="block text-sm font-medium text-gray-700"
                  >CP204</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  RM {{ selectedClient.taxInformation.cp204.toLocaleString() }}
                </div>
              </div>
              <div
                v-if="selectedClient?.taxInformation?.taxExemptions?.length"
                class="col-span-2"
              >
                <label class="block text-sm font-medium text-gray-700"
                  >Tax Exemptions</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  <div
                    v-for="exemption in selectedClient.taxInformation
                      .taxExemptions"
                    :key="exemption"
                    class="mb-1 mr-2 inline-block"
                  >
                    <span
                      class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                      >{{ exemption }}</span
                    >
                  </div>
                </div>
              </div>
              <div
                v-if="selectedClient?.taxInformation?.incentivesApplied?.length"
                class="col-span-2"
              >
                <label class="block text-sm font-medium text-gray-700"
                  >Incentives Applied</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  <div
                    v-for="incentive in selectedClient.taxInformation
                      .incentivesApplied"
                    :key="incentive"
                    class="mb-1 mr-2 inline-block"
                  >
                    <span
                      class="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                      >{{ incentive }}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Client Status & Timestamps -->
          <div class="rounded-lg border p-4">
            <h4 class="mb-4 text-lg font-semibold text-blue-600">
              Client Status & Information
            </h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Status</label
                >
                <div class="mt-1">
                  <span
                    :class="{
                      'rounded-full px-2 py-1 text-xs': true,
                      'bg-green-100 text-green-800':
                        selectedClient?.status === 'ACTIVE',
                      'bg-red-100 text-red-800':
                        selectedClient?.status === 'INACTIVE',
                      'bg-yellow-100 text-yellow-800':
                        selectedClient?.status === 'DORMANT',
                    }"
                  >
                    {{ selectedClient?.status || 'N/A' }}
                  </span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Client ID</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.id || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Created Time</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.createdTime || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Last Modified</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.lastModifiedTime || 'N/A' }}
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Last Contact</label
                >
                <div class="mt-1 text-sm text-gray-900">
                  {{ selectedClient?.lastContactTime || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Income Statement -->
        <div
          v-else-if="selectedSection.type === 'income_statement'"
          class="space-y-6"
        >
          <IncomeStatement
            :editable="true"
            :show-adjustments="true"
            :show-tax-analysis="true"
            company-name="COMPANY SDN BHD"
            reporting-period="PROFIT & LOSS ACCOUNT FOR THE MONTH ENDED 31ST DEC 2024"
            @data-change="handleIncomeStatementChange"
            @adjustment-click="handleAdjustmentClick"
          />
        </div>

        <!-- Balance Sheet -->
        <div
          v-else-if="selectedSection.type === 'balance_sheet'"
          class="space-y-6"
        >
          <BalanceSheet
            :editable="true"
            company-name="COMPANY SDN BHD"
            reporting-period="Financial Position Overview - As at 31 December 2023"
            @data-change="handleBalanceSheetChange"
          />
        </div>

        <!-- Uploaded Files -->
        <div
          v-else-if="selectedSection.type === 'uploaded_files'"
          class="space-y-4"
        >
          <div class="mb-4">
            <h3 class="text-lg font-semibold">Uploaded Documents</h3>
            <p class="text-sm">
              View and manage uploaded files for tax computation
            </p>
          </div>

          <div class="space-y-3">
            <div
              v-for="file in selectedSection.data.files"
              :key="file.name"
              class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
            >
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-blue-100 p-2">
                  <FileTextOutlined class="text-lg text-blue-600" />
                </div>
                <div class="flex-1">
                  <div class="font-medium">{{ file.name }}</div>
                  <div class="text-sm text-gray-500">
                    {{ file.size }} • Uploaded {{ file.uploadDate }}
                  </div>
                  <div class="mt-1 text-xs">
                    {{ file.type || 'Document' }}
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <Button
                  size="small"
                  type="primary"
                  ghost
                  @click="viewFile(file)"
                >
                  <EyeOutlined class="mr-1" />
                  View
                </Button>
                <Button size="small" type="default" @click="downloadFile(file)">
                  <DownloadOutlined class="mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes to Account Section -->
        <div
          v-else-if="selectedSection.type === 'notes_to_account'"
          class="space-y-6"
        >
          <!-- All Income Statement Items for Notes -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">
                Income Statement Items - Notes to Account
              </h3>
              <div class="flex items-center gap-3">
                <div
                  class="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                >
                  {{ filteredIncomeStatementItems.length }}/{{
                    allIncomeStatementItems.length
                  }}
                  {{ allIncomeStatementItems.length === 1 ? 'Item' : 'Items' }}
                </div>
                <Button type="primary" @click="addNewAdjustmentNote">
                  Add Standalone Note
                </Button>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="relative">
              <div
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
              >
                <svg
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search items by name, section, or classification..."
                class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg
                  class="h-4 w-4 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <!-- Items Container with Fixed Height -->
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <!-- Items List -->
              <div
                class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
              >
                <!-- Items Table Header -->
                <div
                  class="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50"
                >
                  <div
                    class="grid grid-cols-5 gap-2 p-3 text-xs font-semibold text-gray-700"
                  >
                    <div class="text-center">#</div>
                    <div>Item Name</div>
                    <div>Section</div>
                    <div class="text-center">Classification</div>
                    <div class="text-center">Notes</div>
                  </div>
                </div>

                <!-- Scrollable Items Container -->
                <div class="h-96 overflow-y-auto">
                  <div
                    v-for="(item, index) in filteredIncomeStatementItems"
                    :key="item.id"
                    class="cursor-pointer border-b border-gray-100 transition-all duration-150 last:border-b-0 hover:bg-blue-50"
                    :class="{
                      'border-blue-200 bg-blue-100':
                        selectedItemForDetails?.id === item.id,
                    }"
                    @click="selectItemForDetails(item)"
                  >
                    <div class="grid grid-cols-5 items-center gap-2 p-3">
                      <div
                        class="text-center text-xs font-medium text-gray-900"
                      >
                        {{ index + 1 }}
                      </div>
                      <div
                        class="truncate text-xs font-medium text-gray-900"
                        :title="item.name"
                      >
                        {{ item.name }}
                      </div>
                      <div
                        class="truncate text-xs text-gray-600"
                        :title="item.section"
                      >
                        {{ item.section }}
                      </div>
                      <div class="text-center">
                        <span
                          v-if="item.allowability === 'exempt'"
                          class="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800"
                        >
                          Exempt
                        </span>
                        <span
                          v-else-if="item.allowability === 'disallowed'"
                          class="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800"
                        >
                          Disallow
                        </span>
                        <span
                          v-else-if="item.allowability === 'partial'"
                          class="inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800"
                        >
                          Partial
                        </span>
                        <span
                          v-else-if="item.allowability === 'taxable'"
                          class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800"
                        >
                          Taxable
                        </span>
                        <span
                          v-else
                          class="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800"
                        >
                          Allowed
                        </span>
                      </div>
                      <div class="text-center">
                        <span
                          v-if="item.notesCount > 0"
                          class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800"
                        >
                          {{ item.notesCount }}
                        </span>
                        <span v-else class="text-xs text-gray-400">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Item Details Panel -->
              <div
                class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
              >
                <div v-if="selectedItemForDetails" class="flex h-96 flex-col">
                  <!-- Item Details Header -->
                  <div
                    class="border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 p-4"
                  >
                    <div class="flex items-center justify-between">
                      <h4 class="text-lg font-semibold text-gray-900">
                        Item Details
                      </h4>
                      <button
                        @click="clearItemSelection"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          class="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <div class="mt-2 space-y-2">
                      <div class="text-sm font-medium text-gray-900">
                        {{ selectedItemForDetails.name }}
                      </div>
                      <div
                        class="flex items-center gap-4 text-sm text-gray-600"
                      >
                        <span>{{ selectedItemForDetails.section }}</span>
                        <span class="font-mono font-semibold"
                          >RM
                          {{
                            formatNumber(selectedItemForDetails.amount)
                          }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Notes/Adjustments Content -->
                  <div class="flex-1 overflow-y-auto p-4">
                    <div class="space-y-4">
                      <!-- Quick Actions -->
                      <div class="flex gap-2">
                        <Button
                          size="small"
                          type="primary"
                          @click="
                            openItemAdjustmentNotes(selectedItemForDetails)
                          "
                        >
                          Add/Edit Notes
                        </Button>
                        <Button
                          size="small"
                          @click="
                            () => {
                              selectedExpenseIndex = selectedItemForDetails.id;
                              adjustmentNotesModalApi.open();
                            }
                          "
                        >
                          Quick Add
                        </Button>
                      </div>

                      <!-- Existing Notes -->
                      <div v-if="getSelectedItemNotes.length > 0">
                        <h5 class="mb-2 text-sm font-medium text-gray-900">
                          Existing Notes ({{ getSelectedItemNotes.length }})
                        </h5>
                        <div class="space-y-2">
                          <div
                            v-for="note in getSelectedItemNotes"
                            :key="note.noteId"
                            class="rounded-lg border bg-gray-50 p-3"
                          >
                            <div class="flex items-start justify-between">
                              <div class="flex-1">
                                <div class="text-sm font-medium text-gray-900">
                                  {{
                                    note.note.description || 'No description'
                                  }}
                                </div>
                                <div class="mt-1 text-xs text-gray-500">
                                  {{ note.note.date || 'No date' }} •
                                  {{ note.note.payee || 'No payee' }}
                                </div>
                                <div class="mt-2 flex items-center gap-2">
                                  <span
                                    v-if="note.note.s390"
                                    class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                                  >
                                    S.39(1)
                                  </span>
                                  <span
                                    v-if="note.note.s60f"
                                    class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                                  >
                                    S.60F
                                  </span>
                                  <span
                                    v-if="note.note.amount"
                                    class="font-mono text-xs text-gray-600"
                                  >
                                    RM {{ formatNumber(note.note.amount) }}
                                  </span>
                                </div>
                              </div>
                              <button
                                @click="editNote(note)"
                                class="text-blue-600 hover:text-blue-800"
                                title="Edit note"
                              >
                                <svg
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  ></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- No Notes State -->
                      <div v-else class="py-8 text-center">
                        <svg
                          class="mx-auto mb-4 h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          ></path>
                        </svg>
                        <p class="mb-4 text-sm text-gray-500">
                          No notes or adjustments for this item yet.
                        </p>
                        <Button
                          size="small"
                          type="primary"
                          @click="
                            openItemAdjustmentNotes(selectedItemForDetails)
                          "
                        >
                          Add First Note
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Selection State -->
                <div v-else class="flex h-96 items-center justify-center">
                  <div class="text-center">
                    <svg
                      class="mx-auto mb-4 h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      ></path>
                    </svg>
                    <p class="text-sm text-gray-500">
                      Click on an item from the list to view its details and
                      manage notes/adjustments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Existing Notes Summary -->
          <div v-if="allAdjustmentNotes.length > 0" class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-lg font-semibold text-gray-900">
                All Existing Notes
              </h4>
              <div
                class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800"
              >
                {{ allAdjustmentNotes.length }}
                {{ allAdjustmentNotes.length === 1 ? 'Note' : 'Notes' }}
              </div>
            </div>

            <div
              class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            >
              <!-- Adjustment Notes Table Header -->
              <div
                class="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50"
              >
                <div
                  class="grid grid-cols-8 gap-4 p-4 text-sm font-semibold text-gray-700"
                >
                  <div class="text-center">#</div>
                  <div class="text-center">Source Item</div>
                  <div class="text-center">Date</div>
                  <div class="text-center">Payee</div>
                  <div class="text-center">Description</div>
                  <div class="text-center">S.39(1)</div>
                  <div class="text-center">S.60F</div>
                  <div class="text-center">Actions</div>
                </div>
              </div>

              <!-- Adjustment Notes Rows -->
              <div
                v-for="(adjustmentNote, index) in allAdjustmentNotes"
                :key="adjustmentNote.noteId"
                class="border-b border-gray-100 transition-colors duration-150 last:border-b-0 hover:bg-gray-50"
              >
                <div class="grid grid-cols-8 items-center gap-4 p-4">
                  <div class="text-center text-sm font-medium text-gray-500">
                    {{ index + 1 }}
                  </div>
                  <div class="text-sm font-medium text-blue-600">
                    {{ adjustmentNote.linkedItemName || 'Standalone' }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ adjustmentNote.note.date || '-' }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ adjustmentNote.note.payee || '-' }}
                  </div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ adjustmentNote.note.description }}
                  </div>
                  <div class="text-center">
                    <span
                      v-if="adjustmentNote.note.s390"
                      class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                    >
                      <svg
                        class="mr-1 h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      Yes
                    </span>
                    <span v-else class="text-xs text-gray-400">-</span>
                  </div>
                  <div class="text-center">
                    <span
                      v-if="adjustmentNote.note.s60f"
                      class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      <svg
                        class="mr-1 h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                      Yes
                    </span>
                    <span v-else class="text-xs text-gray-400">-</span>
                  </div>

                  <div class="text-center">
                    <div class="flex justify-center gap-2">
                      <button
                        @click="viewNote(adjustmentNote)"
                        class="rounded-lg p-2 text-blue-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                        title="View note"
                      >
                        <svg
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        @click="editNote(adjustmentNote)"
                        class="rounded-lg p-2 text-green-600 transition-colors duration-150 hover:bg-green-50 hover:text-green-700"
                        title="Edit note"
                      >
                        <svg
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          ></path>
                        </svg>
                      </button>
                      <button
                        @click="deleteNote(adjustmentNote)"
                        class="rounded-lg p-2 text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
                        title="Delete note"
                      >
                        <svg
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Notes to Account -->
          <div v-else class="flex flex-col items-center justify-center py-16">
            <div class="mb-6 rounded-full bg-gray-100 p-6">
              <svg
                class="h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              No Adjustment Notes
            </h3>
            <p class="mb-6 max-w-md text-center text-gray-500">
              No adjustment notes have been created yet. Adjustment notes will
              appear here once you start adding notes to financial statement
              items.
            </p>
            <div class="rounded-lg bg-blue-50 p-4">
              <div class="flex items-start">
                <svg
                  class="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-blue-800">
                    How to add adjustment notes
                  </h4>
                  <p class="mt-1 text-sm text-blue-700">
                    Navigate to the Income Statement or Balance Sheet sections
                    and click on any line item to add adjustment notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Default view for other sections -->
        <div v-else class="space-y-4">
          <p class="">
            This section contains details for {{ selectedSection.title }}.
          </p>
          <div class="rounded-lg bg-gray-50 p-4">
            <p class="text-sm text-gray-500">
              Section data will be displayed here when available.
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button @click="closeModal">Close</Button>
      </template>
    </SectionModal>

    <!-- Adjustment Notes Modal -->
    <AdjustmentNotesModal
      :visible="isAdjustmentNotesModalOpen"
      :selectedExpenseIndex="selectedExpenseIndex"
      :section39Eligibility="section39Eligibility"
      :linkedItem="selectedExpense || selectedItemForDetails"
      @update:visible="
        (visible) =>
          visible
            ? adjustmentNotesModalApi.open()
            : adjustmentNotesModalApi.close()
      "
      @close="closeAdjustmentModal"
    />

    <!-- Adjustments & Claims Modal -->
    <AdjustmentsClaimsModal>
      <div class="space-y-6">
        <!-- Header with totals -->
        <div class="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div class="text-center">
            <div class="text-sm">Total Disallowable Expenses</div>
            <div class="text-lg font-semibold text-red-600">
              RM {{ formatNumber(adjustmentsClaimsTotals.totalDisallowable) }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm">Total Claims on Deduction</div>
            <div class="text-lg font-semibold text-green-600">
              RM {{ formatNumber(adjustmentsClaimsTotals.totalClaims) }}
            </div>
          </div>
        </div>

        <!-- ALL Income Statement Items -->
        <div v-if="allIncomeStatementItems.length > 0" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              All Income Statement Items
            </h3>
            <div class="flex items-center gap-3">
              <div
                class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
              >
                {{ filteredIncomeStatementItems.length }}/{{
                  allIncomeStatementItems.length
                }}
                {{ allIncomeStatementItems.length === 1 ? 'Item' : 'Items' }}
              </div>
              <Button
                type="primary"
                @click="
                  () => {
                    selectedExpenseIndex = 'standalone';
                    adjustmentNotesModalApi.open();
                  }
                "
              >
                Add New Adjustment
              </Button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative">
            <div
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
            >
              <svg
                class="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search items by name, section, or classification..."
              class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg
                class="h-4 w-4 text-gray-400 hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Items Container with Fixed Height -->
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Items List -->
            <div
              class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            >
              <!-- Items Table Header -->
              <div
                class="sticky top-0 z-10 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50"
              >
                <div
                  class="grid grid-cols-5 gap-2 p-3 text-xs font-semibold text-gray-700"
                >
                  <div class="text-center">#</div>
                  <div>Item Name</div>
                  <div>Section</div>
                  <div class="text-center">Classification</div>
                  <div class="text-center">Notes</div>
                </div>
              </div>

              <!-- Scrollable Items Container -->
              <div class="h-96 overflow-y-auto">
                <div
                  v-for="(item, index) in filteredIncomeStatementItems"
                  :key="item.id"
                  class="cursor-pointer border-b border-gray-100 transition-all duration-150 last:border-b-0 hover:bg-blue-50"
                  :class="{
                    'border-blue-200 bg-blue-100':
                      selectedItemForDetails?.id === item.id,
                  }"
                  @click="selectItemForDetails(item)"
                >
                  <div class="grid grid-cols-5 items-center gap-2 p-3">
                    <div class="text-center text-xs font-medium text-gray-900">
                      {{ index + 1 }}
                    </div>
                    <div
                      class="truncate text-xs font-medium text-gray-900"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </div>
                    <div
                      class="truncate text-xs text-gray-600"
                      :title="item.section"
                    >
                      {{ item.section }}
                    </div>
                    <div class="text-center">
                      <span
                        v-if="item.allowability === 'exempt'"
                        class="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        Exempt
                      </span>
                      <span
                        v-else-if="item.allowability === 'disallowed'"
                        class="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800"
                      >
                        Disallow
                      </span>
                      <span
                        v-else-if="item.allowability === 'partial'"
                        class="inline-flex items-center rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800"
                      >
                        Partial
                      </span>
                      <span
                        v-else-if="item.allowability === 'taxable'"
                        class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800"
                      >
                        Taxable
                      </span>
                      <span
                        v-else
                        class="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-800"
                      >
                        Allowed
                      </span>
                    </div>
                    <div class="text-center">
                      <span
                        v-if="item.notesCount > 0"
                        class="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800"
                      >
                        {{ item.notesCount }}
                      </span>
                      <span v-else class="text-xs text-gray-400">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Selected Item Details Panel -->
            <div
              class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
            >
              <div v-if="selectedItemForDetails" class="flex h-96 flex-col">
                <!-- Item Details Header -->
                <div
                  class="border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 p-4"
                >
                  <div class="flex items-center justify-between">
                    <h4 class="text-lg font-semibold text-gray-900">
                      Item Details
                    </h4>
                    <button
                      @click="clearItemSelection"
                      class="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                  <div class="mt-2 space-y-2">
                    <div class="text-sm font-medium text-gray-900">
                      {{ selectedItemForDetails.name }}
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <span>{{ selectedItemForDetails.section }}</span>
                      <span class="font-mono font-semibold"
                        >RM
                        {{ formatNumber(selectedItemForDetails.amount) }}</span
                      >
                    </div>
                  </div>
                </div>

                <!-- Notes/Adjustments Content -->
                <div class="flex-1 overflow-y-auto p-4">
                  <div class="space-y-4">
                    <!-- Quick Actions -->
                    <div class="flex gap-2">
                      <Button
                        size="small"
                        type="primary"
                        @click="openItemAdjustmentNotes(selectedItemForDetails)"
                      >
                        Add/Edit Notes
                      </Button>
                      <Button
                        size="small"
                        @click="
                          () => {
                            selectedExpenseIndex = selectedItemForDetails.id;
                            adjustmentNotesModalApi.open();
                          }
                        "
                      >
                        Quick Add
                      </Button>
                    </div>

                    <!-- Existing Notes -->
                    <div v-if="getSelectedItemNotes.length > 0">
                      <h5 class="mb-2 text-sm font-medium text-gray-900">
                        Existing Notes ({{ getSelectedItemNotes.length }})
                      </h5>
                      <div class="space-y-2">
                        <div
                          v-for="note in getSelectedItemNotes"
                          :key="note.noteId"
                          class="rounded-lg border bg-gray-50 p-3"
                        >
                          <div class="flex items-start justify-between">
                            <div class="flex-1">
                              <div class="text-sm font-medium text-gray-900">
                                {{ note.note.description || 'No description' }}
                              </div>
                              <div class="mt-1 text-xs text-gray-500">
                                {{ note.note.date || 'No date' }} •
                                {{ note.note.payee || 'No payee' }}
                              </div>
                              <div class="mt-2 flex items-center gap-2">
                                <span
                                  v-if="note.note.s390"
                                  class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                                >
                                  S.39(1)
                                </span>
                                <span
                                  v-if="note.note.s60f"
                                  class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                                >
                                  S.60F
                                </span>
                                <span
                                  v-if="note.note.amount"
                                  class="font-mono text-xs text-gray-600"
                                >
                                  RM {{ formatNumber(note.note.amount) }}
                                </span>
                              </div>
                            </div>
                            <button
                              @click="editNote(note)"
                              class="text-blue-600 hover:text-blue-800"
                              title="Edit note"
                            >
                              <svg
                                class="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                ></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- No Notes State -->
                    <div v-else class="py-8 text-center">
                      <svg
                        class="mx-auto mb-4 h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      <p class="mb-4 text-sm text-gray-500">
                        No notes or adjustments for this item yet.
                      </p>
                      <Button
                        size="small"
                        type="primary"
                        @click="openItemAdjustmentNotes(selectedItemForDetails)"
                      >
                        Add First Note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Selection State -->
              <div v-else class="flex h-96 items-center justify-center">
                <div class="text-center">
                  <svg
                    class="mx-auto mb-4 h-16 w-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    ></path>
                  </svg>
                  <p class="text-sm text-gray-500">
                    Click on an item from the list to view its details and
                    manage notes/adjustments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Adjustments & Claims (using Adjustment Notes) -->
        <div v-if="adjustmentsClaimsNotes.length > 0" class="space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-gray-900">
              Adjustments & Claims
            </h3>
            <div class="flex items-center gap-3">
              <div
                class="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800"
              >
                {{ adjustmentsClaimsNotes.length }}
                {{ adjustmentsClaimsNotes.length === 1 ? 'Item' : 'Items' }}
              </div>
              <Button
                type="primary"
                @click="
                  () => {
                    selectedExpenseIndex = 'standalone';
                    adjustmentNotesModalApi.open();
                  }
                "
              >
                Add New
              </Button>
            </div>
          </div>

          <div
            class="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
          >
            <!-- Adjustment Notes Table Header -->
            <div
              class="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50"
            >
              <div
                class="grid grid-cols-9 gap-4 p-4 text-sm font-semibold text-gray-700"
              >
                <div class="text-center">#</div>
                <div>Source Item</div>
                <div>Date</div>
                <div>Payee</div>
                <div>Description</div>
                <div class="text-center">S.39(1)</div>
                <div class="text-center">S.60F</div>
                <div class="text-right">Amount</div>
                <div class="text-center">Actions</div>
              </div>
            </div>

            <!-- Adjustment Notes Rows -->
            <div
              v-for="(adjustmentNote, index) in adjustmentsClaimsNotes"
              :key="adjustmentNote.noteId"
              class="border-b border-gray-100 transition-colors duration-150 last:border-b-0 hover:bg-gray-50"
            >
              <div class="grid grid-cols-9 items-center gap-4 p-4">
                <div class="text-center text-sm font-medium text-gray-900">
                  {{ index + 1 }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ adjustmentNote.linkedItemName || 'Standalone' }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ adjustmentNote.note.date || '-' }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ adjustmentNote.note.payee || '-' }}
                </div>
                <div class="text-sm font-medium text-gray-900">
                  {{ adjustmentNote.note.description }}
                </div>
                <div class="text-center">
                  <span
                    v-if="adjustmentNote.note.s390"
                    class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                  >
                    <svg
                      class="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Yes
                  </span>
                  <span v-else class="text-xs text-gray-400">-</span>
                </div>
                <div class="text-center">
                  <span
                    v-if="adjustmentNote.note.s60f"
                    class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                  >
                    <svg
                      class="mr-1 h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                    Yes
                  </span>
                  <span v-else class="text-xs text-gray-400">-</span>
                </div>
                <div
                  class="text-right font-mono text-sm font-semibold text-gray-900"
                >
                  RM {{ formatNumber(adjustmentNote.note.amount || 0) }}
                </div>

                <div class="text-center">
                  <div class="flex justify-center gap-2">
                    <button
                      @click="viewNote(adjustmentNote)"
                      class="rounded-lg p-2 text-blue-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                      title="View note"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    </button>
                    <button
                      @click="editNote(adjustmentNote)"
                      class="rounded-lg p-2 text-green-600 transition-colors duration-150 hover:bg-green-50 hover:text-green-700"
                      title="Edit note"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State for Adjustments & Claims -->
        <div
          v-else-if="
            adjustmentsClaimsItems.length === 0 &&
            adjustmentsClaimsNotes.length === 0
          "
          class="flex flex-col items-center justify-center py-16"
        >
          <div class="mb-6 rounded-full bg-gray-100 p-6">
            <svg
              class="h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-semibold text-gray-900">
            No Adjustments & Claims
          </h3>
          <p class="mb-6 max-w-md text-center text-gray-500">
            No adjustments or claims have been recorded yet. Start by reviewing
            your financial statements and adding adjustment notes where needed.
          </p>
          <div class="space-y-4">
            <Button type="primary" @click="addNewAdjustmentNote" class="w-full">
              Add New Adjustment
            </Button>
            <div class="rounded-lg bg-purple-50 p-4">
              <div class="flex items-start">
                <svg
                  class="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-purple-800">
                    Getting started
                  </h4>
                  <p class="mt-1 text-sm text-purple-700">
                    Review your Income Statement and Balance Sheet to identify
                    items that require adjustments or qualify for tax
                    deductions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button @click="closeAdjustmentsClaimsModal">Cancel</Button>
        <Button type="primary" @click="closeAdjustmentsClaimsModal"
          >Save Changes</Button
        >
      </template>
    </AdjustmentsClaimsModal>

    <!-- Shared Profit & Loss Statement Modal -->
    <ProfitLossStatementModal
      ref="statementModalRef"
      :show-single-review-button="true"
      v-model:statement-type="currentStatementType"
    />

    <!-- Income Modals -->
    <DividendIncomeModal ref="dividendModalRef" @save="handleDividendSave" />

    <InterestIncomeModal ref="interestModalRef" @save="handleInterestSave" />

    <RentalIncomeModal ref="rentalModalRef" @save="handleRentalSave" />

    <CapitalAllowanceModal
      ref="capitalAllowanceModalRef"
      @save="handleCapitalAllowanceSave"
    />

    <!-- Edit Adjustment Note Modal -->
    <Modal
      v-model:open="showEditModal"
      title="Edit Adjustment Note"
      width="600px"
      @ok="saveEditedNote"
      @cancel="cancelEdit"
    >
      <div v-if="editingNote" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Date</label
            >
            <Input v-model:value="editingNote.date" placeholder="DD/MM/YYYY" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Payee</label
            >
            <Input v-model:value="editingNote.payee" placeholder="Payee" />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700"
            >Description</label
          >
          <Input
            v-model:value="editingNote.description"
            placeholder="Description"
          />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Amount (RM)</label
            >
            <InputNumber
              v-model:value="editingNote.amount"
              :precision="2"
              :step="0.01"
              class="w-full"
            />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700"
              >Absorb %</label
            >
            <InputNumber
              v-model:value="editingNote.absorb"
              :precision="2"
              :step="0.01"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <div>
              <Checkbox v-model:checked="editingNote.s390">S.39(1)</Checkbox>
            </div>
            <div>
              <Checkbox v-model:checked="editingNote.s60f">S.60F</Checkbox>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- View Adjustment Note Modal -->
    <Modal
      v-model:open="showViewModal"
      title="View Adjustment Note"
      width="700px"
      :footer="null"
      @cancel="closeViewModal"
    >
      <div v-if="viewingNote" class="space-y-6">
        <!-- Linked Item Info -->
        <div
          v-if="viewingNote.linkedItemName"
          class="rounded-lg bg-blue-50 p-4"
        >
          <h4 class="mb-1 text-sm font-medium text-blue-800">
            Linked to Financial Item
          </h4>
          <p class="text-sm text-blue-700">{{ viewingNote.linkedItemName }}</p>
        </div>

        <!-- Note Details -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <p class="mt-1 text-sm text-gray-900">
              {{ viewingNote.note.date || '-' }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Payee</label>
            <p class="mt-1 text-sm text-gray-900">
              {{ viewingNote.note.payee || '-' }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <p class="mt-1 text-sm text-gray-900">
            {{ viewingNote.note.description || '-' }}
          </p>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Amount</label
            >
            <p class="mt-1 text-sm font-semibold text-gray-900">
              RM {{ formatNumber(viewingNote.note.amount || 0) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Absorb %</label
            >
            <p class="mt-1 text-sm text-gray-900">
              {{ viewingNote.note.absorb || 0 }}%
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Tax Sections</label
            >
            <div class="mt-1 space-y-1">
              <span
                v-if="viewingNote.note.s390"
                class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                S.39(1)
              </span>
              <span
                v-if="viewingNote.note.s60f"
                class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
              >
                S.60F
              </span>
              <span
                v-if="!viewingNote.note.s390 && !viewingNote.note.s60f"
                class="text-xs text-gray-400"
              >
                None
              </span>
            </div>
          </div>
        </div>

        <!-- Deduction Items -->
        <div
          v-if="
            viewingNote.note.deductionItems &&
            viewingNote.note.deductionItems.length > 0
          "
        >
          <label class="mb-2 block text-sm font-medium text-gray-700"
            >Deduction Items</label
          >
          <div class="overflow-hidden rounded-lg border">
            <div class="border-b bg-gray-50 px-4 py-2">
              <div
                class="grid grid-cols-3 gap-4 text-xs font-medium text-gray-700"
              >
                <div>Description</div>
                <div class="text-right">Amount</div>
                <div>Type</div>
              </div>
            </div>
            <div class="divide-y">
              <div
                v-for="item in viewingNote.note.deductionItems"
                :key="item.id"
                class="px-4 py-2"
              >
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div>{{ item.description }}</div>
                  <div class="text-right font-medium">
                    RM {{ formatNumber(item.amount) }}
                  </div>
                  <div>
                    <span
                      :class="
                        item.type === 'disallowable'
                          ? 'text-red-600'
                          : 'text-green-600'
                      "
                      class="capitalize"
                    >
                      {{ item.type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state when no note data -->
      <div v-else class="rounded bg-gray-50 p-4 text-center text-sm">
        <p class="text-gray-500">No note data available</p>
      </div>
    </Modal>
  </div>
</template>
