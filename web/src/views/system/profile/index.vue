<template>
  <div class="container mx-auto max-w-4xl p-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <div class="text-muted-foreground">Loading profile...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4"
    >
      <p class="font-semibold">Error loading profile</p>
      <p class="text-sm">{{ error }}</p>
    </div>

    <!-- Profile Content -->
    <div v-else-if="profile">
      <!-- Profile Header -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold" data-test="profile-heading">
          My Profile
        </h1>

        <ToggleEditViewButton
          v-model:isEditing="isEditMode"
          :compact="!isHeaderVisible"
          data-test="toggle-edit-view"
        />
      </div>

      <!-- Profile Content - organized by categories -->
      <div class="flex flex-col space-y-6">
        <!-- Personal Details -->
        <Card data-test="category-personal-details">
          <CardHeader>
            <CardTitle class="text-xl font-semibold"
              >Personal Details</CardTitle
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <div data-test="field-tax-agent-name">
              <label class="text-base font-medium">Tax Agent Name</label>
              <Input
                v-if="isEditMode && editableProfile"
                v-model="editableProfile.tax_agent_name"
                class="mt-1"
              />
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.tax_agent_name) }}
              </div>
            </div>
            <div data-test="field-tax-agent-no">
              <label class="text-base font-medium">
                Tax Agent No
                <span class="text-muted-foreground ml-2 text-sm"
                  >(view only)</span
                >
              </label>
              <div class="mt-1 text-sm">
                {{ displayValue(profile.tax_agent_no) }}
              </div>
            </div>
            <div data-test="field-tax-agent-nric">
              <label class="text-base font-medium">Tax Agent NRIC</label>
              <Input
                v-if="isEditMode && editableProfile"
                v-model="editableProfile.tax_agent_nric"
                class="mt-1"
              />
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.tax_agent_nric) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Firm & Employment -->
        <Card data-test="category-firm-employment">
          <CardHeader>
            <CardTitle class="text-xl font-semibold"
              >Firm & Employment</CardTitle
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <div data-test="field-company-name">
              <label class="text-base font-medium">
                Company Name
                <span class="text-muted-foreground ml-2 text-sm"
                  >(view only)</span
                >
              </label>
              <div class="mt-1 text-sm">
                {{ displayValue(profile.company_name) }}
              </div>
            </div>
            <div data-test="field-business-registration-no">
              <label class="text-base font-medium">
                Business Registration No
                <span class="text-muted-foreground ml-2 text-sm"
                  >(view only)</span
                >
              </label>
              <div class="mt-1 text-sm">
                {{ displayValue(profile.business_registration_no) }}
              </div>
            </div>
            <div data-test="field-position">
              <label class="text-base font-medium">
                Position
                <span class="text-muted-foreground mt-1 text-sm"
                  >(view only)</span
                >
              </label>
              <div class="mt-1 text-sm">
                {{ displayValue(profile.position) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Contact Information -->
        <Card data-test="category-contact-information">
          <CardHeader>
            <CardTitle class="text-xl font-semibold"
              >Contact Information</CardTitle
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <div data-test="field-email">
              <label class="text-base font-medium">Email</label>
              <div v-if="isEditMode && editableProfile">
                <Input v-model="editableProfile.email" class="mt-1" />
                <div
                  v-if="validationErrors.email"
                  class="text-destructive mt-1 text-sm"
                >
                  {{ validationErrors.email }}
                </div>
              </div>
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.email) }}
              </div>
            </div>
            <div data-test="field-tel-no">
              <label class="text-base font-medium">Contact No</label>
              <div v-if="isEditMode && editableProfile">
                <Input v-model="editableProfile.tel_no" class="mt-1" />
                <div
                  v-if="validationErrors.tel_no"
                  class="text-destructive mt-1 text-sm"
                >
                  {{ validationErrors.tel_no }}
                </div>
              </div>
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.tel_no) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Address -->
        <Card data-test="category-address">
          <CardHeader>
            <CardTitle class="text-xl font-semibold">Address</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div data-test="field-address-1">
              <label class="text-base font-medium">Address 1</label>
              <Input
                v-if="isEditMode && editableProfile"
                v-model="editableProfile.address_1"
                class="mt-1"
              />
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.address_1) }}
              </div>
            </div>
            <div data-test="field-address-2">
              <label class="text-base font-medium">Address 2</label>
              <Input
                v-if="isEditMode && editableProfile"
                v-model="editableProfile.address_2"
                class="mt-1"
              />
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.address_2) }}
              </div>
            </div>
            <div data-test="field-address-3">
              <label class="text-base font-medium">Address 3</label>
              <Input
                v-if="isEditMode && editableProfile"
                v-model="editableProfile.address_3"
                class="mt-1"
              />
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.address_3) }}
              </div>
            </div>
            <div data-test="field-postcode">
              <label class="text-base font-medium">Postcode</label>
              <div v-if="isEditMode && editableProfile">
                <Input v-model="editableProfile.postcode" class="mt-1" />
                <div
                  v-if="validationErrors.postcode"
                  class="text-destructive mt-1 text-sm"
                >
                  {{ validationErrors.postcode }}
                </div>
              </div>
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.postcode) }}
              </div>
            </div>
            <div data-test="field-town-city">
              <label class="text-base font-medium">Town/City</label>
              <Input
                v-if="isEditMode && editableProfile"
                v-model="editableProfile.town_city"
                class="mt-1"
              />
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.town_city) }}
              </div>
            </div>
            <div data-test="field-state">
              <label class="text-base font-medium">State</label>
              <div v-if="isEditMode && editableProfile">
                <LookupSelect
                  v-if="!stateLookupError"
                  v-model="editableProfile.state"
                  lookup-slug="state-code"
                  @lookup-error="handleStateLookupError"
                />
                <div v-else>
                  <Input
                    :model-value="editableProfile.state"
                    class="mt-1"
                    disabled
                  />
                  <p class="text-muted-foreground mt-1 text-sm">
                    State lookup unavailable
                  </p>
                </div>
              </div>
              <div v-else class="mt-1 text-sm">
                {{ displayValue(profile.state) }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Tax Identification -->
        <Card data-test="category-tax-identification">
          <CardHeader>
            <CardTitle class="text-xl font-semibold"
              >Tax Identification</CardTitle
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <div data-test="field-tin">
              <label class="text-base font-medium">
                TIN
                <span class="text-muted-foreground ml-2 text-sm"
                  >(view only)</span
                >
              </label>
              <div class="mt-1 text-sm">{{ displayValue(profile.tin) }}</div>
            </div>
          </CardContent>
        </Card>
        <!-- Docked (static) actions - appears at end of form and observed by IntersectionObserver -->
        <div
          v-if="isEditMode"
          ref="dockedButtonsRef"
          class="mt-4 flex justify-end"
        >
          <div class="p-2">
            <FormActionsBar
              :disabled="!hasChanges"
              @save="handleSave"
              @cancel="handleCancel"
            />
          </div>
        </div>
      </div>

      <!-- Floating fixed toolbar: full-width bar that aligns buttons to the card column; hidden when docked toolbar is visible -->
      <div
        v-if="isEditMode"
        v-show="!isDocked"
        class="pointer-events-none fixed bottom-0 left-0 right-0 z-50"
      >
        <div class="pointer-events-auto mx-auto flex max-w-4xl justify-end p-4">
          <div class="bg-popover rounded-md p-2 shadow-md">
            <FormActionsBar
              :disabled="!hasChanges"
              @save="handleSave"
              @cancel="handleCancel"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick } from 'vue';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@vben-core/shadcn-ui';
import { z } from '@vben/common-ui';
import { getOwnProfile, updateOwnProfile } from '#/views/system/services';
import {
  LookupSelect,
  ToggleEditViewButton,
  FormActionsBar,
} from '#/views/system/shared_components';
import { message } from 'ant-design-vue';

// Profile data
interface ProfileData {
  tax_agent_name: string;
  tax_agent_no: string;
  tax_agent_nric: string;
  position: number;
  company_name: string;
  business_registration_no: string;
  address_1: string;
  address_2: string;
  address_3: string;
  postcode: string;
  town_city: string;
  state: number;
  email: string;
  tel_no: string;
  tin: string;
  version: number;
  updated_at: string;
}

const profile = ref<ProfileData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const isEditMode = ref(false);
const editableProfile = ref<ProfileData | null>(null);
const validationErrors = ref<Record<string, string>>({});
const isHeaderVisible = ref(true);
const dockedButtonsRef = ref<HTMLElement | null>(null);
const isDocked = ref(false);

let observer: IntersectionObserver | null = null;

const profileSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  tel_no: z.string().regex(/^\+\d{10,15}$/, {
    message: 'Invalid phone format. Must be E.164 format (+60XXXXXXXXX)',
  }),
  postcode: z
    .string()
    .regex(/^\d{5}$/, { message: 'Postcode must be 5 digits' }),
  // Add other fields to the schema if they have validation rules
});

watch(isEditMode, async (newValue) => {
  if (newValue) {
    // 1. Deep copy the profile using the reliable JSON method
    // eslint-disable-next-line unicorn/prefer-structured-clone
    editableProfile.value = JSON.parse(JSON.stringify(profile.value));

    // 2. Set up the observer after the DOM updates
    await nextTick();
    if (dockedButtonsRef.value) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isDocked.value = !!entry && entry.isIntersecting;
        },
        { root: null, threshold: 0.1 },
      );
      observer.observe(dockedButtonsRef.value);
    }
  } else {
    // 1. Clear the cloned profile
    editableProfile.value = null;

    // 2. Disconnect the observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }
});

// Load profile data on mount
onMounted(async () => {
  try {
    loading.value = true;
    const data = await getOwnProfile();
    profile.value = data as ProfileData;
  } catch (error_: any) {
    error.value = error_.message || 'Failed to load profile';

    // Handle auth/forbidden errors per FR-001
    if (error_.message?.includes('Forbidden')) {
      // For now, just display the error
      // In T015-T017, we'll implement proper route guards and redirects
      console.error('Forbidden: User not authorized to view profile');
    } else if (error_.message?.includes('Not Found')) {
      console.error('Profile not found for current user');
    }
  } finally {
    loading.value = false;
  }

  // Setup scroll listener to detect when header is out of view
  const handleScroll = () => {
    // Consider header hidden if scrolled more than 100px
    isHeaderVisible.value = window.scrollY < 100;
  };

  window.addEventListener('scroll', handleScroll);

  // Cleanup on unmount
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (observer) observer.disconnect();
  };
});

function validate() {
  if (!editableProfile.value) return false;

  const result = profileSchema.safeParse(editableProfile.value);
  if (result.success) {
    validationErrors.value = {};
    return true;
  } else {
    const errors: Record<string, string> = {};
    for (const error of result.error.errors) {
      if (error.path.length > 0) {
        errors[error.path[0] as string] = error.message;
      }
    }
    validationErrors.value = errors;
    return false;
  }
}

// Helper to display field value or empty placeholder
function displayValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
}

const hasChanges = computed(() => {
  if (!profile.value || !editableProfile.value) {
    return false;
  }
  return (
    JSON.stringify(profile.value) !== JSON.stringify(editableProfile.value)
  );
});

// (no alias needed) use `isEditMode` directly

// Placeholder handlers for Save/Cancel (will be implemented in US2)
async function handleSave() {
  if (!validate() || !editableProfile.value) {
    return;
  }

  try {
    const updatedProfile = await updateOwnProfile(editableProfile.value);
    profile.value = updatedProfile;
    isEditMode.value = false;
    message.success('Profile updated successfully');
  } catch (error_: any) {
    if (error_.message?.includes('Conflict')) {
      error.value =
        'Conflict: The profile has been updated by someone else. Please reload the page.';
      isEditMode.value = false; // Revert to view mode
    } else {
      error.value = error_.message || 'Failed to update profile';
    }
  }
}

function handleCancel() {
  isEditMode.value = false;
}

function handleStateLookupError() {
  stateLookupError.value = true;
}
</script>
