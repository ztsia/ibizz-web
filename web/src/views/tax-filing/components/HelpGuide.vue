<template>
  <div class="bg-card rounded-lg border p-6 shadow-sm">

    <!-- Available Commands -->
    <div class="mb-6">
      <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
        <CodeOutlined class="" />
        Available Commands
      </h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="command in slashCommands"
          :key="command.command"
          class="flex items-center gap-3 rounded-lg border p-3 transition-colors"
        >
          <div class="flex h-8 w-8 items-center justify-center rounded-full">
            <component :is="command.icon" class="text-sm" />
          </div>
          <div class="flex-1">
            <div class="mb-1 font-mono text-sm font-semibold">
              {{ command.command }}
            </div>
            <div class="text-xs">
              {{ command.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- What You Can Do -->
    <div class="mb-6">
      <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
        <BulbOutlined class="" />
        What You Can Do
      </h3>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-lg border p-4">
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
            >
              1
            </div>
            <div class="font-semibold text-gray-800">Ask Natural Questions</div>
          </div>
          <div class="text-sm">
            Get help with tax filing, document requirements, or process steps
            using natural language
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
            >
              2
            </div>
            <div class="font-semibold text-gray-800">
              Start Multi-Agent Workflow
            </div>
          </div>
          <div class="text-sm">
            Begin the automated tax filing process with AI assistance from
            multiple specialized agents
          </div>
        </div>

        <div class="rounded-lg border p-4">
          <div class="mb-2 flex items-center gap-2">
            <div
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
            >
              3
            </div>
            <div class="font-semibold text-gray-800">Use Slash Commands</div>
          </div>
          <div class="text-sm">
            Type / to see available commands for quick actions and instant
            responses
          </div>
        </div>
      </div>
    </div>

    <!-- AI Features -->
    <div class="mb-6">
      <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
        <RobotOutlined class="" />
        AI Assistant Features
      </h3>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div class="rounded-lg border p-3">
          <div class="mb-2 flex items-center gap-2">
            <ExperimentOutlined class="" />
            <span class="font-semibold text-gray-800"
              >Smart Context Understanding</span
            >
          </div>
          <p class="text-sm">
            AI remembers conversation context and provides relevant responses
            based on your current workflow step.
          </p>
        </div>

        <div class="rounded-lg border p-3">
          <div class="mb-2 flex items-center gap-2">
            <TeamOutlined class="" />
            <span class="font-semibold text-gray-800"
              >Multi-Agent Collaboration</span
            >
          </div>
          <p class="text-sm">
            Specialized AI agents work together to handle different aspects of
            tax filing efficiently.
          </p>
        </div>
      </div>
    </div>

    <!-- Tips & Best Practices -->
    <div class="rounded-lg border p-4">
      <h4 class="mb-3 flex items-center gap-2 font-semibold">
        <BulbOutlined class="" />
        Tips & Best Practices
      </h4>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 rounded-full p-1">
            <CheckOutlined class="text-xs" />
          </div>
          <div class="text-sm">
            <span class="font-medium">Natural Language:</span> Type your
            questions naturally - the AI understands context and conversational
            language
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="mt-0.5 rounded-full p-1">
            <CheckOutlined class="text-xs" />
          </div>
          <div class="text-sm">
            <span class="font-medium">Slash Commands:</span> Use "/" for quick
            actions and instant access to specific functions
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="mt-0.5 rounded-full p-1">
            <CheckOutlined class="text-xs" />
          </div>
          <div class="text-sm">
            <span class="font-medium">Step-by-Step Guidance:</span> The AI will
            guide you through each step and explain the process clearly
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="mt-0.5 rounded-full p-1">
            <CheckOutlined class="text-xs" />
          </div>
          <div class="text-sm">
            <span class="font-medium">Ask for Help:</span> Don't hesitate to ask
            for clarification or additional information at any time
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  QuestionCircleOutlined,
  ThunderboltOutlined,
  ClearOutlined,
  ClusterOutlined,
  CodeOutlined,
  BulbOutlined,
  RobotOutlined,
  ExperimentOutlined,
  TeamOutlined,
  CheckOutlined,
} from '@ant-design/icons-vue';

defineEmits<{
  action: [actionType: string];
}>();

const slashCommands = [
  {
    command: '/start',
    description: 'Initialize multi-agent tax filing workflow',
    icon: ThunderboltOutlined,
  },
  {
    command: '/clear',
    description: 'Reset conversation and clear all data',
    icon: ClearOutlined,
  },
  {
    command: '/restart',
    description: 'Restart workflow and reset all agents',
    icon: ClusterOutlined,
  },
  {
    command: '/help',
    description: 'Display comprehensive assistance guide',
    icon: QuestionCircleOutlined,
  },
];
</script>
