// Enhanced Malaysian Corporate Client Data Structure with MSIC Codes

interface BasicParticulars {
  companyName: string;
  registrationNumber: string;
  incorporationDate: string;
  companyType: 'SDN BHD' | 'BHD' | 'LLP' | 'PARTNERSHIP' | 'SOLE_PROPRIETOR';
  businessRegistrationNumber?: string;
  taxIdentificationNumber: string;
  ssmNumber: string;
}

interface CompanyParticulars {
  registeredAddress: {
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  businessAddress: {
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  contactDetails: {
    phone: string;
    fax?: string;
    email: string;
    website?: string;
  };
  msicCode: string;
  msicDescription: string;
  principalActivities: string;
  businessNature: string;
  paidUpCapital: number;
  authorizedCapital: number;
  financialYearEnd: string;
  commencementDate: string;
}

interface AuditorParticulars {
  firmName: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
  partnerInCharge: string;
  auditFee: number;
}

interface TaxAgentParticulars {
  agentName?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  taxAgentFee?: number;
}

interface FinancialData {
  revenue: number;
  grossProfit: number;
  netProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  cashFlow: number;
  previousYearRevenue: number;
  previousYearProfit: number;
}

interface TaxInformation {
  previousYearTaxPaid: number;
  estimatedTaxPayable: number;
  installmentPayments: number;
  taxExemptions: string[];
  incentivesApplied: string[];
  witholdingTaxPaid: number;
  cp204A?: number; // Tax deducted
  cp204?: number; // Tax deducted
}

interface EnhancedSystemClient {
  id: string;
  basicParticulars: BasicParticulars;
  companyParticulars: CompanyParticulars;
  auditorParticulars?: AuditorParticulars;
  taxAgentParticulars?: TaxAgentParticulars;
  financialData: FinancialData;
  taxInformation: TaxInformation;
  status: 'ACTIVE' | 'INACTIVE' | 'DORMANT';
  createdTime: string;
  lastModifiedTime: string;
  lastContactTime: string;
  image?: string;
}

// Enhanced Mock Client Data
const enhancedMockClients: EnhancedSystemClient[] = [
  {
    id: '1',
    basicParticulars: {
      companyName: 'TechCorp Solutions Sdn Bhd',
      registrationNumber: '201801031248',
      incorporationDate: '2018-01-15',
      companyType: 'SDN BHD',
      taxIdentificationNumber: 'C 12345678',
      ssmNumber: '1293274-D',
    },
    companyParticulars: {
      registeredAddress: {
        address: '123 Tech Street, Suite 400',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        postcode: '50200',
        country: 'Malaysia',
      },
      businessAddress: {
        address: '123 Tech Street, Suite 400',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        postcode: '50200',
        country: 'Malaysia',
      },
      contactDetails: {
        phone: '+603-2123-4567',
        email: 'info@techcorp.com.my',
        website: 'https://techcorp.com.my',
      },
      msicCode: '62010',
      msicDescription: 'Computer programming activities',
      principalActivities: 'Software development and IT consulting services',
      businessNature: 'Technology Solutions Provider',
      paidUpCapital: 1_000_000,
      authorizedCapital: 2_000_000,
      financialYearEnd: '31-12',
      commencementDate: '2018-01-15',
    },
    auditorParticulars: {
      firmName: 'ABC Chartered Accountants',
      registrationNumber: 'AF 1234',
      address: '456 Audit Street',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postcode: '50300',
      phone: '+603-2234-5678',
      email: 'audit@abc.com.my',
      partnerInCharge: 'John Lim',
      auditFee: 25_000,
    },
    taxAgentParticulars: {
      agentName: 'Tax Consultancy Services',
      registrationNumber: 'TA 5678',
      address: '789 Tax Street',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postcode: '50400',
      phone: '+603-2345-6789',
      email: 'tax@consultant.com.my',
      taxAgentFee: 15_000,
    },
    financialData: {
      revenue: 3_500_000,
      grossProfit: 2_800_000,
      netProfit: 850_000,
      totalAssets: 2_500_000,
      totalLiabilities: 800_000,
      shareholdersEquity: 1_700_000,
      cashFlow: 650_000,
      previousYearRevenue: 3_200_000,
      previousYearProfit: 780_000,
    },
    taxInformation: {
      previousYearTaxPaid: 187_200,
      estimatedTaxPayable: 204_000,
      installmentPayments: 150_000,
      taxExemptions: ['Pioneer Status'],
      incentivesApplied: ['MSC Status'],
      witholdingTaxPaid: 12_000,
      cp204A: 5000,
      cp204: 3000,
    },
    status: 'ACTIVE',
    createdTime: '2024-01-15 09:30:00',
    lastModifiedTime: '2024-11-20 14:22:00',
    lastContactTime: '2024-11-18 16:45:00',
    image:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=150&h=150&fit=crop',
  },
  {
    id: '2',
    basicParticulars: {
      companyName: 'HealthPlus Medical Centre Sdn Bhd',
      registrationNumber: '201705125689',
      incorporationDate: '2017-05-12',
      companyType: 'SDN BHD',
      taxIdentificationNumber: 'C 23456789',
      ssmNumber: '1234567-A',
    },
    companyParticulars: {
      registeredAddress: {
        address: '456 Medical Center Blvd, Floor 12',
        city: 'Petaling Jaya',
        state: 'Selangor',
        postcode: '47800',
        country: 'Malaysia',
      },
      businessAddress: {
        address: '456 Medical Center Blvd, Floor 12',
        city: 'Petaling Jaya',
        state: 'Selangor',
        postcode: '47800',
        country: 'Malaysia',
      },
      contactDetails: {
        phone: '+603-7956-1234',
        email: 'info@healthplus.com.my',
        website: 'https://healthplus.com.my',
      },
      msicCode: '86101',
      msicDescription: 'Hospital activities',
      principalActivities: 'Medical and healthcare services',
      businessNature: 'Healthcare Provider',
      paidUpCapital: 5_000_000,
      authorizedCapital: 10_000_000,
      financialYearEnd: '31-12',
      commencementDate: '2017-05-12',
    },
    auditorParticulars: {
      firmName: 'Medical Audit Associates',
      registrationNumber: 'AF 2345',
      address: '789 Healthcare Street',
      city: 'Petaling Jaya',
      state: 'Selangor',
      postcode: '47900',
      phone: '+603-7890-1234',
      email: 'audit@medical-audit.com.my',
      partnerInCharge: 'Dr. Sarah Lee',
      auditFee: 45_000,
    },
    financialData: {
      revenue: 8_500_000,
      grossProfit: 6_200_000,
      netProfit: 1_850_000,
      totalAssets: 12_000_000,
      totalLiabilities: 4_500_000,
      shareholdersEquity: 7_500_000,
      cashFlow: 1_650_000,
      previousYearRevenue: 7_800_000,
      previousYearProfit: 1_650_000,
    },
    taxInformation: {
      previousYearTaxPaid: 396_000,
      estimatedTaxPayable: 444_000,
      installmentPayments: 300_000,
      taxExemptions: [],
      incentivesApplied: [],
      witholdingTaxPaid: 25_000,
      cp204A: 8000,
      cp204: 6000,
    },
    status: 'ACTIVE',
    createdTime: '2024-01-10 11:15:00',
    lastModifiedTime: '2024-11-19 10:30:00',
    lastContactTime: '2024-11-17 14:20:00',
    image:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop',
  },
  {
    id: '3',
    basicParticulars: {
      companyName: 'Global Finance Group Sdn Bhd',
      registrationNumber: '201603089456',
      incorporationDate: '2016-03-08',
      companyType: 'SDN BHD',
      taxIdentificationNumber: 'C 34567890',
      ssmNumber: '2345678-B',
    },
    companyParticulars: {
      registeredAddress: {
        address: '789 Financial Plaza, 25th Floor',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        postcode: '50088',
        country: 'Malaysia',
      },
      businessAddress: {
        address: '789 Financial Plaza, 25th Floor',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        postcode: '50088',
        country: 'Malaysia',
      },
      contactDetails: {
        phone: '+603-2087-9999',
        email: 'info@globalfinance.com.my',
        website: 'https://globalfinance.com.my',
      },
      msicCode: '66192',
      msicDescription: 'Financial consultancy services',
      principalActivities: 'Investment advisory and financial consulting',
      businessNature: 'Financial Services',
      paidUpCapital: 2_000_000,
      authorizedCapital: 5_000_000,
      financialYearEnd: '31-12',
      commencementDate: '2016-03-08',
    },
    auditorParticulars: {
      firmName: 'Finance Audit Partners',
      registrationNumber: 'AF 3456',
      address: '321 Finance Street',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postcode: '50100',
      phone: '+603-2100-5678',
      email: 'audit@financeaudit.com.my',
      partnerInCharge: 'Michael Tan',
      auditFee: 35_000,
    },
    financialData: {
      revenue: 4_200_000,
      grossProfit: 3_800_000,
      netProfit: 1_260_000,
      totalAssets: 8_500_000,
      totalLiabilities: 2_800_000,
      shareholdersEquity: 5_700_000,
      cashFlow: 1_150_000,
      previousYearRevenue: 3_900_000,
      previousYearProfit: 1_150_000,
    },
    taxInformation: {
      previousYearTaxPaid: 276_000,
      estimatedTaxPayable: 302_400,
      installmentPayments: 200_000,
      taxExemptions: [],
      incentivesApplied: ['FinTech Incentive'],
      witholdingTaxPaid: 18_000,
      cp204A: 7000,
      cp204: 5000,
    },
    status: 'ACTIVE',
    createdTime: '2024-01-05 14:20:00',
    lastModifiedTime: '2024-11-16 09:15:00',
    lastContactTime: '2024-11-15 13:45:00',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=150&h=150&fit=crop',
  },
  {
    id: '4',
    basicParticulars: {
      companyName: 'Palm Oil Industries Sdn Bhd',
      registrationNumber: '201512078934',
      incorporationDate: '2015-12-07',
      companyType: 'SDN BHD',
      taxIdentificationNumber: 'C 45678901',
      ssmNumber: '3456789-C',
    },
    companyParticulars: {
      registeredAddress: {
        address: 'KM 15 Jalan Kelapa Sawit',
        city: 'Johor Bahru',
        state: 'Johor',
        postcode: '81000',
        country: 'Malaysia',
      },
      businessAddress: {
        address: 'KM 15 Jalan Kelapa Sawit',
        city: 'Johor Bahru',
        state: 'Johor',
        postcode: '81000',
        country: 'Malaysia',
      },
      contactDetails: {
        phone: '+607-3456-7890',
        email: 'info@palmoil.com.my',
        website: 'https://palmoil.com.my',
      },
      msicCode: '10401',
      msicDescription: 'Manufacture of crude palm oil',
      principalActivities: 'Palm oil processing and manufacturing',
      businessNature: 'Palm Oil Manufacturing',
      paidUpCapital: 15_000_000,
      authorizedCapital: 30_000_000,
      financialYearEnd: '31-12',
      commencementDate: '2015-12-07',
    },
    auditorParticulars: {
      firmName: 'Agricultural Audit Sdn Bhd',
      registrationNumber: 'AF 4567',
      address: '654 Palm Street',
      city: 'Johor Bahru',
      state: 'Johor',
      postcode: '81100',
      phone: '+607-4567-8901',
      email: 'audit@agriaudit.com.my',
      partnerInCharge: 'Ahmad Rashid',
      auditFee: 55_000,
    },
    financialData: {
      revenue: 45_000_000,
      grossProfit: 18_000_000,
      netProfit: 8_500_000,
      totalAssets: 65_000_000,
      totalLiabilities: 25_000_000,
      shareholdersEquity: 40_000_000,
      cashFlow: 7_200_000,
      previousYearRevenue: 42_000_000,
      previousYearProfit: 7_800_000,
    },
    taxInformation: {
      previousYearTaxPaid: 1_872_000,
      estimatedTaxPayable: 2_040_000,
      installmentPayments: 1_500_000,
      taxExemptions: [],
      incentivesApplied: ['Agriculture Allowance'],
      witholdingTaxPaid: 85_000,
      cp204A: 25_000,
      cp204: 18_000,
    },
    status: 'ACTIVE',
    createdTime: '2024-01-08 16:30:00',
    lastModifiedTime: '2024-10-16 11:20:00',
    lastContactTime: '2024-10-14 15:10:00',
    image:
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&h=150&fit=crop',
  },
  {
    id: '5',
    basicParticulars: {
      companyName: 'IBizzCloud Sdn Bhd',
      registrationNumber: '201801031248',
      incorporationDate: '2018-01-03',
      companyType: 'SDN BHD',
      taxIdentificationNumber: 'C 56789012',
      ssmNumber: '1293274-D',
    },
    companyParticulars: {
      registeredAddress: {
        address: '3-2, The Boulevard, Mid Valley City, Lingkaran Syed Putra',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        postcode: '59200',
        country: 'Malaysia',
      },
      businessAddress: {
        address: '3-2, The Boulevard, Mid Valley City, Lingkaran Syed Putra',
        city: 'Kuala Lumpur',
        state: 'Wilayah Persekutuan',
        postcode: '59200',
        country: 'Malaysia',
      },
      contactDetails: {
        phone: '+603-2282-1234',
        email: 'info@ibizzcloud.com',
        website: 'https://ibizzcloud.com',
      },
      msicCode: '62021',
      msicDescription: 'Computer consultancy',
      principalActivities:
        'Investment advisory services, computer programming and other management consultancy activities',
      businessNature: 'Technology and Investment Advisory',
      paidUpCapital: 2_000_002,
      authorizedCapital: 2_000_002,
      financialYearEnd: '31-12',
      commencementDate: '2018-01-03',
    },
    auditorParticulars: {
      firmName: 'UHY',
      registrationNumber: 'AF 1411',
      address:
        'Suite 11.05, Level 11, The Gardens South Tower, Mid Valley City, Lingkaran Syed Putra',
      city: 'Kuala Lumpur',
      state: 'Wilayah Persekutuan',
      postcode: '59200',
      phone: '+603-2279-3088',
      email: 'uhykl@uhy.com.my',
      partnerInCharge: 'Datuk Tee Guan Pian',
      auditFee: 14_000,
    },
    financialData: {
      revenue: 3_003_398,
      grossProfit: 2_786_169,
      netProfit: 1_009_247,
      totalAssets: 4_783_535,
      totalLiabilities: 1_706_639,
      shareholdersEquity: 3_076_896,
      cashFlow: 586_610,
      previousYearRevenue: 1_529_551,
      previousYearProfit: 101_605,
    },
    taxInformation: {
      previousYearTaxPaid: 100_969,
      estimatedTaxPayable: 366_693,
      installmentPayments: 0,
      taxExemptions: [],
      incentivesApplied: ['SME Digitalisation Grant'],
      witholdingTaxPaid: 0,
      cp204A: 0,
      cp204: 0,
    },
    status: 'ACTIVE',
    createdTime: '2024-02-12 08:45:00',
    lastModifiedTime: '2024-11-14 16:30:00',
    lastContactTime: '2024-11-12 11:15:00',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop',
  },
];

// API Parameter Interfaces
namespace EnhancedSystemClientApi {
  export interface GetEnhancedClientListParams {
    page?: number;
    pageSize?: number;
    companyName?: string;
    email?: string;
    city?: string;
    state?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'DORMANT';
    msicCode?: string;
    businessNature?: string;
  }

  export interface CreateEnhancedClientParams {
    basicParticulars: BasicParticulars;
    companyParticulars: CompanyParticulars;
    auditorParticulars?: AuditorParticulars;
    taxAgentParticulars?: TaxAgentParticulars;
    financialData: FinancialData;
    taxInformation: TaxInformation;
    status?: 'ACTIVE' | 'INACTIVE' | 'DORMANT';
    image?: string;
  }

  export interface UpdateEnhancedClientParams {
    basicParticulars?: Partial<BasicParticulars>;
    companyParticulars?: Partial<CompanyParticulars>;
    auditorParticulars?: Partial<AuditorParticulars>;
    taxAgentParticulars?: Partial<TaxAgentParticulars>;
    financialData?: Partial<FinancialData>;
    taxInformation?: Partial<TaxInformation>;
    status?: 'ACTIVE' | 'INACTIVE' | 'DORMANT';
    image?: string;
  }
}

/**
 * Get enhanced client list with pagination and filtering
 */
export async function getEnhancedClientList(
  params: EnhancedSystemClientApi.GetEnhancedClientListParams = {},
): Promise<{ items: EnhancedSystemClient[]; total: number }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredClients = [...enhancedMockClients];

  // Apply filters
  if (params.companyName) {
    filteredClients = filteredClients.filter((client) =>
      client.basicParticulars.companyName
        .toLowerCase()
        .includes((params.companyName || '').toLowerCase()),
    );
  }

  if (params.email) {
    filteredClients = filteredClients.filter((client) =>
      client.companyParticulars.contactDetails.email
        .toLowerCase()
        .includes((params.email || '').toLowerCase()),
    );
  }

  if (params.city) {
    filteredClients = filteredClients.filter((client) =>
      client.companyParticulars.registeredAddress.city
        .toLowerCase()
        .includes((params.city || '').toLowerCase()),
    );
  }

  if (params.state) {
    filteredClients = filteredClients.filter((client) =>
      client.companyParticulars.registeredAddress.state
        .toLowerCase()
        .includes((params.state || '').toLowerCase()),
    );
  }

  if (params.status) {
    filteredClients = filteredClients.filter(
      (client) => client.status === params.status,
    );
  }

  if (params.msicCode) {
    filteredClients = filteredClients.filter((client) =>
      client.companyParticulars.msicCode.includes(params.msicCode || ''),
    );
  }

  if (params.businessNature) {
    filteredClients = filteredClients.filter((client) =>
      client.companyParticulars.businessNature
        .toLowerCase()
        .includes((params.businessNature || '').toLowerCase()),
    );
  }

  // Apply pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    items: filteredClients.slice(startIndex, endIndex),
    total: filteredClients.length,
  };
}

/**
 * Create a new enhanced client
 */
export async function createEnhancedClient(
  params: EnhancedSystemClientApi.CreateEnhancedClientParams,
): Promise<EnhancedSystemClient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newClient: EnhancedSystemClient = {
    id: Date.now().toString(),
    basicParticulars: params.basicParticulars,
    companyParticulars: params.companyParticulars,
    auditorParticulars: params.auditorParticulars,
    taxAgentParticulars: params.taxAgentParticulars,
    financialData: params.financialData,
    taxInformation: params.taxInformation,
    status: params.status || 'ACTIVE',
    createdTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    lastModifiedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    lastContactTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    image: params.image,
  };

  enhancedMockClients.push(newClient);
  return newClient;
}

/**
 * Update an existing enhanced client
 */
export async function updateEnhancedClient(
  id: string,
  params: EnhancedSystemClientApi.UpdateEnhancedClientParams,
): Promise<EnhancedSystemClient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const clientIndex = enhancedMockClients.findIndex(
    (client) => client.id === id,
  );
  if (clientIndex === -1) {
    throw new Error('Enhanced client not found');
  }

  const existingClient = enhancedMockClients[clientIndex];
  const updatedClient: EnhancedSystemClient = {
    ...existingClient,
    basicParticulars: {
      ...existingClient.basicParticulars,
      ...params.basicParticulars,
    },
    companyParticulars: {
      ...existingClient.companyParticulars,
      ...params.companyParticulars,
      registeredAddress: {
        ...existingClient.companyParticulars.registeredAddress,
        ...params.companyParticulars?.registeredAddress,
      },
      businessAddress: {
        ...existingClient.companyParticulars.businessAddress,
        ...params.companyParticulars?.businessAddress,
      },
      contactDetails: {
        ...existingClient.companyParticulars.contactDetails,
        ...params.companyParticulars?.contactDetails,
      },
    },
    auditorParticulars: params.auditorParticulars
      ? {
          ...existingClient.auditorParticulars,
          ...params.auditorParticulars,
        }
      : existingClient.auditorParticulars,
    taxAgentParticulars: params.taxAgentParticulars
      ? {
          ...existingClient.taxAgentParticulars,
          ...params.taxAgentParticulars,
        }
      : existingClient.taxAgentParticulars,
    financialData: {
      ...existingClient.financialData,
      ...params.financialData,
    },
    taxInformation: {
      ...existingClient.taxInformation,
      ...params.taxInformation,
    },
    status: params.status || existingClient.status,
    image: params.image === undefined ? existingClient.image : params.image,
    lastModifiedTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
  };

  enhancedMockClients[clientIndex] = updatedClient;
  return updatedClient;
}

/**
 * Delete an enhanced client
 */
export async function deleteEnhancedClient(id: string): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const clientIndex = enhancedMockClients.findIndex(
    (client) => client.id === id,
  );
  if (clientIndex === -1) {
    throw new Error('Enhanced client not found');
  }

  enhancedMockClients.splice(clientIndex, 1);
}

/**
 * Get enhanced client by ID
 */
export async function getEnhancedClientById(
  id: string,
): Promise<EnhancedSystemClient> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const client = enhancedMockClients.find((client) => client.id === id);
  if (!client) {
    throw new Error('Enhanced client not found');
  }

  return client;
}

export type { EnhancedSystemClient, EnhancedSystemClientApi };
export { enhancedMockClients };
