<script lang="ts" setup>
import { ref } from 'vue';
import { Card, Alert, Button } from 'ant-design-vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import type {
  WorkflowPreviewProps as Props,
  WorkflowPreviewEmits as Emits,
} from '../../types/workflow-types';

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();

const showTimeline = ref(true);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Preview Coordinator Assignment',
    description: 'Assigning form generation and preview agents',
    details: ['Form Generation Agent assigned', 'Preview Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying form generation and preview agents',
    details: ['Form Generation Agent deployed', 'Preview Agent synchronized'],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Tax Form Generation',
    description: 'Generating tax forms based on computed data',
    details: [
      'Tax forms generated',
      'Supporting documents created',
      'Preview interface prepared',
    ],
    hasProgress: true,
    progressKey: 'generation',
  },
  {
    id: 4,
    title: 'Ready for Submission',
    description: 'Tax forms ready for review and submission',
    details: ['Forms ready for preview', 'Ready to proceed to review'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 2000, 4500, 8000],
  progressConfigs: {
    deployment: { increment: 10, interval: 200 },
    generation: { increment: 8, interval: 300 },
  },
  autoCollapseDelay: 2000,
};

// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

// Handle step shown
const handleStepShown = () => {
  emit('step-loaded');
};

// Complete step with save draft
const saveDraft = () => {
  if (props.disabled) return;
  emit('step-complete', { action: 'save_draft' });
};

// Complete step with submit
const submitReturn = () => {
  if (props.disabled) return;
  emit('step-complete', { action: 'submit', submitted: true });
};
</script>

<template>
  <div class="relative">
    <!-- Step-specific timeline -->
    <SharedTimeline
      v-if="showTimeline"
      title="Tax Form Preview Timeline"
      color-theme="indigo"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
      class="mb-6"
    />

    <Card title="👁️ Preview & Submit" class="mb-4" v-if="timelineCompleted">
      <Alert
        message="Preview & Submission Agents Ready"
        description="Your tax return is ready for final review and submission to tax authorities."
        type="success"
        show-icon
        class="mb-4"
      />

      <div class="mb-4">
        <h4 class="mb-3 font-medium">Tax Return Summary:</h4>
        <div class="bg-card border p-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h5 class="mb-2 font-medium">Personal Information</h5>
              <div class="space-y-1 text-sm">
                <div>Filing Status: Single</div>
                <div>Tax Year: 2023</div>
              </div>
            </div>
            <div>
              <h5 class="mb-2 font-medium">Financial Summary</h5>
              <div class="space-y-1 text-sm">
                <div>Adjusted Gross Income: $72,500</div>
                <div>Total Tax: $11,300</div>
                <div class="font-medium text-red-600">Amount Owed: $2,800</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex space-x-3">
        <Button type="default" :disabled="props.disabled" @click="saveDraft">
          Save as Draft
        </Button>
        <Button type="primary" :disabled="props.disabled" @click="submitReturn">
          Submit Tax Return
        </Button>
      </div>
    </Card>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.gap-4 {
  gap: 1rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.p-4 {
  padding: 1rem;
}

.flex {
  display: flex;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

.text-red-600 {
  color: rgb(220 38 38);
}

.border {
  border-width: 1px;
}
</style>
