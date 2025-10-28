export interface TaxRuleSection {
  id: string;
  sectionNumber: string;
  title: string;
  content: string;
  subsections: TaxRuleSubsection[];
  lastModified: string;
  modifiedBy: string;
  version: number;
}

export interface TaxRuleSubsection {
  id: string;
  subsectionNumber: string;
  title: string;
  content: string;
  examples?: string[];
  references?: string[];
}

export interface TaxRuleChangeLog {
  id: string;
  sectionId: string;
  changeType: 'create' | 'update' | 'delete';
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  reason: string;
  changedBy: string;
  changedAt: string;
  version: number;
}

export interface UpdateTaxRuleRequest {
  content?: string;
  subsections?: TaxRuleSubsection[];
  reason: string;
}

export interface TaxRuleSearchParams {
  search?: string;
  sectionNumber?: string;
  category?: string;
}

// Mock data for Malaysian Income Tax Act 1967
const mockTaxRuleSections: TaxRuleSection[] = [
  {
    id: '1',
    sectionNumber: '4',
    title: 'Charge of Income Tax',
    content:
      'Subject to this Act, a tax to be known as income tax shall be charged for each year of assessment upon the income of any person accruing in or derived from Malaysia or received in Malaysia from outside Malaysia in respect of gains or profits from a business, trade, profession or vocation; gains or profits from employment; dividends, interest, discounts, charges or annuities; rents, royalties or premiums; pensions, annuities or other periodical payments not falling under any of the foregoing paragraphs; gains or profits not falling under any of the foregoing paragraphs.',
    subsections: [
      {
        id: '1-1',
        subsectionNumber: '4(a)',
        title: 'Business Income',
        content:
          'Gains or profits from a business for the purposes of this Act include gains or profits from any trade, business, profession, vocation or isolated business transactions.',
        examples: [
          'Trading profits from retail business',
          'Professional fees from legal practice',
          'Commission from insurance agency',
        ],
        references: [
          'Section 4A - Source of income',
          'Section 15 - Deductions allowed',
        ],
      },
      {
        id: '1-2',
        subsectionNumber: '4(b)',
        title: 'Employment Income',
        content:
          'Gains or profits from employment include wages, salary, leave pay, fee, commission, bonus, gratuity, perquisites or allowances (whether in money or otherwise) in respect of having or exercising an employment.',
        examples: [
          'Monthly salary and bonuses',
          'Director fees and allowances',
          'Benefits-in-kind such as company car',
        ],
        references: [
          'Section 13 - Gross income from employment',
          'Schedule 1 - Benefits-in-kind valuation',
        ],
      },
    ],
    lastModified: '2024-01-15T10:30:00Z',
    modifiedBy: 'Tax Policy Team',
    version: 3,
  },
  {
    id: '2',
    sectionNumber: '15',
    title: 'Deductions Allowed',
    content:
      'Notwithstanding any other provision of this Act, for the purpose of ascertaining the adjusted income of a person for the basis period for a year of assessment from a source consisting of a business, there shall be deducted all outgoings and expenses wholly and exclusively incurred during that period by that person in the production of gross income from that source.',
    subsections: [
      {
        id: '2-1',
        subsectionNumber: '15(1)(a)',
        title: 'Business Expenses',
        content:
          'Expenses incurred wholly and exclusively for the purpose of producing income from business operations.',
        examples: [
          'Office rent and utilities',
          'Staff salaries and EPF contributions',
          'Raw materials and inventory costs',
          'Professional fees for audit and legal services',
        ],
        references: [
          'Section 16 - Deductions not allowed',
          'Section 33 - Capital allowances',
        ],
      },
      {
        id: '2-2',
        subsectionNumber: '15(1)(b)',
        title: 'Interest Expenses',
        content:
          'Interest on money borrowed and used for the purpose of acquiring income chargeable to tax.',
        examples: [
          'Bank loan interest for business expansion',
          'Hire purchase interest on business vehicles',
          'Overdraft interest for working capital',
        ],
        references: [
          'Section 16(2)(f) - Interest restrictions',
          'Public Ruling No. 3/2018 - Interest deduction',
        ],
      },
    ],
    lastModified: '2024-01-20T14:45:00Z',
    modifiedBy: 'Legal Review Committee',
    version: 2,
  },
  {
    id: '3',
    sectionNumber: '33',
    title: 'Capital Allowances',
    content:
      'Subject to this Act, there shall be made to a person carrying on a business all such allowances as are authorized by the Second Schedule and no others in respect of capital expenditure incurred by him on the provision of assets for the purposes of that business.',
    subsections: [
      {
        id: '3-1',
        subsectionNumber: '33(1)',
        title: 'Initial Allowance',
        content:
          'An initial allowance at the rate specified in the Second Schedule in respect of qualifying plant expenditure.',
        examples: [
          '20% initial allowance on plant and machinery',
          '10% initial allowance on industrial buildings',
          'Computer equipment and software',
        ],
        references: [
          'Second Schedule - Capital allowances rates',
          'Section 34 - Annual allowances',
        ],
      },
      {
        id: '3-2',
        subsectionNumber: '33(2)',
        title: 'Annual Allowance',
        content:
          'An annual allowance for each year of assessment at the rate specified in the Second Schedule.',
        examples: [
          '14% annual allowance on plant and machinery',
          '3% annual allowance on industrial buildings',
          'Motor vehicles capped at RM150,000',
        ],
        references: [
          'Public Ruling No. 1/2019 - Motor vehicle allowances',
          'Section 35 - Balancing allowances and charges',
        ],
      },
    ],
    lastModified: '2024-01-25T09:15:00Z',
    modifiedBy: 'Capital Allowance Specialist',
    version: 4,
  },
  {
    id: '4',
    sectionNumber: '91',
    title: 'Assessment and Additional Assessment',
    content:
      'The Director General may at any time make an assessment upon any person in respect of his chargeable income for any year of assessment and of the tax payable thereon if he is satisfied that such person is liable to tax for that year.',
    subsections: [
      {
        id: '4-1',
        subsectionNumber: '91(1)',
        title: 'Original Assessment',
        content:
          'The Director General shall make an assessment based on the return furnished by the taxpayer or based on the best of his judgment.',
        examples: [
          'Assessment based on filed tax return',
          'Estimated assessment for non-filers',
          'Best judgment assessment',
        ],
        references: [
          'Section 77 - Return of income',
          'Section 90 - Time limit for assessment',
        ],
      },
      {
        id: '4-2',
        subsectionNumber: '91(2)',
        title: 'Additional Assessment',
        content:
          'Where the Director General discovers that any income chargeable to tax has not been assessed or has been under-assessed.',
        examples: [
          'Discovery of unreported income',
          'Correction of computational errors',
          'Adjustment after audit findings',
        ],
        references: [
          'Section 91A - Time limit for additional assessment',
          'Section 96 - Objection to assessment',
        ],
      },
    ],
    lastModified: '2024-01-18T16:20:00Z',
    modifiedBy: 'Assessment Division',
    version: 1,
  },
  {
    id: '5',
    sectionNumber: '103',
    title: 'Recovery of Tax',
    content:
      'Tax shall be due and payable on the date specified in the notice of assessment and may be recovered as a debt due to the Government.',
    subsections: [
      {
        id: '5-1',
        subsectionNumber: '103(1)',
        title: 'Payment Due Date',
        content:
          'Tax shall be paid within 30 days from the date of service of the notice of assessment.',
        examples: [
          'Individual tax payment by April 30',
          'Company tax payment within 30 days of assessment',
          'Installment payment arrangements',
        ],
        references: [
          'Section 107B - Installment payment',
          'Section 106 - Recovery proceedings',
        ],
      },
      {
        id: '5-2',
        subsectionNumber: '103(3)',
        title: 'Interest on Overdue Tax',
        content:
          'Interest at the rate of 6% per annum shall be payable on any tax which remains unpaid after the due date.',
        examples: [
          '6% per annum on overdue individual tax',
          '6% per annum on overdue company tax',
          'Daily compounding of interest',
        ],
        references: [
          'Section 103(4) - Increase of rate of interest',
          'Public Ruling No. 5/2017 - Interest calculation',
        ],
      },
    ],
    lastModified: '2024-01-22T11:00:00Z',
    modifiedBy: 'Collection Unit',
    version: 2,
  },
  {
    id: '6',
    sectionNumber: '39',
    title: 'Exemptions from Tax',
    content:
      'The following income shall be exempt from tax: (a) any pension, gratuity or other allowance paid by the Government to any person in respect of past services or to the widow or dependants of any such person; (b) any sum paid out of any fund established for the benefit of employees; (c) any scholarship, exhibition, bursary or other similar educational endowment; (d) any sum received by way of a prize in any competition; (e) any dividend paid by a resident company.',
    subsections: [
      {
        id: '6-1',
        subsectionNumber: '39(1)(a)',
        title: 'Government Pensions and Gratuities',
        content:
          'Pensions, gratuities, and allowances paid by the Government for past services, including payments to widows and dependants of government servants.',
        examples: [
          'Civil service pension payments',
          'Military pension and gratuities',
          'Judicial pension schemes',
          'Widow and orphan pension benefits',
        ],
        references: [
          'Pensions Act 1980',
          'Armed Forces Fund Act 1973',
          'Public Ruling No. 2/2020 - Government pension exemption',
        ],
      },
      {
        id: '6-2',
        subsectionNumber: '39(1)(b)',
        title: 'Employee Benefit Fund Payments',
        content:
          'Payments from approved employee benefit funds, provident funds, and similar schemes established for employee welfare.',
        examples: [
          'EPF withdrawal payments',
          'Approved company provident fund',
          'Employee welfare fund distributions',
          'Retirement benefit scheme payments',
        ],
        references: [
          'Employees Provident Fund Act 1991',
          'Section 150 - Approved schemes',
          'Public Ruling No. 4/2019 - EPF exemptions',
        ],
      },
      {
        id: '6-3',
        subsectionNumber: '39(1)(c)',
        title: 'Educational Scholarships and Bursaries',
        content:
          'Scholarships, exhibitions, bursaries, and similar educational endowments received for educational purposes.',
        examples: [
          'Government scholarship awards',
          'University merit scholarships',
          'Corporate educational sponsorships',
          'Research grant stipends',
        ],
        references: [
          'Education Act 1996',
          'Public Ruling No. 6/2018 - Educational exemptions',
          'Higher Education Fund Corporation Act 1997',
        ],
      },
      {
        id: '6-4',
        subsectionNumber: '39(1)(d)',
        title: 'Competition Prizes',
        content:
          'Prizes received from competitions, contests, games of chance, or similar events, subject to certain conditions and limits.',
        examples: [
          'Sports competition prizes',
          'Academic competition awards',
          'Lucky draw and lottery winnings',
          'Innovation and invention prizes',
        ],
        references: [
          'Gaming and Betting Act 1953',
          'Public Ruling No. 8/2017 - Prize exemptions',
          'Sports Development Act 1997',
        ],
      },
      {
        id: '6-5',
        subsectionNumber: '39(1)(e)',
        title: 'Resident Company Dividends',
        content:
          'Dividends paid by resident companies to individual shareholders, promoting domestic investment and avoiding double taxation.',
        examples: [
          'Cash dividends from Malaysian companies',
          'Stock dividends and bonus shares',
          'Dividend reinvestment plans',
          'Unit trust distributions',
        ],
        references: [
          'Section 108 - Single tier system',
          'Companies Act 2016',
          'Public Ruling No. 7/2020 - Dividend exemptions',
        ],
      },
    ],
    lastModified: '2024-01-28T15:30:00Z',
    modifiedBy: 'Tax Exemption Specialist',
    version: 1,
  },
];

const mockCategories: string[] = [
  'General Provisions',
  'Income Tax',
  'Deductions',
  'Assessment',
  'Collection',
  'Capital Allowances',
  'Employment Income',
  'Business Income',
  'Tax Exemptions',
];

const mockChangeLogs: TaxRuleChangeLog[] = [
  {
    id: 'cl-1',
    sectionId: '1',
    changeType: 'update',
    fieldChanged: 'content',
    oldValue: 'Previous version of charge of income tax content...',
    newValue:
      'Updated version with clarifications on digital economy taxation...',
    reason:
      'Updated to include digital economy provisions as per Finance Act 2024',
    changedBy: 'Tax Policy Team',
    changedAt: '2024-01-15T10:30:00Z',
    version: 3,
  },
  {
    id: 'cl-2',
    sectionId: '2',
    changeType: 'update',
    fieldChanged: 'subsections',
    oldValue: 'Previous subsection content...',
    newValue: 'Updated subsection with new expense categories...',
    reason: 'Added clarification on cloud computing expenses deductibility',
    changedBy: 'Legal Review Committee',
    changedAt: '2024-01-20T14:45:00Z',
    version: 2,
  },
  {
    id: 'cl-3',
    sectionId: '3',
    changeType: 'update',
    fieldChanged: 'subsections',
    oldValue: 'Previous capital allowance rates...',
    newValue: 'Updated capital allowance rates for green technology...',
    reason: 'Enhanced capital allowances for green technology investments',
    changedBy: 'Capital Allowance Specialist',
    changedAt: '2024-01-25T09:15:00Z',
    version: 4,
  },
];

/**
 * Get all tax rule sections based on Malaysia Income Tax Act 1967
 */
export async function getTaxRuleSections(
  params?: TaxRuleSearchParams,
): Promise<TaxRuleSection[]> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  let filteredSections = [...mockTaxRuleSections];

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredSections = filteredSections.filter(
      (section) =>
        section.title.toLowerCase().includes(searchLower) ||
        section.content.toLowerCase().includes(searchLower) ||
        section.sectionNumber.toLowerCase().includes(searchLower),
    );
  }

  if (params?.sectionNumber) {
    filteredSections = filteredSections.filter(
      (section) => section.sectionNumber === params.sectionNumber,
    );
  }

  if (params?.category) {
    // Simple category mapping based on section numbers
    filteredSections = filteredSections.filter((section) => {
      const num = Number.parseInt(section.sectionNumber);
      const category = params.category;

      if (category === 'General Provisions') return num >= 1 && num <= 20;
      if (category === 'Income Tax')
        return (num >= 21 && num <= 40) || section.sectionNumber === '4';
      if (category === 'Deductions')
        return (num >= 41 && num <= 60) || section.sectionNumber === '15';
      if (category === 'Assessment')
        return (num >= 61 && num <= 100) || section.sectionNumber === '91';
      if (category === 'Collection')
        return (num >= 101 && num <= 120) || section.sectionNumber === '103';
      if (category === 'Capital Allowances')
        return section.sectionNumber === '33';
      if (category === 'Tax Exemptions') return section.sectionNumber === '39';

      return true;
    });
  }

  return filteredSections;
}

/**
 * Get specific tax rule section by ID
 */
export async function getTaxRuleSection(id: string): Promise<TaxRuleSection> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

  const section = mockTaxRuleSections.find((s) => s.id === id);
  if (!section) {
    throw new Error(`Tax rule section with ID ${id} not found`);
  }

  return section;
}

/**
 * Update tax rule section
 */
export async function updateTaxRuleSection(
  id: string,
  data: UpdateTaxRuleRequest,
): Promise<TaxRuleSection> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay

  const sectionIndex = mockTaxRuleSections.findIndex((s) => s.id === id);
  if (sectionIndex === -1) {
    throw new Error(`Tax rule section with ID ${id} not found`);
  }

  const updatedSection = {
    ...mockTaxRuleSections[sectionIndex],
    ...(data.content && { content: data.content }),
    ...(data.subsections && { subsections: data.subsections }),
    lastModified: new Date().toISOString(),
    modifiedBy: 'Current User',
    version: mockTaxRuleSections[sectionIndex].version + 1,
  };

  // Update the mock data
  mockTaxRuleSections[sectionIndex] = updatedSection;

  // Add to change log
  const changeLog: TaxRuleChangeLog = {
    id: `cl-${Date.now()}`,
    sectionId: id,
    changeType: 'update',
    fieldChanged: data.content ? 'content' : 'subsections',
    oldValue: 'Previous content...',
    newValue: 'Updated content...',
    reason: data.reason,
    changedBy: 'Current User',
    changedAt: new Date().toISOString(),
    version: updatedSection.version,
  };

  mockChangeLogs.unshift(changeLog);

  return updatedSection;
}

/**
 * Get change log for a specific section
 */
export async function getTaxRuleChangeLog(
  sectionId: string,
  params?: {
    page?: number;
    pageSize?: number;
    dateFrom?: string;
    dateTo?: string;
  },
): Promise<{
  changes: TaxRuleChangeLog[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate API delay

  let filteredChanges = mockChangeLogs.filter(
    (log) => log.sectionId === sectionId,
  );

  if (params?.dateFrom) {
    filteredChanges = filteredChanges.filter(
      (log) => new Date(log.changedAt) >= new Date(params.dateFrom!),
    );
  }

  if (params?.dateTo) {
    filteredChanges = filteredChanges.filter(
      (log) => new Date(log.changedAt) <= new Date(params.dateTo!),
    );
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    changes: filteredChanges.slice(startIndex, endIndex),
    total: filteredChanges.length,
    page,
    pageSize,
  };
}

/**
 * Get all change logs
 */
export async function getAllTaxRuleChangeLogs(params?: {
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  changedBy?: string;
}): Promise<{
  changes: TaxRuleChangeLog[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate API delay

  let filteredChanges = [...mockChangeLogs];

  if (params?.dateFrom) {
    filteredChanges = filteredChanges.filter(
      (log) => new Date(log.changedAt) >= new Date(params.dateFrom!),
    );
  }

  if (params?.dateTo) {
    filteredChanges = filteredChanges.filter(
      (log) => new Date(log.changedAt) <= new Date(params.dateTo!),
    );
  }

  if (params?.changedBy) {
    filteredChanges = filteredChanges.filter((log) =>
      log.changedBy.toLowerCase().includes(params.changedBy!.toLowerCase()),
    );
  }

  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    changes: filteredChanges.slice(startIndex, endIndex),
    total: filteredChanges.length,
    page,
    pageSize,
  };
}

/**
 * Compare two versions of a tax rule section
 */
export async function compareTaxRuleVersions(
  sectionId: string,
  fromVersion: number,
  toVersion: number,
): Promise<{
  from: TaxRuleSection;
  to: TaxRuleSection;
  differences: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 700)); // Simulate API delay

  const currentSection = mockTaxRuleSections.find((s) => s.id === sectionId);
  if (!currentSection) {
    throw new Error(`Tax rule section with ID ${sectionId} not found`);
  }

  // Create mock previous version
  const previousSection: TaxRuleSection = {
    ...currentSection,
    version: fromVersion,
    content: currentSection.content.replace(
      'digital economy',
      'traditional business',
    ),
    lastModified: '2023-12-01T10:00:00Z',
    modifiedBy: 'Previous Editor',
  };

  const differences = [
    {
      field: 'content',
      oldValue: 'traditional business provisions',
      newValue: 'digital economy provisions',
    },
    {
      field: 'lastModified',
      oldValue: '2023-12-01T10:00:00Z',
      newValue: currentSection.lastModified,
    },
  ];

  return {
    from: previousSection,
    to: currentSection,
    differences,
  };
}

/**
 * Revert tax rule section to a previous version
 */
export async function revertTaxRuleSection(
  sectionId: string,
  version: number,
  reason: string,
): Promise<TaxRuleSection> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 900)); // Simulate API delay

  const sectionIndex = mockTaxRuleSections.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    throw new Error(`Tax rule section with ID ${sectionId} not found`);
  }

  const revertedSection = {
    ...mockTaxRuleSections[sectionIndex],
    version: mockTaxRuleSections[sectionIndex].version + 1,
    lastModified: new Date().toISOString(),
    modifiedBy: 'Current User',
  };

  // Update the mock data
  mockTaxRuleSections[sectionIndex] = revertedSection;

  // Add to change log
  const changeLog: TaxRuleChangeLog = {
    id: `cl-${Date.now()}`,
    sectionId,
    changeType: 'update',
    fieldChanged: 'version',
    oldValue: `Version ${version + 1}`,
    newValue: `Reverted to Version ${version}`,
    reason,
    changedBy: 'Current User',
    changedAt: new Date().toISOString(),
    version: revertedSection.version,
  };

  mockChangeLogs.unshift(changeLog);

  return revertedSection;
}

/**
 * Get tax rule categories for filtering
 */
export async function getTaxRuleCategories(): Promise<string[]> {
  // Return mock data for demonstration
  await new Promise((resolve) => setTimeout(resolve, 200)); // Simulate API delay

  return mockCategories;
}
