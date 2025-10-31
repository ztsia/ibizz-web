import type { LookupCategory } from '../components';
import {
  MdiAccount,
  MdiBank,
  MdiBriefcase,
  MdiMapMarker,
  MdiHome,
  MdiCurrencyUsd,
  MdiFileDocument,
} from '@vben/icons';

export const categories: LookupCategory[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Manage your personal information and preferences',
    icon: MdiAccount,
  },
  {
    id: 'financial-banking',
    title: 'Financial and Banking',
    description: 'Configure financial accounts and banking details',
    icon: MdiBank,
  },
  {
    id: 'business-and-regulatory',
    title: 'Business and Regulatory',
    description: 'Business settings and regulatory compliance',
    icon: MdiBriefcase,
  },
  {
    id: 'geographic-and-location',
    title: 'Geographic and Location',
    description: 'Location-based settings and preferences',
    icon: MdiMapMarker,
  },
  {
    id: 'assets-and-properties',
    title: 'Assets and Properties',
    description: 'Manage your assets and property information',
    icon: MdiHome,
  },
  {
    id: 'income-and-interest',
    title: 'Income and Interest',
    description: 'Income sources and interest settings',
    icon: MdiCurrencyUsd,
  },
  {
    id: 'income-statement-headers',
    title: 'Income Statement',
    description: 'Configure income statement preferences',
    icon: MdiFileDocument,
  },
];

export default categories;
