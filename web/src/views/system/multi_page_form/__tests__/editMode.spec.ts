import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import MainFormLayout from '../MainFormLayout.vue';
import * as formCService from '../../services/form_c_service';
import { FormTemplate, FormSubmission } from '../types';

vi.mock('@vben-core/shadcn-ui', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
  Button: {
    name: 'Button',
    template: '<button><slot /></button>',
  },
}));

vi.mock('../../services/form_c_service');

const MOCK_TEMPLATE: FormTemplate = {
  _id: 'form-c-template-2025',
  formName: 'Form C',
  yearOfAssessment: 2025,
  pages: [
    {
      id: 'page1',
      title: 'Page 1',
      sections: [
        {
          part: 'A',
          title: 'A',
          fields: [{ id: 'field1', label: 'F1', inputType: 'text' }],
        },
      ],
    },
  ],
};

const MOCK_SUBMISSION: FormSubmission = {
  submissionId: 'sub-2025-1',
  templateId: 'form-c-template-2025',
  year: 2025,
  data: { field1: 'initial value' },
  updated_at: '2025-01-15T10:00:00Z',
};

describe('edit Mode in MainFormLayout', () => {
  it('should toggle between view and edit mode', async () => {
    vi.spyOn(formCService, 'getFormContext').mockResolvedValue({
      template: MOCK_TEMPLATE,
      submission: MOCK_SUBMISSION,
      canEdit: true,
    });

    const wrapper = mount(MainFormLayout, {
      props: { templateId: 'form-c-template-2025', submissionId: 'sub-2025-1' },
    });
    await flushPromises();

    expect(wrapper.find('input').exists()).toBe(false); // In view mode initially

    const editButton = wrapper.find('.toggle-edit-button').findAll('button')[1];
    await editButton.trigger('click');
    await flushPromises();

    expect(wrapper.find('input').exists()).toBe(true); // In edit mode
  });

  it('should revert changes on cancel', async () => {
    vi.spyOn(formCService, 'getFormContext').mockResolvedValue({
      template: MOCK_TEMPLATE,
      submission: MOCK_SUBMISSION,
      canEdit: true,
    });

    const wrapper = mount(MainFormLayout, {
      props: { templateId: 'form-c-template-2025', submissionId: 'sub-2025-1' },
    });
    await flushPromises();

    // Enter edit mode and change value
    const editButton = wrapper.find('.toggle-edit-button').findAll('button')[1];
    await editButton.trigger('click');
    await flushPromises();
    await wrapper.find('input').setValue('new value');

    // Cancel edit
    await wrapper.find('.cancel-button').trigger('click');
    await flushPromises();

    // Should be back in view mode with original value
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.text()).toContain('initial value');
  });

  it('should persist changes on save', async () => {
    const saveSpy = vi
      .spyOn(formCService, 'saveFormSubmission')
      .mockResolvedValue({ ...MOCK_SUBMISSION, data: { field1: 'new value' } });
    vi.spyOn(formCService, 'getFormContext').mockResolvedValue({
      template: MOCK_TEMPLATE,
      submission: MOCK_SUBMISSION,
      canEdit: true,
    });

    const wrapper = mount(MainFormLayout, {
      props: { templateId: 'form-c-template-2025', submissionId: 'sub-2025-1' },
    });
    await flushPromises();

    // Enter edit mode and change value
    const editButton = wrapper.find('.toggle-edit-button').findAll('button')[1];
    await editButton.trigger('click');
    await flushPromises();
    await wrapper.find('input').setValue('new value');

    // Save edit
    await wrapper.find('.save-button').trigger('click');
    await flushPromises();

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ data: { field1: 'new value' } }),
    );
    // Should be back in view mode with new value
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.text()).toContain('new value');
  });
});
