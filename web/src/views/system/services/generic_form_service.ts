import genericFormTemplates from './mock_data/generic_form_template.json';
import genericFormSubmissions from './mock_data/generic_form_submission.json';
import type { FormTemplate, FormSubmission } from '../form_c/types';

// Simulate a database delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory store initialized from JSON
const submissionsStore: FormSubmission[] = [
  ...(genericFormSubmissions as any[]),
];

export async function getFormTemplate(formId: string): Promise<FormTemplate> {
  await delay(300);
  const template = (genericFormTemplates as any[]).find(
    (t) => t.id === formId && t.type !== 'lookup_data',
  );
  if (!template) {
    throw new Error(`Form template with ID "${formId}" not found.`);
  }
  return template as FormTemplate;
}

export async function getLookupData(lookupId: string): Promise<any[]> {
  await delay(300);
  const lookupItem = (genericFormTemplates as any[]).find(
    (t) => t.id === lookupId && t.type === 'lookup_data',
  );
  if (!lookupItem) {
    return [];
  }
  return lookupItem.data || [];
}

export async function saveFormSubmission(
  submission: FormSubmission,
): Promise<FormSubmission> {
  await delay(500);

  const now = new Date().toISOString();
  const newSubmission = {
    ...submission,
    submissionId: submission.submissionId || `sub-${Date.now()}`,
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

export async function getFormSubmission(
  submissionId: string,
): Promise<FormSubmission | null> {
  await delay(300);
  const submission = submissionsStore.find(
    (s) => s.submissionId === submissionId,
  );
  return submission || null;
}
