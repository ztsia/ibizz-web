import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import FormField from '../components/fields/FormField.vue';
import { FormTemplateField } from '../types';
import LookupSelect from '../../shared_components/LookupSelect.vue';
import LookupFormPlaceholder from '../components/LookupItemForm/LookupFormPlaceholder.vue';

vi.mock('../../shared_components/LookupSelect.vue', () => {
  return {
    default: {
      name: 'LookupSelect',
      template: '<div class="mock-lookup-select"></div>',
    },
  };
});

vi.mock('../components/LookupFormPlaceholder.vue', () => {
  return {
    default: {
      name: 'LookupFormPlaceholder',
      template: '<div class="mock-lookup-placeholder" disabled></div>',
    },
  };
});

const MOCK_FIELD_COUNTRIES: FormTemplateField = {
  id: 'countryField',
  label: 'Country',
  inputType: 'countries',
};

const MOCK_FIELD_LOOKUP: FormTemplateField = {
  id: 'lookupField',
  label: 'Lookup',
  inputType: 'lookup',
};

describe('formField.vue - Lookup Fields', () => {
  it('should render LookupSelect for "countries" inputType', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: MOCK_FIELD_COUNTRIES,
        formData: { countryField: 'USA' },
        isEditMode: true,
      },
    });
    await flushPromises();

    const lookupSelect = wrapper.findComponent(LookupSelect);
    expect(lookupSelect.exists()).toBe(true);
  });

  it('should render LookupFormPlaceholder for "lookup" inputType and it should be disabled', async () => {
    const wrapper = mount(FormField, {
      props: {
        field: MOCK_FIELD_LOOKUP,
        formData: { lookupField: 'some-value' },
        isEditMode: true,
      },
    });
    await flushPromises();

    const placeholder = wrapper.findComponent(LookupFormPlaceholder);
    expect(placeholder.exists()).toBe(true);
    expect(placeholder.attributes('disabled')).toBeDefined();
  });
});
