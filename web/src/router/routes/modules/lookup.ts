import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/lookup',
    name: 'Lookup',
    component: () => import('#/views/system/lookup/LookupModule.vue'),
    meta: { title: 'Lookup', icon: 'lucide:folder-search' },
  },
  {
    path: '/profile',
    name: 'LookupProfile',
    component: () => import('#/views/system/lookup/pages/ProfilePage.vue'),
    meta: {
      title: 'Lookup Profile',
      hideInMenu: true,
      hideInTab: true,
    },
  },
];

export default routes;
