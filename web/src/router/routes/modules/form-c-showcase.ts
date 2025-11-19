import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/form-c-showcase',
    name: 'FormCModalShowcase',
    component: () => import('#/views/system/form_c/ModalShowcase.vue'),
    meta: {
      title: 'Form C Modal Showcase',
      icon: 'lucide:box',
      requiresAuth: true,
    },
  },
];

export default routes;
