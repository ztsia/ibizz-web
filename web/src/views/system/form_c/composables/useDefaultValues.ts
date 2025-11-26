import type { FormTemplate, FormTemplateField } from '../types';

export function useDefaultValues(template: FormTemplate) {
  const generateDefaults = (): Record<string, any> => {
    const defaults: Record<string, any> = {};
    template.pages.forEach((page) => {
      page.sections.forEach((section) => {
        section.fields.forEach((field) => {
          const defaultValue = getDefaultValue(field);
          if (defaultValue !== undefined) {
            defaults[field.id] = defaultValue;
          }
        });
      });
    });
    return defaults;
  };

  const getDefaultValue = (field: FormTemplateField): any => {
    switch (field.inputType) {
      case 'text':
      case 'email': {
        return '';
      }
      case 'number':
      case 'date':
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'countries':
      case 'states':
      case 'lookup': {
        return null;
      }
      case 'readonly_note': {
        return undefined;
      }
      default: {
        return null;
      }
    }
  };

  return { generateDefaults };
}
