import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FormItemList from '../components/fields/FormItemList.vue';
import { FormTemplateField } from '../types';

const MOCK_FIELD_UNKEYED: FormTemplateField = {
  id: 'itemListField',
  label: 'Item List',
  inputType: 'itemList',
  itemStructure: {
    key: null,
    values: [{ id: 'itemValue', label: 'Item Value', inputType: 'text' }],
  },
};

describe('formItemList.vue - Unkeyed', () => {
  it('should allow adding multiple rows', async () => {
    const wrapper = mount(FormItemList, {
      props: {
        field: MOCK_FIELD_UNKEYED,
        formData: { itemListField: [] },
        isEditMode: true,
      },
    });
    await flushPromises();

    // Add two items
    await wrapper.find('.add-item-button').trigger('click');
    await wrapper.find('.add-item-button').trigger('click');
    await flushPromises();

    const rows = wrapper.findAll('.item-list-row');
    expect(rows.length).toBe(2);
  });

  it('should allow removing rows', async () => {
    const wrapper = mount(FormItemList, {
      props: {
        field: MOCK_FIELD_UNKEYED,
        formData: {
          itemListField: [{ itemValue: 'value1' }, { itemValue: 'value2' }],
        },
        isEditMode: true,
      },
    });
    await flushPromises();

    // Remove one item
    await wrapper.find('.remove-item-button').trigger('click');
    await flushPromises();

    const rows = wrapper.findAll('.item-list-row');
    expect(rows.length).toBe(1);
  });
});
