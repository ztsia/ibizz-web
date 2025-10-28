<template>
  <div
    class="bg-card relative mb-4 rounded-lg border p-4 shadow-sm"
    :class="containerClass"
  >
    <div class="relative">
      <div
        class="group mb-4 flex items-center justify-between transition-all duration-200"
        :class="{ 'cursor-pointer': !disableCollapse }"
        @click="handleHeaderClick"
      >
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div
              class="h-2 w-2 rounded-full transition-all duration-300"
              :class="indicatorClass"
            ></div>
          </div>
          <h3 class="text-sm font-medium tracking-tight">
            {{ title }}
          </h3>
        </div>
        <button
          v-if="!disableCollapse"
          @click.stop="toggleCollapse"
          class="flex h-6 w-6 items-center justify-center rounded transition-all duration-200"
          :class="buttonClass"
          :aria-label="isCollapsed ? 'Expand timeline' : 'Collapse timeline'"
        >
          <svg
            class="h-3 w-3 transition-all duration-300"
            :class="{ 'rotate-180': isCollapsed }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          v-else
          class="transition-all duration-300"
          :class="{ 'rotate-180': isCollapsed }"
        >
          <svg
            class="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      <div
        class="duration-400 space-y-3 overflow-hidden transition-all ease-out"
        :class="{
          'max-h-0 opacity-0': isCollapsed,
          'max-h-[1000px] opacity-100': !isCollapsed,
        }"
      >
        <!-- Dynamic Steps - Show progressively and cumulatively -->
        <div
          v-for="(step, stepIndex) in visibleSteps"
          :key="stepIndex"
          class="timeline-step relative"
          :class="{
            completed: currentStep > getOriginalStepIndex(step) + 1,
            active: currentStep === getOriginalStepIndex(step) + 1,
          }"
        >
          <div class="relative flex items-start">
            <!-- Connection line for multiple steps -->
            <div
              v-if="stepIndex < visibleSteps.length - 1"
              class="absolute left-1.5 top-6 h-full w-px"
            ></div>
            <div class="step-indicator relative z-10 flex-shrink-0">
              <!-- Completed State -->
              <div
                v-if="currentStep > getOriginalStepIndex(step) + 1"
                class="flex h-3 w-3 items-center justify-center rounded-full bg-green-500"
              >
                <svg class="h-2 w-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <!-- Active State -->
              <div
                v-else-if="currentStep === getOriginalStepIndex(step) + 1"
                class="h-3 w-3 animate-pulse rounded-full bg-blue-500"
              ></div>
              <!-- Pending State -->
              <div v-else class="h-3 w-3 rounded-full"></div>
            </div>
            <div class="ml-4 flex-1">
              <h4 class="text-foreground text-sm font-medium">
                {{ step.title }}
              </h4>
              <p class="text-foreground/80 mt-0.5 text-xs leading-relaxed">
                {{ step.description }}
              </p>
              <!-- Details -->
              <div
                v-if="
                  currentStep >= getOriginalStepIndex(step) + 1 && step.details
                "
                class="mt-2 space-y-1"
              >
                <div
                  v-for="(detail, detailIndex) in step.details"
                  :key="detailIndex"
                  class="text-foreground/50 flex items-center text-xs"
                >
                  <div class="bg-foreground mr-2 h-1 w-1 rounded-full"></div>
                  <span class="font-medium">{{ detail }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { TimelineStep, TimelineConfig, ColorTheme } from '../../types';

// Props
interface Props {
  title: string;
  colorTheme: ColorTheme;
  steps: TimelineStep[];
  config?: TimelineConfig;
  disableCollapse?: boolean;
  startImmediately?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({
    stepTimings: [250, 1000, 2250],
    autoCollapseDelay: 2000,
  }),
  disableCollapse: false,
  startImmediately: true,
});

// Emits
const emit = defineEmits<{
  completed: [];
  'step-shown': [];
}>();

// Reactive state
const currentStep = ref(0);
const isCollapsed = ref(false);

// Computed property to show steps progressively and cumulatively
const visibleSteps = computed(() => {
  if (currentStep.value === 0) {
    return props.steps.slice(0, 1); // Show first step when nothing is active
  }

  // Show all steps up to and including the current step
  return props.steps.slice(0, currentStep.value);
});

// Intervals and timeouts
let stepTimeouts: NodeJS.Timeout[] = [];

// Color theme classes - muted and minimal
const colorClasses = computed(() => {
  return {
    indicator: 'bg-gray-400',
    button: 'hover:bg-gray-50',
    icon: 'text-gray-500',
    stepIndicator: 'bg-gray-500',
    stepDot: 'bg-gray-400',
    stepText: 'text-gray-600',
    progressBar: 'bg-gray-500',
    container: '',
  };
});

// Computed classes
const containerClass = computed(() => colorClasses.value.container);
const indicatorClass = computed(() => colorClasses.value.indicator);
const buttonClass = computed(() => colorClasses.value.button);

// Methods
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const handleHeaderClick = () => {
  if (!props.disableCollapse) {
    toggleCollapse();
  }
};

const getOriginalStepIndex = (step: TimelineStep): number => {
  return props.steps.indexOf(step);
};

const startTimeline = () => {
  const timings = props.config?.stepTimings || [250, 1000, 1250];

  props.steps.forEach((step, index) => {
    const delay = timings[index] || timings[timings.length - 1];

    const timeout = setTimeout(() => {
      currentStep.value = index + 1;

      // Emit step-shown event when a new step is shown
      emit('step-shown');

      // Emit completion when last step is reached
      if (index === props.steps.length - 1) {
        emit('completed');
        isCollapsed.value = true;
      }
    }, delay);

    stepTimeouts.push(timeout);
  });
};

const cleanup = () => {
  stepTimeouts.forEach((timeout) => clearTimeout(timeout));
  stepTimeouts = [];
};

// Lifecycle
onMounted(() => {
  if (props.startImmediately) {
    startTimeline();
  }
});

onUnmounted(() => {
  cleanup();
});

// Expose methods for external control
defineExpose({
  startTimeline,
  toggleCollapse,
  cleanup,
});
</script>

<style scoped>
.timeline-step {
  @apply transition-all duration-300 ease-out;
}

.timeline-step.active {
  @apply opacity-100;
}

.timeline-step.completed {
  @apply opacity-90;
}

.step-indicator {
  @apply flex-shrink-0;
}

/* Minimal transitions */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
