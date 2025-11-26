import { ref } from 'vue';
import type { Ref } from 'vue';
import type { FormTemplate } from '../types';

export function useFormValidation(
  template: Ref<FormTemplate | null>,
  formData: Ref<Record<string, any>>,
  visibleFieldIds: Ref<Set<string>>,
) {
  const errors = ref<Record<string, string>>({});

  const validate = () => {
    // --- END CLEANUP ---

    const newErrors: Record<string, string> = {};

    // If there's no template loaded yet, treat as valid (no fields to validate)
    if (!template.value || !Array.isArray(template.value.pages)) {
      errors.value = {};
      return true;
    }

    const data = formData.value || {};

    template.value.pages.forEach((page) => {
      (page.sections || []).forEach((section) => {
        (section.fields || []).forEach((field) => {
          // Only validate fields that are currently visible
          if (!visibleFieldIds.value.has(field.id)) return;

          // Readonly notes are not validated
          if (field.inputType === 'readonly_note') return;

          const value = data[field.id];

          // Required validation for fields marked as required
          if (
            field.required &&
            (value === null || value === undefined || value === '')
          ) {
            newErrors[field.id] = `${field.label} is required.`;
            return; // Stop validation for this field
          }

          // Email validation (can be combined with required)
          if (field.inputType === 'email' && value) {
            const emailRegex = /.[^\n\r@\u2028\u2029]*@.+\..+/;
            if (typeof value !== 'string' || !emailRegex.test(value)) {
              newErrors[field.id] = `${field.label} must be a valid email.`;
            }
          }
        });
      });
    });

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  const validatePage = (pageId: string) => {
    const newErrors: Record<string, string> = {};
    errors.value = {}; // Clear previous errors

    if (!template.value || !Array.isArray(template.value.pages)) {
      return true;
    }

    const pageToValidate = template.value.pages.find((p) => p.id === pageId);
    if (!pageToValidate) return true; // No page found, nothing to validate

    // --- END CLEANUP ---

    const data = formData.value || {};

    (pageToValidate.sections || []).forEach((section) => {
      (section.fields || []).forEach((field) => {
        if (!visibleFieldIds.value.has(field.id)) return;
        if (field.inputType === 'readonly_note') return;

        if (field.required) {
          const value = data[field.id];
          if (value === null || value === undefined || value === '') {
            newErrors[field.id] = `${field.label} is required.`;
            return;
          }
        }

        if (field.inputType === 'email' && data[field.id]) {
          const emailRegex = /.[^\n\r@\u2028\u2029]*@.+\..+/;
          if (
            typeof data[field.id] !== 'string' ||
            !emailRegex.test(data[field.id])
          ) {
            newErrors[field.id] = `${field.label} must be a valid email.`;
          }
        }
      });
    });

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validate, validatePage };
}
