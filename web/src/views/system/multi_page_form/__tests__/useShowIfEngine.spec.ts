import { ref } from 'vue';
import { describe, it, expect } from 'vitest';
import { useShowIfEngine } from '../composables/useShowIfEngine';
import type { ShowIf } from '../types';

describe('useShowIfEngine', () => {
  const formData = ref({
    field1: 'value1',
    field2: 'value2',
    field3: 10,
  });

  it('should return true for a simple "equals" condition that is met', () => {
    const showIf: ShowIf = {
      fieldId: 'field1',
      operator: 'equals',
      value: 'value1',
    };
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(true);
  });

  it('should return false for a simple "equals" condition that is not met', () => {
    const showIf: ShowIf = {
      fieldId: 'field1',
      operator: 'equals',
      value: 'wrong_value',
    };
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(false);
  });

  it('should return true for a simple "not_equals" condition that is met', () => {
    const showIf: ShowIf = {
      fieldId: 'field1',
      operator: 'not_equals',
      value: 'wrong_value',
    };
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(true);
  });

  it('should return false for a simple "not_equals" condition that is not met', () => {
    const showIf: ShowIf = {
      fieldId: 'field1',
      operator: 'not_equals',
      value: 'value1',
    };
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(false);
  });

  it('should handle composite "or" conditions correctly (true)', () => {
    const showIf: ShowIf = {
      operator: 'or',
      conditions: [
        { fieldId: 'field1', operator: 'equals', value: 'value1' },
        { fieldId: 'field2', operator: 'equals', value: 'wrong_value' },
      ],
    };
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(true);
  });

  it('should handle composite "or" conditions correctly (false)', () => {
    const showIf: ShowIf = {
      operator: 'or',
      conditions: [
        { fieldId: 'field1', operator: 'equals', value: 'wrong_value' },
        { fieldId: 'field2', operator: 'equals', value: 'wrong_value' },
      ],
    };
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(false);
  });

  it('should return true when show_if is undefined', () => {
    const showIf = undefined;
    const { isVisible } = useShowIfEngine(showIf, formData);
    expect(isVisible.value).toBe(true);
  });
});
