<script setup lang="ts">
import type { ToolbarType } from './types';

import { preferences, usePreferences } from '@vben/preferences';

import { Copyright } from '../basic/copyright';
import AuthenticationFormView from './form.vue';
import Toolbar from './toolbar.vue';

interface Props {
  appName?: string;
  logo?: string;
  pageTitle?: string;
  pageDescription?: string;
  sloganImage?: string;
  toolbar?: boolean;
  copyright?: boolean;
  toolbarList?: ToolbarType[];
  clickLogo?: () => void;
}

withDefaults(defineProps<Props>(), {
  appName: 'ibizztax.ai',
  copyright: true,
  logo: '',
  pageDescription:
    'Streamline your tax processes with AI-powered insights and comprehensive management tools',
  pageTitle: 'AI Tax Assistant & Management System',
  sloganImage: '',
  toolbar: true,
  toolbarList: () => ['color', 'language', 'layout', 'theme'],
  clickLogo: () => {},
});

const { authPanelCenter, authPanelLeft, authPanelRight, isDark } =
  usePreferences();
</script>

<template>
  <div
    :class="[isDark ? 'dark' : '']"
    class="flex min-h-full flex-1 select-none overflow-x-hidden"
  >
    <template v-if="toolbar">
      <slot name="toolbar">
        <Toolbar :toolbar-list="toolbarList" />
      </slot>
    </template>
    <!-- 左侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelLeft"
      class="min-h-full w-2/5 flex-1"
      transition-name="slide-left"
    >
      <template v-if="copyright" #copyright>
        <slot name="copyright">
          <Copyright
            v-if="preferences.copyright.enable"
            v-bind="preferences.copyright"
          />
        </slot>
      </template>
    </AuthenticationFormView>

    <!-- 头部 Logo 和应用名称 -->
    <div
      v-if="logo || appName"
      class="absolute left-0 top-0 z-10 flex flex-1"
      @click="clickLogo"
    >
      <div
        class="text-foreground lg:text-foreground ml-4 mt-4 flex flex-1 items-center sm:left-6 sm:top-6"
      >
        <!-- Minimalist icon if no logo provided -->
        <div
          v-if="!logo"
          class="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <svg
            class="h-5 w-5 text-slate-700 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <img v-else :alt="appName" :src="logo" class="mr-2" width="180" />
      </div>
    </div>

    <!-- 系统介绍 -->
    <div v-if="!authPanelCenter" class="relative hidden w-0 flex-1 lg:block">
      <div
        class="bg-background-deep absolute inset-0 h-full w-full dark:bg-[#070709]"
      >
        <div class="login-background absolute left-0 top-0 size-full"></div>
        <div class="flex-col-center -enter-x mr-20 h-full">
          <template v-if="sloganImage">
            <img
              :alt="appName"
              :src="sloganImage"
              class="animate-float h-64 w-2/5"
            />
          </template>
          <div v-else class="flex h-64 w-2/5 items-center justify-center">
            <!-- Modern minimalist illustration -->
            <div class="relative">
              <!-- Main container -->
              <div
                class="relative flex h-40 w-40 items-center justify-center rounded-2xl bg-slate-50 shadow-lg dark:bg-slate-800/50"
              >
                <!-- Document stack representation -->
                <div class="relative">
                  <!-- Background documents -->
                  <div
                    class="absolute -left-2 -top-2 h-16 w-12 rounded-lg bg-slate-200 opacity-60 dark:bg-slate-700"
                  ></div>
                  <div
                    class="absolute -left-1 -top-1 h-16 w-12 rounded-lg bg-slate-300 opacity-80 dark:bg-slate-600"
                  ></div>
                  <!-- Main document -->
                  <div
                    class="relative h-16 w-12 rounded-lg border border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700"
                  >
                    <!-- Document lines -->
                    <div class="mt-2 space-y-1 px-2">
                      <div
                        class="h-1 w-6 rounded bg-slate-400 dark:bg-slate-500"
                      ></div>
                      <div
                        class="h-1 w-4 rounded bg-slate-300 dark:bg-slate-600"
                      ></div>
                      <div
                        class="h-1 w-5 rounded bg-slate-300 dark:bg-slate-600"
                      ></div>
                    </div>
                  </div>
                  <!-- Checkmark overlay -->
                  <div
                    class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-sm"
                  >
                    <svg
                      class="h-3 w-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <!-- Subtle floating elements -->
              <div
                class="absolute -right-2 -top-2 h-2 w-2 rounded-full bg-slate-300 opacity-50 dark:bg-slate-600"
              ></div>
              <div
                class="absolute -bottom-3 -left-3 h-1.5 w-1.5 rounded-full bg-slate-400 opacity-60 dark:bg-slate-500"
              ></div>
            </div>
          </div>
          <div
            class="mt-8 text-2xl font-semibold text-slate-900 lg:text-3xl dark:text-slate-100"
          >
            {{ pageTitle }}
          </div>
          <div
            class="mt-4 max-w-lg text-center leading-relaxed text-slate-600 dark:text-slate-400"
          >
            {{ pageDescription }}
          </div>
          <!-- Key features -->
          <div class="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div
              class="flex flex-col items-center rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30"
            >
              <div
                class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700"
              >
                <svg
                  class="h-5 w-5 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3
                class="mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                AI-Powered
              </h3>
              <p class="text-center text-xs text-slate-500 dark:text-slate-400">
                Intelligent automation for complex tax calculations
              </p>
            </div>
            <div
              class="flex flex-col items-center rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30"
            >
              <div
                class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700"
              >
                <svg
                  class="h-5 w-5 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3
                class="mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                Secure
              </h3>
              <p class="text-center text-xs text-slate-500 dark:text-slate-400">
                Bank-level security for sensitive financial data
              </p>
            </div>
            <div
              class="flex flex-col items-center rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/30"
            >
              <div
                class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700"
              >
                <svg
                  class="h-5 w-5 text-slate-600 dark:text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3
                class="mb-1 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                Analytics
              </h3>
              <p class="text-center text-xs text-slate-500 dark:text-slate-400">
                Comprehensive insights and reporting tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 中心认证面板 -->
    <div v-if="authPanelCenter" class="flex-center relative w-full">
      <div class="login-background absolute left-0 top-0 size-full"></div>
      <AuthenticationFormView
        class="md:bg-background shadow-primary/5 shadow-float w-full rounded-3xl pb-20 md:w-2/3 lg:w-1/2 xl:w-[36%]"
      >
        <template v-if="copyright" #copyright>
          <slot name="copyright">
            <Copyright
              v-if="preferences.copyright.enable"
              v-bind="preferences.copyright"
            />
          </slot>
        </template>
      </AuthenticationFormView>
    </div>

    <!-- 右侧认证面板 -->
    <AuthenticationFormView
      v-if="authPanelRight"
      class="min-h-full w-[34%] flex-1"
    >
      <template v-if="copyright" #copyright>
        <slot name="copyright">
          <Copyright
            v-if="preferences.copyright.enable"
            v-bind="preferences.copyright"
          />
        </slot>
      </template>
    </AuthenticationFormView>
  </div>
</template>

<style scoped>
.login-background {
  background: linear-gradient(
    135deg,
    rgb(148 163 184 / 3%) 0%,
    rgb(71 85 105 / 5%) 50%,
    rgb(148 163 184 / 3%) 100%
  );
  filter: blur(80px);
}

.dark {
  .login-background {
    background: linear-gradient(
      135deg,
      rgb(51 65 85 / 8%) 0%,
      rgb(30 41 59 / 12%) 50%,
      rgb(51 65 85 / 8%) 100%
    );
    filter: blur(80px);
  }
}

/* Minimal modern styling */
.shadow-float {
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 10%),
    0 10px 10px -5px rgb(0 0 0 / 4%);
}

.dark .shadow-float {
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 25%),
    0 10px 10px -5px rgb(0 0 0 / 10%);
}

/* Subtle hover effects for feature cards */
.feature-card {
  transition: all 0.2s ease-in-out;
}

.feature-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  transform: translateY(-1px);
}

.dark .feature-card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
}
</style>
