import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/cp204',
    name: 'CP204',
    component: () => import('#/views/system/form_c/CP204FormLayout.vue'),
    meta: {
      title: 'CP204',
      icon: 'lucide:file-text',
      requiresAuth: true,
    },
  },
];

export default routes;
