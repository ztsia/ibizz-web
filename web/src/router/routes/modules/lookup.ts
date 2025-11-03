import type { RouteRecordRaw } from 'vue-router';

// Helper: convert slugs like "some-slug_name" -> "Some Slug Name"
export function humanizeSlug(slug?: string): string {
  if (!slug) return '';
  return String(slug)
    .replaceAll(/[-_]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/lookup',
    meta: { title: 'Lookup', hideInTab: true, hideInMenu: true },
  },
  {
    path: '/lookup',
    name: 'Lookup',
    component: () =>
      import('#/views/system/lookup/pages').then((m) => m.LookupMenu),
    meta: { title: 'Lookup', icon: 'lucide:folder-search' },
  },
  {
    path: '/lookup/:category',
    name: 'LookupCategory',
    component: () => import('#/views/system/lookup/pages/CategoryPage.vue'),
    meta: {
      title: 'Lookup',
      hideInTab: true,
      hideInMenu: true,
      activeMenu: 'Lookup',
    },
  },
  {
    path: '/lookup/:category/:group',
    name: 'LookupCategoryGroup',
    component: () => import('#/views/system/lookup/pages/CategoryPage.vue'),
    meta: {
      title: 'Lookup',
      hideInTab: true,
      hideInMenu: true,
      activeMenu: 'Lookup',
    },
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
