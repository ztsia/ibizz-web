import { ref } from 'vue';
import { describe, it, expect } from 'vitest';
import { useFormValidation } from '../composables/useFormValidation';
import type { FormTemplate, FormSubmission } from '../types';

describe('useFormValidation', () => {
  const template = ref<FormTemplate>({
    // Abridged template for testing
    _id: 'template1',
    formName: 'Test Form',
    yearOfAssessment: 2025,
    pages: [
      {
        id: 'page1',
        title: 'Page 1',
        sections: [
          {
            part: 'partA',
            title: 'Part A',
            fields: [
              { id: 'field1', label: 'Field 1', inputType: 'text' },
              { id: 'field2', label: 'Field 2', inputType: 'email' },
              { id: 'field3', label: 'Field 3', inputType: 'readonly_note' },
              {
                id: 'field4',
                label: 'Field 4',
                inputType: 'number',
                show_if: {
                  fieldId: 'field1',
                  operator: 'equals',
                  value: 'show',
                },
              },
            ],
          },
        ],
      },
    ],
  });

  const submission = ref<FormSubmission>({
    submissionId: 'sub1',
    templateId: 'template1',
    year: 2025,
    data: {},
    updated_at: '',
  });

  const visibleFieldIds = ref<Set<string>>(
    new Set(['field1', 'field2', 'field3']),
  );

  it('should validate required text fields', () => {
    submission.value.data = { field1: '' };
    const { errors, validate } = useFormValidation(
      template,
      submission,
      visibleFieldIds,
    );
    validate();
    expect(errors.value.field1).toBe('Field 1 is required.');
  });

  it('should validate email format', () => {
    submission.value.data = { field1: 'some value', field2: 'invalid-email' };
    const { errors, validate } = useFormValidation(
      template,
      submission,
      visibleFieldIds,
    );
    validate();
    expect(errors.value.field2).toBe('Field 2 must be a valid email.');
  });

  it('should not require readonly_note fields', () => {
    submission.value.data = { field1: 'some value', field2: 'test@test.com' };
    const { errors, validate } = useFormValidation(
      template,
      submission,
      visibleFieldIds,
    );
    validate();
    expect(errors.value.field3).toBeUndefined();
  });

  it('should not validate hidden fields', () => {
    submission.value.data = {
      field1: 'some other value',
      field2: 'test@test.com',
      field4: null,
    };
    visibleFieldIds.value = new Set(['field1', 'field2', 'field3']);
    const { errors, validate } = useFormValidation(
      template,
      submission,
      visibleFieldIds,
    );
    validate();
    expect(errors.value.field4).toBeUndefined();
  });

  it('should validate fields that become visible', () => {
    submission.value.data = {
      field1: 'show',
      field2: 'test@test.com',
      field4: null,
    };
    visibleFieldIds.value = new Set(['field1', 'field2', 'field3', 'field4']);
    const { errors, validate } = useFormValidation(
      template,
      submission,
      visibleFieldIds,
    );
    validate();
    expect(errors.value.field4).toBe('Field 4 is required.');
  });
});
