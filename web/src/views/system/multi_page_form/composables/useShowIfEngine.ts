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
        console.log('[useShowIfEngine] or ->', { condition, result: res });
        return res;
      }

      if (!condition.fieldId) {
        // This case should not happen for non-composite conditions, but as a safeguard...
        console.log(
          '[useShowIfEngine] missing fieldId in condition, defaulting visible',
          { condition },
        );
        return true;
      }

      const fieldValue = formData.value[condition.fieldId];

      if (condition.operator === 'equals') {
        const res = fieldValue === condition.value;
        console.log('[useShowIfEngine] equals ->', {
          fieldId: condition.fieldId,
          fieldValue,
          expected: condition.value,
          result: res,
        });
        return res;
      }

      if (condition.operator === 'not_equals') {
        const res = fieldValue !== condition.value;
        console.log('[useShowIfEngine] not_equals ->', {
          fieldId: condition.fieldId,
          fieldValue,
          expected: condition.value,
          result: res,
        });
        return res;
      }

      // Fallback for unknown operators
      console.warn(
        `[useShowIfEngine] Unknown operator "${condition.operator}". Defaulting to visible.`,
      );
      return true;
    };

    const result = evaluate(showIf);
    console.log('[useShowIfEngine] evaluated show_if', { showIf, result });
    return result;
  });

  return { isVisible };
}
