import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FormField from '../components/fields/FormField.vue';
import { FormTemplateField } from '../types';

const MOCK_FIELD_EMAIL: FormTemplateField = {
  id: 'emailField',
  label: 'Email',
  inputType: 'email',
};

const MOCK_FIELD_NOTE: FormTemplateField = {
  id: 'noteField',
  label: 'Note',
  inputType: 'readonly_note',
};

describe('formField.vue field types', () => {
  it('should render an email field', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: MOCK_FIELD_EMAIL,
        formData: { emailField: 'test@example.com' },
        isEditMode: false,
      },
    });
    await flushPromises();
    const valueEl = wrapper.find('.view-field-value');
    expect(valueEl.exists()).toBe(true);
    expect(valueEl.text()).toContain('test@example.com');
  });

  it('should render a readonly_note and it should have aria-readonly', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: MOCK_FIELD_NOTE,
        formData: { noteField: 'This is a note.' },
        isEditMode: false,
      },
    });
    await flushPromises();
    const readonlyEl = wrapper.find('.readonly-note-value');
    expect(readonlyEl.exists()).toBe(true);
    expect(readonlyEl.text()).toContain('This is a note.');
    expect(readonlyEl.attributes('aria-readonly')).toBe('true');
  });
});
