import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { z } from '#/adapter/form';

// User interface type (you may need to define this in your API types)
export interface SystemUser {
  contactNumber: string;
  createdTime: string;
  email: string;
  id: string;
  lastLoginTime: string;
  lastModifiedTime: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// Common form configuration constants
const FORM_CONFIG = {
  // Common component props
  INPUT_SIZE: 'large' as const,
  BORDER_RADIUS: '8px',
  LABEL_WIDTH: 140,

  // Section divider styles
  DIVIDER_STYLES: {
    PERSONAL: {
      borderColor: '#e0e7ff',
      color: '#4f46e5',
    },
    ROLE: {
      borderColor: '#fef3c7',
      color: '#d97706',
    },
    ACCOUNT: {
      borderColor: '#dcfce7',
      color: '#16a34a',
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

// Role options configuration
const USER_ROLES = [
  {
    label: 'Agency Admin',
    value: 'Agency Admin',
    description: 'Full system access and user management',
  },
  {
    label: 'Candidate Holder',
    value: 'Candidate Holder',
    description: 'Manage candidate profiles and applications',
  },
  {
    label: 'Client Holder',
    value: 'Client Holder',
    description: 'Manage client accounts and job postings',
  },
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

export function useFormSchema(): VbenFormSchema[] {
  return [
    // Personal Information Section
    {
      component: 'Divider',
      componentProps: createDividerProps('Personal Information', 'PERSONAL'),
      fieldName: 'personalInfo',
      label: 'Personal Information',
    },
    {
      component: 'Input',
      componentProps: createInputProps('Enter full name (e.g., John Doe)', 100),
      fieldName: 'name',
      label: 'Full Name',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: "Enter the user's complete name as it should appear in the system",
      rules: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    },
    {
      component: 'Input',
      componentProps: {
        ...createInputProps('Enter email address (e.g., john.doe@company.com)'),
        type: 'email',
      },
      fieldName: 'email',
      label: 'Email Address',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: 'This will be used for login and system notifications',
      rules: z
        .string()
        .min(1, 'Please enter the email address')
        .email('Please enter a valid email address'),
    },
    {
      component: 'Input',
      componentProps: createInputProps(
        'Enter contact number (e.g., +1 (555) 123-4567)',
        20,
      ),
      fieldName: 'contactNumber',
      label: 'Contact Number',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: 'Optional: Primary contact number for the user',
      rules: z
        .string()
        .regex(/^\+?[0-9\s\-()]+$/, 'Please enter a valid contact number')
        .optional(),
    },

    // Role & Permissions Section
    {
      component: 'Divider',
      componentProps: createDividerProps('Role & Permissions', 'ROLE'),
      fieldName: 'rolePermissions',
      label: 'Role & Permissions',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: false,
        class: 'w-full',
        placeholder: 'Select user role',
        size: FORM_CONFIG.INPUT_SIZE,
        style: { borderRadius: FORM_CONFIG.BORDER_RADIUS },
        options: USER_ROLES,
        optionLabelProp: 'label',
      },
      fieldName: 'role',
      label: 'User Role',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: 'Select the appropriate role based on user responsibilities',
      rules: z.string().min(1, 'Please select a user role'),
    },

    // Account Settings Section
    {
      component: 'Divider',
      componentProps: createDividerProps('Account Settings', 'ACCOUNT'),
      fieldName: 'accountSettings',
      label: 'Account Settings',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid' as const,
        size: FORM_CONFIG.INPUT_SIZE,
        style: {
          width: '100%',
          borderRadius: FORM_CONFIG.BORDER_RADIUS,
        },
        options: STATUS_OPTIONS,
        optionType: 'button' as const,
      },
      defaultValue: 'ACTIVE',
      fieldName: 'status',
      label: 'Account Status',
      labelWidth: FORM_CONFIG.LABEL_WIDTH,
      help: 'Active users can log in and access the system. Inactive users are blocked from login.',
    },
  ];
}

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
      fieldName: 'contactNumber',
      label: 'Phone',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: [
          { label: 'Agency Admin', value: 'Agency Admin' },
          { label: 'Candidate Holder', value: 'Candidate Holder' },
          { label: 'Client Holder', value: 'Client Holder' },
        ],
      },
      fieldName: 'role',
      label: 'Role',
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Inactive', value: 'INACTIVE' },
        ],
      },
      fieldName: 'status',
      label: 'Status',
    },
  ];
}

export function useColumns<T = SystemUser>(
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
      width: 150,
      resizable: false,
    },
    {
      field: 'email',
      title: 'EMAIL',
      width: 200,
      resizable: false,
    },
    {
      field: 'contactNumber',
      title: 'CONTACT NUMBER',
      width: 150,
      resizable: false,
    },
    {
      field: 'role',
      title: 'ROLE',
      width: 150,
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
      width: 100,
      resizable: false,
    },
    {
      field: 'lastLoginTime',
      title: 'LAST LOGIN TIME',
      width: 180,
      resizable: false,
    },
    {
      field: 'createdTime',
      title: 'CREATED TIME',
      width: 180,
      resizable: false,
    },
    {
      field: 'lastModifiedTime',
      title: 'LAST MODIFIED TIME',
      width: 180,
      resizable: false,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: 'User',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
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
            code: 'reset',
            icon: 'carbon:reset',
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
