<template>
  <div class="bg-card min-h-screen p-8">
    <!-- Header Section -->
    <div class="mb-12">
      <div class="mb-8 flex items-center gap-6">
        <div class="bg-primary/10 rounded-2xl p-4">
          <Bot class="text-primary h-8 w-8" />
        </div>
        <div>
          <h1 class="text-primary text-4xl font-bold tracking-tight">
            Agent Configuration
          </h1>
          <p class="text-foreground/60 mt-2 text-lg">
            Manage and monitor your AI agents
          </p>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          class="bg-card border-foreground/5 hover:border-foreground/10 rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-green-50 p-3">
              <Bot class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-foreground/60 text-sm font-medium">
                Active Agents
              </p>
              <p class="text-foreground text-2xl font-bold">
                {{ agents.filter((a) => a.status === 'active').length }}
              </p>
            </div>
          </div>
        </div>
        <div
          class="bg-card border-foreground/5 hover:border-foreground/10 rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-blue-50 p-3">
              <FileText class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-foreground/60 text-sm font-medium">Total Rules</p>
              <p class="text-foreground text-2xl font-bold">
                {{ agents.reduce((sum, a) => sum + a.rules.length, 0) }}
              </p>
            </div>
          </div>
        </div>
        <div
          class="bg-card border-foreground/5 hover:border-foreground/10 rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-purple-50 p-3">
              <BookOpen class="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p class="text-foreground/60 text-sm font-medium">Guidelines</p>
              <p class="text-foreground text-2xl font-bold">
                {{ agents.reduce((sum, a) => sum + a.guidelines.length, 0) }}
              </p>
            </div>
          </div>
        </div>
        <div
          class="bg-card border-foreground/5 hover:border-foreground/10 rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg"
        >
          <div class="flex items-center gap-4">
            <div class="rounded-xl bg-orange-50 p-3">
              <Zap class="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p class="text-foreground/60 text-sm font-medium">Performance</p>
              <p class="text-foreground text-2xl font-bold">94%</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-card border-foreground/5 mb-8 rounded-2xl border p-8">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div class="flex-1">
          <div class="relative">
            <Search
              class="text-foreground/40 absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search agents by name, type, or capabilities..."
              class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary w-full rounded-xl border py-4 pl-12 pr-4 text-sm transition-colors focus:ring-0"
            />
          </div>
        </div>
        <div class="flex gap-4">
          <select
            v-model="filterType"
            class="bg-card border-foreground/20 text-foreground focus:border-primary min-w-[160px] rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
          >
            <option value="">All Types</option>
            <option value="tax-advisor">Tax Advisor</option>
            <option value="document-analyzer">Document Analyzer</option>
            <option value="compliance-checker">Compliance Checker</option>
            <option value="general-assistant">General Assistant</option>
          </select>
          <select
            v-model="filterStatus"
            class="bg-card border-foreground/20 text-foreground focus:border-primary min-w-[140px] rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div
        class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"
      ></div>
    </div>

    <!-- Agents Grid -->
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="agent in filteredAgents"
        :key="agent.id"
        class="bg-card border-foreground/5 hover:border-foreground/10 group rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl"
      >
        <!-- Agent Card Header -->
        <div class="space-y-5">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="bg-primary/10 rounded-xl p-3">
                <Bot class="text-primary h-5 w-5" />
              </div>
              <div>
                <h3 class="text-primary text-lg font-semibold">
                  {{ agent.name }}
                </h3>
                <p class="text-foreground/60 text-sm font-medium">
                  {{ getTypeLabel(agent.type) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span
                :class="getStatusClass(agent.status)"
                class="rounded-full px-3 py-1.5 text-xs font-semibold"
              >
                {{
                  agent.status.charAt(0).toUpperCase() + agent.status.slice(1)
                }}
              </span>
              <div class="relative">
                <button
                  @click="toggleDropdown(agent.id)"
                  class="hover:bg-foreground/5 rounded-xl p-2 transition-colors"
                >
                  <MoreVertical class="text-foreground/60 h-4 w-4" />
                </button>
                <div
                  v-if="activeDropdown === agent.id"
                  class="bg-card border-foreground/10 absolute right-0 z-20 mt-2 w-40 rounded-xl border shadow-xl"
                >
                  <button
                    @click="editAgent(agent)"
                    class="text-foreground hover:bg-foreground/5 hover:text-primary flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-left text-sm transition-colors"
                  >
                    <Edit class="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    @click="testAgent(agent)"
                    class="text-foreground hover:bg-foreground/5 hover:text-primary flex w-full items-center gap-3 rounded-b-xl px-4 py-3 text-left text-sm transition-colors"
                  >
                    <Play class="h-4 w-4" />
                    Test
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p class="text-foreground/70 line-clamp-2 text-sm leading-relaxed">
            {{ agent.description }}
          </p>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-foreground/5 rounded-xl p-4">
              <div class="mb-2 flex items-center gap-2">
                <FileText class="h-4 w-4 text-blue-600" />
                <span class="text-foreground/60 text-xs font-medium"
                  >Rules</span
                >
              </div>
              <span class="text-foreground text-lg font-bold">{{
                agent.rules.length
              }}</span>
            </div>
            <div class="bg-foreground/5 rounded-xl p-4">
              <div class="mb-2 flex items-center gap-2">
                <BookOpen class="h-4 w-4 text-purple-600" />
                <span class="text-foreground/60 text-xs font-medium"
                  >Guidelines</span
                >
              </div>
              <span class="text-foreground text-lg font-bold">{{
                agent.guidelines.length
              }}</span>
            </div>
          </div>

          <!-- Model Info -->
          <div class="bg-foreground/5 space-y-3 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <span class="text-foreground/60 text-sm font-medium">Model</span>
              <span class="text-foreground text-sm font-semibold">{{
                agent.model
              }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-foreground/60 text-sm font-medium"
                >Temperature</span
              >
              <span class="text-foreground text-sm font-semibold">{{
                agent.temperature
              }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="text-foreground/50 border-foreground/10 border-t pt-3 text-xs"
          >
            Updated {{ formatDate(agent.updatedAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredAgents.length === 0"
      class="py-20 text-center"
    >
      <div class="bg-primary/10 mx-auto mb-6 h-20 w-20 rounded-2xl p-6">
        <Bot class="text-primary h-8 w-8" />
      </div>
      <h3 class="text-primary mb-3 text-xl font-semibold">No agents found</h3>
      <p class="text-foreground/60 mx-auto max-w-md text-base leading-relaxed">
        No agents match your current search criteria. Try adjusting your filters
        or search terms.
      </p>
    </div>

    <!-- Enhanced Agent Modal with VbenModal -->
    <AgentModal @cancel="closeAgentModal" @confirm="saveAgent">
      <template #title>
        <AgentModalHeader
          :selected-agent="selectedAgent"
          :is-edit-mode="isEditMode"
          :active-tab="activeTab"
          :chat-messages-count="chatMessages.length"
          @update:active-tab="activeTab = $event"
        />
      </template>

      <div class="space-y-6">
        <!-- Configuration Tab -->
        <AgentConfigurationTab
          v-if="activeTab === 'configuration'"
          :agent-form="agentForm"
          @update:agent-form="agentForm = $event"
          @add-rule="addRule"
          @remove-rule="removeRule"
          @add-guideline="addGuideline"
          @remove-guideline="removeGuideline"
        />

        <!-- Testing Tab -->
        <AgentTestingTab
          v-else-if="activeTab === 'testing'"
          ref="testingTabRef"
          :selected-agent="selectedAgent"
          :chat-messages="chatMessages"
          :current-message="currentMessage"
          :is-chat-loading="isChatLoading"
          :streaming-content="streamingContent"
          @update:current-message="currentMessage = $event"
          @send-message="sendTestMessage"
        />

        <!-- Settings Tab -->
        <AgentSettingsTab
          v-else-if="activeTab === 'settings'"
          :agent-form="agentForm"
          @update:agent-form="agentForm = $event"
        />

        <!-- Action Buttons -->
        <div class="border-foreground/10 flex justify-end gap-3 border-t pt-6">
          <button
            @click="closeAgentModal"
            class="bg-card border-foreground/20 text-foreground hover:bg-foreground/5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveAgent"
            class="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {{ isEditMode ? 'Update Agent' : 'Save Agent' }}
          </button>
        </div>
      </div>
    </AgentModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  Search,
  Bot,
  MoreVertical,
  Edit,
  Play,
  FileText,
  BookOpen,
} from 'lucide-vue-next';
import { message } from 'ant-design-vue';
import { useVbenModal } from '@vben/common-ui';
import type { Agent } from '#/api/configuration/agents';
import {
  getAgents,
  updateAgent,
  testAgent as testAgentApi,
} from '#/api/configuration/agents';

// Import modal components
import AgentModalHeader from './components/AgentModalHeader.vue';
import AgentConfigurationTab from './components/AgentConfigurationTab.vue';
import AgentTestingTab from './components/AgentTestingTab.vue';
import AgentSettingsTab from './components/AgentSettingsTab.vue';

// State
const loading = ref(false);
const agents = ref<Agent[]>([]);
const searchQuery = ref('');
const filterType = ref('');
const filterStatus = ref('');
const activeDropdown = ref<string | null>(null);
const selectedAgent = ref<Agent | null>(null);
const isEditMode = ref(false);
const activeTab = ref<'configuration' | 'testing' | 'settings'>(
  'configuration',
);

// Initialize VbenModal with proper hook
const [AgentModal, agentModalApi] = useVbenModal({
  width: 800,
});

// Agent form state
const agentForm = ref({
  name: '',
  description: '',
  type: 'general-assistant' as Agent['type'],
  status: 'draft' as Agent['status'],
  rules: [''],
  guidelines: [''],
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: '',
});

// Chat state for testing
const chatMessages = ref<
  Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>
>([]);
const currentMessage = ref('');
const isChatLoading = ref(false);
const streamingContent = ref('');
const testingTabRef = ref<InstanceType<typeof AgentTestingTab> | null>(null);

// Computed
const filteredAgents = computed(() => {
  // Ensure agents.value is always an array to prevent filter error
  const agentsList = agents.value || [];
  return agentsList.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesType = !filterType.value || agent.type === filterType.value;
    const matchesStatus =
      !filterStatus.value || agent.status === filterStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

// Methods
const loadAgents = async () => {
  try {
    loading.value = true;
    console.log('Loading agents...');
    const response = await getAgents();
    console.log('Agents response:', response);

    // Handle both direct array response and object with agents property
    if (Array.isArray(response)) {
      agents.value = response;
    } else if (response && Array.isArray(response.agents)) {
      agents.value = response.agents;
    } else {
      console.warn('Unexpected response format:', response);
      agents.value = [];
    }

    console.log('Loaded agents count:', agents.value.length);

    if (agents.value.length === 0) {
      console.warn('No agents found');
    }
  } catch (error) {
    message.error('Failed to load agents');
    console.error('Error loading agents:', error);
    // Set empty array on error to prevent filter issues
    agents.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleDropdown = (agentId: string) => {
  activeDropdown.value = activeDropdown.value === agentId ? null : agentId;
};

const editAgent = (agent: Agent) => {
  selectedAgent.value = agent;
  isEditMode.value = true;
  populateForm(agent);
  activeTab.value = 'configuration';
  agentModalApi.setState({ title: 'Edit Agent' });
  agentModalApi.open();
  activeDropdown.value = null;
};

const testAgent = (agent: Agent) => {
  selectedAgent.value = agent;
  isEditMode.value = true;
  populateForm(agent);
  activeTab.value = 'testing';
  agentModalApi.setState({ title: 'Test Agent' });
  agentModalApi.open();
  activeDropdown.value = null;
};

// Modal management

const closeAgentModal = async () => {
  // Reset all state
  selectedAgent.value = null;
  isEditMode.value = false;
  activeTab.value = 'configuration';
  chatMessages.value = [];
  currentMessage.value = '';
  isChatLoading.value = false;
  streamingContent.value = '';
  resetForm();

  // Close modal
  agentModalApi.close();

  await nextTick();
};

// Form management
const resetForm = () => {
  agentForm.value = {
    name: '',
    description: '',
    type: 'general-assistant',
    status: 'draft',
    rules: [''],
    guidelines: [''],
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: '',
  };
};

const populateForm = (agent: Agent) => {
  agentForm.value = {
    name: agent.name,
    description: agent.description,
    type: agent.type,
    status: agent.status,
    rules: agent.rules.length > 0 ? [...agent.rules] : [''],
    guidelines: agent.guidelines.length > 0 ? [...agent.guidelines] : [''],
    model: agent.model,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    systemPrompt: agent.systemPrompt,
  };
};

// Rules and guidelines management
const addRule = () => {
  agentForm.value.rules.push('');
};

const removeRule = (index: number) => {
  if (agentForm.value.rules.length > 1) {
    agentForm.value.rules.splice(index, 1);
  }
};

const addGuideline = () => {
  agentForm.value.guidelines.push('');
};

const removeGuideline = (index: number) => {
  if (agentForm.value.guidelines.length > 1) {
    agentForm.value.guidelines.splice(index, 1);
  }
};

// Save agent
const saveAgent = async () => {
  if (!isEditMode.value || !selectedAgent.value) return;

  try {
    // Filter out empty rules and guidelines
    const cleanedRules = agentForm.value.rules.filter(
      (rule) => rule.trim() !== '',
    );
    const cleanedGuidelines = agentForm.value.guidelines.filter(
      (guideline) => guideline.trim() !== '',
    );

    const agentData = {
      ...agentForm.value,
      rules: cleanedRules,
      guidelines: cleanedGuidelines,
    };

    await updateAgent(selectedAgent.value.id, agentData);
    message.success('Agent updated successfully');

    agentModalApi.close();
    loadAgents();
  } catch (error) {
    message.error('Failed to update agent');
    console.error('Error updating agent:', error);
  }
};

// Chat testing functionality
const sendTestMessage = async () => {
  if (!currentMessage.value.trim() || !selectedAgent.value) return;

  const userMessage = {
    id: Date.now().toString(),
    role: 'user' as const,
    content: currentMessage.value,
    timestamp: new Date(),
  };

  chatMessages.value.push(userMessage);
  const messageToSend = currentMessage.value;
  currentMessage.value = '';
  isChatLoading.value = true;
  streamingContent.value = '';

  try {
    const response = await testAgentApi(selectedAgent.value.id, messageToSend);

    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: response.response,
      timestamp: new Date(),
    };

    chatMessages.value.push(assistantMessage);

    // Scroll to bottom
    await nextTick();
    if (testingTabRef.value?.chatContainer) {
      testingTabRef.value.chatContainer.scrollTop =
        testingTabRef.value.chatContainer.scrollHeight;
    }
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content:
        "I apologize, but I'm having trouble responding right now. Please try again.",
      timestamp: new Date(),
    };
    chatMessages.value.push(errorMessage);
  } finally {
    isChatLoading.value = false;
    streamingContent.value = '';
  }
};

const getTypeLabel = (type: string) => {
  const labels = {
    'tax-advisor': 'Tax Advisor',
    'document-analyzer': 'Document Analyzer',
    'compliance-checker': 'Compliance Checker',
    'general-assistant': 'General Assistant',
  };
  return labels[type as keyof typeof labels] || type;
};

const getStatusClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-foreground/10 text-foreground/70',
    draft: 'bg-yellow-100 text-yellow-800',
  };
  return (
    classes[status as keyof typeof classes] ||
    'bg-foreground/10 text-foreground/70'
  );
};

const _getStatusDotClass = (status: string) => {
  const classes = {
    active: 'bg-green-500',
    inactive: 'bg-foreground/40',
    draft: 'bg-yellow-500',
  };
  return classes[status as keyof typeof classes] || 'bg-foreground/40';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

// Click outside to close dropdown
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.relative')) {
    activeDropdown.value = null;
  }
};

// Lifecycle
onMounted(() => {
  loadAgents();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
