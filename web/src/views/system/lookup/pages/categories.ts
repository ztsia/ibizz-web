import type { LookupCategory } from '../components';
import {
  MdiBank,
  MdiBriefcase,
  MdiMapMarker,
  MdiHome,
  MdiCurrencyUsd,
  MdiFileDocument,
  LucideFileSpreadsheet,
  LucideClipboardCheck,
} from '@vben/icons';

export const categories: LookupCategory[] = [
  {
    id: 'financial-banking',
    title: 'Financial and Banking',
    description:
      'Manage the directory of banks, account types, and payment methods.',
    icon: MdiBank,
  },
  {
    id: 'business-and-regulatory',
    title: 'Business and Regulatory',
    description:
      'Manage business entities, registration IDs, and regulatory codes.',
    icon: MdiBriefcase,
  },
  {
    id: 'geographic-and-location',
    title: 'Geographic and Location',
    description:
      'Manage the list of countries, states, regions, and office locations.',
    icon: MdiMapMarker,
  },
  {
    id: 'assets-and-properties',
    title: 'Assets and Properties',
    description: 'Define and manage categories and types for company assets.',
    icon: MdiHome,
  },
  {
    id: 'income-and-interest',
    title: 'Income and Interest',
    description:
      'Manage definitions for income sources, revenue types, and interest rates.',
    icon: MdiCurrencyUsd,
  },
  {
    id: 'income-statement-headers',
    title: 'Income Statement',
    description:
      'Manage the account headers and groupings for financial statements.',
    icon: MdiFileDocument,
  },
  {
    id: 'tax-agent',
    title: 'Tax Agent',
    description:
      'Manage the directory of tax agents and their contact details.',
    icon: LucideFileSpreadsheet,
  },
  {
    id: 'audit-firm',
    title: 'Audit Firm',
    description:
      'Manage the directory of audit firms and their contact details.',
    icon: LucideClipboardCheck,
  },
];

export default categories;
