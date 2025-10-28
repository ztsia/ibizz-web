import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';

// Client interface type
export interface SystemClient {
  address: string;
  city: string;
  company: string;
  contactNumber: string;
  country: string;
  createdTime: string;
  description?: string;
  email: string;
  id: string;
  image?: string;
  industry: string;
  lastContactTime?: string;
  lastModifiedTime: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  website?: string;
}

// Common form configuration constants
const FORM_CONFIG = {
  // Common component props
  INPUT_SIZE: 'large' as const,
  BORDER_RADIUS: '8px',
  LABEL_WIDTH: 240,

  // Section divider styles
  DIVIDER_STYLES: {
    PERSONAL: {
      borderColor: '#e0e7ff',
      color: '#4f46e5',
    },
    COMPANY: {
      borderColor: '#fef3c7',
      color: '#d97706',
    },
    LOCATION: {
      borderColor: '#dcfce7',
      color: '#16a34a',
    },
    ADDITIONAL: {
      borderColor: '#fce7f3',
      color: '#be185d',
    },
  },

  // Status colors
  STATUS_COLORS: {
    ACTIVE: '#16a34a',
    INACTIVE: '#dc2626',
  },
} as const;

// Common component props factory
const createInputProps = (placeholder: string, maxlength?: number) => ({
  placeholder,
  size: FORM_CONFIG.INPUT_SIZE,
  style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
  ...(maxlength && { maxlength, showCount: true }),
});

const createDividerProps = (
  label: string,
  styleKey: keyof typeof FORM_CONFIG.DIVIDER_STYLES,
) => ({
  orientation: 'left' as const,
  orientationMargin: 0,
  style: {
    ...FORM_CONFIG.DIVIDER_STYLES[styleKey],
    fontSize: '16px',
    fontWeight: '600',
  },
});

// Industry options configuration
const INDUSTRY_OPTIONS = [
  { label: 'Technology', value: 'Technology' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Retail', value: 'Retail' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Education', value: 'Education' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Consulting', value: 'Consulting' },
  { label: 'Media & Entertainment', value: 'Media & Entertainment' },
  { label: 'Other', value: 'Other' },
] as const;

// Country options configuration
const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'United States' },
  { label: 'Canada', value: 'Canada' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Japan', value: 'Japan' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Malaysia', value: 'Malaysia' },
  { label: 'Other', value: 'Other' },
] as const;

// Status options configuration
const STATUS_OPTIONS = [
  {
    label: 'Active',
    value: 'ACTIVE' as const,
    style: {
      fontWeight: '600',
      borderRadius: '6px',
    },
  },
  {
    label: 'Inactive',
    value: 'INACTIVE' as const,
    style: {
      fontWeight: '600',
      borderRadius: '6px',
    },
  },
] as const;

// Step 1: Company Information Schema
export function useStep1Schema(): VbenFormSchema[] {
  return [
    {
      component: 'Divider',
      componentProps: createDividerProps('Company Information', 'COMPANY'),
      fieldName: 'companyInfo',
      label: 'Company Information',
    },
    {
      component: 'Input',
      componentProps: createInputProps('Company Name', 100),
      fieldName: 'companyName',
      label: 'Company Name',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      rules: z.string().min(1, 'Company name is required'),
    },
    {
      component: 'Input',
      componentProps: createInputProps('Company Registration Number', 50),
      fieldName: 'companyRegistrationNumber',
      label: 'Company Registration Number',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      rules: z.string().min(1, 'Registration number is required'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: false,
        class: 'w-full',
        placeholder: 'Select Industry',
        size: FORM_CONFIG.INPUT_SIZE,
        options: INDUSTRY_OPTIONS,
        showSearch: true,
      },
      fieldName: 'characterizationOfBusinessActivity',
      label: 'Characterization of Business Activity',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      rules: z.string().min(1, 'Please select an industry'),
    },
    {
      component: 'Input',
      componentProps: createInputProps('Tax Reference No.', 50),
      fieldName: 'taxReferenceNo',
      label: 'Tax Reference No.',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Input',
      componentProps: createInputProps('Business Activity', 100),
      fieldName: 'businessActivity',
      label: 'Business Activity',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Input',
      componentProps: createInputProps('Business Code', 50),
      fieldName: 'businessCode',
      label: 'Business Code',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'RangePicker',
      componentProps: {
        placeholder: ['Start Date', 'End Date'],
        size: FORM_CONFIG.INPUT_SIZE,
        style: { width: '100%' },
        format: 'YYYY-MM-DD',
      },
      fieldName: 'financialPeriod',
      label: 'Financial Period',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Input',
      componentProps: {
        ...createInputProps('Enter website URL'),
        type: 'url',
      },
      fieldName: 'website',
      label: 'Website',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Divider',
      componentProps: createDividerProps('Client Information', 'PERSONAL'),
      fieldName: 'clientInfo',
      label: 'Client Information',
    },
    {
      component: 'Input',
      componentProps: createInputProps('Contact Person', 100),
      fieldName: 'contactPerson',
      label: 'Contact Person',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      rules: z.string().min(1, 'Contact person is required'),
    },
    {
      component: 'Input',
      componentProps: {
        ...createInputProps('Contact Email'),
        type: 'email',
      },
      fieldName: 'contactEmail',
      label: 'Contact Email',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      rules: z.string().email('Please enter a valid email'),
    },
    {
      component: 'Input',
      componentProps: createInputProps('Contact Phone', 20),
      fieldName: 'contactPhone',
      label: 'Contact Phone',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      rules: z.string().min(1, 'Contact phone is required'),
    },
    {
      component: 'Input',
      componentProps: createInputProps('Contact Fax', 20),
      fieldName: 'contactFax',
      label: 'Contact Fax',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Divider',
      componentProps: createDividerProps('Location Information', 'LOCATION'),
      fieldName: 'locationInfo',
      label: 'Location Information',
    },
    {
      component: 'Input',
      componentProps: createInputProps('Street', 200),
      fieldName: 'street',
      label: 'Street',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Input',
      componentProps: createInputProps('City', 50),
      fieldName: 'city',
      label: 'City',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Input',
      componentProps: createInputProps('Province', 50),
      fieldName: 'province',
      label: 'Province',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Input',
      componentProps: createInputProps('Postal Code', 20),
      fieldName: 'postalCode',
      label: 'Postal Code',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: false,
        class: 'w-full',
        placeholder: 'Select Country',
        size: FORM_CONFIG.INPUT_SIZE,
        options: COUNTRY_OPTIONS,
        showSearch: true,
      },
      fieldName: 'country',
      label: 'Country',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: false,
        class: 'w-full',
        placeholder: 'Select Currency',
        size: FORM_CONFIG.INPUT_SIZE,
        options: [
          { label: 'MYR', value: 'MYR' },
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'SGD', value: 'SGD' },
        ],
      },
      fieldName: 'currency',
      label: 'Currency',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Divider',
      componentProps: createDividerProps('Management Structure', 'ADDITIONAL'),
      fieldName: 'managementStructure',
      label: 'Management Structure',
    },
    {
      component: 'QuillEditor',
      componentProps: {
        placeholder:
          'Describe the management structure and organizational hierarchy...',
        height: '250px',
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
          ['link'],
        ],
      },
      fieldName: 'managementStructureText',
      label: 'Management Structure Details',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
  ];
}

// Mock client data for development and testing
export const mockClientData = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    contactNumber: '+1 (555) 123-4567',
    company: 'TechCorp Solutions',
    industry: 'Technology',
    website: 'https://techcorp.com',
    address: '123 Tech Street, Suite 400',
    city: 'San Francisco',
    country: 'United States',
    description:
      'Leading technology solutions provider specializing in enterprise software development and cloud infrastructure.',
    status: 'ACTIVE' as const,
    createdTime: '2024-01-15 09:30:00',
    lastModifiedTime: '2024-11-20 14:22:00',
    lastContactTime: '2024-11-18 16:45:00',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@healthplus.com',
    contactNumber: '+1 (555) 987-6543',
    company: 'HealthPlus Medical Center',
    industry: 'Healthcare',
    website: 'https://healthplus.com',
    address: '456 Medical Center Blvd, Floor 12',
    city: 'New York',
    country: 'United States',
    description:
      'Comprehensive healthcare services with focus on patient-centered care and innovative medical technologies.',
    status: 'ACTIVE' as const,
    createdTime: '2024-01-10 11:15:00',
    lastModifiedTime: '2024-11-19 10:30:00',
    lastContactTime: '2024-11-17 14:20:00',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@financegroup.com',
    contactNumber: '+1 (555) 456-7890',
    company: 'Global Finance Group Ltd',
    industry: 'Finance',
    website: 'https://globalfinancegroup.com',
    address: '789 Wall Street, 25th Floor',
    city: 'New York',
    country: 'United States',
    description:
      'Investment and financial advisory services for corporate clients with expertise in international markets.',
    status: 'ACTIVE' as const,
    createdTime: '2024-01-05 14:20:00',
    lastModifiedTime: '2024-11-16 09:15:00',
    lastContactTime: '2024-11-15 13:45:00',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@retailworld.com',
    contactNumber: '+1 (555) 321-0987',
    company: 'Retail World Inc',
    industry: 'Retail',
    website: 'https://retailworld.com',
    address: '321 Commerce Ave, Building B',
    city: 'Chicago',
    country: 'United States',
    description:
      'Multi-channel retail solutions and e-commerce platform development with omnichannel integration.',
    status: 'INACTIVE' as const,
    createdTime: '2024-01-08 16:30:00',
    lastModifiedTime: '2024-10-16 11:20:00',
    lastContactTime: '2024-10-14 15:10:00',
  },
  {
    id: '5',
    name: 'David Rodriguez',
    email: 'david.rodriguez@manufacturing.com',
    contactNumber: '+1 (555) 789-0123',
    company: 'Advanced Manufacturing Solutions',
    industry: 'Manufacturing',
    website: 'https://advancedmfg.com',
    address: '555 Industrial Park Dr',
    city: 'Detroit',
    country: 'United States',
    description:
      'Precision manufacturing and automation solutions for automotive and aerospace industries.',
    status: 'ACTIVE' as const,
    createdTime: '2024-02-12 08:45:00',
    lastModifiedTime: '2024-11-14 16:30:00',
    lastContactTime: '2024-11-12 11:15:00',
  },
  {
    id: '6',
    name: 'Lisa Wang',
    email: 'lisa.wang@edutech.com',
    contactNumber: '+1 (555) 654-3210',
    company: 'EduTech Innovations',
    industry: 'Education',
    website: 'https://edutech-innovations.com',
    address: '888 University Ave, Campus Center',
    city: 'Boston',
    country: 'United States',
    description:
      'Educational technology solutions and digital learning platforms for K-12 and higher education.',
    status: 'ACTIVE' as const,
    createdTime: '2024-02-20 13:20:00',
    lastModifiedTime: '2024-11-13 09:45:00',
    lastContactTime: '2024-11-11 15:30:00',
  },
  {
    id: '7',
    name: 'James Thompson',
    email: 'james.thompson@realestate.com',
    contactNumber: '+1 (555) 147-2580',
    company: 'Premier Real Estate Group',
    industry: 'Real Estate',
    website: 'https://premierrealestate.com',
    address: '999 Property Lane, Tower 1',
    city: 'Los Angeles',
    country: 'United States',
    description:
      'Commercial and residential real estate development with sustainable building practices.',
    status: 'ACTIVE' as const,
    createdTime: '2024-03-05 10:15:00',
    lastModifiedTime: '2024-11-10 14:20:00',
    lastContactTime: '2024-11-08 12:45:00',
  },
  {
    id: '8',
    name: 'Maria Garcia',
    email: 'maria.garcia@consulting.com',
    contactNumber: '+1 (555) 369-1470',
    company: 'Strategic Consulting Partners',
    industry: 'Consulting',
    website: 'https://strategicconsulting.com',
    address: '777 Business Plaza, Executive Suite',
    city: 'Atlanta',
    country: 'United States',
    description:
      'Management consulting and business transformation services for Fortune 500 companies.',
    status: 'ACTIVE' as const,
    createdTime: '2024-03-18 15:40:00',
    lastModifiedTime: '2024-11-09 11:30:00',
    lastContactTime: '2024-11-07 16:20:00',
  },
  {
    id: '9',
    name: 'Robert Kim',
    email: 'robert.kim@mediagroup.com',
    contactNumber: '+1 (555) 258-1470',
    company: 'Digital Media Entertainment',
    industry: 'Media & Entertainment',
    website: 'https://digitalmedia.com',
    address: '333 Entertainment Blvd, Studio Complex',
    city: 'Los Angeles',
    country: 'United States',
    description:
      'Digital content creation and distribution platform for streaming and social media.',
    status: 'ACTIVE' as const,
    createdTime: '2024-04-02 12:25:00',
    lastModifiedTime: '2024-11-06 13:15:00',
    lastContactTime: '2024-11-04 10:50:00',
  },
  {
    id: '10',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@globaltech.sg',
    contactNumber: '+65 6123-4567',
    company: 'Global Tech Solutions Pte Ltd',
    industry: 'Technology',
    website: 'https://globaltech.sg',
    address: '1 Marina Bay Financial Centre, Level 30',
    city: 'Singapore',
    country: 'Singapore',
    description:
      'Regional technology hub providing AI and machine learning solutions across Asia-Pacific.',
    status: 'ACTIVE' as const,
    createdTime: '2024-04-15 09:10:00',
    lastModifiedTime: '2024-11-05 15:45:00',
    lastContactTime: '2024-11-03 14:30:00',
  },
  {
    id: '11',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@construction.ae',
    contactNumber: '+971 4-123-4567',
    company: 'Emirates Construction Group',
    industry: 'Other',
    website: 'https://emiratesconstruction.ae',
    address: 'Sheikh Zayed Road, Business Bay',
    city: 'Dubai',
    country: 'United Arab Emirates',
    description:
      'Large-scale construction and infrastructure development projects in the Middle East region.',
    status: 'ACTIVE' as const,
    createdTime: '2024-05-08 11:30:00',
    lastModifiedTime: '2024-11-02 12:20:00',
    lastContactTime: '2024-10-31 09:15:00',
  },
  {
    id: '12',
    name: 'Sophie Martin',
    email: 'sophie.martin@pharma.fr',
    contactNumber: '+33 1-23-45-67-89',
    company: 'BioPharm Research Institute',
    industry: 'Healthcare',
    website: 'https://biopharma.fr',
    address: '15 Avenue des Champs-Élysées',
    city: 'Paris',
    country: 'France',
    description:
      'Pharmaceutical research and development with focus on innovative drug discovery and clinical trials.',
    status: 'INACTIVE' as const,
    createdTime: '2024-05-22 14:45:00',
    lastModifiedTime: '2024-09-15 16:30:00',
    lastContactTime: '2024-09-10 11:20:00',
  },
] as const;

// Utility functions for mock data
export const getClientsByIndustry = (industry: string) => {
  return mockClientData.filter((client) => client.industry === industry);
};

export const getActiveClients = () => {
  return mockClientData.filter((client) => client.status === 'ACTIVE');
};

export const getClientsByCountry = (country: string) => {
  return mockClientData.filter((client) => client.country === country);
};

export const getRecentClients = (days: number = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return mockClientData.filter((client) => {
    const createdDate = new Date(client.createdTime);
    return createdDate >= cutoffDate;
  });
};

// Statistics helpers
export const getClientStats = () => {
  const total = mockClientData.length;
  const active = getActiveClients().length;
  const inactive = total - active;

  const byIndustry = mockClientData.reduce(
    (acc, client) => {
      acc[client.industry] = (acc[client.industry] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const byCountry = mockClientData.reduce(
    (acc, client) => {
      acc[client.country] = (acc[client.country] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return {
    total,
    active,
    inactive,
    byIndustry,
    byCountry,
  };
};
// Step 2: Local Organization Info Schema
export function useStep2Schema(): VbenFormSchema[] {
  return [
    {
      component: 'Divider',
      componentProps: createDividerProps(
        'Local Organizational Chart',
        'COMPANY',
      ),
      fieldName: 'localOrgChart',
      label: 'Local Organizational Chart',
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.jpg,.jpeg,.png,.pdf,.xlsx',
        listType: 'picture-card',
        maxCount: 1,
        beforeUpload: () => false,
        showUploadList: {
          showPreviewIcon: true,
          showRemoveIcon: true,
        },
      },
      fieldName: 'localOrgChartFile',
      label: 'Local Organizational Chart',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: '(Format: jpg, jpeg, png, pdf, xlsx)',
    },
    {
      component: 'Text',
      componentProps: {
        style: { fontSize: '12px', color: '#999' },
      },
      fieldName: 'lastUpdated',
      label: '',
      labelWidth: 0,
      defaultValue: 'Last updated: 12 Nov 2024, 11:23am',
    },
    {
      component: 'Divider',
      componentProps: createDividerProps(
        'Departments & Headcounts',
        'LOCATION',
      ),
      fieldName: 'departmentsHeadcounts',
      label: 'Departments & Headcounts',
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.xlsx,.xls,.csv,.pdf',
        listType: 'text',
        maxCount: 1,
        beforeUpload: () => false,
      },
      fieldName: 'departmentsFile',
      label: 'Departments & Headcounts',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: '(Format: xlsx, xls, csv, pdf)',
    },
    {
      component: 'Table',
      componentProps: {
        columns: [
          { title: 'Department', dataIndex: 'department', key: 'department' },
          { title: 'Headcount', dataIndex: 'headcount', key: 'headcount' },
        ],
        dataSource: [
          { key: '1', department: 'Insert Department', headcount: 'X' },
          { key: '2', department: 'XX', headcount: 'X' },
          { key: '3', department: 'XX', headcount: 'X' },
        ],
        pagination: false,
        size: 'small',
        bordered: true,
      },
      fieldName: 'departmentsTable',
      label: '',
      labelWidth: 0,
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: 'XXXX',
        style: { textAlign: 'center', fontWeight: 'bold' },
        disabled: true,
      },
      fieldName: 'totalHeadcount',
      label: 'Total',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Divider',
      componentProps: createDividerProps(
        'Overview of Business Activities and Controlled Transactions',
        'ADDITIONAL',
      ),
      fieldName: 'businessOverview',
      label: 'Overview of Business Activities and Controlled Transactions',
    },
    {
      component: 'QuillEditor',
      componentProps: {
        placeholder: 'Write something here...',
        height: '200px',
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['clean'],
          ['link'],
        ],
      },
      fieldName: 'businessActivitiesOverview',
      label: '',
      labelWidth: 0,
    },
  ];
}

// Step 3: Group Information Schema
export function useStep3Schema(): VbenFormSchema[] {
  return [
    {
      component: 'Divider',
      componentProps: createDividerProps('Group Structure', 'LOCATION'),
      fieldName: 'groupStructure',
      label: 'Group Structure',
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.jpg,.jpeg,.png,.pdf,.xlsx',
        listType: 'picture-card',
        maxCount: 1,
        beforeUpload: () => false,
        showUploadList: {
          showPreviewIcon: true,
          showRemoveIcon: true,
        },
      },
      fieldName: 'groupStructureFile',
      label: 'Group Structure',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: '(Format: jpg, jpeg, png, pdf, xlsx)',
    },
    {
      component: 'Text',
      componentProps: {
        style: { fontSize: '12px', color: '#999' },
      },
      fieldName: 'groupStructureLastUpdated',
      label: '',
      labelWidth: 0,
      defaultValue: 'Last updated: 12 Nov 2024, 11:23am',
    },
    {
      component: 'Divider',
      componentProps: createDividerProps(
        'Details of Associated Persons',
        'COMPANY',
      ),
      fieldName: 'associatedPersons',
      label: 'Details of Associated Persons',
    },
    {
      component: 'Upload',
      componentProps: {
        accept: '.xlsx,.xls,.csv,.pdf',
        listType: 'text',
        maxCount: 1,
        beforeUpload: () => false,
      },
      fieldName: 'associatedPersonsFile',
      label: 'Details of associated persons',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: '(Format: xlsx, xls, csv, pdf)',
    },
    {
      component: 'Table',
      componentProps: {
        columns: [
          {
            title: 'Company Name',
            dataIndex: 'companyName',
            key: 'companyName',
          },
          { title: 'Country', dataIndex: 'country', key: 'country' },
          { title: 'Address', dataIndex: 'address', key: 'address' },
          {
            title: 'Tax Identification Number',
            dataIndex: 'taxId',
            key: 'taxId',
          },
          {
            title: 'Business Activity',
            dataIndex: 'businessActivity',
            key: 'businessActivity',
          },
        ],
        dataSource: [
          {
            key: '1',
            companyName: 'A1 Sdn Bhd',
            country: 'MY',
            address: '12, Jalan Hang Tuah, Kuala L...',
            taxId: 'XXXXXXXXXXX',
            businessActivity:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed velit nibh, pulvinar et posuere...',
          },
          {
            key: '2',
            companyName: 'A2 Sdn Bhd',
            country: 'MY',
            address: '12, Jalan Hang Tuah, Kuala L...',
            taxId: 'XXXXXXXXXXX',
            businessActivity:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed velit nibh, pulvinar et posuere...',
          },
          {
            key: '3',
            companyName: 'B1 PLC',
            country: 'SG',
            address: '395-03, Orchard Rd, Singapore',
            taxId: 'XXXXXXXXXXX',
            businessActivity:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed velit nibh, pulvinar et posuere...',
          },
          {
            key: '4',
            companyName: 'ABC Sdn Bhd',
            country: 'MY',
            address: '12, Jalan Hang Tuah, Kuala L...',
            taxId: 'XXXXXXXXXXX',
            businessActivity:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed velit nibh, pulvinar et posuere...',
          },
          {
            key: '5',
            companyName: 'DEF PLC',
            country: 'TH',
            address: '195, New Road, Bangkok, Bangkok',
            taxId: 'XXXXXXXXXXX',
            businessActivity:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed velit nibh, pulvinar et posuere...',
          },
          {
            key: '6',
            companyName: 'Xxx Sdn Bhd',
            country: 'MY',
            address: '12, Jalan Hang Tuah, Kuala L...',
            taxId: 'XXXXXXXXXXX',
            businessActivity:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed velit nibh, pulvinar et posuere...',
          },
        ],
        pagination: false,
        size: 'small',
        bordered: true,
        scroll: { x: 1200 },
      },
      fieldName: 'associatedPersonsTable',
      label: '',
      labelWidth: 0,
    },
  ];
}

// Step 4: Group Business Schema
export function useStep4Schema(): VbenFormSchema[] {
  return [
    {
      component: 'Divider',
      componentProps: createDividerProps(
        "Group's Business Activities",
        'ADDITIONAL',
      ),
      fieldName: 'groupBusinessActivities',
      label: "Group's Business Activities",
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: 'Group history',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'groupHistory',
      label: 'Group history',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: 'Products and services',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'productsAndServices',
      label: 'Products and services',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: 'Geographic Markets',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'geographicMarkets',
      label: 'Geographic Markets',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: 'Supply Chains',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'supplyChains',
      label: 'Supply Chains',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder:
          'Restructuring, acquisition or divestiture during the basis period',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'restructuring',
      label:
        'Restructuring, acquisition or divestiture during the basis period',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Divider',
      componentProps: createDividerProps(
        "Group's financial activities that are connected to the business in Malaysia",
        'COMPANY',
      ),
      fieldName: 'groupFinancialActivities',
      label:
        "Group's financial activities that are connected to the business in Malaysia",
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder:
          'Inter-entity financial activities (and financial arrangements with third parties where relevant)',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'interEntityFinancialActivities',
      label:
        'Inter-entity financial activities (and financial arrangements with third parties where relevant)',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder:
          'Entity within the Group that provides central financing function',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'centralFinancingEntity',
      label: 'Entity within the Group that provides central financing function',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder:
          'Group transfer pricing policy relating to financing arrangements between associated persons',
        rows: 6,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
      },
      fieldName: 'transferPricingPolicy',
      label:
        'Group transfer pricing policy relating to financing arrangements between associated persons',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
    },
  ];
}

// Grid form schema for search/filter
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: 'Name',
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: 'Email',
    },
    {
      component: 'Input',
      fieldName: 'company',
      label: 'Company',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        allowClear: true,
        options: INDUSTRY_OPTIONS,
      },
      fieldName: 'industry',
      label: 'Industry',
    },
    {
      component: 'Input',
      fieldName: 'city',
      label: 'City',
    },
    {
      component: 'Select',
      componentProps: {
        class: 'w-full',
        allowClear: true,
        options: STATUS_OPTIONS,
      },
      fieldName: 'status',
      label: 'Status',
    },
  ];
}

// Table columns configuration
export function useColumns<T = SystemClient>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      type: 'checkbox',
      width: 50,
      resizable: false,
    },
    {
      field: 'name',
      title: 'NAME',
      resizable: false,
    },
    {
      field: 'company',
      title: 'COMPANY',
      resizable: false,
    },
    {
      field: 'industry',
      title: 'INDUSTRY',
      resizable: false,
    },
    {
      field: 'email',
      title: 'EMAIL',
      resizable: false,
    },
    {
      field: 'contactNumber',
      title: 'CONTACT',
      resizable: false,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        options: [
          { color: 'success', label: 'ACTIVE', value: 'ACTIVE' },
          { color: 'error', label: 'INACTIVE', value: 'INACTIVE' },
        ],
      },
      field: 'status',
      title: 'STATUS',
      resizable: false,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: 'Client',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'start-tax-filing',
            icon: 'carbon:document-tasks',
            iconOnly: true,
            tooltip: 'Start Tax Filing',
          },
          {
            code: 'view',
            icon: 'carbon:view',
            iconOnly: true,
          },
          {
            code: 'edit',
            icon: 'carbon:edit',
            iconOnly: true,
          },
          {
            code: 'delete',
            icon: 'carbon:trash-can',
            iconOnly: true,
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: 'ACTIONS',
      resizable: false,
    },
  ];
}
