import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/form-c',
    name: 'FormC',
    component: () =>
      import('#/views/system/multi_page_form/MainFormLayout.vue'),
    meta: {
      title: 'Form C',
      icon: 'lucide:building-2',
      requiresAuth: true,
    },
  },
];

export default routes;
