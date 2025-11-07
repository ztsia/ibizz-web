/**
 * @file Tax Agent Profile Service
 * @description
 * Mock service that exposes the minimal API surface required by the
 * Profile UI: read the current authenticated tax agent's row and update it.
 *
 * This module intentionally mirrors a server-side implementation so that
 * frontend development and reviewers can reason about the expected backend
 * behaviour. The in-memory `db` is the single source of truth for the
 * development server and tests. When the real backend is implemented, the
 * functions here should be replaced by calls to the real API but the
 * documented semantics (access control, validation and optimistic
 * concurrency) must be preserved.
 *
 * Key responsibilities implemented by this mock:
 * - Access control: only allow reads/updates for the authenticated user's
 *   Tax Agent No (from the session/user store).
 * - Optimistic concurrency: validate that the client edits are based on the
 *   latest row state (version/updated_at) and reject stale writes with a
 *   Conflict error.
 * - Validation: basic checks for required fields and formats (email,
 *   E.164 phone, postcode). Normalises phone numbers into E.164 for storage.
 * - Server-authoritative timestamps/versioning: the mock sets `updated_at`
 *   and increments `version` on successful updates.
 *
 * Implementation note for backend engineers:
 * - getOwnProfile should SELECT the row from `lookup_tax_agents` WHERE
 *   `tax_agent_no = :taxAgentNo`.
 * - updateOwnProfile should perform an UPDATE with a WHERE clause that
 *   includes the incoming `version` (or `updated_at`) to enforce optimistic
 *   concurrency in a single atomic statement (e.g. `UPDATE ... WHERE id = :id
 *   AND version = :version RETURNING *`). If the UPDATE affects 0 rows,
 *   return a Conflict error to the client.
 */

import { db, delay } from './mock_db';

// Type definition for user info (used by the userInfoProvider)
interface UserInfo {
  taxAgentNo?: string;
}

/**
 * User info provider
 *
 * In production this would read the authenticated user's session / user
 * store. For development and tests we expose a replaceable provider so
 * test code can simulate different authenticated users.
 *
 * Backend implementers: the real server would determine the authenticated
 * user's tax agent identity from the auth token/session and use that to
 * authorise reads/updates.
 */
export const userInfoProvider = {
  getUserInfo: (): UserInfo => {
    // Default to seeded dev row so the dev server uses the in-memory mock DB.
    // Tests can override this provider (vi.spyOn or direct assignment).
    return { taxAgentNo: 'TA-0001' };
  },
};

// Initialize with real user store (called at module load in production)
/**
 * initUserStore()
 *
 * Hook point for wiring the mock provider to the real user store in the
 * running application. In production the function would read the user
 * store and patch `userInfoProvider.getUserInfo` so that the service uses
 * the same authenticated identity as the rest of the app.
 *
 * Note: this method is a no-op in the mock environment used for tests and
 * local development, but it illustrates where the auth integration belongs.
 */
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
 * getOwnProfile()
 *
 * Read the current authenticated tax agent's profile from the lookup
 * table. The function enforces access control using the taxAgentNo provided
 * by `userInfoProvider.getUserInfo()`.
 *
 * Backend implementation guidance:
 * - SQL: SELECT * FROM lookup_tax_agents WHERE tax_agent_no = :taxAgentNo
 * - If no taxAgentNo exists in the session, return 403 Forbidden.
 * - If no row is found, return 404 Not Found.
 *
 * Returns a complete TaxAgentProfile including `version` and `updated_at` so
 * clients can perform optimistic concurrency checks when updating.
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
 * updateOwnProfile()
 *
 * Update the authenticated tax agent's editable fields. The function:
 * 1. Enforces access control using the Tax Agent No from the session.
 * 2. Performs an optimistic concurrency check using `version` (rejects if
 *    the provided version does not match the current row).
 * 3. Validates required fields and formats.
 * 4. Normalises phone numbers to E.164 and sets server-authoritative
 *    `updated_at` and `version` values before persisting.
 *
 * Backend implementation guidance:
 * - Prefer a single atomic UPDATE statement that includes the concurrency
 *   predicate in the WHERE clause. Example (Postgres):
 *
 *   UPDATE lookup_tax_agents
 *   SET tax_agent_name = :tax_agent_name,
 *       email = :email,
 *       tel_no = :tel_no,
 *       -- other editable columns --
 *       version = version + 1,
 *       updated_at = now()
 *   WHERE tax_agent_no = :taxAgentNo AND version = :clientVersion
 *   RETURNING *;
 *
 *   If the UPDATE returns no rows then another actor modified the row and
 *   you should return a 409 Conflict to the client.
 *
 * - Alternatively, you can use `updated_at` equality as the concurrency
 *   check (compare the timestamps). Using a numeric `version` counter is
 *   simpler and avoids clock/precision issues.
 *
 * Errors
 * - 403 Forbidden: if the session doesn't include a taxAgentNo.
 * - 404 Not Found: if no row exists for the taxAgentNo.
 * - 409 Conflict: if optimistic concurrency check fails.
 * - 400 Bad Request: if validation fails (invalid email/phone/postcode).
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
  const emailRegex = /^[^\s@]+@[^\s@][^.\s@]*\.[^\s@]+$/;
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

  // Apply updates (server-authoritative version and timestamp)
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
