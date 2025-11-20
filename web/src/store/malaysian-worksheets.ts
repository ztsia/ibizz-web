import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import {
  FileTextOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
} from '@ant-design/icons-vue';

// Types
export interface MalaysianTaxWorksheet {
  code: string;
  description: string;
  section: string;
  status: 'pending' | 'in-progress' | 'completed';
  lastUpdated: Date;
  formData?: Record<string, any>;
  legalBasis?: string;
  purpose?: string;
  requiredDocuments?: string[];
  keyFields?: string[];
  relatedForms?: string[];
}

export interface WorksheetSection {
  id: string;
  title: string;
  icon?: any;
  worksheets: MalaysianTaxWorksheet[];
}

export interface WorksheetSession {
  sessionId: string;
  worksheets: MalaysianTaxWorksheet[];
  lastUpdated: number;
  completionStats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
}

export interface CompletionStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

// Storage key prefix
const STORAGE_PREFIX = 'malaysian-worksheets-session-';

// Comprehensive Malaysian Tax Worksheets - All Available Forms
const defaultWorksheets: MalaysianTaxWorksheet[] = [
  // Group 1: Main Forms - Primary computation forms
  {
    code: 'HK-PC1',
    description: 'Computation of statutory income for business',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose:
      'Computation of statutory income for businesses which have not been granted any tax incentive other than special deductions, further deductions and double deductions',
    requiredDocuments: [
      'Audited Financial Statements',
      'Trial Balance',
      'Tax Computation',
    ],
    keyFields: ['Gross Income', 'Allowable Deductions', 'Statutory Income'],
    relatedForms: ['HK-E', 'HK-C14'],
  },
  {
    code: 'HK-PC2',
    description: 'Computation of statutory income for partnership',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose: 'Computation of statutory income for partnership',
    requiredDocuments: [
      'Partnership Agreement',
      'Financial Statements',
      "Partners' Capital Accounts",
    ],
    keyFields: ['Partnership Income', "Partners' Share", 'Statutory Income'],
    relatedForms: ['HK-PC1', 'HK-E'],
  },
  {
    code: 'HK-PC3',
    description: 'Computation of statutory income for pioneer business',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis:
      'Section 5 to section 25 of the Promotion of Investments Act 1986',
    purpose: 'Computation of statutory income for pioneer business',
    requiredDocuments: [
      'Pioneer Status Certificate',
      'Financial Statements',
      'Production Records',
    ],
    keyFields: ['Pioneer Income', 'Tax Relief Period', 'Statutory Income'],
    relatedForms: ['HK-PC1', 'HK-PC4'],
  },
  {
    code: 'HK-PC4',
    description: 'Computation of statutory income for approved service project',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Paragraph 127(3)(a) and subsection 127(3A) of the ITA 1967',
    purpose: 'Computation of statutory income for approved service project',
    requiredDocuments: [
      'Approval Certificate',
      'Service Records',
      'Financial Statements',
    ],
    keyFields: ['Service Income', 'Approved Activities', 'Tax Exemption'],
    relatedForms: ['HK-PC3', 'HK-PC5'],
  },
  {
    code: 'HK-PC5',
    description:
      'Computation of statutory income for a company which has been granted Investment Tax Allowance (ITA) incentive',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis:
      'Section 26 to section 31 of the Promotion of Investments Act 1986, Income Tax (Exemption) (No. 10) Order 2021 [P.U. (A) 370/2021]',
    purpose:
      'Computation of statutory income for a company which has been granted Investment Tax Allowance (ITA) incentive P.U. (A) 370/2021',
    requiredDocuments: [
      'ITA Certificate',
      'Investment Records',
      'Qualifying Expenditure',
    ],
    keyFields: ['Investment Amount', 'Tax Allowance', 'Statutory Income'],
    relatedForms: ['HK-PC4', 'HK-PC6'],
  },
  {
    code: 'HK-PC6',
    description:
      'Computation of statutory income for a company which has been granted Schedule 7A and Schedule 7B',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose:
      'Computation of statutory income for a company which has been granted Schedule 7A and Schedule 7B',
    requiredDocuments: [
      'Schedule 7A Certificate',
      'Schedule 7B Certificate',
      'Investment Records',
    ],
    keyFields: [
      'Reinvestment Allowance',
      'Investment Allowance',
      'Statutory Income',
    ],
    relatedForms: ['HK-E1', 'HK-E2'],
  },
  {
    code: 'HK-E',
    description: 'Computation of Adjusted Income',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4, Income Tax Act 1967',
    purpose: 'Calculate adjusted income for corporate tax computation',
    requiredDocuments: [
      'Audited Financial Statements',
      'Trial Balance',
      'General Ledger',
    ],
    keyFields: [
      'Gross Income',
      'Allowable Deductions',
      'Adjustments',
      'Adjusted Income',
    ],
    relatedForms: ['HK-E1', 'HK-E2'],
  },
  {
    code: 'HK-E1',
    description: 'Summary of Schedule 7A allowance',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Schedule 7A, Income Tax Act 1967',
    purpose: 'Summary of reinvestment allowance under Schedule 7A',
    requiredDocuments: [
      'HK-E Form',
      'Reinvestment Records',
      'Qualifying Expenditure',
    ],
    keyFields: ['Reinvestment Amount', 'Allowance Rate', 'Total Allowance'],
    relatedForms: ['HK-E', 'HK-E2'],
  },
  {
    code: 'HK-E2',
    description: 'Summary of Schedule 7B allowance',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Schedule 7B, Income Tax Act 1967',
    purpose:
      'Summary of investment allowance for service sector under Schedule 7B',
    requiredDocuments: [
      'HK-E Form',
      'Investment Records',
      'Service Sector Certification',
    ],
    keyFields: ['Investment Amount', 'Allowance Rate', 'Total Allowance'],
    relatedForms: ['HK-E', 'HK-E1'],
  },

  // Group 2: Income Schedules - Detailed income computations
  {
    code: 'HK-C14',
    description: 'Computation of statutory income - dividends',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4(f), Income Tax Act 1967',
    purpose: 'Computation of statutory income from dividends',
    requiredDocuments: [
      'Dividend Vouchers',
      'Company Annual Reports',
      'Tax Deduction Certificates',
    ],
    keyFields: [
      'Dividend Amount',
      'Tax Deducted',
      'Franking Credits',
      'Net Dividend',
    ],
    relatedForms: ['HK-C16', 'SCH DI'],
  },
  {
    code: 'HK-C15',
    description: 'Computation of statutory income - interest/royalties',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4(f), Income Tax Act 1967',
    purpose: 'Computation of statutory income from interest and royalties',
    requiredDocuments: [
      'Interest Certificates',
      'Royalty Agreements',
      'Bank Statements',
    ],
    keyFields: [
      'Interest Amount',
      'Royalty Amount',
      'Tax Deducted',
      'Net Income',
    ],
    relatedForms: ['HK-C14', 'HK-C16'],
  },
  {
    code: 'HK-C16',
    description: 'Computation of statutory income - rents',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4A, Income Tax Act 1967',
    purpose: 'Computation of statutory income from rental properties',
    requiredDocuments: [
      'Rental Agreements',
      'Property Tax Receipts',
      'Maintenance Records',
      'Insurance Documents',
    ],
    keyFields: [
      'Gross Rental Income',
      'Allowable Expenses',
      'Adjusted Income from Rents',
      'Statutory Income from Rents',
    ],
    relatedForms: ['HK-C14', 'HK-C15'],
  },
  {
    code: 'HK-C16A',
    description: 'Computation of statutory income - rental business',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4, Income Tax Act 1967',
    purpose: 'Computation of statutory income from rental business activities',
    requiredDocuments: [
      'Business Registration',
      'Rental Records',
      'Business Expenses',
    ],
    keyFields: [
      'Business Rental Income',
      'Business Expenses',
      'Net Business Income',
    ],
    relatedForms: ['HK-C16', 'HK-PC1'],
  },

  // Group 3: Supporting Forms - Allowances, adjustments and special computations
  {
    code: 'HK',
    description: 'Summary of Schedule 3 allowance',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Schedule 3, Income Tax Act 1967',
    purpose: 'Summary of capital allowances under Schedule 3',
    requiredDocuments: [
      'Asset Register',
      'Purchase Invoices',
      'Disposal Records',
    ],
    keyFields: [
      'Asset Cost',
      'Allowance Rate',
      'Annual Allowance',
      'Balancing Charge',
    ],
    relatedForms: ['HK-E', 'HK-F'],
  },
  {
    code: 'HK-F',
    description: 'Summary of losses',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 43, Income Tax Act 1967',
    purpose: 'Summary of business losses available for offset',
    requiredDocuments: [
      'Loss Computation',
      'Previous Year Returns',
      'Audit Reports',
    ],
    keyFields: [
      'Current Year Loss',
      'Brought Forward Loss',
      'Loss Utilized',
      'Loss Carried Forward',
    ],
    relatedForms: ['HK-F1', 'HK-F2'],
  },
  {
    code: 'HK-F1',
    description:
      'Adjustment of losses for business and partnership that subject to losses restrictions',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 44, Income Tax Act 1967',
    purpose:
      'Adjustment of losses for business and partnership subject to loss restrictions',
    requiredDocuments: [
      'Shareholding Records',
      'Business Activity Records',
      'Loss Computation',
    ],
    keyFields: ['Restricted Losses', 'Allowable Losses', 'Adjustment Amount'],
    relatedForms: ['HK-F', 'HK-F2'],
  },
  {
    code: 'HK-F2',
    description:
      'Adjustment of losses for business and partnership during incentive period and not subject to losses restrictions',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose:
      'Adjustment of losses during incentive period not subject to restrictions',
    requiredDocuments: [
      'Incentive Certificate',
      'Loss Records',
      'Period Documentation',
    ],
    keyFields: [
      'Incentive Period Losses',
      'Adjustment Factor',
      'Adjusted Losses',
    ],
    relatedForms: ['HK-F', 'HK-F1'],
  },
  {
    code: 'HK-FIC',
    description: 'Financial particulars of company',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose: 'Financial particulars and details of company structure',
    requiredDocuments: [
      'Company Registration',
      'Financial Statements',
      'Shareholding Structure',
    ],
    keyFields: [
      'Share Capital',
      'Retained Earnings',
      'Total Assets',
      'Company Details',
    ],
    relatedForms: ['HK-O', 'HK-P'],
  },
  {
    code: 'HK-J',
    description: 'Income of preceding years not declared',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 91, Income Tax Act 1967',
    purpose:
      'Declaration of income from preceding years not previously declared',
    requiredDocuments: [
      'Previous Year Records',
      'Income Documentation',
      'Explanation Letter',
    ],
    keyFields: ['Undeclared Income', 'Year of Income', 'Penalty Calculation'],
    relatedForms: ['HK-PC1', 'HK-M'],
  },
  {
    code: 'HK-M',
    description: 'Particulars of withholding taxes',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 107A, Income Tax Act 1967',
    purpose: 'Details of withholding taxes deducted and paid',
    requiredDocuments: [
      'Withholding Tax Certificates',
      'Payment Vouchers',
      'Recipient Details',
    ],
    keyFields: ['Tax Withheld', 'Payment Date', 'Recipient Information'],
    relatedForms: ['HK-J', 'HK-O'],
  },
  {
    code: 'HK-O',
    description: 'Particulars of company directors',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Companies Act 2016',
    purpose: 'Details of company directors and their particulars',
    requiredDocuments: [
      "Directors' Register",
      'Appointment Letters',
      'Identity Documents',
    ],
    keyFields: [
      'Director Names',
      'Appointment Dates',
      'Shareholding',
      'Remuneration',
    ],
    relatedForms: ['HK-P', 'HK-FIC'],
  },
  {
    code: 'HK-P',
    description: "Particulars of company's major shareholders",
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Companies Act 2016',
    purpose: 'Details of major shareholders and their shareholding',
    requiredDocuments: [
      'Share Register',
      'Transfer Documents',
      'Shareholding Certificates',
    ],
    keyFields: [
      'Shareholder Names',
      'Share Percentage',
      'Share Class',
      'Voting Rights',
    ],
    relatedForms: ['HK-O', 'HK-FIC'],
  },

  // Additional PC Series Forms
  {
    code: 'HK-PC7',
    description:
      'Computation of statutory income for shipping business carried on by a resident company',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 54A of the ITA 1967',
    purpose:
      'Computation of statutory income for shipping business carried on by a resident company',
    requiredDocuments: [
      'Shipping License',
      'Vessel Registration',
      'Freight Records',
    ],
    keyFields: ['Shipping Income', 'Vessel Operations', 'Tax Computation'],
    relatedForms: ['HK-PC8', 'HK-PC1'],
  },
  {
    code: 'HK-PC8',
    description:
      'Computation of statutory income for sea and air transport business carried on by a non-resident company',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose:
      'Computation of statutory income for sea and air transport business carried on by a non-resident company',
    requiredDocuments: [
      'Transport License',
      'Route Documentation',
      'Revenue Records',
    ],
    keyFields: ['Transport Income', 'Route Operations', 'Non-Resident Tax'],
    relatedForms: ['HK-PC7', 'HK-PC9'],
  },
  {
    code: 'HK-PC9',
    description: 'Computation of statutory income for insurance business',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose: 'Computation of statutory income for insurance business',
    requiredDocuments: [
      'Insurance License',
      'Premium Records',
      'Claims Documentation',
    ],
    keyFields: ['Premium Income', 'Claims Paid', 'Insurance Reserves'],
    relatedForms: ['HK-PC8', 'HK-PC9A'],
  },
  {
    code: 'HK-PC9A',
    description: 'Computation of statutory income for takaful business',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose: 'Computation of statutory income for takaful business',
    requiredDocuments: [
      'Takaful License',
      'Contribution Records',
      'Tabarru Fund Records',
    ],
    keyFields: [
      'Takaful Contributions',
      'Tabarru Fund',
      'Surplus Distribution',
    ],
    relatedForms: ['HK-PC9', 'HK-PC10'],
  },
  {
    code: 'HK-PC10',
    description:
      'Computation of statutory income for a company entitled to claim exemption of income on increased exports under P.U. (A) 162/2019 – manufacturing company/company engaged in agriculture',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax (Exemption) (No. 5) Order 2019 [P.U. (A) 162/2019]',
    purpose:
      'Computation of statutory income for manufacturing/agriculture companies with export exemption',
    requiredDocuments: [
      'Export Records',
      'Manufacturing License',
      'Agriculture Certification',
    ],
    keyFields: ['Export Income', 'Increased Exports', 'Exemption Amount'],
    relatedForms: ['HK-PC10A', 'HK-PC10B'],
  },
  {
    code: 'HK-PC10A',
    description:
      'Computation of statutory income for a company entitled to claim exemption of income on the value of increased exports under P.U. (A) 161/2019',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax (Exemption) (No. 5) Order 2019 [P.U. (A) 161/2019]',
    purpose:
      'Computation for companies claiming exemption on increased export value',
    requiredDocuments: [
      'Export Value Records',
      'Baseline Export Data',
      'Exemption Certificate',
    ],
    keyFields: [
      'Export Value',
      'Baseline Value',
      'Increased Value',
      'Exemption Rate',
    ],
    relatedForms: ['HK-PC10', 'HK-PC10B'],
  },
  {
    code: 'HK-PC10B',
    description:
      'Budget 2008 - Computation of statutory income for a company entitled to claim exemption of income on the value of increased export of qualifying services',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Various Income Tax (Exemption) Orders',
    purpose: 'Budget 2008 provisions for service export exemption',
    requiredDocuments: [
      'Service Export Records',
      'Qualifying Service Certification',
      'Budget 2008 Documentation',
    ],
    keyFields: [
      'Service Export Value',
      'Qualifying Services',
      'Exemption Calculation',
    ],
    relatedForms: ['HK-PC10A', 'HK-PC10C'],
  },
  {
    code: 'HK-PC10C',
    description: 'Deleted',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'N/A',
    purpose: 'This form has been deleted and is no longer in use',
    requiredDocuments: ['N/A'],
    keyFields: ['N/A'],
    relatedForms: [],
  },
  {
    code: 'HK-PC10D',
    description:
      'Computation of statutory income for a company entitled to claim exemption of income on the value of increased exports under P.U. (A) 163/2019',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax (Exemption) (No. 7) Order 2019 [P.U. (A) 163/2019]',
    purpose:
      'Computation of statutory income for a company entitled to claim exemption of income on the value of increased exports under P.U. (A) 163/2019',
    requiredDocuments: [
      'Export Documentation',
      'Value Records',
      'Exemption Certificate',
    ],
    keyFields: ['Export Value', 'Increased Value', 'Exemption Rate'],
    relatedForms: ['HK-PC10B', 'HK-PC11'],
  },
  {
    code: 'HK-PC11',
    description:
      'Computation of statutory income for a company entitled to claim exemption of income on value of increased exports - Malaysian International Trading Company',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis:
      'Income Tax (Exemption) (No. 12) Order 2002 [P.U. (A) 60/2002], Income Tax (Exemption) (Amendment) Order 2003 [P.U. (A) 181/2003]',
    purpose:
      'Computation of statutory income for a company entitled to claim exemption of income on value of increased exports - Malaysian International Trading Company',
    requiredDocuments: [
      'MITC Certificate',
      'Export Records',
      'Trading Documentation',
    ],
    keyFields: ['Trading Income', 'Export Value', 'Exemption Amount'],
    relatedForms: ['HK-PC10D', 'HK-PC12'],
  },
  {
    code: 'HK-PC12',
    description: 'Deleted',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'N/A',
    purpose: 'This form has been deleted and is no longer in use',
    requiredDocuments: ['N/A'],
    keyFields: ['N/A'],
    relatedForms: [],
  },
  {
    code: 'HK-PC13',
    description:
      'Computation of statutory income for a Regional Distribution Centre Company/International Procurement Centre Company',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis:
      'Income Tax (Exemption) (No. 41) Order 2005 [P.U. (A) 308/2005], Income Tax (Exemption) (No. 42) Order 2005 [P.U. (A) 309/2005]',
    purpose:
      'Computation of statutory income for a Regional Distribution Centre Company/International Procurement Centre Company',
    requiredDocuments: [
      'RDC/IPC License',
      'Distribution Records',
      'Procurement Documentation',
    ],
    keyFields: [
      'Distribution Income',
      'Procurement Income',
      'Regional Operations',
    ],
    relatedForms: ['HK-PC11', 'HK-PC14'],
  },
  {
    code: 'HK-PC14',
    description:
      'Computation of statutory income for a company which carry on an approved business under special incentive scheme (Pre-package)',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis:
      'Income Tax (Exemption) (No. 11) Order 2006 [P.U. (A) 112/2006]',
    purpose:
      'Computation of statutory income for a company which carry on an approved business under special incentive scheme (Pre-package) - P.U (A) 112/2006',
    requiredDocuments: [
      'Pre-package Approval',
      'Business Records',
      'Incentive Documentation',
    ],
    keyFields: ['Approved Business Income', 'Incentive Rate', 'Tax Exemption'],
    relatedForms: ['HK-PC13', 'HK-PC15'],
  },
  {
    code: 'HK-PC15',
    description:
      'Computation of statutory income for a company which carry on an approved business under special incentive scheme (Pre-package)',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis:
      'Income Tax (Exemption) (No. 12) Order 2006 [P.U. (A) 113/2006]',
    purpose:
      'Computation of statutory income for a company which carry on an approved business under special incentive scheme (Pre-package) - P.U (A) 113/2006',
    requiredDocuments: [
      'Pre-package Approval',
      'Business Activities',
      'Incentive Records',
    ],
    keyFields: ['Business Income', 'Incentive Benefits', 'Tax Computation'],
    relatedForms: ['HK-PC14', 'HK-PC16'],
  },
  {
    code: 'HK-PC16',
    description:
      'Computation of chargeable income for approved special incentive businesses',
    section: 'main-forms',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Income Tax Act 1967',
    purpose:
      'Computation of chargeable income for approved special incentive businesses',
    requiredDocuments: [
      'Special Incentive Approval',
      'Business Records',
      'Income Documentation',
    ],
    keyFields: ['Chargeable Income', 'Special Incentives', 'Tax Calculation'],
    relatedForms: ['HK-PC15', 'HK-C14'],
  },

  // Additional Schedule and Supporting Forms
  {
    code: 'SCH DI',
    description: 'Schedule for Dividend Income',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4(f), Income Tax Act 1967',
    purpose: 'Detail dividend income received from various sources',
    requiredDocuments: [
      'Dividend Vouchers',
      'Company Annual Reports',
      'Tax Deduction Certificates',
    ],
    keyFields: [
      'Dividend Amount',
      'Tax Deducted',
      'Franking Credits',
      'Net Dividend',
    ],
    relatedForms: ['HK-C14', 'HK-C16'],
  },
  {
    code: 'HK-C15/SCH INT',
    description: 'Schedule for Interest Income',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4(f), Income Tax Act 1967',
    purpose: 'Detail interest income from various financial instruments',
    requiredDocuments: [
      'Bank Statements',
      'Interest Certificates',
      'Investment Records',
    ],
    keyFields: [
      'Interest Amount',
      'Source of Interest',
      'Tax Deducted',
      'Net Interest',
    ],
    relatedForms: ['HK-C15', 'SCH DEEMED INT'],
  },
  {
    code: 'SCH DEEMED INT',
    description: 'Schedule for Deemed Interest',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4(f), Income Tax Act 1967',
    purpose: 'Calculate deemed interest on loans and advances',
    requiredDocuments: [
      'Loan Agreements',
      'Advance Records',
      'Interest Rate Documentation',
    ],
    keyFields: [
      'Principal Amount',
      'Deemed Interest Rate',
      'Deemed Interest Amount',
      'Period',
    ],
    relatedForms: ['HK-C15/SCH INT', 'HK-C15'],
  },
  {
    code: 'HK-C16/SCH RI',
    description: 'Schedule for Rental Income',
    section: 'income-schedules',
    status: 'pending',
    lastUpdated: new Date(),
    legalBasis: 'Section 4A, Income Tax Act 1967',
    purpose: 'Detail rental income from properties and related expenses',
    requiredDocuments: [
      'Rental Agreements',
      'Property Tax Receipts',
      'Maintenance Records',
    ],
    keyFields: [
      'Gross Rental',
      'Property Expenses',
      'Net Rental Income',
      'Property Details',
    ],
    relatedForms: ['HK-C16', 'HK-C16A'],
  },
  {
    code: 'CP-204',
    description: 'Estimation of Tax Payable by a Company',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
  {
    code: 'CP-204A',
    description: 'Revision of Estimation of Tax Payable',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
  {
    code: 'CP-204B',
    description: 'Notification of Change in Accounting Period',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
  {
    code: 'OP-MAIN',
    description: 'Other Particulars - Main',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
  {
    code: 'OP-CT',
    description: 'Other Particulars - Controlled Transactions',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
  {
    code: 'OP-LABUAN',
    description: 'Other Particulars - Labuan Details',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
  {
    code: 'OP-CBCR',
    description: 'Other Particulars - CbC Reporting',
    section: 'supporting-forms',
    status: 'pending',
    lastUpdated: new Date(),
  },
];

export const useMalaysianWorksheetsStore = defineStore(
  'malaysian-worksheets',
  () => {
    // State
    const sessions = ref<Map<string, WorksheetSession>>(new Map());
    const currentSessionId = ref<string>('');

    // Computed
    const currentSession = computed(() => {
      if (!currentSessionId.value) return null;
      return sessions.value.get(currentSessionId.value) || null;
    });

    const currentWorksheets = computed(() => {
      return currentSession.value?.worksheets || [];
    });

    const worksheetSections = computed((): WorksheetSection[] => {
      const worksheets = currentWorksheets.value;

      return [
        {
          id: 'main-forms',
          title: 'Main Forms',
          icon: FileTextOutlined,
          worksheets: worksheets.filter((w) => w.section === 'main-forms'),
        },
        {
          id: 'income-schedules',
          title: 'Income Schedules',
          icon: DatabaseOutlined,
          worksheets: worksheets.filter(
            (w) => w.section === 'income-schedules',
          ),
        },
        {
          id: 'supporting-forms',
          title: 'Supporting Forms',
          icon: CalculatorOutlined,
          worksheets: worksheets.filter(
            (w) => w.section === 'supporting-forms',
          ),
        },
      ];
    });

    const completionStats = computed((): CompletionStats => {
      const worksheets = currentWorksheets.value;
      const total = worksheets.length;
      const completed = worksheets.filter(
        (w) => w.status === 'completed',
      ).length;
      const inProgress = worksheets.filter(
        (w) => w.status === 'in-progress',
      ).length;
      const pending = worksheets.filter((w) => w.status === 'pending').length;

      return { total, completed, inProgress, pending };
    });

    // Actions
    function initializeSession(sessionId: string) {
      if (!sessionId) return;

      currentSessionId.value = sessionId;

      // Try to load from sessionStorage first
      const stored = loadSessionFromStorage(sessionId);
      if (stored) {
        sessions.value.set(sessionId, stored);
        return;
      }

      // Create new session with default worksheets
      const newSession: WorksheetSession = {
        sessionId,
        worksheets: [...defaultWorksheets],
        lastUpdated: Date.now(),
        completionStats: {
          total: defaultWorksheets.length,
          completed: 0,
          inProgress: 0,
          pending: defaultWorksheets.length,
        },
      };

      sessions.value.set(sessionId, newSession);
      saveSessionToStorage(sessionId, newSession);
    }

    function updateWorksheetStatus(
      code: string,
      status: MalaysianTaxWorksheet['status'],
    ) {
      const session = currentSession.value;
      if (!session) return;

      const worksheet = session.worksheets.find((w) => w.code === code);
      if (worksheet) {
        worksheet.status = status;
        worksheet.lastUpdated = new Date();
        session.lastUpdated = Date.now();

        // Update completion stats
        updateCompletionStats(session);

        saveSessionToStorage(currentSessionId.value, session);
      }
    }

    function updateWorksheetFormData(
      code: string,
      formData: Record<string, any>,
    ) {
      const session = currentSession.value;
      if (!session) return;

      const worksheet = session.worksheets.find((w) => w.code === code);
      if (worksheet) {
        worksheet.formData = { ...worksheet.formData, ...formData };
        worksheet.lastUpdated = new Date();
        session.lastUpdated = Date.now();

        saveSessionToStorage(currentSessionId.value, session);
      }
    }

    function getWorksheetByCode(
      code: string,
    ): MalaysianTaxWorksheet | undefined {
      return currentWorksheets.value.find((w) => w.code === code);
    }

    function getWorksheetsBySection(
      sectionId: string,
    ): MalaysianTaxWorksheet[] {
      return currentWorksheets.value.filter((w) => w.section === sectionId);
    }

    function searchWorksheets(query: string): MalaysianTaxWorksheet[] {
      if (!query.trim()) return currentWorksheets.value;

      const searchTerm = query.toLowerCase();
      return currentWorksheets.value.filter(
        (w) =>
          w.code.toLowerCase().includes(searchTerm) ||
          w.description.toLowerCase().includes(searchTerm),
      );
    }

    function filterWorksheetsBySection(
      sectionId: string,
    ): MalaysianTaxWorksheet[] {
      if (!sectionId) return currentWorksheets.value;
      return currentWorksheets.value.filter((w) => w.section === sectionId);
    }

    // Helper functions
    function updateCompletionStats(session: WorksheetSession) {
      const worksheets = session.worksheets;
      session.completionStats = {
        total: worksheets.length,
        completed: worksheets.filter((w) => w.status === 'completed').length,
        inProgress: worksheets.filter((w) => w.status === 'in-progress').length,
        pending: worksheets.filter((w) => w.status === 'pending').length,
      };
    }

    function saveSessionToStorage(
      sessionId: string,
      session: WorksheetSession,
    ) {
      try {
        const key = STORAGE_PREFIX + sessionId;
        sessionStorage.setItem(key, JSON.stringify(session));
      } catch (error) {
        console.warn('Failed to save worksheet session to storage:', error);
      }
    }

    function loadSessionFromStorage(
      sessionId: string,
    ): WorksheetSession | null {
      try {
        const key = STORAGE_PREFIX + sessionId;
        const stored = sessionStorage.getItem(key);
        if (stored) {
          const session = JSON.parse(stored);
          // Convert date strings back to Date objects
          session.worksheets.forEach((w: any) => {
            w.lastUpdated = new Date(w.lastUpdated);
          });
          return session;
        }
      } catch (error) {
        console.warn('Failed to load worksheet session from storage:', error);
      }
      return null;
    }

    function clearSession(sessionId: string) {
      sessions.value.delete(sessionId);
      try {
        const key = STORAGE_PREFIX + sessionId;
        sessionStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to clear worksheet session from storage:', error);
      }
    }

    function exportWorksheet(code: string, format: 'pdf' | 'excel' = 'pdf') {
      const worksheet = getWorksheetByCode(code);
      if (!worksheet) return;

      // Mock export functionality
      console.log(`Exporting ${code} as ${format}:`, worksheet);

      // In a real implementation, this would generate and download the file
      // For now, we'll just show a success message
      return {
        success: true,
        message: `${code} exported as ${format.toUpperCase()}`,
        worksheet,
      };
    }

    return {
      // State
      sessions,
      currentSessionId,

      // Computed
      currentSession,
      currentWorksheets,
      worksheetSections,
      completionStats,

      // Actions
      initializeSession,
      updateWorksheetStatus,
      updateWorksheetFormData,
      getWorksheetByCode,
      getWorksheetsBySection,
      searchWorksheets,
      filterWorksheetsBySection,
      clearSession,
      exportWorksheet,
    };
  },
);
