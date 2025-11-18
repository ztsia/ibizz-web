import type { FormTemplate, FormSubmission } from '../form_c/types';
import { delay, genId } from './';
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
 * Get a submission by year
 */
export const getSubmissionByYear = async (
  year: number,
): Promise<FormSubmission | undefined> => {
  await delay();
  const submission = FORM_SUBMISSIONS.find((s) => s.year === year);
  // Return a deep copy to prevent direct mutation of the in-memory store
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return submission ? JSON.parse(JSON.stringify(submission)) : undefined;
};

/**
 * Save/update a form submission based on its year.
 */
export const saveFormSubmission = async (
  submission: FormSubmission,
): Promise<FormSubmission> => {
  await delay();

  // Find existing submission for the same year
  const existingIndex = FORM_SUBMISSIONS.findIndex(
    (s) => s.year === submission.year,
  );

  if (existingIndex === -1) {
    // Create a new submission for that year
    const newSubmission = {
      ...submission,
      submissionId: genId(), // Generate a new ID
      updated_at: new Date().toISOString(),
    };
    FORM_SUBMISSIONS.push(newSubmission);
    // Return a deep copy
    // eslint-disable-next-line unicorn/prefer-structured-clone
    return JSON.parse(JSON.stringify(newSubmission));
  } else {
    // Update existing submission for that year
    const existingSubmission = FORM_SUBMISSIONS[existingIndex];
    const updatedSubmission = {
      ...submission,
      submissionId: existingSubmission.submissionId, // Ensure we keep the original ID
      updated_at: new Date().toISOString(),
    };
    FORM_SUBMISSIONS[existingIndex] = updatedSubmission;
    // Return a deep copy
    // eslint-disable-next-line unicorn/prefer-structured-clone
    return JSON.parse(JSON.stringify(updatedSubmission));
  }
};

/**
 * Get the complete form context (template + submission for the template's year)
 */
export const getFormContext = async () => {
  await delay();
  const template = await getFormTemplate();
  const submission = await getSubmissionByYear(template.yearOfAssessment);

  // For this frontend-only mock, we assume the user always has edit rights
  const canEdit = true;

  return {
    template,
    submission,
    canEdit,
  };
};
