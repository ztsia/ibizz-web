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
    // --- PRE-VALIDATION CLEANUP for itemList ---
    if (template.value) {
      template.value.pages.forEach((page) => {
        page.sections.forEach((section) => {
          section.fields.forEach((field) => {
            if (
              field.inputType === 'itemList' &&
              Array.isArray(formData.value[field.id])
            ) {
              formData.value[field.id] = formData.value[field.id].filter(
                (item) => item.key !== null && item.key !== undefined,
              );
            }
          });
        });
      });
    }
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

          // itemList validation
          if (field.inputType === 'itemList' && field.itemStructure) {
            const items = data[field.id];
            if (Array.isArray(items)) {
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                // Only validate rows that have a key selected
                if (item.key) {
                  for (const valueField of field.itemStructure.values) {
                    if (valueField.required) {
                      const itemValue = item.values[valueField.id];
                      if (
                        itemValue === null ||
                        itemValue === undefined ||
                        itemValue === ''
                      ) {
                        newErrors[
                          field.id
                        ] = `Row ${i + 1}: '${valueField.label}' is required.`;
                        // Break out of all loops for this field once an error is found
                        break;
                      }
                    }
                  }
                }
                if (newErrors[field.id]) break; // Exit outer loop if error found
              }
            }
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

    // --- PRE-VALIDATION CLEANUP for itemList ---
    (pageToValidate.sections || []).forEach((section) => {
      (section.fields || []).forEach((field) => {
        if (
          field.inputType === 'itemList' &&
          Array.isArray(formData.value[field.id])
        ) {
          formData.value[field.id] = formData.value[field.id].filter(
            (item) => item.key !== null && item.key !== undefined,
          );
        }
      });
    });
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

        // itemList validation
        if (field.inputType === 'itemList' && field.itemStructure) {
          const items = data[field.id];
          if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              // Only validate rows that have a key selected
              if (item.key) {
                for (const valueField of field.itemStructure.values) {
                  if (valueField.required) {
                    const itemValue = item.values[valueField.id];
                    if (
                      itemValue === null ||
                      itemValue === undefined ||
                      itemValue === ''
                    ) {
                      newErrors[
                        field.id
                      ] = `Row ${i + 1}: '${valueField.label}' is required.`;
                      // Break out of all loops for this field once an error is found
                      break;
                    }
                  }
                }
              }
              if (newErrors[field.id]) break; // Exit outer loop if error found
            }
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
