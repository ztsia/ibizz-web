import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:account-tie',
      order: 2,
      title: 'Client',
    },
    name: 'Client',
    path: '/client',
    children: [
      {
        path: '/client/list',
        name: 'ClientList',
        meta: {
          icon: 'mdi:account-multiple',
          title:'Client List',
        },
        component: () => import('#/views/client/list.vue'),
      },
    ],
  },
];

export default routes;
