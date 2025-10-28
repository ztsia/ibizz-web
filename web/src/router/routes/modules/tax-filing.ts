import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:calculator',
      order: 3,
      title: 'Tax Filing',
      ignoreAccess: true,
    },
    name: 'TaxFiling',
    path: '/tax-filing',
    redirect: '/tax-filing/list',
    children: [
      {
        name: 'AITaxFiling',
        path: '/tax-filing/ai-chat',
        component: () => import('#/views/tax-filing/ai-chat.vue'),
        meta: {
          icon: 'lucide:bot',
          title: 'AI Tax Filing',
          ignoreAccess: true,
        },
      },
    ],
  },
];

export default routes;
