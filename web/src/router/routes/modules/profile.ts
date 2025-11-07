import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'ProfileRoot',
    path: '/profile',
    component: () => import('#/views/system/profile/index.vue'),
    meta: {
      icon: 'lucide:user-round-pen',
      title: 'My Profile',
      requiresAuth: true,
    },
  },
];

export default routes;
