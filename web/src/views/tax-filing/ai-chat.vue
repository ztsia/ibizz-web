<script lang="ts" setup>
import { onMounted, ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AIChatAssistant from './components/AIChatAssistant.vue';
import MalaysianTaxWorksheetsSidebar from './components/MalaysianTaxWorksheetsSidebar.vue';
import { providePdfExportContext } from '#/composables/usePdfExportContext';

// Session storage keys
const SESSION_STORAGE_PREFIX = 'ai-chat-session-';
const PAGE_INFO_KEY = 'ai-chat-page-info';

// Reactive state
const sessionId = ref<string>('');
const pageInfo = reactive({
  sessionId: '',
  timestamp: 0,
  path: '',
  query: {} as Record<string, any>,
  scrollPosition: 0,
  chatHistory: [] as any[],
  userInput: '',
  isRestored: false,
  // Workflow-specific state
  workflowState: {
    workflowActive: false,
    currentWorkflowStep: 0,
    workflowSteps: [] as any[],
    selectedClient: null as any,
    selectedAccountingPeriod: null as any,
    uploadedFiles: [] as any[],
    extractedData: {} as any,
    taxResults: {} as any,
    messages: [] as any[],
    conversationHistory: [] as any[],
    isGenerating: false,
    isWorkflowStepProcessing: false,
    streamingText: '',
    sidebarCollapsed: false,
    worksheetsSidebarVisible: true,
  },
});

const route = useRoute();
const router = useRouter();

// Provide PDF export context for child components
providePdfExportContext();

/**
 * Generate a new session ID
 */
function generateSessionId(): string {
  const newSessionId = `ai-chat-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  return newSessionId;
}

/**
 * Save page info to session storage
 */
function savePageInfo() {
  const info = {
    ...pageInfo,
    timestamp: Date.now(),
    path: route.path,
    query: route.query,
    scrollPosition: window.scrollY || document.documentElement.scrollTop,
  };

  try {
    // Save general page info
    sessionStorage.setItem(PAGE_INFO_KEY, JSON.stringify(info));

    // Save session-specific data
    if (sessionId.value) {
      const sessionKey = SESSION_STORAGE_PREFIX + sessionId.value;
      const sessionData = {
        sessionId: sessionId.value,
        created: pageInfo.timestamp || Date.now(),
        lastAccessed: Date.now(),
        chatHistory: pageInfo.chatHistory,
        userInput: pageInfo.userInput,
        workflowState: pageInfo.workflowState,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
  } catch {
    // Failed to save page info to session storage
  }
}

/**
 * Restore page info from session storage
 */
function restorePageInfo(): boolean {
  try {
    // Restore general page info
    const savedPageInfo = sessionStorage.getItem(PAGE_INFO_KEY);
    if (savedPageInfo) {
      const parsed = JSON.parse(savedPageInfo);
      Object.assign(pageInfo, parsed);
    }

    // Restore session-specific data
    if (sessionId.value) {
      const sessionKey = SESSION_STORAGE_PREFIX + sessionId.value;
      const savedSessionData = sessionStorage.getItem(sessionKey);
      if (savedSessionData) {
        const sessionData = JSON.parse(savedSessionData);
        pageInfo.chatHistory = sessionData.chatHistory || [];
        pageInfo.userInput = sessionData.userInput || '';

        // Restore workflow state
        if (sessionData.workflowState) {
          Object.assign(pageInfo.workflowState, sessionData.workflowState);
        }

        pageInfo.isRestored = true;

        // Update last accessed time
        sessionData.lastAccessed = Date.now();
        sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));

        return true;
      }
    }

    return false;
  } catch {
    // Failed to restore page info from session storage
    return false;
  }
}

/**
 * Initialize session management
 */
function initializeSession() {
  // Get session ID from URL query parameter
  const urlSessionId = route.query.sessionId as string;

  if (urlSessionId) {
    sessionId.value = urlSessionId;
    pageInfo.sessionId = urlSessionId;
  } else {
    // Generate new session ID if not provided
    const newSessionId = generateSessionId();
    sessionId.value = newSessionId;
    pageInfo.sessionId = newSessionId;

    // Update URL with new session ID
    router.replace({
      path: route.path,
      query: { ...route.query, sessionId: newSessionId },
    });
  }

  // Try to restore previous state
  const restored = restorePageInfo();

  if (restored) {
    // Restore scroll position after a short delay
    setTimeout(() => {
      if (pageInfo.scrollPosition > 0) {
        window.scrollTo(0, pageInfo.scrollPosition);
      }
    }, 100);
  } else {
    pageInfo.timestamp = Date.now();
  }
}

/**
 * Clean up old sessions from storage
 */
function cleanupOldSessions() {
  try {
    const keys = Object.keys(sessionStorage);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    keys.forEach((key) => {
      if (key.startsWith(SESSION_STORAGE_PREFIX)) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (data.lastAccessed && now - data.lastAccessed > maxAge) {
            sessionStorage.removeItem(key);
          }
        } catch {
          // Remove corrupted entries
          sessionStorage.removeItem(key);
        }
      }
    });
  } catch {
    // Failed to cleanup old sessions
  }
}

/**
 * Update workflow state
 */
function updateWorkflowState(updates: Partial<typeof pageInfo.workflowState>) {
  Object.assign(pageInfo.workflowState, updates);
  savePageInfo(); // Auto-save when workflow state changes
}

/**
 * Get current workflow state
 */
function getWorkflowState() {
  return pageInfo.workflowState;
}

/**
 * Reset workflow state
 */
function resetWorkflowState() {
  pageInfo.workflowState = {
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
    worksheetsSidebarVisible: false,
  };
  savePageInfo();
}

/**
 * Handle worksheets sidebar visibility change
 */
function handleWorksheetsSidebarVisibilityChange(visible: boolean) {
  updateWorkflowState({ worksheetsSidebarVisible: visible });
}

// Route watcher to handle sessionId changes
watch(
  () => route.query.sessionId,
  (newSessionId, oldSessionId) => {
    // Only reinitialize if sessionId actually changed
    if (newSessionId !== oldSessionId && newSessionId !== sessionId.value) {
      // Save current state before switching
      if (sessionId.value) {
        savePageInfo();
      }

      // Initialize new session
      initializeSession();
    }
  },
  { immediate: false }, // Don't trigger on initial mount
);

// Lifecycle hooks
onMounted(() => {
  initializeSession();
  cleanupOldSessions();

  // Save state periodically
  const saveInterval = setInterval(savePageInfo, 30_000); // Save every 30 seconds

  // Save state before page unload
  const handleBeforeUnload = () => {
    savePageInfo();
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Cleanup on unmount
  return () => {
    clearInterval(saveInterval);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    savePageInfo(); // Final save
  };
});

// Expose reactive state for child components
defineExpose({
  sessionId,
  pageInfo,
  savePageInfo,
  restorePageInfo,
  updateWorkflowState,
  getWorkflowState,
  resetWorkflowState,
});
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Malaysian Tax Worksheets Sidebar -->
    <MalaysianTaxWorksheetsSidebar
      :visible="pageInfo.workflowState.worksheetsSidebarVisible"
      @visibility-change="handleWorksheetsSidebarVisibilityChange"
    />

    <!-- Main Content -->
    <div class="flex max-h-screen min-h-0 flex-1 overflow-hidden">
      <!-- Main Content Area - Unified Chat Interface -->
      <div class="flex min-h-0 flex-1 flex-col">
        <!-- Chat Container -->
        <div class="bg-card flex min-h-0 flex-1 flex-col">
          <!-- Chat Messages Area -->
          <AIChatAssistant
            class="min-h-0 flex-1"
            :workflow-state="pageInfo.workflowState"
            :is-restored="pageInfo.isRestored"
            @update-workflow-state="updateWorkflowState"
            @reset-workflow-state="resetWorkflowState"
          />
        </div>
      </div>
    </div>
  </div>
</template>
