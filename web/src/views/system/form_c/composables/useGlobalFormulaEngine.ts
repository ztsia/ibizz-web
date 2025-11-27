import { watch } from 'vue';
import type { Ref } from 'vue';
import { evaluateGlobalFormula } from './useFormulaEngine';
import type { FormTemplate } from '../types';

/**
 * A Vue composable that watches formData and updates fields that have global formulas.
 * @param template The form template containing field definitions.
 * @param formData The reactive form data object.
 */
export function useGlobalFormulaEngine(
  template: Ref<FormTemplate | null>,
  formData: Ref<Record<string, any>>,
) {
  // Helper to find all fields with formulas in the template
  const getFormulaFields = () => {
    const fields: { id: string; formula: string }[] = [];
    if (!template.value) return fields;

    template.value.pages?.forEach((page) => {
      page.sections?.forEach((section) => {
        section.fields?.forEach((field) => {
          if (field.formula) {
            fields.push({ id: field.id, formula: field.formula });
          }
        });
      });
    });
    return fields;
  };

  // Watch for changes in formData (deep watch)
  watch(
    () => formData.value,
    (newData) => {
      if (!template.value) return;

      const formulaFields = getFormulaFields();

      formulaFields.forEach(({ id, formula }) => {
        // Evaluate the formula
        const result = evaluateGlobalFormula(formula, newData);

        // Only update if the value is different to avoid infinite loops
        // (though Vue's reactivity system usually handles this, it's good practice)
        if (result !== null && newData[id] !== result) {
          formData.value[id] = result;
        }
      });
    },
    { deep: true },
  );
}
