import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: 'Settings',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:account-multiple',
          title: $t('system.user.title'),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
    ],
  },
];

export default routes;
