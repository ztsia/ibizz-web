import { describe, it, expect } from 'vitest';
import { getFormContext, db } from '..';

describe('prefill Heuristic in getFormContext', () => {
  it('should load the latest previous submission if no submissionId is provided', async () => {
    // Temporarily remove the 2025 submission to test the fallback
    const originalSubmissions = db.form_c_submissions;
    db.form_c_submissions = originalSubmissions.filter((s) => s.year !== 2025);

    const context = await getFormContext('form-c-template-2025');
    expect(context.submission?.year).toBe(2024);

    // Restore the original submissions
    db.form_c_submissions = originalSubmissions;
  });
});
