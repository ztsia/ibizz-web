import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 4,
      title: 'Configuration',
    },
    name: 'Configuration',
    path: '/configuration',
    children: [
      {
        name: 'AgentConfiguration',
        path: '/configuration/agents',
        component: () => import('#/views/configuration/agents/index.vue'),
        meta: {
          icon: 'lucide:bot',
          title: 'Agent Configuration',
        },
      },
      {
        name: 'TaxRulesConfiguration',
        path: '/configuration/tax-rules',
        component: () => import('#/views/configuration/tax-rules/index.vue'),
        meta: {
          icon: 'lucide:book-open',
          title: 'Tax Rules Configuration',
        },
      },
    ],
  },
];

export default routes;
