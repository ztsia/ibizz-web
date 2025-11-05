import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/lookup',
    name: 'Lookup',
    component: () => import('#/views/system/lookup/LookupModule.vue'),
    meta: { title: 'Lookup', icon: 'lucide:folder-search' },
  },
];

export default routes;
