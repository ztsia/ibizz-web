<script lang="ts" setup>
import type { TaxFilingFormData } from './types';

import { nextTick, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { ChatWidget } from '@vben/layouts';
import { useChatStore } from '@vben/stores';

import {
  ArrowLeftOutlined,
  CalculatorOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  message,
  Row,
  Select,
  SelectOption,
  Textarea,
} from 'ant-design-vue';

import { useTaxFilingStore } from '#/store';

import { createTaxFiling } from './data';

const router = useRouter();
const taxFilingStore = useTaxFilingStore();
const chatStore = useChatStore();
const loading = ref(false);
const isFromClientList = ref(false);
const chatWidgetRef = ref<InstanceType<typeof ChatWidget>>();
const showWelcomeMessage = ref(true);

// Auto-trigger chat widget with workflow guidance
const triggerChatWithWorkflowGuidance = async () => {
  await nextTick();
  // Use chat store to auto-trigger with context
  chatStore.autoTriggerWithContext('tax-filing-create', 1000);


};

const formData = reactive<TaxFilingFormData>({
  clientName: '',
  taxYear: new Date().getFullYear(), // Auto-default to current year
  filingType: 'individual',
  description: '',
});

const rules = {
  clientName: [
    { required: true, message: 'Please enter client name', trigger: 'blur' },
    {
      min: 2,
      max: 100,
      message: 'Client name should be 2-100 characters',
      trigger: 'blur',
    },
  ],
  taxYear: [
    { required: true, message: 'Please select tax year', trigger: 'change' },
    {
      validator: (_rule: any, value: number) => {
        const currentYear = new Date().getFullYear();
        if (value < 2020 || value > currentYear) {
          return Promise.reject(
            new Error(`Tax year should be between 2020 and ${currentYear}`),
          );
        }
        return Promise.resolve();
      },
      trigger: 'change',
    },
  ],
  filingType: [
    { required: true, message: 'Please select filing type', trigger: 'change' },
  ],
};

async function onSubmit() {
  try {
    loading.value = true;
    const newTaxFiling = await createTaxFiling(formData);
    message.success('Tax filing created successfully!');

    // Navigate to workflow page
    router.push(`/tax-filing/workflow/${newTaxFiling.id}`);
  } catch (error) {
    message.error('Failed to create tax filing');
    console.error('Create tax filing error:', error);
  } finally {
    loading.value = false;
  }
}

function onCancel() {
  router.push('/tax-filing/create');
}

function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2020; year--) {
    years.push(year);
  }
  return years;
}

// Handle client information from store and auto-trigger chat
onMounted(async () => {
  const { client, fromClientList } = taxFilingStore.consumeClientInfo();

  if (client && fromClientList) {
    isFromClientList.value = true;
    formData.clientName = `${client.name} (${client.company || 'N/A'})`;
    formData.description = `Tax filing for ${client.name} from ${client.company || 'N/A'}\nContact: ${client.email || 'N/A'}`;
    // Set default filing type based on client company info
    formData.filingType = client.company ? 'corporate' : 'individual';

    message.info(
      `Pre-filled client information for ${client.name}. Only tax year can be modified.`,
    );
  } else {
    // If no client info, allow manual entry
    isFromClientList.value = false;
    message.info('Please enter client information manually.');
  }

  // Auto-trigger chat widget after component is mounted
  setTimeout(() => {
    //triggerChatWithWorkflowGuidance();
  }, 2000);
});
</script>

<template>
  <Page auto-content-height>
    <!-- Clean Form Layout -->
    <div class="min-h-screen">
      <!-- Main Content -->
      <div class="px-8 py-10">
        <div class="mx-auto ">
          <Row justify="center">
            <!-- Form Section -->
            <Col :span="24">
              <Card class="border shadow-sm">
                <template #title>
                  <div class="flex items-center space-x-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded border">
                      <FileTextOutlined class="text-sm" />
                    </div>
                    <div>
                      <h3 class="text-lg font-medium">Tax Filing Information</h3>
                      <p class="text-sm opacity-60">Complete the form to start your workflow</p>
                    </div>
                  </div>
                </template>

                <div class="p-6">
                  <Form
                    :model="formData"
                    :rules="rules"
                    layout="vertical"
                    @finish="onSubmit"
                  >
                    <!-- Client Name -->
                    <FormItem label="Client Name" name="clientName" class="mb-6">
                      <Input
                        v-model:value="formData.clientName"
                        size="large"
                        :placeholder="
                          isFromClientList
                            ? 'Client information pre-filled'
                            : 'Enter client name'
                        "
                        :disabled="isFromClientList"
                        class="border-gray-300"
                      >
                        <template #prefix>
                          <UserOutlined class="opacity-50" />
                        </template>
                      </Input>
                      <div v-if="isFromClientList" class="mt-2 text-xs opacity-60">
                        Client information is pre-filled and cannot be modified
                      </div>
                    </FormItem>

                    <!-- Two-Column Layout -->
                    <Row :gutter="24">
                      <Col :span="12">
                        <FormItem
                          :label="isFromClientList ? 'Tax Year (Editable)' : 'Tax Year'"
                          name="taxYear"
                          class="mb-6"
                        >
                          <Select
                            v-model:value="formData.taxYear"
                            size="large"
                            placeholder="Select tax year"
                            class="w-full"
                            :class="{
                              'ring-1 ring-gray-400': isFromClientList,
                            }"
                          >
                            <SelectOption
                              v-for="year in generateYearOptions()"
                              :key="year"
                              :value="year"
                            >
                              {{ year }}
                            </SelectOption>
                          </Select>
                          <div v-if="isFromClientList" class="mt-2 text-xs font-medium">
                            This is the only field you can modify
                          </div>
                        </FormItem>
                      </Col>
                      <Col :span="12">
                        <FormItem label="Filing Type" name="filingType" class="mb-6">
                          <Select
                            v-model:value="formData.filingType"
                            size="large"
                            :placeholder="
                              isFromClientList
                                ? 'Auto-selected based on client'
                                : 'Select filing type'
                            "
                            :disabled="isFromClientList"
                            class="w-full"
                          >
                            <SelectOption value="individual">Individual</SelectOption>
                            <SelectOption value="corporate">Corporate</SelectOption>
                            <SelectOption value="partnership">Partnership</SelectOption>
                          </Select>
                          <div v-if="isFromClientList" class="mt-2 text-xs opacity-60">
                            Filing type auto-selected based on client information
                          </div>
                        </FormItem>
                      </Col>
                    </Row>

                    <!-- Description Field -->
                    <FormItem label="Description (Optional)" name="description" class="mb-8">
                      <Textarea
                        v-model:value="formData.description"
                        :rows="4"
                        :placeholder="
                          isFromClientList
                            ? 'Client information and notes pre-filled'
                            : 'Add any additional notes, special requirements, or client-specific information...'
                        "
                        :disabled="isFromClientList"
                        class="border-gray-300"
                      />
                      <div v-if="isFromClientList" class="mt-2 text-xs opacity-60">
                        Description pre-filled with client information
                      </div>
                    </FormItem>

                    <!-- Action Buttons -->
                    <FormItem class="mb-0">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 text-sm opacity-60">
                          <ClockCircleOutlined />
                          <span>Estimated time: 2-3 minutes</span>
                        </div>
                        <div class="flex gap-3">
                          <Button
                            size="large"
                            class="px-6 border hover:border-gray-400"
                            @click="onCancel"
                          >
                            <ArrowLeftOutlined class="mr-2" />
                            {{ isFromClientList ? 'Back to Clients' : 'Back to List' }}
                          </Button>
                          <Button
                            type="primary"
                            size="large"
                            html-type="submit"
                            :loading="loading"
                            class="px-6"
                          >
                            <PlayCircleOutlined class="mr-2" />
                            Create & Start Workflow
                          </Button>
                        </div>
                      </div>
                    </FormItem>
                  </Form>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>

    <!-- Chat Widget -->
    <ChatWidget
      ref="chatWidgetRef"
      :show-welcome-message="showWelcomeMessage"
    />
  </Page>
</template>

<style scoped>
/* Responsive Design */
@media (max-width: 768px) {
  .modern-card {
    margin: 1rem;
  }
}

.modern-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-card:hover {
  box-shadow: 0 8px 25px rgb(0 0 0 / 8%);
  transform: translateY(-2px);
}

/* Enhanced Form Styles */
.modern-form .form-item-enhanced {
  margin-bottom: 24px;
}

.modern-form .form-item-enhanced :deep(.ant-form-item-label) {
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.modern-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-input:hover {
  border-color: #9ca3af;
}

.modern-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 10%);
}

.modern-select {
  border-radius: 8px;
}

.modern-select :deep(.ant-select-selector) {
  border: 1px solid #d1d5db !important;
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.modern-select:hover :deep(.ant-select-selector) {
  border-color: #9ca3af !important;
}

.modern-select.ant-select-focused :deep(.ant-select-selector) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 10%) !important;
}

.modern-textarea {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modern-textarea:hover {
  border-color: #9ca3af;
}

.modern-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgb(59 130 246 / 10%);
}

/* Clean Button Styles */
:deep(.ant-btn-primary) {
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.ant-btn) {
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* Badge Enhancements */
:deep(.ant-badge) {
  font-weight: 600;
}

/* Workflow Steps */
.workflow-steps :deep(.ant-steps-item-title) {
  font-weight: 600;
  color: #374151;
}

.workflow-steps :deep(.ant-steps-item-description) {
  color: #6b7280;
}

.ant-card {
  border-radius: 8px;
}

.ant-form-item-label > label {
  font-weight: 500;
}

/* Clean Professional Styles */
</style>
