<script lang="ts" setup>
import { ref } from 'vue';
import {
  DatabaseOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons-vue';
import { Card, Button, Row, Col, Tag, message } from 'ant-design-vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import type { DataEntryMethodData } from '../../types/workflow-types';

interface Props {
  disabled?: boolean;
}

interface Emits {
  (e: 'method-selected', method: 'manual' | 'upload'): void;
  (e: 'step-completed', data: DataEntryMethodData): void;
  (e: 'step-loaded'): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();

const selectedMethod = ref<'manual' | 'upload' | null>(null);
const showTimeline = ref(true);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Method Selection Agent Assignment',
    description:
      'Assigning data entry method selection and workflow coordination agents',
    details: [
      'Method Selection Agent assigned',
      'Workflow Coordinator activated',
    ],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying method selection and coordination agents',
    details: [
      'Method Selection Agent deployed',
      'Workflow Coordinator synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Method Analysis',
    description: 'Analyzing available data entry methods and requirements',
    details: [
      'Manual entry capabilities assessed',
      'Document upload system verified',
      'Method comparison prepared',
    ],
    hasProgress: true,
    progressKey: 'analysis',
  },
  {
    id: 4,
    title: 'Selection Interface Ready',
    description: 'Data entry method selection interface ready for use',
    details: [
      'All methods analyzed successfully',
      'Ready for method selection',
    ],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1500, 3000, 4500],
  progressConfigs: {
    deployment: { increment: 15, interval: 150 },
    analysis: { increment: 8, interval: 300 },
  },
  autoCollapseDelay: 2000,
};

const dataEntryMethods = [
  {
    id: 'manual',
    title: 'Manual Entry',
    description: 'Enter financial data manually using guided forms',
    icon: DatabaseOutlined,
    color: 'blue',
    pros: [
      'Full control over data entry',
      'Real-time validation and guidance',
      'Perfect for small datasets',
      'No document scanning required',
    ],
    cons: [
      'Time-intensive for large datasets',
      'Requires manual input of all values',
      'Potential for typing errors',
    ],
    bestFor:
      'Small to medium businesses with straightforward financial records',
  },
  {
    id: 'upload',
    title: 'Document Upload',
    description: 'Upload documents for AI-powered data extraction',
    icon: UploadOutlined,
    color: 'green',
    pros: [
      'Fast processing of large datasets',
      'AI-powered data extraction',
      'Automatic document classification',
      'Reduces manual typing errors',
    ],
    cons: [
      'Requires high-quality document scans',
      'May need manual review and corrections',
      'Dependent on document format quality',
    ],
    bestFor: 'Businesses with extensive financial documents and receipts',
  },
];

// Select a method
const selectMethod = (method: 'manual' | 'upload') => {
  if (props.disabled || selectedMethod.value) {
    return;
  }

  selectedMethod.value = method;
  const methodData = dataEntryMethods.find((m) => m.id === method);

  emit('method-selected', method);
  message.success(`Selected method: ${methodData?.title}`);
};

// Proceed to next step
const proceedToNextStep = () => {
  if (!selectedMethod.value) {
    message.warning('Please select a data entry method first');
    return;
  }

  const methodData: DataEntryMethodData = {
    method: selectedMethod.value,
  };

  emit('step-completed', methodData);
};

// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};
</script>

<template>
  <div class="workflow-data-entry-method relative">
    <!-- Step-Specific Timeline -->
    <div v-if="showTimeline" class="mb-6">
      <SharedTimeline
        title="Data Entry Method Selection Timeline"
        color-theme="purple"
        :steps="timelineSteps"
        :config="timelineConfig"
        @completed="handleTimelineCompleted"
      />
    </div>

    <!-- Main Content -->
    <div v-if="timelineCompleted" class="space-y-6">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="mb-4 flex items-center justify-center">
          <div
            class="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500"
          >
            <FileTextOutlined class="text-xl text-white" />
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              Choose Data Entry Method
            </h2>
            <p class="mt-1 text-gray-600">
              Select how you'd like to input your financial data
            </p>
          </div>
        </div>
      </div>

      <!-- Method Selection Cards -->
      <Row :gutter="24" class="mb-8">
        <Col :span="12" v-for="method in dataEntryMethods" :key="method.id">
          <Card
            :class="[
              'method-card transition-all duration-300',
              selectedMethod === method.id
                ? 'selected-method border-2'
                : 'border hover:border-gray-300',
              selectedMethod === method.id && method.color === 'blue'
                ? 'border-blue-500 bg-blue-50'
                : '',
              selectedMethod === method.id && method.color === 'green'
                ? 'border-green-500 bg-green-50'
                : '',
              props.disabled ? 'cursor-not-allowed opacity-50' : '',
              selectedMethod && selectedMethod !== method.id
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:shadow-lg',
            ]"
            @click="selectMethod(method.id as 'manual' | 'upload')"
          >
            <div class="mb-4 text-center">
              <div
                :class="[
                  'mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full',
                  method.color === 'blue' ? 'bg-blue-100' : 'bg-green-100',
                ]"
              >
                <component
                  :is="method.icon"
                  :class="[
                    'text-2xl',
                    method.color === 'blue'
                      ? 'text-blue-600'
                      : 'text-green-600',
                  ]"
                />
              </div>
              <h3 class="mb-2 text-xl font-semibold">{{ method.title }}</h3>
              <p class="text-sm text-gray-600">{{ method.description }}</p>
            </div>

            <!-- Selection Indicator -->
            <div v-if="selectedMethod === method.id" class="mb-4 text-center">
              <Tag :color="method.color" class="px-3 py-1">
                <CheckCircleOutlined class="mr-1" />
                Selected
              </Tag>
            </div>

            <!-- Pros -->
            <div class="mb-4">
              <h4 class="mb-2 flex items-center font-medium text-green-700">
                <CheckCircleOutlined class="mr-1" />
                Advantages
              </h4>
              <ul class="space-y-1 text-sm text-gray-600">
                <li
                  v-for="pro in method.pros"
                  :key="pro"
                  class="flex items-start"
                >
                  <span class="mr-2 mt-0.5 text-green-500">•</span>
                  {{ pro }}
                </li>
              </ul>
            </div>

            <!-- Cons -->
            <div class="mb-4">
              <h4 class="mb-2 flex items-center font-medium text-orange-700">
                <ClockCircleOutlined class="mr-1" />
                Considerations
              </h4>
              <ul class="space-y-1 text-sm text-gray-600">
                <li
                  v-for="con in method.cons"
                  :key="con"
                  class="flex items-start"
                >
                  <span class="mr-2 mt-0.5 text-orange-500">•</span>
                  {{ con }}
                </li>
              </ul>
            </div>

            <!-- Best For -->
            <div class="border-t pt-3">
              <h4 class="mb-2 flex items-center font-medium text-blue-700">
                <SafetyOutlined class="mr-1" />
                Best For
              </h4>
              <p class="text-sm text-gray-600">{{ method.bestFor }}</p>
            </div>
          </Card>
        </Col>
      </Row>

      <!-- Proceed Button -->
      <div v-if="selectedMethod" class="mt-8 text-center">
        <Button
          type="primary"
          size="large"
          :disabled="props.disabled"
          @click="proceedToNextStep"
          class="h-12 rounded-lg px-8 py-2 text-lg font-semibold"
        >
          <ThunderboltOutlined class="mr-2" />
          Proceed to Next Step
        </Button>
      </div>
    </div>

    <!-- Disabled Overlay -->
    <WorkflowDisabledOverlay v-if="props.disabled" />
  </div>
</template>

<style scoped>
.method-card {
  min-height: 400px;
  transition: all 0.3s ease;
}

.method-card:hover {
  transform: translateY(-2px);
}

.selected-method {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

:deep(.ant-card-body) {
  padding: 24px;
}

:deep(.ant-tag) {
  border-radius: 12px;
  font-weight: 500;
}
</style>
