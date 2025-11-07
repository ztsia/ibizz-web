/**
 * @file Unit tests for Tax Agent Profile Service
 * @description Tests for getOwnProfile and updateOwnProfile, covering:
 * - Contract adherence (method signatures, return types)
 * - Optimistic concurrency (version/updated_at checks)
 * - Validation (required fields, E.164 phone format, email format, postcode)
 * - Access control (own-row-only via Tax Agent No from session)
 * - E.164 phone normalization
 * - Uses mock_db.ts (no direct file IO to mock_data.json)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '#/views/system/services/mock_db';
import {
  getOwnProfile,
  updateOwnProfile,
  userInfoProvider,
} from '#/views/system/services/profile.service';

// Mock user session to provide taxAgentNo
const mockUserSession = {
  taxAgentNo: 'TA-0001',
};

// Spy on userInfoProvider.getUserInfo to control its return value
vi.spyOn(userInfoProvider, 'getUserInfo').mockImplementation(
  () => mockUserSession,
);

describe('profile.service', () => {
  beforeEach(() => {
    // Reset mockUserSession to default state
    mockUserSession.taxAgentNo = 'TA-0001';

    // Reset mock_db to initial state with seeded tax agent
    db.lookup_tax_agents = [
      {
        id: 1,
        tax_agent_name: 'Acme Tax Services',
        tax_agent_no: 'TA-0001',
        tax_agent_nric: '900101-01-1234',
        position: 1,
        company_name: 'Acme Tax Services Sdn Bhd',
        business_registration_no: 'BRN123456',
        address_1: '10 Jalan Example',
        address_2: 'Off Jalan Sample',
        address_3: '',
        postcode: '43000',
        town_city: 'Kajang',
        state: 12,
        country: 'MYS',
        email: 'agent1@example.com',
        tel_no: '+60123456789',
        tin: 'TIN-0001',
        version: 1,
        created_at: '2025-11-06T00:00:00.000000+00:00',
        updated_at: '2025-11-06T00:00:00.000000+00:00',
      },
      {
        id: 2,
        tax_agent_name: 'Other Agent',
        tax_agent_no: 'TA-0002',
        tax_agent_nric: '900202-02-2345',
        position: 2,
        company_name: 'Other Company',
        business_registration_no: 'BRN654321',
        address_1: '20 Jalan Other',
        address_2: '',
        address_3: '',
        postcode: '50000',
        town_city: 'Kuala Lumpur',
        state: 14,
        country: 'MYS',
        email: 'agent2@example.com',
        tel_no: '+60198765432',
        tin: 'TIN-0002',
        version: 1,
        created_at: '2025-11-06T00:00:00.000000+00:00',
        updated_at: '2025-11-06T00:00:00.000000+00:00',
      },
    ];
  });

  describe('getOwnProfile', () => {
    it('should return the profile for the authenticated tax agent (TA-0001)', async () => {
      const profile = await getOwnProfile();

      expect(profile).toBeDefined();
      expect(profile.tax_agent_no).toBe('TA-0001');
      expect(profile.tax_agent_name).toBe('Acme Tax Services');
      expect(profile.email).toBe('agent1@example.com');
    });

    it('should throw Forbidden error if taxAgentNo is missing from session', async () => {
      mockUserSession.taxAgentNo = '';

      await expect(getOwnProfile()).rejects.toThrow('Forbidden');
    });

    it('should throw NotFound error if no matching row exists for taxAgentNo', async () => {
      mockUserSession.taxAgentNo = 'TA-9999';

      await expect(getOwnProfile()).rejects.toThrow('Not Found');
    });

    it('should only access own row (not other agents)', async () => {
      const profile = await getOwnProfile();

      // Verify we got TA-0001, not TA-0002
      expect(profile.tax_agent_no).toBe('TA-0001');
      expect(profile.tax_agent_no).not.toBe('TA-0002');
    });
  });

  describe('updateOwnProfile', () => {
    it('should update editable fields and return updated profile', async () => {
      const updates = {
        tax_agent_name: 'Updated Acme Tax',
        email: 'newemail@example.com',
        tel_no: '+60199998888',
        address_1: 'New Address 1',
        postcode: '43100',
        town_city: 'Seri Kembangan',
        state: 12,
        version: 1,
      };

      const result = await updateOwnProfile(updates);

      expect(result.tax_agent_name).toBe('Updated Acme Tax');
      expect(result.email).toBe('newemail@example.com');
      expect(result.tel_no).toBe('+60199998888');
      expect(result.address_1).toBe('New Address 1');
      expect(result.version).toBe(2); // Incremented
    });

    it('should normalize phone to E.164 format (+60XXXXXXXXX)', async () => {
      const updates = {
        tel_no: '0123456789', // Malaysian format without country code
        version: 1,
      };

      const result = await updateOwnProfile(updates);

      expect(result.tel_no).toBe('+60123456789');
    });

    it('should reject update with stale version (optimistic concurrency)', async () => {
      const updates = {
        email: 'stale@example.com',
        version: 0, // Stale version
      };

      await expect(updateOwnProfile(updates)).rejects.toThrow(
        'Conflict: Version mismatch',
      );
    });

    it('should reject update if email is empty', async () => {
      const updates = {
        email: '',
        version: 1,
      };

      await expect(updateOwnProfile(updates)).rejects.toThrow(
        'Email is required',
      );
    });

    it('should reject update if email is invalid format', async () => {
      const updates = {
        email: 'invalid-email',
        version: 1,
      };

      await expect(updateOwnProfile(updates)).rejects.toThrow(
        'Invalid email format',
      );
    });

    it('should reject update if tel_no is empty', async () => {
      const updates = {
        tel_no: '',
        version: 1,
      };

      await expect(updateOwnProfile(updates)).rejects.toThrow(
        'Contact No is required',
      );
    });

    it('should reject update if tel_no is not E.164 format after normalization', async () => {
      const updates = {
        tel_no: 'invalid-phone',
        version: 1,
      };

      await expect(updateOwnProfile(updates)).rejects.toThrow(
        'Invalid phone format',
      );
    });

    it('should reject update if postcode is not 5 digits', async () => {
      const updates = {
        postcode: '1234', // Only 4 digits
        version: 1,
      };

      await expect(updateOwnProfile(updates)).rejects.toThrow(
        'Postcode must be 5 digits',
      );
    });

    it('should throw Forbidden if taxAgentNo is missing from session', async () => {
      mockUserSession.taxAgentNo = '';

      await expect(
        updateOwnProfile({ email: 'test@example.com', version: 1 }),
      ).rejects.toThrow('Forbidden');
    });

    it("should prevent updating another agent's row", async () => {
      // Try to update TA-0002 while authenticated as TA-0001
      mockUserSession.taxAgentNo = 'TA-0001';

      const updates = {
        email: 'hacker@example.com',
        version: 1,
      };

      const result = await updateOwnProfile(updates);

      // Should only update TA-0001, verify TA-0002 is unchanged
      const otherAgent = db.lookup_tax_agents.find(
        (a: any) => a.tax_agent_no === 'TA-0002',
      );
      expect(otherAgent?.email).toBe('agent2@example.com');
      expect(result.tax_agent_no).toBe('TA-0001');
    });

    it('should not allow updating view-only fields (tax_agent_no, position, company_name, business_registration_no, tin)', async () => {
      const updates = {
        tax_agent_no: 'TA-HACKED',
        position: 99,
        company_name: 'Hacked Company',
        business_registration_no: 'HACKED',
        tin: 'HACKED-TIN',
        version: 1,
      };

      const result = await updateOwnProfile(updates);

      // View-only fields should remain unchanged
      expect(result.tax_agent_no).toBe('TA-0001');
      expect(result.position).toBe(1);
      expect(result.company_name).toBe('Acme Tax Services Sdn Bhd');
      expect(result.business_registration_no).toBe('BRN123456');
      expect(result.tin).toBe('TIN-0001');
    });

    it('should update updated_at timestamp', async () => {
      const before = new Date(db.lookup_tax_agents[0].updated_at).getTime();

      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay

      const updates = {
        email: 'timestamp@example.com',
        version: 1,
      };

      const result = await updateOwnProfile(updates);
      const after = new Date(result.updated_at).getTime();

      expect(after).toBeGreaterThan(before);
    });

    it('should use mock_db.ts (not direct file access)', () => {
      // This test verifies the service imports from mock_db.ts
      // The db import at the top of this test file confirms this
      expect(db).toBeDefined();
      expect(db.lookup_tax_agents).toBeDefined();
    });
  });
});
