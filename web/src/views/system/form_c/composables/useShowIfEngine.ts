import { computed } from 'vue';
import type { Ref } from 'vue';
import type { ShowIf } from '../types';

export function evaluateShowIfCondition(
  condition: ShowIf,
  data: Record<string, any>,
): boolean {
  if (condition.operator === 'or') {
    const res =
      condition.conditions?.some((c) => evaluateShowIfCondition(c, data)) ??
      false;
    return res;
  }

  if (condition.operator === 'and') {
    const res =
      condition.conditions?.every((c) => evaluateShowIfCondition(c, data)) ??
      false;
    return res;
  }

  if (!condition.fieldId) {
    return true;
  }

  const fieldValue = data[condition.fieldId];

  // Resolve the value to compare against
  let comparisonValue = condition.value;
  if (condition.valueFromField) {
    comparisonValue = data[condition.valueFromField];
  }

  if (condition.operator === 'equals') {
    return fieldValue === comparisonValue;
  }

  if (condition.operator === 'not_equals') {
    return fieldValue !== comparisonValue;
  }

  // Comparison operators (works for strings/dates and numbers)
  // If comparisonValue is null/undefined, we treat it as "no limit" (pass)
  if (condition.operator === 'gt') {
    if (comparisonValue === null || comparisonValue === undefined) return true;
    return fieldValue > comparisonValue;
  }

  if (condition.operator === 'gte') {
    if (comparisonValue === null || comparisonValue === undefined) return true;
    return fieldValue >= comparisonValue;
  }

  if (condition.operator === 'lt') {
    if (comparisonValue === null || comparisonValue === undefined) return true;
    return fieldValue < comparisonValue;
  }

  if (condition.operator === 'lte') {
    if (comparisonValue === null || comparisonValue === undefined) return true;
    return fieldValue <= comparisonValue;
  }

  // Fallback for unknown operators
  console.warn(
    `[evaluateShowIfCondition] Unknown operator "${condition.operator}". Defaulting to visible.`,
  );
  return true;
}

export function useShowIfEngine(
  showIf: ShowIf | undefined,
  formData: Ref<Record<string, any>>,
) {
  const isVisible = computed(() => {
    if (!showIf) {
      return true;
    }
    return evaluateShowIfCondition(showIf, formData.value);
  });

  return { isVisible };
}
