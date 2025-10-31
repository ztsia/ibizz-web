import type {
  RouteRecordRaw,
  RouteLocationNormalized,
  NavigationGuardNext,
} from 'vue-router';

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
    redirect: '/settings',
    meta: { title: 'Settings' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('#/views/system/lookup/pages/SettingsPage.vue'),
    meta: { title: 'Settings' },
  },
  {
    path: '/settings/:category/:group?',
    name: 'SettingsCategory',
    component: () => import('#/views/system/lookup/pages/CategoryPage.vue'),
    meta: { title: 'Settings Category' },
    beforeEnter: (
      to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext,
    ) => {
      // Special case: profile category uses blank page
      if (to.params.category === 'profile') {
        return next({ name: 'SettingsProfile' });
      }
      next();
    },
  },
  {
    path: '/settings/profile',
    name: 'SettingsProfile',
    component: () => import('#/views/system/lookup/pages/ProfilePage.vue'),
    meta: { title: 'Settings Profile' },
  },
];

export default routes;
