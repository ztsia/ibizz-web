<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaxFilingStore } from '#/store';
import { getEnhancedClientList } from '#/api/system/iBizzClient';
import type { EnhancedSystemClient } from '#/api/system/iBizzClient';

import {
  UserOutlined,
  BankOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons-vue';
import {
  Card,
  Button,
  Input,
  Avatar,
  Tag,
  Spin,
  Empty,
  message,
} from 'ant-design-vue';
import SharedTimeline from '../shared/SharedTimeline.vue';
import WorkflowDisabledOverlay from './shared/WorkflowDisabledOverlay.vue';
import type { TimelineStep, TimelineConfig } from '../../types';

interface Props {
  disabled?: boolean;
}

interface Emits {
  (e: 'client-selected', client: EnhancedSystemClient): void;
  (e: 'step-completed', data: any): void;
  (e: 'step-loaded'): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<Emits>();
const router = useRouter();
const taxFilingStore = useTaxFilingStore();

const clients = ref<EnhancedSystemClient[]>([]);
const filteredClients = ref<EnhancedSystemClient[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedClient = ref<EnhancedSystemClient | null>(null);
const showTimeline = ref(true);
const timelineCompleted = ref(false);

const timelineSteps: TimelineStep[] = [
  {
    id: 1,
    title: 'Client Selection Coordinator Assignment',
    description: 'Assigning client management and verification agents',
    details: [
      'Client Management Agent assigned',
      'Verification Agent activated',
    ],
  },
  {
    id: 2,
    title: 'Agent Deployment',
    description: 'Deploying client management and verification agents',
    details: [
      'Client Management Agent deployed',
      'Verification Agent synchronized',
    ],
    hasProgress: true,
    progressKey: 'deployment',
  },
  {
    id: 3,
    title: 'Client Database Access',
    description: 'Accessing client database and loading client list',
    details: [
      'Database connection established',
      'Client list loaded',
      'Search functionality enabled',
    ],
    hasProgress: true,
    progressKey: 'database',
  },
  {
    id: 4,
    title: 'Client Selection Ready',
    description: 'Client selection interface ready for use',
    details: ['All clients loaded successfully', 'Ready for client selection'],
  },
];

const timelineConfig: TimelineConfig = {
  stepTimings: [500, 1500, 3000, 4500],
  progressConfigs: {
    deployment: { increment: 15, interval: 150 },
    database: { increment: 8, interval: 300 },
  },
  autoCollapseDelay: 2000,
};

// Load clients on mount
onMounted(async () => {
  await loadClients();
});

// Load clients from API
const loadClients = async () => {
  loading.value = true;
  try {
    const response = await getEnhancedClientList({
      page: 1,
      pageSize: 100, // Load more clients for selection
    });
    clients.value = response.items || [];
    filteredClients.value = clients.value;
  } catch (error) {
    console.error('Failed to load clients:', error);
    message.error('Failed to load client list');
  } finally {
    loading.value = false;
  }
};

// Filter clients based on search query
const filterClients = () => {
  if (!searchQuery.value.trim()) {
    filteredClients.value = clients.value;
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredClients.value = clients.value.filter(
    (client) =>
      client.basicParticulars.companyName.toLowerCase().includes(query) ||
      client.basicParticulars.taxIdentificationNumber
        .toLowerCase()
        .includes(query) ||
      client.companyParticulars.contactDetails.email
        .toLowerCase()
        .includes(query),
  );
};

// Select a client
const selectClient = (client: EnhancedSystemClient) => {
  if (props.disabled || selectedClient.value) {
    return;
  }

  selectedClient.value = client;

  // Set client in store - pass the complete EnhancedSystemClient object
  taxFilingStore.setClientForTaxFiling(client);

  emit('client-selected', client);
  message.success(`Selected client: ${client.basicParticulars.companyName}`);
};

// Proceed to next step
const proceedToNextStep = () => {
  if (!selectedClient.value) {
    message.warning('Please select a client first');
    return;
  }

  emit('step-completed', {
    selectedClient: selectedClient.value,
    stepId: 'client-selection',
  });
};

// Navigate to client management
const navigateToClientManagement = () => {
  router.push('/client/list');
};
// Handle step shown
const handleStepShown = () => {
  emit('step-loaded');
};
// Handle timeline completion
const handleTimelineCompleted = () => {
  timelineCompleted.value = true;
  emit('step-loaded');
};
</script>

<template>
  <div class="workflow-client-selection relative">
    <!-- Step-Specific Timeline -->
    <div v-if="showTimeline" class="mb-6">
      <SharedTimeline
        title="Client Selection Timeline"
        color-theme="blue"
        :steps="timelineSteps"
        :config="timelineConfig"
        @completed="handleTimelineCompleted"
        @step-shown="handleStepShown"
      />
    </div>
    <div v-if="timelineCompleted">
      <!-- Header -->
      <div class="mb-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-full">
            <UserOutlined class="text-xl" />
          </div>
          <div>
            <h3 class="text-lg font-semibold">Client Selection</h3>
            <p class="text-sm">
              Select a client to start the tax filing workflow
            </p>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="flex gap-3">
          <Input
            v-model:value="searchQuery"
            placeholder="Search clients by name, company, or email..."
            size="large"
            class="flex-1"
            :disabled="props.disabled"
            @input="filterClients"
          >
            <template #prefix>
              <SearchOutlined class="" />
            </template>
          </Input>
          <Button
            size="large"
            :disabled="props.disabled"
            @click="navigateToClientManagement"
          >
            Manage Clients
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <Spin size="large" />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredClients.length === 0" class="py-12">
        <Empty
          description="No clients found"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <Button type="primary" @click="navigateToClientManagement">
            Add New Client
          </Button>
        </Empty>
      </div>

      <!-- Client List -->
      <div v-else class="max-h-[310px] space-y-3 overflow-y-auto">
        <div
          v-for="client in filteredClients"
          :key="client.id"
          :class="[
            'transition-all duration-200',
            props.disabled
              ? 'cursor-not-allowed opacity-50'
              : selectedClient && selectedClient.id !== client.id
                ? 'cursor-not-allowed opacity-60'
                : 'cursor-pointer hover:shadow-md',
          ]"
          @click="selectClient(client)"
        >
          <Card
            :class="[
              'border-2 transition-all duration-200',
              !props.disabled && 'hover:shadow-md',
            ]"
            size="small"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <Avatar
                  :size="48"
                  :style="{
                    backgroundColor:
                      selectedClient?.id === client.id ? '#1890ff' : '#f56a00',
                  }"
                >
                  <template #icon>
                    <UserOutlined />
                  </template>
                </Avatar>

                <!-- Client Info -->
                <div class="flex-1">
                  <div class="mb-1 flex items-center gap-2">
                    <h4 class="text-foreground font-medium">
                      {{ client.basicParticulars.companyName }}
                    </h4>
                    <Tag
                      :color="client.status === 'ACTIVE' ? 'green' : 'red'"
                      size="small"
                    >
                      {{ client.status }}
                    </Tag>
                  </div>

                  <div class="flex items-center gap-4 text-sm">
                    <div class="flex items-center gap-1">
                      <BankOutlined class="text-xs" />
                      <span>{{
                        client.basicParticulars.taxIdentificationNumber
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <MailOutlined class="text-xs" />
                      <span>{{
                        client.companyParticulars.contactDetails.email
                      }}</span>
                    </div>
                  </div>

                  <div class="mt-1 flex items-center gap-4 text-xs">
                    <div>Type: {{ client.basicParticulars.companyType }}</div>
                    <div>
                      MSIC: {{ client.companyParticulars.msicCode }} -
                      {{ client.companyParticulars.msicDescription }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selection Indicator -->
              <div v-if="selectedClient?.id === client.id">
                <CheckCircleOutlined class="text-xl" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        v-if="!loading && filteredClients.length > 0"
        class="mt-6 flex justify-end gap-3"
      >
        <Button
          size="large"
          :disabled="props.disabled"
          @click="navigateToClientManagement"
        >
          Manage Clients
        </Button>
        <Button
          type="primary"
          size="large"
          :disabled="!selectedClient || props.disabled"
          @click="proceedToNextStep"
        >
          Continue with Selected Client
        </Button>
      </div>
    </div>

    <!-- Disabled overlay -->
    <WorkflowDisabledOverlay :disabled="props.disabled" />
  </div>
</template>
