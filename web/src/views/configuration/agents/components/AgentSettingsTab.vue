<template>
  <div class="space-y-8">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <label class="text-foreground mb-3 block text-sm font-semibold">
          AI Model
        </label>
        <select
          :value="agentForm.model"
          @change="
            $emit('update:agentForm', {
              ...agentForm,
              model: $event.target.value,
            })
          "
          class="bg-card border-foreground/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3">Claude 3</option>
        </select>
      </div>
      <div>
        <label class="text-foreground mb-3 block text-sm font-semibold">
          Temperature: {{ agentForm.temperature }}
        </label>
        <input
          :value="agentForm.temperature"
          @input="updateTemperature($event.target.value)"
          type="range"
          min="0"
          max="1"
          step="0.1"
          class="accent-primary h-2 w-full rounded-full"
        />
        <div
          class="text-foreground/60 mt-3 flex justify-between text-sm font-medium"
        >
          <span>Focused</span>
          <span>Creative</span>
        </div>
      </div>
      <div>
        <label class="text-foreground mb-3 block text-sm font-semibold">
          Max Tokens
        </label>
        <input
          :value="agentForm.maxTokens"
          @input="updateMaxTokens($event.target.value)"
          type="number"
          min="100"
          max="4000"
          step="100"
          class="bg-card border-foreground/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-4 text-sm transition-colors focus:ring-0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
}>();

const updateTemperature = (value: string) => {
  const temperature = Number.parseFloat(value);
  emit('update:agentForm', { ...props.agentForm, temperature });
};

const updateMaxTokens = (value: string) => {
  const maxTokens = Number.parseInt(value, 10);
  emit('update:agentForm', { ...props.agentForm, maxTokens });
};
</script>
