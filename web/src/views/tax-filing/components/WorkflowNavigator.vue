<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  FileSearchOutlined,
  DatabaseOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  CloseOutlined,
  HistoryOutlined,
} from '@ant-design/icons-vue';
import { Button, Tooltip } from 'ant-design-vue';
import type { WorkflowStep } from '../types/ai-chat';
import { useWorkflowHistoryStore } from '#/stores/workflowHistory';

interface WorkflowNavigatorProps {
  workflowSteps: WorkflowStep[];
  currentWorkflowStep: number;
  workflowActive: boolean;
  visible: boolean;
}

interface WorkflowNavigatorEmits {
  (e: 'navigate-to-step', stepIndex: number): void;
  (e: 'close'): void;
}

const props = withDefaults(defineProps<WorkflowNavigatorProps>(), {
  visible: false,
});

const emit = defineEmits<WorkflowNavigatorEmits>();

// Initialize workflow history store and route
const route = useRoute();
const workflowHistoryStore = useWorkflowHistoryStore();
const sessionId = computed(
  () => (route.query.sessionId as string) || 'default-session',
);

// Icon mapping for workflow steps
const stepIcons = {
  'client-selection': UserOutlined,
  'accounting-period': CalendarOutlined,
  'data-entry-method': FileTextOutlined,
  'manual-entry': DatabaseOutlined,
  upload: UploadOutlined,
  classify: FileSearchOutlined,
  extract: DatabaseOutlined,
  review: CheckCircleOutlined,
  'expense-review': FileTextOutlined,
  compute: CalculatorOutlined,
  'income-extraction': DatabaseOutlined,
  'capital-allowance': CalculatorOutlined,
  preview: EyeOutlined,
};

// Get status text for each step
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': {
      return 'Completed';
    }
    case 'active': {
      return 'Active';
    }
    case 'pending':
    default: {
      return 'Pending';
    }
  }
};

// Check if a step can be navigated to
const canNavigateToStep = (stepIndex: number, step: WorkflowStep) => {
  if (!props.workflowActive) return false;

  // Allow navigation to completed steps and current step
  return step.status === 'completed' || stepIndex === props.currentWorkflowStep;
};

// Handle step navigation
const handleStepClick = (stepIndex: number, step: WorkflowStep) => {
  if (canNavigateToStep(stepIndex, step)) {
    emit('navigate-to-step', stepIndex);
  }
};

// Get step icon component
const getStepIcon = (stepId: string) => {
  return stepIcons[stepId] || FileTextOutlined;
};

// Check if a step has saved history
const hasHistoryForStep = (stepId: string) => {
  return workflowHistoryStore.hasHistoryForStep(stepId, sessionId.value);
};

// Get the latest snapshot timestamp for a step
const getStepHistoryTimestamp = (stepId: string) => {
  const snapshot = workflowHistoryStore.getLatestSnapshotForStep(
    stepId,
    sessionId.value,
  );
  return snapshot ? snapshot.timestamp : null;
};

// Computed property for enhanced workflow steps with status
const enhancedSteps = computed(() => {
  return props.workflowSteps.map((step, index) => {
    const hasHistory = hasHistoryForStep(step.id);
    const historyTimestamp = getStepHistoryTimestamp(step.id);

    return {
      ...step,
      index,
      canNavigate: canNavigateToStep(index, step),
      hasHistory,
      historyTimestamp,
    };
  });
});
</script>

<template>
  <div
    v-if="visible"
    class="workflow-navigator-sidebar bg-background flex h-full flex-col"
  >
    <!-- Header -->
    <div class="border-border flex items-center justify-between border-b p-6">
      <div class="flex items-center space-x-4">
        <div class="bg-primary/10 rounded-xl p-3">
          <FileSearchOutlined class="text-primary text-xl" />
        </div>
        <div>
          <h3 class="text-foreground text-xl font-semibold">
            Workflow Navigator
          </h3>
          <p class="text-muted-foreground mt-1 text-sm">
            Navigate to completed steps
          </p>
        </div>
      </div>
      <Button
        type="text"
        shape="circle"
        size="large"
        @click="emit('close')"
        class="hover:bg-muted text-muted-foreground hover:text-foreground"
      >
        <CloseOutlined class="text-lg" />
      </Button>
    </div>

    <!-- Workflow Steps List -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="space-y-4">
        <div
          v-for="step in enhancedSteps"
          :key="step.id"
          class="group relative"
        >
          <div
            :class="[
              'border-border cursor-pointer rounded-xl border p-4 transition-all duration-300 hover:shadow-lg',
              {
                'bg-primary/5 border-primary/20 hover:bg-primary/10':
                  step.status === 'completed' && step.canNavigate,
                'bg-primary/10 border-primary/30 ring-primary/20 ring-1':
                  step.status === 'active',
                'bg-muted/30 border-muted cursor-not-allowed opacity-60':
                  step.status === 'pending' || !step.canNavigate,
                'hover:border-primary/40': step.canNavigate,
              },
            ]"
            @click="handleStepClick(step.index, step)"
          >
            <!-- Step Header -->
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="relative">
                  <div
                    :class="[
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      {
                        'bg-primary text-primary-foreground':
                          step.status === 'completed',
                        'bg-primary text-primary-foreground':
                          step.status === 'active',
                        'bg-muted text-muted-foreground':
                          step.status === 'pending',
                      },
                    ]"
                  >
                    <component :is="getStepIcon(step.id)" class="text-sm" />
                  </div>
                  <!-- History Indicator -->
                  <Tooltip
                    v-if="step.hasHistory"
                    :title="`Saved data available (${new Date(step.historyTimestamp).toLocaleString()})`"
                  >
                    <div
                      class="border-background absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-green-500"
                    >
                      <HistoryOutlined class="text-xs text-white" />
                    </div>
                  </Tooltip>
                </div>
                <div class="flex flex-col">
                  <span class="text-muted-foreground text-sm font-medium">
                    Step {{ step.index + 1 }}
                  </span>
                  <span
                    v-if="step.hasHistory"
                    class="text-xs font-medium text-green-600"
                  >
                    Data saved
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <div
                  :class="[
                    'rounded-md px-2 py-1 text-xs font-medium',
                    {
                      'bg-primary/10 text-primary': step.status === 'completed',
                      'bg-primary/15 text-primary': step.status === 'active',
                      'bg-muted text-muted-foreground':
                        step.status === 'pending',
                    },
                  ]"
                >
                  {{ getStatusText(step.status) }}
                </div>
              </div>
            </div>

            <!-- Step Content -->
            <div class="space-y-2">
              <h4 class="text-foreground text-base font-semibold">
                {{ step.title }}
              </h4>
              <p
                class="text-muted-foreground line-clamp-2 text-sm leading-relaxed"
              >
                {{ step.description }}
              </p>
            </div>

            <!-- Step Agents -->
            <div class="mt-3">
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="agent in step.agents?.slice(0, 1)"
                  :key="agent"
                  class="bg-muted/50 text-muted-foreground rounded-md px-2 py-1 text-xs font-medium"
                >
                  {{ agent.split(' ')[0] }}
                </div>
                <div
                  v-if="step.agents && step.agents.length > 1"
                  class="bg-muted/50 text-muted-foreground rounded-md px-2 py-1 text-xs font-medium"
                >
                  +{{ step.agents.length - 1 }}
                </div>
              </div>
            </div>

            <!-- Navigation Hint -->
            <div
              v-if="step.canNavigate && step.status === 'completed'"
              class="bg-primary/0 group-hover:bg-primary/5 absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-300"
            >
              <div
                class="bg-background/95 text-foreground border-border rounded-lg border px-3 py-2 text-sm font-medium opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
              >
                Click to navigate
              </div>
            </div>

            <!-- Current Step Indicator -->
            <div
              v-if="step.status === 'active'"
              class="bg-primary absolute -right-2 -top-2 h-4 w-4 animate-pulse rounded-full shadow-lg"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-border bg-muted/20 border-t p-4">
      <div class="text-muted-foreground space-y-3 text-sm">
        <div class="flex items-center space-x-2">
          <div class="bg-primary h-2.5 w-2.5 rounded-full"></div>
          <span>Completed - Click to navigate</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="bg-primary h-2.5 w-2.5 animate-pulse rounded-full"></div>
          <span>Current step</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="bg-muted h-2.5 w-2.5 rounded-full"></div>
          <span>Pending</span>
        </div>
        <div class="flex items-center space-x-2">
          <div
            class="flex h-3 w-3 items-center justify-center rounded-full bg-green-500"
          >
            <HistoryOutlined class="text-xs text-white" />
          </div>
          <span>Saved data available</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for the workflow steps container */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.workflow-navigator-sidebar {
  min-height: 100vh;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions for step cards */
.group:hover .group-hover\:bg-opacity-10 {
  background-opacity: 0.1;
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
