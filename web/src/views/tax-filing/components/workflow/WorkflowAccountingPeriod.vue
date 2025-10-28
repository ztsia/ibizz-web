<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import {
  CalendarOutlined,
  CalendarTwoTone,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue';
import {
  Card,
  DatePicker,
  Button,
  Alert,
  Space,
  Typography,
  Tag,
  Badge,
  Checkbox,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';
import type {
  AccountingPeriodData,
  WorkflowAccountingPeriodProps as Props,
  WorkflowAccountingPeriodEmits as Emits,
} from '../../types/workflow-types';

const { Title, Text } = Typography;

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();

// Timeline state
const showTimeline = ref(true);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Period Selection Coordinator Assignment',
    description: 'Assigning accounting period and validation agents',
    details: ['Period Selection Agent assigned', 'Validation Agent activated'],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying period selection and validation agents',
    details: [
      'Period Selection Agent deployed',
      'Validation Agent synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Period Configuration Setup',
    description: 'Setting up accounting period configuration interface',
    details: [
      'Date selection interface ready',
      'Validation rules configured',
      'Period presets loaded',
    ],
    hasProgress: true,
    progressKey: 'configuration',
  },
  {
    id: 4,
    title: 'Period Selection Ready',
    description: 'Accounting period selection interface ready',
    details: ['All period options available', 'Ready for period selection'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1200, 2800, 4000],
  progressConfigs: {
    deployment: { increment: 18, interval: 140 },
    configuration: { increment: 9, interval: 280 },
  },
  autoCollapseDelay: 2000,
};

// Date selection state
const accountingStartDate = ref<Dayjs | null>(null);
const accountingEndDate = ref<Dayjs | null>(null);
const basicStartDate = ref<Dayjs | null>(null);
const basicEndDate = ref<Dayjs | null>(null);

// Validation state
const errors = ref<string[]>([]);
const warnings = ref<string[]>([]);
const isLoading = ref(false);
const isConfirmed = ref(false);
const overrideRestrictions = ref(false);

// Computed validation
const isAccountingPeriodValid = computed(() => {
  return (
    accountingStartDate.value &&
    accountingEndDate.value &&
    accountingStartDate.value.isBefore(accountingEndDate.value)
  );
});

const isBasicPeriodValid = computed(() => {
  return (
    basicStartDate.value &&
    basicEndDate.value &&
    basicStartDate.value.isBefore(basicEndDate.value)
  );
});

const canProceed = computed(() => {
  return (
    isAccountingPeriodValid.value &&
    isBasicPeriodValid.value &&
    errors.value.length === 0
  );
});

// Date validation
const validateDates = () => {
  errors.value = [];
  warnings.value = [];

  // Validate accounting period
  if (!accountingStartDate.value || !accountingEndDate.value) {
    errors.value.push(
      'Please select both accounting period start and end dates',
    );
  } else if (accountingStartDate.value.isAfter(accountingEndDate.value)) {
    errors.value.push('Accounting period start date must be before end date');
  }

  // Validate basis period
  if (!basicStartDate.value || !basicEndDate.value) {
    errors.value.push('Please select both basis periods start and end dates');
  } else if (basicStartDate.value.isAfter(basicEndDate.value)) {
    errors.value.push('Basis period start date must be before end date');
  }

  // Check for non-standard periods (warnings only when override is not checked)
  if (isAccountingPeriodValid.value && isBasicPeriodValid.value && !overrideRestrictions.value) {
    const accountingDuration = accountingEndDate.value!.diff(
      accountingStartDate.value!,
      'days',
    );
    const basicDuration = basicEndDate.value!.diff(
      basicStartDate.value!,
      'days',
    );

    if (accountingDuration < 300 || accountingDuration > 400) {
      warnings.value.push(
        'Accounting period is not standard 12 months. This might be due to: 1) New Company - 1st set of accounts, 2) Company changed its financial year end. Check "Override standard period restrictions" if this is intentional.'
      );
    }

    if (basicDuration < 300 || basicDuration > 400) {
      warnings.value.push(
        'Basis period is not standard 12 months. This might be due to: 1) New Company - 1st set of accounts, 2) Company changed its financial year end. Check "Override standard period restrictions" if this is intentional.'
      );
    }
  }
};

// Watch for date changes to trigger validation
watch(
  [accountingStartDate, accountingEndDate, basicStartDate, basicEndDate, overrideRestrictions],
  validateDates,
);

// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};

// Handle step shown
const handleStepShown = (data: { stepIndex: number; step: any }) => {
  emit('step-shown', data);
};

// Handle period selection completion
const handlePeriodSelection = async () => {
  if (!canProceed.value || props.disabled || isConfirmed.value) return;

  isLoading.value = true;

  try {
    const periodData: AccountingPeriodData = {
      accountingPeriod: {
        startDate: accountingStartDate.value!.format('YYYY-MM-DD'),
        endDate: accountingEndDate.value!.format('YYYY-MM-DD'),
      },
      basicPeriod: {
        startDate: basicStartDate.value!.format('YYYY-MM-DD'),
        endDate: basicEndDate.value!.format('YYYY-MM-DD'),
      },
    };

    isConfirmed.value = true;
    emit('step-loaded');
    emit('period-selected', periodData);
    emit('step-complete', periodData);
  } finally {
    isLoading.value = false;
  }
};

// Preset date ranges
const setCurrentFinancialYear = () => {
  if (props.disabled || isConfirmed.value) return;

  const now = dayjs();
  const currentYear = now.year();

  // Malaysian financial year typically runs from January to December
  accountingStartDate.value = dayjs(`${currentYear}-01-01`);
  accountingEndDate.value = dayjs(`${currentYear}-12-31`);
  basicStartDate.value = dayjs(`${currentYear}-01-01`);
  basicEndDate.value = dayjs(`${currentYear}-12-31`);
  emit('step-loaded');
};

const setPreviousFinancialYear = () => {
  if (props.disabled || isConfirmed.value) return;

  const now = dayjs();
  const previousYear = now.year() - 1;

  accountingStartDate.value = dayjs(`${previousYear}-01-01`);
  accountingEndDate.value = dayjs(`${previousYear}-12-31`);
  basicStartDate.value = dayjs(`${previousYear}-01-01`);
  basicEndDate.value = dayjs(`${previousYear}-12-31`);
};

// Disable future dates
const disabledDate = (current: Dayjs) => {
  return current && current.isAfter(dayjs().endOf('day'));
};
</script>

<template>
  <div class="workflow-accounting-period relative">
    <!-- Step-specific timeline -->
    <SharedTimeline
      v-if="showTimeline"
      title="Accounting Period Selection Timeline"
      color-theme="orange"
      :steps="timelineSteps"
      :config="timelineConfig"
      @completed="handleTimelineCompleted"
      @step-shown="handleStepShown"
      class="mb-6"
    />

    <div v-if="timelineCompleted" class="space-y-6">
      <!-- Quick Preset Buttons Section -->
      <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Text class="text-xs font-semibold uppercase tracking-wider">
          Quick Selection
        </Text>
        <Space>
          <Button
            type="default"
            :disabled="props.disabled || isConfirmed"
            @click="setCurrentFinancialYear"
            class="transition-all hover:shadow-md"
          >
            Current Year ({{ new Date().getFullYear() }})
          </Button>
          <Button
            type="default"
            :disabled="props.disabled || isConfirmed"
            @click="setPreviousFinancialYear"
            class="transition-all hover:shadow-md"
          >
            Previous Year ({{ new Date().getFullYear() - 1 }})
          </Button>
        </Space>
      </div>

      <!-- Override Restrictions Checkbox -->
      <div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div class="flex items-start gap-3">
          <Checkbox
            v-model:checked="overrideRestrictions"
            :disabled="props.disabled || isConfirmed"
            class="mt-1"
          />
          <div class="flex-1">
            <Text class="font-medium text-orange-800">
              Override standard period restrictions
            </Text>
            <div class="mt-1 text-sm text-orange-700">
              Check this if your accounting/basis period is not standard 12 months due to:
              <ul class="mt-1 ml-4 list-disc">
                <li>New Company - 1st set of accounts</li>
                <li>Company changed its financial year end</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Periods Container -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Accounting Period Card -->
        <Card
          class="rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="rounded-lg p-2">
                  <ClockCircleOutlined
                    class="text-2xl"
                    style="color: var(--ant-primary-color)"
                  />
                </div>
                <div>
                  <Title :level="5" class="!mb-0">Accounting Period</Title>
                  <Text type="secondary" class="text-sm"
                    >Financial year for tax filing</Text
                  >
                </div>
              </div>
              <Badge
                v-if="isAccountingPeriodValid"
                status="success"
                text="Valid"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Text class="text-sm font-medium">Start Date</Text>
                <DatePicker
                  v-model:value="accountingStartDate"
                  class="w-full"
                  placeholder="Select start date"
                  :disabled-date="disabledDate"
                  :disabled="props.disabled || isConfirmed"
                  format="DD/MM/YYYY"
                  size="large"
                />
              </div>
              <div class="space-y-2">
                <Text class="text-sm font-medium">End Date</Text>
                <DatePicker
                  v-model:value="accountingEndDate"
                  class="w-full"
                  placeholder="Select end date"
                  :disabled-date="disabledDate"
                  :disabled="props.disabled || isConfirmed"
                  format="DD/MM/YYYY"
                  size="large"
                />
              </div>
            </div>

            <div
              v-if="
                accountingStartDate &&
                accountingEndDate &&
                isAccountingPeriodValid
              "
              class="flex flex-wrap items-center gap-2 rounded-lg border p-3"
            >
              <CheckCircleOutlined style="color: var(--ant-success-color)" />
              <Text class="text-sm font-medium">
                {{ accountingStartDate.format('DD/MM/YYYY') }} to
                {{ accountingEndDate.format('DD/MM/YYYY') }}
              </Text>
              <Tag color="processing">
                {{ accountingEndDate.diff(accountingStartDate, 'days') + 1 }}
                days
              </Tag>
            </div>
          </div>
        </Card>

        <!-- Basis Period Card -->
        <Card
          class="rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-lg"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="rounded-lg p-2">
                  <CalendarOutlined
                    class="text-2xl"
                    style="color: var(--ant-primary-color)"
                  />
                </div>
                <div>
                  <Title :level="5" class="!mb-0">Basis Period</Title>
                  <Text type="secondary" class="text-sm"
                    >Tax computation period</Text
                  >
                </div>
              </div>
              <Badge v-if="isBasicPeriodValid" status="success" text="Valid" />
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Text class="text-sm font-medium">Start Date</Text>
                <DatePicker
                  v-model:value="basicStartDate"
                  class="w-full"
                  placeholder="Select start date"
                  :disabled-date="disabledDate"
                  :disabled="props.disabled || isConfirmed"
                  format="DD/MM/YYYY"
                  size="large"
                />
              </div>
              <div class="space-y-2">
                <Text class="text-sm font-medium">End Date</Text>
                <DatePicker
                  v-model:value="basicEndDate"
                  class="w-full"
                  placeholder="Select end date"
                  :disabled-date="disabledDate"
                  :disabled="props.disabled || isConfirmed"
                  format="DD/MM/YYYY"
                  size="large"
                />
              </div>
            </div>

            <div
              v-if="basicStartDate && basicEndDate && isBasicPeriodValid"
              class="flex flex-wrap items-center gap-2 rounded-lg border p-3"
            >
              <CheckCircleOutlined style="color: var(--ant-success-color)" />
              <Text class="text-sm font-medium">
                {{ basicStartDate.format('DD/MM/YYYY') }} to
                {{ basicEndDate.format('DD/MM/YYYY') }}
              </Text>
              <Tag color="success">
                {{ basicEndDate.diff(basicStartDate, 'days') + 1 }} days
              </Tag>
            </div>
          </div>
        </Card>
      </div>

      <!-- Guidelines Alert -->
      <Alert type="info" show-icon>
        <template #icon>
          <InfoCircleOutlined />
        </template>
        <template #message>
          <span class="font-medium">Period Selection Guidelines</span>
        </template>
        <template #description>
          <div class="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="flex items-start gap-2">
              <CalendarOutlined
                class="text-sm"
                style="color: var(--ant-primary-color)"
              />
              <Text type="secondary" class="text-sm">
                Accounting period is the financial year for tax filing
              </Text>
            </div>
            <div class="flex items-start gap-2">
              <CalendarTwoTone class="text-sm" />
              <Text type="secondary" class="text-sm">
                Basis period is typically same as accounting period
              </Text>
            </div>
            <div class="flex items-start gap-2">
              <ClockCircleOutlined
                class="text-sm"
                style="color: var(--ant-primary-color)"
              />
              <Text type="secondary" class="text-sm">
                Standard periods are typically 12 months
              </Text>
            </div>
            <div class="flex items-start gap-2">
              <CheckCircleOutlined
                class="text-sm"
                style="color: var(--ant-success-color)"
              />
              <Text type="secondary" class="text-sm">
                End date must be after start date
              </Text>
            </div>
          </div>
        </template>
      </Alert>

      <!-- Validation Errors -->
      <div v-if="errors.length > 0" class="space-y-2">
        <Alert
          v-for="error in errors"
          :key="error"
          type="error"
          :message="error"
          show-icon
        />
      </div>

      <!-- Validation Warnings -->
      <div v-if="warnings.length > 0" class="space-y-2">
        <Alert
          v-for="warning in warnings"
          :key="warning"
          type="warning"
          :message="warning"
          show-icon
        />
      </div>

      <!-- Action Button -->
      <div class="flex justify-end">
        <Button
          :type="isConfirmed ? 'default' : 'primary'"
          size="large"
          :disabled="!canProceed || props.disabled || isConfirmed"
          :loading="isLoading"
          @click="handlePeriodSelection"
          class="px-8"
        >
          <template #icon>
            <CheckCircleOutlined />
          </template>
          {{
            isConfirmed
              ? 'Period Selection Confirmed'
              : 'Confirm Period Selection'
          }}
        </Button>
      </div>
    </div>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />
  </div>
</template>

<style scoped></style>
