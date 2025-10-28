<template>
  <div class="space-y-6">
    <!-- Basic Information -->
    <div class="space-y-6">
      <div>
        <label class="text-foreground mb-3 block text-sm font-semibold">
          Agent Name
        </label>
        <input
          :value="agentForm.name"
          @input="
            $emit('update:agentForm', {
              ...agentForm,
              name: $event.target.value,
            })
          "
          type="text"
          placeholder="Enter agent name"
          class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary w-full rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
        />
      </div>
      <div>
        <label class="text-foreground mb-3 block text-sm font-semibold">
          Description
        </label>
        <textarea
          :value="agentForm.description"
          @input="
            $emit('update:agentForm', {
              ...agentForm,
              description: $event.target.value,
            })
          "
          placeholder="Describe the agent's purpose and capabilities"
          rows="4"
          class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary w-full resize-none rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
        ></textarea>
      </div>
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="text-foreground mb-3 block text-sm font-semibold">
            Type
          </label>
          <select
            :value="agentForm.type"
            @change="
              $emit('update:agentForm', {
                ...agentForm,
                type: $event.target.value,
              })
            "
            class="bg-card border-foreground/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
          >
            <option value="tax-advisor">Tax Advisor</option>
            <option value="document-analyzer">Document Analyzer</option>
            <option value="compliance-checker">Compliance Checker</option>
            <option value="general-assistant">General Assistant</option>
          </select>
        </div>
        <div>
          <label class="text-foreground mb-3 block text-sm font-semibold">
            Status
          </label>
          <select
            :value="agentForm.status"
            @change="
              $emit('update:agentForm', {
                ...agentForm,
                status: $event.target.value,
              })
            "
            class="bg-card border-foreground/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Rules Section -->
    <div>
      <div class="mb-4 flex items-center justify-between">
        <label class="text-foreground block text-sm font-semibold">
          Rules
        </label>
        <button
          @click="$emit('addRule')"
          class="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
        >
          + Add Rule
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(rule, index) in agentForm.rules"
          :key="index"
          class="flex items-center gap-4"
        >
          <input
            :value="rule"
            @input="updateRule(index, $event.target.value)"
            type="text"
            placeholder="Enter rule"
            class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary flex-1 rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
          />
          <button
            @click="$emit('removeRule', index)"
            class="rounded-xl p-3 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Guidelines Section -->
    <div>
      <div class="mb-4 flex items-center justify-between">
        <label class="text-foreground block text-sm font-semibold">
          Guidelines
        </label>
        <button
          @click="$emit('addGuideline')"
          class="text-primary hover:text-primary/80 hover:bg-primary/5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
        >
          + Add Guideline
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(guideline, index) in agentForm.guidelines"
          :key="index"
          class="flex items-center gap-4"
        >
          <input
            :value="guideline"
            @input="updateGuideline(index, $event.target.value)"
            type="text"
            placeholder="Enter guideline"
            class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary flex-1 rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
          />
          <button
            @click="$emit('removeGuideline', index)"
            class="rounded-xl p-3 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- System Prompt -->
    <div>
      <label class="text-foreground mb-3 block text-sm font-semibold">
        System Prompt
      </label>
      <textarea
        :value="agentForm.systemPrompt"
        @input="
          $emit('update:agentForm', {
            ...agentForm,
            systemPrompt: $event.target.value,
          })
        "
        placeholder="Enter the system prompt that defines the agent's behavior"
        rows="5"
        class="bg-card border-foreground/20 text-foreground placeholder-foreground/50 focus:border-primary w-full resize-none rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import type { Agent } from '#/api/configuration/agents';

interface AgentForm {
  name: string;
  description: string;
  type: Agent['type'];
  status: Agent['status'];
  rules: string[];
  guidelines: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface Props {
  agentForm: AgentForm;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:agentForm': [form: AgentForm];
  addRule: [];
  removeRule: [index: number];
  addGuideline: [];
  removeGuideline: [index: number];
}>();

const updateRule = (index: number, value: string) => {
  const newRules = [...props.agentForm.rules];
  newRules[index] = value;
  emit('update:agentForm', { ...props.agentForm, rules: newRules });
};

const updateGuideline = (index: number, value: string) => {
  const newGuidelines = [...props.agentForm.guidelines];
  newGuidelines[index] = value;
  emit('update:agentForm', { ...props.agentForm, guidelines: newGuidelines });
};
</script>
