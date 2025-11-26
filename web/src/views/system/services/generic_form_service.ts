import genericFormTemplates from './mock_data/generic_form_template.json';
import type { FormTemplate, FormSubmission } from '../form_c/types';

// Simulate a database delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  // In a real app, this would save to the backend.
  // Here we just return the submission with an updated timestamp.
  return {
    ...submission,
    updated_at: new Date().toISOString(),
  };
}
