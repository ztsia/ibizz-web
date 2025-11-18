import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import OtherParticularsFormLayout from '../OtherParticularsFormLayout.vue';
import * as formCService from '../../services/form_c_service';
import { FormTemplate } from '../types';

vi.mock('@vben-core/shadcn-ui', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
  Button: {
    name: 'Button',
    template: '<button><slot /></button>',
  },
}));

// Mock the service
vi.mock('../services/form_c_service');

const MOCK_TEMPLATE: FormTemplate = {
  _id: 'form-c-template-2025',
  formName: 'Form C',
  yearOfAssessment: 2025,
  pages: [
    { id: 'page1', title: 'Page 1', sections: [] },
    { id: 'page2', title: 'Page 2', sections: [] },
  ],
};

describe('OtherParticularsFormLayout.vue', () => {
  it('should load the form template and render the first page', async () => {
    // Arrange
    vi.spyOn(formCService, 'getFormContext').mockResolvedValue({
      template: MOCK_TEMPLATE,
      submission: undefined,
      canEdit: true,
    });

    const wrapper = mount(OtherParticularsFormLayout, {
      props: { templateId: 'form-c-template-2025' },
    });

    // Act
    await flushPromises();

    // Assert
    expect(wrapper.text()).toContain('Page 1');
    expect(wrapper.text()).not.toContain('Page 2');
    // Check progress indicator
    expect(wrapper.text()).toContain('1 / 2');
  });

  it('should navigate to the next page and update progress', async () => {
    // Arrange
    vi.spyOn(formCService, 'getFormContext').mockResolvedValue({
      template: MOCK_TEMPLATE,
      submission: undefined,
      canEdit: true,
    });

    const wrapper = mount(OtherParticularsFormLayout, {
      props: { templateId: 'form-c-template-2025' },
    });

    await flushPromises();

    // Act
    await wrapper.find('button.next-page').trigger('click');
    await flushPromises();

    // Assert
    expect(wrapper.text()).not.toContain('Page 1');
    expect(wrapper.text()).toContain('Page 2');
    expect(wrapper.text()).toContain('2 / 2');
  });
});
