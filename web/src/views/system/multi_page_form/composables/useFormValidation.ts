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

          // Required validation: treat null/undefined/empty-string as empty
          if (value === null || value === undefined || value === '') {
            newErrors[field.id] = `${field.label} is required.`;
            return;
          }

          // Email validation
          if (field.inputType === 'email') {
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

  return { errors, validate };
}
