import type { Router } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 生成AI聊天会话ID
 */
function generateSessionId(): string {
  return `ai-chat-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 处理AI聊天路由的会话ID
 */
function handleAIChatRoute(to: any) {
  const AI_CHAT_STORAGE_PREFIX = 'ai-chat-session-';
  const LAST_SESSION_KEY = 'ai-chat-last-session';

  // 检查是否是AI聊天路由
  if (to.name === 'AITaxFiling' || to.path === '/tax-filing/ai-chat') {
    // 如果没有sessionId查询参数，总是生成新的会话ID
    if (!to.query.sessionId) {
      // 生成新的会话ID
      const sessionId = generateSessionId();
      sessionStorage.setItem(LAST_SESSION_KEY, sessionId);

      // 初始化新会话的数据结构
      const sessionKey = AI_CHAT_STORAGE_PREFIX + sessionId;
      const initialSessionData = {
        sessionId,
        created: Date.now(),
        lastAccessed: Date.now(),
        chatHistory: [],
        userInput: '',
        workflowState: {
          workflowActive: false,
          currentWorkflowStep: 0,
          workflowSteps: [],
          selectedClient: null,
          selectedAccountingPeriod: null,
          uploadedFiles: [],
          extractedData: {},
          taxResults: {},
          messages: [],
          conversationHistory: [],
          isGenerating: false,
          isWorkflowStepProcessing: false,
          streamingText: '',
          sidebarCollapsed: false,
        },
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(initialSessionData));

      console.log(
        `[${new Date().toISOString()}] 🆕 Router: Initialized new session in sessionStorage:`,
        sessionId,
      );

      // 重定向到带会话ID查询参数的路径
      return {
        path: '/tax-filing/ai-chat',
        query: { sessionId },
        replace: true,
      };
    }

    // 如果查询参数中有会话ID，提取并存储
    if (to.query.sessionId) {
      const sessionId = to.query.sessionId as string;
      // 更新最后使用的会话ID
      sessionStorage.setItem(LAST_SESSION_KEY, sessionId);

      // 为这个特定会话创建存储键（用于存储会话数据）
      const sessionStorageKey = AI_CHAT_STORAGE_PREFIX + sessionId;

      // 检查会话是否存在，如果不存在则初始化
      if (sessionStorage.getItem(sessionStorageKey)) {
        // Update last accessed time for existing session
        try {
          const existingData = JSON.parse(
            sessionStorage.getItem(sessionStorageKey) || '{}',
          );
          existingData.lastAccessed = Date.now();
          sessionStorage.setItem(
            sessionStorageKey,
            JSON.stringify(existingData),
          );

          console.log(
            `[${new Date().toISOString()}] 🔄 Router: Updated last accessed time for session:`,
            sessionId,
          );
        } catch (error) {
          console.warn('Failed to update session last accessed time:', error);
        }
      } else {
        const initialSessionData = {
          sessionId,
          created: Date.now(),
          lastAccessed: Date.now(),
          chatHistory: [],
          userInput: '',
          workflowState: {
            workflowActive: false,
            currentWorkflowStep: 0,
            workflowSteps: [],
            selectedClient: null,
            selectedAccountingPeriod: null,
            uploadedFiles: [],
            extractedData: {},
            taxResults: {},
            messages: [],
            conversationHistory: [],
            isGenerating: false,
            isWorkflowStepProcessing: false,
            streamingText: '',
            sidebarCollapsed: false,
          },
        };
        sessionStorage.setItem(
          sessionStorageKey,
          JSON.stringify(initialSessionData),
        );

        console.log(
          `[${new Date().toISOString()}] 🆕 Router: Initialized existing session ID in sessionStorage:`,
          sessionId,
        );
      }
    }
  }

  return true;
}

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行
    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    // 处理AI聊天路由的会话ID - 在权限检查之前处理
    const aiChatResult = handleAIChatRoute(to);
    if (aiChatResult !== true) {
      return aiChatResult;
    }

    const accessStore = useAccessStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();
    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) ||
            userStore.userInfo?.homePath ||
            preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 生成路由表
    // 当前登录用户拥有的角色标识列表
    const userInfo = userStore.userInfo || (await authStore.fetchUserInfo());
    const userRoles = userInfo.roles ?? [];

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: accessRoutes,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    let redirectPath: string;
    if (from.query.redirect) {
      redirectPath = from.query.redirect as string;
    } else if (to.path === preferences.app.defaultHomePath) {
      redirectPath = preferences.app.defaultHomePath;
    } else if (userInfo.homePath && to.path === userInfo.homePath) {
      redirectPath = userInfo.homePath;
    } else {
      redirectPath = to.fullPath;
    }
    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
