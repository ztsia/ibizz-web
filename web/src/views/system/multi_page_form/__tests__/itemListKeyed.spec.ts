import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import FormItemList from '../FormItemList.vue';
import { FormTemplateField } from '../types';

const MOCK_FIELD: FormTemplateField = {
  id: 'itemListField',
  label: 'Item List',
  inputType: 'itemList',
  itemStructure: {
    key: {
      id: 'itemKey',
      label: 'Item Key',
      options: [
        { value: 'key1', label: 'Key 1' },
        { value: 'key2', label: 'Key 2' },
      ],
    },
    values: [{ id: 'itemValue', label: 'Item Value', inputType: 'text' }],
  },
};

describe('formItemList.vue - Keyed', () => {
  it('should remove a key from options when an item is added', async () => {
    const wrapper = mount(FormItemList, {
      props: {
        field: MOCK_FIELD,
        formData: { itemListField: [] },
        isEditMode: true,
      },
    });
    await flushPromises();

    // Add an item
    await wrapper.find('.add-item-key-select').setValue('key1');
    await wrapper.find('.add-item-button').trigger('click');
    await flushPromises();

    const options = wrapper.findAll('.add-item-key-select option');
    expect(options.length).toBe(1);
    expect(options[0].text()).toBe('Key 2');
  });

  it('should add a key back to options when an item is removed', async () => {
    const wrapper = mount(FormItemList, {
      props: {
        field: MOCK_FIELD,
        formData: {
          itemListField: [{ key: 'key1', values: { itemValue: 'value1' } }],
        },
        isEditMode: true,
      },
    });
    await flushPromises();

    // Remove an item
    await wrapper.find('.remove-item-button').trigger('click');
    await flushPromises();

    const options = wrapper.findAll('.add-item-key-select option');
    expect(options.length).toBe(2);
  });

  it('should enforce key uniqueness', async () => {
    const wrapper = mount(FormItemList, {
      props: {
        field: MOCK_FIELD,
        formData: {
          itemListField: [{ key: 'key1', values: { itemValue: 'value1' } }],
        },
        isEditMode: true,
      },
    });
    await flushPromises();

    // 'key1' should not be in the options for adding a new item
    const options = wrapper.findAll('.add-item-key-select option');
    expect(options.length).toBe(1);
    expect(options[0].text()).toBe('Key 2');
  });

  it('should disable Add button when no key is available', async () => {
    const wrapper = mount(FormItemList, {
      props: {
        field: {
          ...MOCK_FIELD,
          itemStructure: {
            ...MOCK_FIELD.itemStructure,
            key: {
              ...MOCK_FIELD.itemStructure.key,
              options: [{ value: 'key1', label: 'Key 1' }],
            },
          },
        },
        formData: {
          itemListField: [{ key: 'key1', values: { itemValue: 'value1' } }],
        },
        isEditMode: true,
      },
    });
    await flushPromises();

    const addButton = wrapper.find('.add-item-button');
    expect(addButton.attributes('disabled')).toBeDefined();
  });
});
