<script lang="ts" setup>
import type { TaxFiling, TaxFilingFormData } from './types';

import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';

import {
  ArrowLeftOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons-vue';
import {
  Button,
  Card,
  Col,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  SelectOption,
  Spin,
  Tag,
  Textarea,
  message,
} from 'ant-design-vue';

import { getTaxFiling, updateTaxFiling } from './data';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const taxFiling = ref<TaxFiling | null>(null);

const formData = reactive<TaxFilingFormData>({
  clientName: '',
  taxYear: new Date().getFullYear() - 1,
  filingType: 'individual',
  description: '',
});

const rules = {
  clientName: [
    { required: true, message: 'Please enter client name', trigger: 'blur' },
    { min: 2, max: 100, message: 'Client name should be 2-100 characters', trigger: 'blur' },
  ],
  taxYear: [
    { required: true, message: 'Please select tax year', trigger: 'change' },
    {
      validator: (_rule: any, value: number) => {
        const currentYear = new Date().getFullYear();
        if (value < 2020 || value > currentYear) {
          return Promise.reject(new Error(`Tax year should be between 2020 and ${currentYear}`));
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

onMounted(async () => {
  await loadTaxFiling();
});

async function loadTaxFiling() {
  try {
    loading.value = true;
    const id = route.params.id as string;
    const data = await getTaxFiling(id);

    if (!data) {
      message.error('Tax filing not found');
      router.push('/client/list');
      return;
    }

    taxFiling.value = data;

    // Populate form data
    formData.clientName = data.clientName;
    formData.taxYear = data.taxYear;
    formData.filingType = data.filingType;
    formData.description = '';
  } catch (error) {
    message.error('Failed to load tax filing');
    console.error('Load tax filing error:', error);
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!taxFiling.value) return;

  try {
    saving.value = true;

    // Only update the tax year since it's the only editable field
    await updateTaxFiling(taxFiling.value.id, {
      taxYear: formData.taxYear,
    });

    message.success('Tax filing updated successfully!');
    router.push('/client/list');
  } catch (error) {
    message.error('Failed to update tax filing');
    console.error('Update tax filing error:', error);
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  router.push('/client/list');
}

function goToWorkflow() {
  if (taxFiling.value) {
    router.push(`/tax-filing/workflow/${taxFiling.value.id}`);
  }
}

function generateYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2020; year--) {
    years.push(year);
  }
  return years;
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: 'default',
    file_uploaded: 'processing',
    file_classified: 'processing',
    data_extracted: 'processing',
    data_validated: 'warning',
    preview_generated: 'warning',
    user_confirmed: 'processing',
    analysis_complete: 'success',
    completed: 'success',
    error: 'error'
  };
  return colorMap[status] || 'default';
}

function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    draft: 'Draft',
    file_uploaded: 'File Uploaded',
    file_classified: 'File Classified',
    data_extracted: 'Data Extracted',
    data_validated: 'Data Validated',
    preview_generated: 'Preview Generated',
    user_confirmed: 'User Confirmed',
    analysis_complete: 'Analysis Complete',
    completed: 'Completed',
    error: 'Error'
  };
  return labelMap[status] || status;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
</script>

<template>
  <Page auto-content-height>
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white border-b px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">
              <CalculatorOutlined class="mr-2" />
              Edit Tax Filing
            </h1>
            <p v-if="taxFiling" class="mt-1 text-sm text-gray-600">
              Editing {{ taxFiling.clientName }} - {{ taxFiling.taxYear }} Filing
            </p>
          </div>
          <div class="flex gap-2">
            <Button v-if="taxFiling" @click="goToWorkflow">
              <PlayCircleOutlined class="mr-2" />
              Open Workflow
            </Button>
            <Button @click="onCancel">
              <ArrowLeftOutlined class="mr-2" />
              Back to List
            </Button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>

      <!-- Main Content -->
      <div v-else-if="taxFiling" class="p-6">
        <Row :gutter="24">
          <!-- Edit Form -->
          <Col :span="16">
            <Card class="shadow-sm">
              <template #title>
                <div class="flex items-center">
                  <FileTextOutlined class="mr-2 text-blue-500" />
                  Tax Filing Information
                </div>
              </template>

              <Form
                :model="formData"
                :rules="rules"
                layout="vertical"
                @finish="onSubmit"
              >
                <FormItem label="Client Name" name="clientName">
                  <Input
                    v-model:value="formData.clientName"
                    size="large"
                    placeholder="Enter client name"
                    disabled
                  >
                    <template #prefix>
                      <UserOutlined class="text-gray-400" />
                    </template>
                  </Input>
                  <div class="text-xs text-gray-500 mt-1">
                    Client name cannot be modified in edit mode
                  </div>
                </FormItem>

                <Row :gutter="16">
                  <Col :span="12">
                    <FormItem label="Tax Year (Editable)" name="taxYear">
                      <Select
                        v-model:value="formData.taxYear"
                        size="large"
                        placeholder="Select tax year"
                        class="border-blue-300 ring-1 ring-blue-200"
                      >
                        <SelectOption
                          v-for="year in generateYearOptions()"
                          :key="year"
                          :value="year"
                        >
                          {{ year }}
                        </SelectOption>
                      </Select>
                      <div class="text-xs text-blue-600 mt-1">
                        This is the only field you can modify
                      </div>
                    </FormItem>
                  </Col>
                  <Col :span="12">
                    <FormItem label="Filing Type" name="filingType">
                      <Select
                        v-model:value="formData.filingType"
                        size="large"
                        placeholder="Select filing type"
                        disabled
                      >
                        <SelectOption value="individual">
                          Individual
                        </SelectOption>
                        <SelectOption value="corporate">
                          Corporate
                        </SelectOption>
                        <SelectOption value="partnership">
                          Partnership
                        </SelectOption>
                      </Select>
                      <div class="text-xs text-gray-500 mt-1">
                        Filing type cannot be modified in edit mode
                      </div>
                    </FormItem>
                  </Col>
                </Row>

                <FormItem label="Notes (Optional)" name="description">
                  <Textarea
                    v-model:value="formData.description"
                    :rows="4"
                    placeholder="Add any additional notes or changes..."
                  />
                </FormItem>

                <FormItem class="mb-0">
                  <div class="flex justify-end gap-3">
                    <Button size="large" @click="onCancel">
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      html-type="submit"
                      :loading="saving"
                    >
                      Update Tax Filing
                    </Button>
                  </div>
                </FormItem>
              </Form>
            </Card>
          </Col>

          <!-- Status & Info Panel -->
          <Col :span="8">
            <!-- Current Status -->
            <Card title="Current Status" class="shadow-sm mb-4">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Status:</span>
                  <Tag :color="getStatusColor(taxFiling.status)">
                    {{ getStatusLabel(taxFiling.status) }}
                  </Tag>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Current Step:</span>
                  <span class="font-medium">{{ taxFiling.workflowStep }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Files Uploaded:</span>
                  <span class="font-medium">{{ taxFiling.uploadedFiles.length }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Created:</span>
                  <span class="text-sm">{{ new Date(taxFiling.createdAt).toLocaleDateString() }}</span>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Last Updated:</span>
                  <span class="text-sm">{{ new Date(taxFiling.updatedAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </Card>

            <!-- Uploaded Files -->
            <Card v-if="taxFiling.uploadedFiles.length > 0" title="Uploaded Files" class="shadow-sm mb-4">
              <div class="space-y-3">
                <div
                  v-for="file in taxFiling.uploadedFiles"
                  :key="file.id"
                  class="border rounded p-3"
                >
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-sm truncate">{{ file.name }}</span>
                    <Tag
                      v-if="file.classification"
                      :color="file.classification.type === 'pdf' ? 'red' : file.classification.type === 'excel' ? 'green' : 'blue'"
                      size="small"
                    >
                      {{ file.classification.type.toUpperCase() }}
                    </Tag>
                  </div>

                  <div class="text-xs text-gray-500">
                    {{ formatFileSize(file.size) }} •
                    {{ new Date(file.uploadedAt).toLocaleDateString() }}
                  </div>

                  <div v-if="file.classification" class="text-xs text-gray-600 mt-1">
                    Confidence: {{ Math.round(file.classification.confidence * 100) }}%
                  </div>
                </div>
              </div>
            </Card>

            <!-- Extracted Data Preview -->
            <Card v-if="taxFiling.extractedData" title="Extracted Data" class="shadow-sm mb-4">
              <div class="space-y-2 text-sm">
                <div v-if="taxFiling.extractedData.personalInfo">
                  <strong>Personal Info:</strong>
                  <div class="ml-2 text-gray-600">
                    {{ taxFiling.extractedData.personalInfo.name }}
                  </div>
                </div>

                <div v-if="taxFiling.extractedData.incomeData">
                  <strong>Total Income:</strong>
                  <div class="ml-2 text-gray-600">
                    ${{ taxFiling.extractedData.incomeData.totalIncome?.toLocaleString() }}
                  </div>
                </div>

                <div class="text-xs text-gray-500 mt-2">
                  Extracted: {{ new Date(taxFiling.extractedData.extractedAt).toLocaleDateString() }}
                </div>
              </div>
            </Card>

            <!-- Validation Results -->
            <Card v-if="taxFiling.validationResults" title="Validation Results" class="shadow-sm mb-4">
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span>Completeness:</span>
                  <span class="font-medium">{{ taxFiling.validationResults.completenessScore }}%</span>
                </div>

                <div class="flex items-center justify-between">
                  <span>Status:</span>
                  <Tag :color="taxFiling.validationResults.isComplete ? 'green' : 'orange'">
                    {{ taxFiling.validationResults.isComplete ? 'Complete' : 'Incomplete' }}
                  </Tag>
                </div>

                <div v-if="taxFiling.validationResults.warnings.length > 0">
                  <strong>Warnings:</strong> {{ taxFiling.validationResults.warnings.length }}
                </div>

                <div v-if="taxFiling.validationResults.errors.length > 0">
                  <strong>Errors:</strong> {{ taxFiling.validationResults.errors.length }}
                </div>
              </div>
            </Card>

            <!-- Quick Actions -->
            <Card title="Quick Actions" class="shadow-sm">
              <div class="space-y-2">
                <Button block @click="goToWorkflow">
                  <PlayCircleOutlined class="mr-2" />
                  Continue Workflow
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <!-- Error State -->
      <div v-else class="flex justify-center items-center h-64">
        <div class="text-center">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Tax Filing Not Found</h3>
          <p class="text-gray-600 mb-4">The requested tax filing could not be found.</p>
          <Button type="primary" @click="onCancel">
            Back to List
          </Button>
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.ant-card {
  border-radius: 8px;
}

.ant-form-item-label > label {
  font-weight: 500;
}
</style>
