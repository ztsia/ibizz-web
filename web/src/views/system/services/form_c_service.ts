import type { FormTemplate, FormSubmission } from '../multi_page_form/types';
import { delay, genId } from './mock_db';
import {
  formTemplate as formTemplateJson,
  formSubmission as formSubmissionJson,
} from './mock_data';

// Load and transform template from JSON fixture
const templateData = formTemplateJson as any;
const rawTemplate = Array.isArray(templateData)
  ? templateData[0]
  : templateData;

// Transform the JSON structure to match FormTemplate interface
// The JSON may contain a root template object (with `sections`) and additional
// page objects alongside it (e.g., `page_controlled_transactions`). Build a
// unified `pages` array that includes the root sections as a page plus any
// additional standalone page objects found in the JSON array.
const pages: FormTemplate['pages'] = [];

// If the root template has `sections`, make that the first page
if (rawTemplate.sections) {
  pages.push({
    id: rawTemplate._id ? `${String(rawTemplate._id)}_root` : 'page1',
    title: rawTemplate.formName || 'Form',
    sections: rawTemplate.sections,
  });
}

// If the original JSON was an array, include any subsequent entries that look
// like pre-defined pages (they usually have an `id` and `sections`). Also allow
// rootTemplate.pages if present.
if (Array.isArray(templateData)) {
  // start from index 1 (other entries) and include those with sections
  templateData.slice(1).forEach((entry: any) => {
    if (entry && entry.sections) {
      pages.push({
        id: entry.id || entry._id || `page_${pages.length + 1}`,
        title: entry.title || entry.part || `Page ${pages.length + 1}`,
        show_if: entry.show_if ?? null,
        sections: entry.sections,
      });
    }
  });
} else if (rawTemplate.pages) {
  // If pages already present on the template, append them
  pages.push(...(rawTemplate.pages as any));
}

const FORM_TEMPLATE: FormTemplate = {
  _id: rawTemplate._id,
  formName: rawTemplate.formName,
  yearOfAssessment: rawTemplate.yearOfAssessment,
  pages,
};

// Transform submission JSON to FormSubmission format
const submissionData = formSubmissionJson as any;
const FORM_SUBMISSIONS: FormSubmission[] = Array.isArray(submissionData)
  ? submissionData.map((s: any) => ({
      submissionId: s._id || '',
      templateId: s.formTemplateId || '',
      year: 2025, // default year
      data: s.formData || {},
      updated_at: new Date().toISOString(),
    }))
  : [
      {
        submissionId: submissionData._id || '',
        templateId: submissionData.formTemplateId || '',
        year: 2025, // default year
        data: submissionData.formData || {},
        updated_at: new Date().toISOString(),
      },
    ];

/**
 * Get the form template (no ID required - returns the single template from JSON)
 */
export const getFormTemplate = async (): Promise<FormTemplate> => {
  await delay();
  return { ...FORM_TEMPLATE };
};

/**
 * Get the latest submission from the JSON fixture
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
