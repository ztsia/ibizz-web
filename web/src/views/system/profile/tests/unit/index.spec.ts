/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import Index from '#/views/system/profile/index.vue';
import * as profileService from '#/views/system/services/profile.service';

// Mock the profile service
vi.mock('#/views/system/services/profile.service', () => ({
  getOwnProfile: vi.fn(),
  updateOwnProfile: vi.fn(),
}));

// Mock the ToggleEditViewButton component
const MockToggleEditViewButton = defineComponent({
  name: 'ToggleEditViewButton',
  props: { isEditing: Boolean },
  emits: ['update:isEditing'],
  template:
    '<button @click="$emit(\'update:isEditing\', !isEditing)">Toggle Edit</button>',
});

const MockInput = defineComponent({
  template: '<input />',
});

describe('profile View (index.vue)', () => {
  it('renders profile data and toggles edit mode', async () => {
    // Arrange
    const mockProfile = {
      tax_agent_name: 'Test Agent',
      tax_agent_no: 'TA-1234',
      tax_agent_nric: '123456-78-9012',
      position: 1,
      company_name: 'Test Inc.',
      business_registration_no: 'BRN-123',
      address_1: '123 Test St',
      address_2: '',
      address_3: '',
      postcode: '12345',
      town_city: 'Testville',
      state: 1,
      email: 'test@example.com',
      tel_no: '+60123456789',
      tin: 'TIN-123',
      version: 1,
      updated_at: new Date().toISOString(),
    };
    vi.mocked(profileService.getOwnProfile).mockResolvedValue(mockProfile);

    const wrapper = mount(Index, {
      global: {
        stubs: {
          ToggleEditViewButton: MockToggleEditViewButton,
          Input: MockInput,
          Button: true,
        },
      },
    });

    // Act: Wait for the component to mount and load data
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    // Assert: Check that profile data is rendered
    expect(wrapper.text()).toContain('Test Agent');
    expect(wrapper.find('[data-test="profile-heading"]').text()).toBe(
      'My Profile',
    );

    // Assert: Check that it's in view mode initially
    expect(wrapper.find('input').exists()).toBe(false);

    // Act: Find and click the toggle button
    const toggleButton = wrapper.findComponent(MockToggleEditViewButton);
    await toggleButton.trigger('click');
    await wrapper.vm.$nextTick();

    // Assert: Check that it's in edit mode
    // A simple way to check for edit mode is to see if an input is now rendered
    // Since we stubbed Input, we can check for its existence.
    expect(wrapper.find('input').exists()).toBe(true);
  });
});
