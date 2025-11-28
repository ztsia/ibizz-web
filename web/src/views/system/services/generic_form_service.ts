import genericFormTemplates from './mock_data/generic_form_template.json';
import genericFormSubmissions from './mock_data/generic_form_submission.json';
import type { FormTemplate, FormSubmission } from '../form_c/types';

// Simulate a database delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate unique IDs
const genId = () =>
  `id_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

// In-memory store initialized from JSON
const submissionsStore: FormSubmission[] = [
  ...(genericFormSubmissions as any[]),
];

/**
 * Get a form template by ID
 * @param formId - The form template ID
 * @endpoint GET /api/forms/templates/:id
 */
export async function getFormTemplate(formId: string): Promise<FormTemplate> {
  await delay();
  const template = (genericFormTemplates as any[]).find(
    (t) => (t.id || t._id) === formId && t.type !== 'lookup_data',
  );
  if (!template) {
    throw new Error(`Form template with ID "${formId}" not found.`);
  }
  return template as FormTemplate;
}

/**
 * Get lookup data by ID (for static lookup data stored in template)
 * @param lookupId - The lookup data ID
 */
export async function getLookupData(lookupId: string): Promise<any[]> {
  await delay();
  const lookupItem = (genericFormTemplates as any[]).find(
    (t) => t.id === lookupId && t.type === 'lookup_data',
  );
  if (!lookupItem) {
    return [];
  }
  return lookupItem.data || [];
}

/**
 * Save or update a form submission
 * @param submission - The form submission to save
 * @endpoint POST /api/forms/submissions
 * @payload { submissionId, templateId, year, data, updated_at }
 */
export async function saveFormSubmission(
  submission: FormSubmission,
): Promise<FormSubmission> {
  await delay(500);

  const now = new Date().toISOString();
  const newSubmission = {
    ...submission,
    submissionId: submission.submissionId || genId(),
    updated_at: now,
  };

  const existingIndex = submissionsStore.findIndex(
    (s) => s.submissionId === newSubmission.submissionId,
  );

  if (existingIndex === -1) {
    submissionsStore.push(newSubmission);
  } else {
    submissionsStore[existingIndex] = newSubmission;
  }

  return newSubmission;
}

/**
 * Get a form submission by its submission ID
 * @param submissionId - The submission ID
 * @endpoint GET /api/forms/submissions/:id
 */
export async function getFormSubmission(
  submissionId: string,
): Promise<FormSubmission | null> {
  await delay();
  const submission = submissionsStore.find(
    (s) => s.submissionId === submissionId,
  );
  return submission || null;
}

/**
 * Get a submission by year
 * @param year - The year of assessment
 * @endpoint GET /api/forms/submissions/year/:year
 */
export async function getSubmissionByYear(
  year: number,
): Promise<FormSubmission | undefined> {
  await delay();
  const submission = submissionsStore.find((s) => s.year === year);
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return submission ? JSON.parse(JSON.stringify(submission)) : undefined;
}

/**
 * Get the latest submission (sorted by year descending)
 * @endpoint GET /api/forms/submissions/latest
 */
export async function getLatestSubmission(): Promise<
  FormSubmission | undefined
> {
  await delay();
  if (submissionsStore.length === 0) return undefined;

  const sorted = [...submissionsStore].sort((a, b) => b.year - a.year);
  const latest = sorted[0];
  return latest ? { ...latest } : undefined;
}

/**
 * Get the complete form context (template + submission)
 * @param formId - The form template ID
 * @param options - Options for fetching submission (by year or latest)
 * @param options.year - Specific year to fetch submission for
 * @param options.latest - Whether to fetch the latest submission
 */
export async function getFormContext(
  formId: string,
  options?: { year?: number; latest?: boolean },
) {
  await delay();
  const template = await getFormTemplate(formId);

  let submission: FormSubmission | undefined;
  if (options?.year !== undefined) {
    submission = await getSubmissionByYear(options.year);
  } else if (options?.latest) {
    submission = await getLatestSubmission();
  } else {
    // Default: use template's year
    submission = await getSubmissionByYear(template.yearOfAssessment);
  }

  const canEdit = true; // For frontend mock

  return {
    template,
    submission,
    canEdit,
  };
}
