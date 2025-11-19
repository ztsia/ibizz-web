import { computed } from 'vue';
import type { Ref } from 'vue';
import type { ShowIf } from '../types';

export function useShowIfEngine(
  showIf: ShowIf | undefined,
  formData: Ref<Record<string, any>>,
) {
  const isVisible = computed(() => {
    if (!showIf) {
      return true;
    }

    const evaluate = (condition: ShowIf): boolean => {
      if (condition.operator === 'or') {
        const res = condition.conditions?.some((c) => evaluate(c)) ?? false;
        return res;
      }

      if (condition.operator === 'and') {
        const res = condition.conditions?.every((c) => evaluate(c)) ?? false;
        return res;
      }

      if (!condition.fieldId) {
        return true;
      }

      const fieldValue = formData.value[condition.fieldId];

      if (condition.operator === 'equals') {
        const res = fieldValue === condition.value;
        return res;
      }

      if (condition.operator === 'not_equals') {
        const res = fieldValue !== condition.value;
        return res;
      }

      // Fallback for unknown operators
      console.warn(
        `[useShowIfEngine] Unknown operator "${condition.operator}". Defaulting to visible.`,
      );
      return true;
    };

    const result = evaluate(showIf);
    return result;
  });

  return { isVisible };
}
