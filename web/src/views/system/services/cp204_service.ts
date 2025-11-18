import type { FormTemplate, FormSubmission } from '../form_c/types';
import { delay, genId } from './';
import cp204TemplateJson from './mock_data/cp204_template.json';

// Load and transform template from JSON fixture
const templateData = cp204TemplateJson as any;
const rawTemplate = Array.isArray(templateData)
  ? templateData[0]
  : templateData;

// CP204 template already has pages array defined, so use it directly
const FORM_TEMPLATE: FormTemplate = {
  _id: rawTemplate._id,
  formName: rawTemplate.formName,
  yearOfAssessment: rawTemplate.yearOfAssessment,
  pages: rawTemplate.pages || [],
};

// In-memory storage for submissions
const FORM_SUBMISSIONS: FormSubmission[] = [];

/**
 * Get the form template (no ID required - returns the single template from JSON)
 */
export const getFormTemplate = async (): Promise<FormTemplate> => {
  await delay();
  return { ...FORM_TEMPLATE };
};

/**
 * Get the latest submission
 */
export const getLatestSubmission = async (): Promise<
  FormSubmission | undefined
> => {
  await delay();
  if (FORM_SUBMISSIONS.length === 0) return undefined;

  // Sort by year descending and return the latest
  const sorted = [...FORM_SUBMISSIONS].sort((a, b) => b.year - a.year);
  const latest = sorted[0];
  return latest ? { ...latest } : undefined;
};

/**
 * Save/update a form submission
 */
export const saveFormSubmission = async (
  submission: FormSubmission,
): Promise<FormSubmission> => {
  await delay();
  const newSubmission = {
    ...submission,
    submissionId: submission.submissionId || genId(),
    updated_at: new Date().toISOString(),
  };

  const index = FORM_SUBMISSIONS.findIndex(
    (s) => s.submissionId === newSubmission.submissionId,
  );
  if (index === -1) {
    FORM_SUBMISSIONS.push(newSubmission);
  } else {
    FORM_SUBMISSIONS[index] = newSubmission;
  }

  return { ...newSubmission };
};

/**
 * Get the complete form context (template + latest submission)
 */
export const getFormContext = async () => {
  await delay();
  const template = await getFormTemplate();
  const submission = await getLatestSubmission();

  // For this frontend-only mock, we assume the user always has edit rights
  const canEdit = true;

  return {
    template,
    submission,
    canEdit,
  };
};
