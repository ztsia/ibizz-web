import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/tax-workspace/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:calculator',
          title: 'Tax Management',
        },
      },
    ],
  },
];

export default routes;
