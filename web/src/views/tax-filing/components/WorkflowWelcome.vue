<template>
  <div class="mx-auto max-w-6xl p-6">
    <!-- Header Section -->
    <div class="mb-8">
      <div class="mb-4 flex items-center gap-3 text-left">
        <div class="bg-primary text-secondary h-12 w-12 rounded-xl shadow-lg">
          <div
            class="flex h-full w-full items-center justify-center rounded-xl"
          >
            <RobotOutlined class="" />
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold">ibizztax.ai AI Assistant</h1>
          <p class="text-sm">
            Your intelligent companion for Malaysian corporate tax filing
          </p>
        </div>
      </div>
    </div>

    <!-- Workflow Steps Visual -->
    <div class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">Tax Filing Workflow</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(step, index) in workflowSteps"
          :key="step.id"
          class="relative rounded-lg border p-4 transition-all duration-200 hover:shadow-md"
        >
          <div
            class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <component :is="step.icon" class="text-lg" />
          </div>
          <div class="mb-2">
            <h3 class="mb-1 text-sm font-semibold">{{ step.title }}</h3>
            <p class="text-xs opacity-75">{{ step.description }}</p>
          </div>
          <div
            class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
          >
            {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mb-6">
      <h2 class="mb-4 text-lg font-semibold">Quick Actions</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Button
          v-for="action in quickActions"
          :key="action.id"
          :type="action.type"
          :size="action.size"
          class="flex h-12 items-center justify-center font-medium transition-all duration-200 hover:shadow-sm"
          @click="handleAction(action.action)"
        >
          <component :is="action.icon" class="mr-2" />
          {{ action.label }}
        </Button>
      </div>
    </div>

    <!-- Help Section -->
    <div class="mt-6">
      <div class="rounded-lg border p-4">
        <div class="flex items-start gap-3">
          <InfoCircleOutlined class="mt-0.5" />
          <div>
            <h3 class="mb-1 text-sm font-semibold">Getting Started</h3>
            <p class="mb-2 text-sm">
              Click "Start Workflow" to begin your tax filing journey, or use
              any of the quick actions above.
            </p>
            <div class="text-xs">
              <span class="font-medium">Available Commands:</span>
              <code class="ml-1 rounded border px-1">/start</code>
              <code class="ml-1 rounded border px-1">/help</code>
              <code class="ml-1 rounded border px-1">/clear</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'ant-design-vue';
import {
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons-vue';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  active: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  action: string;
  type: 'primary' | 'default' | 'dashed';
  size: 'large' | 'middle' | 'small';
}

const emit = defineEmits<{
  action: [actionType: string];
}>();

const workflowSteps = ref<WorkflowStep[]>([
  {
    id: 'client-selection',
    title: 'Client Selection',
    description: 'Choose and configure client information',
    icon: UserOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'accounting-period',
    title: 'Accounting Period',
    description: 'Set the tax filing period',
    icon: CalendarOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    description: 'Upload and classify documents',
    icon: UploadOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'data-extraction',
    title: 'Data Extraction',
    description: 'Extract and validate data',
    icon: FileTextOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'expense-review',
    title: 'Expense Review',
    description: 'Review and categorize expenses',
    icon: DollarOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'income-extraction',
    title: 'Income Extraction',
    description: 'Extract dividend, interest and rental income',
    icon: DollarOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'computation',
    title: 'Tax Computation',
    description: 'Calculate tax obligations',
    icon: CalculatorOutlined,
    completed: false,
    active: false,
  },
  {
    id: 'review',
    title: 'Final Review',
    description: 'Quality assurance and submission',
    icon: CheckCircleOutlined,
    completed: false,
    active: false,
  },
]);

const quickActions = ref<QuickAction[]>([
  {
    id: 'start-workflow',
    label: 'Start Workflow',
    icon: PlayCircleOutlined,
    action: 'start',
    type: 'primary',
    size: 'large',
  },
  {
    id: 'get-help',
    label: 'Get Help',
    icon: QuestionCircleOutlined,
    action: 'help',
    type: 'default',
    size: 'large',
  },
  {
    id: 'clear-chat',
    label: 'Clear Chat',
    icon: ClearOutlined,
    action: 'clear',
    type: 'dashed',
    size: 'large',
  },
]);

function handleAction(actionType: string) {
  emit('action', actionType);
}
</script>

<style scoped>
/* All styles moved to inline Tailwind classes */
</style>
