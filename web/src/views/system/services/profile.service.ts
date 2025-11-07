/**
 * @file Tax Agent Profile Service
 * @description Mock service for tax agent profile operations.
 * Provides getOwnProfile and updateOwnProfile with:
 * - Access control: only allow access to own row via Tax Agent No from session
 * - Optimistic concurrency: version/updated_at checks
 * - Validation: required fields, E.164 phone, email format, postcode
 * - E.164 phone normalization
 * - Uses mock_db.ts (no direct file IO)
 */

import { db, delay } from './mock_db';

// Type definition for user info
interface UserInfo {
  taxAgentNo?: string;
}

// User info provider - can be overridden in tests
export const userInfoProvider = {
  getUserInfo: (): UserInfo => {
    // Default to seeded dev row so the dev server uses the in-memory mock DB.
    // Tests can still override this provider (vi.spyOn or direct assignment).
    return { taxAgentNo: 'TA-0001' };
  },
};

// Initialize with real user store (called at module load in production)
export async function initUserStore() {
  try {
    // const { useUserStore } = await import('#/store/modules/user');
    // const userStore = useUserStore();
    // userInfoProvider.getUserInfo = () => userStore.getUserInfo?.() || {};
  } catch {
    // In test environment or if store unavailable
  }
}

// Auto-init only in production. Development uses the seeded TA-0001 provider
// so the mock in-memory `db` is the single source of truth for local dev.
if (import.meta.env.MODE === 'production') {
  initUserStore();
}

interface TaxAgentProfile {
  id: number;
  tax_agent_name: string;
  tax_agent_no: string;
  tax_agent_nric: string;
  position: number;
  company_name: string;
  business_registration_no: string;
  address_1: string;
  address_2: string;
  address_3: string;
  postcode: string;
  town_city: string;
  state: number;
  country: string;
  email: string;
  tel_no: string;
  tin: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface ProfileUpdatePayload {
  tax_agent_name?: string;
  tax_agent_nric?: string;
  email?: string;
  tel_no?: string;
  address_1?: string;
  address_2?: string;
  address_3?: string;
  postcode?: string;
  town_city?: string;
  state?: number;
  version: number;
  // View-only fields that should be ignored if provided
  tax_agent_no?: string;
  position?: number;
  company_name?: string;
  business_registration_no?: string;
  tin?: string;
}

/**
 * Get the current authenticated tax agent's profile.
 * @returns {Promise<TaxAgentProfile>} The profile data
 * @throws {Error} Forbidden if taxAgentNo is missing from session
 * @throws {Error} Not Found if no matching row exists
 */
export async function getOwnProfile(): Promise<TaxAgentProfile> {
  await delay();

  const userInfo = userInfoProvider.getUserInfo();
  const taxAgentNo = userInfo.taxAgentNo;

  if (!taxAgentNo) {
    throw new Error('Forbidden: Tax Agent No is required');
  }

  const table = db.lookup_tax_agents || [];
  const profile = table.find((agent: any) => agent.tax_agent_no === taxAgentNo);

  if (!profile) {
    throw new Error('Not Found: Profile not found for this tax agent');
  }

  return profile as TaxAgentProfile;
}

/**
 * Update the current authenticated tax agent's profile.
 * @param {ProfileUpdatePayload} updates - The fields to update
 * @returns {Promise<TaxAgentProfile>} The updated profile
 * @throws {Error} Forbidden if taxAgentNo is missing from session
 * @throws {Error} Not Found if no matching row exists
 * @throws {Error} Conflict if version mismatch (optimistic concurrency)
 * @throws {Error} Validation errors for invalid inputs
 */
export async function updateOwnProfile(
  updates: ProfileUpdatePayload,
): Promise<TaxAgentProfile> {
  await delay();

  const userInfo = userInfoProvider.getUserInfo();
  const taxAgentNo = userInfo.taxAgentNo;

  if (!taxAgentNo) {
    throw new Error('Forbidden: Tax Agent No is required');
  }

  const table = db.lookup_tax_agents || [];
  const profileIndex = table.findIndex(
    (agent: any) => agent.tax_agent_no === taxAgentNo,
  );

  if (profileIndex === -1) {
    throw new Error('Not Found: Profile not found for this tax agent');
  }

  const currentProfile = table[profileIndex];

  // Optimistic concurrency check
  if (currentProfile.version !== updates.version) {
    throw new Error('Conflict: Version mismatch. Please reload and try again.');
  }

  // Validation
  const emailToValidate = updates.email ?? currentProfile.email;
  const telToValidate = updates.tel_no ?? currentProfile.tel_no;
  const postcodeToValidate = updates.postcode ?? currentProfile.postcode;

  if (!emailToValidate || emailToValidate.trim() === '') {
    throw new Error('Email is required');
  }

  // Simple email format validation
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  if (!emailRegex.test(emailToValidate)) {
    throw new Error('Invalid email format');
  }

  if (!telToValidate || telToValidate.trim() === '') {
    throw new Error('Contact No is required');
  }

  // E.164 normalization: convert Malaysian numbers to +60 format
  let normalizedPhone = telToValidate.trim();
  if (normalizedPhone.startsWith('0')) {
    // Malaysian format: 0123456789 -> +60123456789
    normalizedPhone = `+60${normalizedPhone.slice(1)}`;
  } else if (!normalizedPhone.startsWith('+')) {
    // If no country code at all, assume Malaysia
    normalizedPhone = `+60${normalizedPhone}`;
  }

  // Validate E.164 format: +[country code][number]
  const e164Regex = /^\+\d{10,15}$/;
  if (!e164Regex.test(normalizedPhone)) {
    throw new Error(
      'Invalid phone format. Must be E.164 format (+60XXXXXXXXX)',
    );
  }

  // Validate postcode: must be 5 digits for Malaysia
  if (postcodeToValidate && !/^\d{5}$/.test(postcodeToValidate)) {
    throw new Error('Postcode must be 5 digits');
  }

  // Build updated profile (only editable fields)
  const editableFields = {
    tax_agent_name: updates.tax_agent_name,
    tax_agent_nric: updates.tax_agent_nric,
    email: emailToValidate,
    tel_no: normalizedPhone,
    address_1: updates.address_1,
    address_2: updates.address_2,
    address_3: updates.address_3,
    postcode: postcodeToValidate,
    town_city: updates.town_city,
    state: updates.state,
  };

  // Remove undefined fields (keep existing values)
  const fieldsToUpdate = Object.fromEntries(
    Object.entries(editableFields).filter(([_, v]) => v !== undefined),
  );

  // Apply updates
  const updatedProfile = {
    ...currentProfile,
    ...fieldsToUpdate,
    version: currentProfile.version + 1,
    updated_at: new Date().toISOString(),
  };

  // Update in db
  table[profileIndex] = updatedProfile;

  return updatedProfile as TaxAgentProfile;
}
