import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { EnhancedSystemClient } from '#/api/system/iBizzClient';
import type {
  AccountingPeriodData,
  ManualEntryData,
  UploadedFile,
  ExtractedData,
  TaxResults,
} from '#/views/tax-filing/components/workflow';
import type { ChatMessage } from '#/views/tax-filing/types/ai-chat';

// Workflow snapshot interface
export interface WorkflowSnapshot {
  stepId: string;
  stepIndex: number;
  timestamp: Date;
  sessionId?: string;
  data: {
    selectedClient?: EnhancedSystemClient | null;
    selectedAccountingPeriod?: AccountingPeriodData | null;
    selectedDataEntryMethod?: string | null;
    manualEntryData?: ManualEntryData;
    uploadedFiles?: UploadedFile[];
    extractedData?: ExtractedData;
    taxResults?: TaxResults;
    messages?: ChatMessage[];
    conversationHistory?: Array<{ role: string; content: string }>;
    workflowSteps?: any[];
    currentWorkflowStep?: number;
    workflowActive?: boolean;
  };
}

// Storage key for persistence
const STORAGE_KEY = 'workflow-history';
const MAX_HISTORY_ENTRIES = 50; // Limit history to prevent storage bloat
const HISTORY_EXPIRY_DAYS = 7; // Auto-cleanup after 7 days

export const useWorkflowHistoryStore = defineStore('workflowHistory', () => {
  // State
  const snapshots = ref<WorkflowSnapshot[]>([]);
  const currentSessionId = ref<string>('');

  // Computed
  const sortedSnapshots = computed(() => {
    return [...snapshots.value].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  });

  const snapshotsByStep = computed(() => {
    const grouped: Record<string, WorkflowSnapshot[]> = {};
    snapshots.value.forEach((snapshot) => {
      if (!grouped[snapshot.stepId]) {
        grouped[snapshot.stepId] = [];
      }
      grouped[snapshot.stepId].push(snapshot);
    });
    return grouped;
  });

  // Actions
  const setCurrentSessionId = (sessionId: string) => {
    currentSessionId.value = sessionId;
  };

  const saveWorkflowSnapshot = (
    stepId: string,
    stepIndex: number,
    data: WorkflowSnapshot['data'],
    sessionId?: string,
  ) => {
    try {
      const snapshot: WorkflowSnapshot = {
        stepId,
        stepIndex,
        timestamp: new Date(),
        sessionId: sessionId || currentSessionId.value,
        data: JSON.parse(JSON.stringify(data)), // Deep clone to avoid reference issues
      };

      // Remove existing snapshot for the same step in current session
      const existingIndex = snapshots.value.findIndex(
        (s) => s.stepId === stepId && s.sessionId === snapshot.sessionId,
      );

      if (existingIndex === -1) {
        snapshots.value.push(snapshot);
      } else {
        snapshots.value[existingIndex] = snapshot;
      }

      // Cleanup old entries if we exceed the limit
      if (snapshots.value.length > MAX_HISTORY_ENTRIES) {
        snapshots.value = sortedSnapshots.value.slice(0, MAX_HISTORY_ENTRIES);
      }

      // Persist to localStorage
      persistToStorage();

      console.log(`Workflow snapshot saved for step: ${stepId}`, snapshot);
      return true;
    } catch (error) {
      console.error('Failed to save workflow snapshot:', error);
      return false;
    }
  };

  const restoreWorkflowSnapshot = (
    stepId: string,
    sessionId?: string,
  ): WorkflowSnapshot | null => {
    try {
      const targetSessionId = sessionId || currentSessionId.value;
      const snapshot = snapshots.value.find(
        (s) => s.stepId === stepId && s.sessionId === targetSessionId,
      );

      if (snapshot) {
        console.log(`Workflow snapshot restored for step: ${stepId}`, snapshot);
        return JSON.parse(JSON.stringify(snapshot)); // Deep clone
      }

      console.warn(`No workflow snapshot found for step: ${stepId}`);
      return null;
    } catch (error) {
      console.error('Failed to restore workflow snapshot:', error);
      return null;
    }
  };

  const getWorkflowHistory = (sessionId?: string): WorkflowSnapshot[] => {
    if (sessionId) {
      return snapshots.value.filter((s) => s.sessionId === sessionId);
    }
    return sortedSnapshots.value;
  };

  const hasHistoryForStep = (stepId: string, sessionId?: string): boolean => {
    const targetSessionId = sessionId || currentSessionId.value;
    return snapshots.value.some(
      (s) => s.stepId === stepId && s.sessionId === targetSessionId,
    );
  };

  const clearWorkflowHistory = (sessionId?: string) => {
    try {
      snapshots.value = sessionId
        ? snapshots.value.filter((s) => s.sessionId !== sessionId)
        : [];
      persistToStorage();
      console.log('Workflow history cleared');
    } catch (error) {
      console.error('Failed to clear workflow history:', error);
    }
  };

  const getLatestSnapshotForStep = (
    stepId: string,
    sessionId?: string,
  ): WorkflowSnapshot | null => {
    const targetSessionId = sessionId || currentSessionId.value;
    const stepSnapshots = snapshots.value
      .filter((s) => s.stepId === stepId && s.sessionId === targetSessionId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    return stepSnapshots[0] || null;
  };

  const getStepsWithHistory = (sessionId?: string): string[] => {
    const targetSessionId = sessionId || currentSessionId.value;
    const stepsWithHistory = new Set<string>();

    snapshots.value
      .filter((s) => s.sessionId === targetSessionId)
      .forEach((s) => stepsWithHistory.add(s.stepId));

    return [...stepsWithHistory];
  };

  // Persistence methods
  const persistToStorage = () => {
    try {
      const dataToStore = {
        snapshots: snapshots.value,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to persist workflow history to storage:', error);
    }
  };

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);

        // Check if data is expired
        const storedDate = new Date(data.timestamp);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - HISTORY_EXPIRY_DAYS);

        if (storedDate > expiryDate && Array.isArray(data.snapshots)) {
          snapshots.value = data.snapshots.map((s) => ({
            ...s,
            timestamp: new Date(s.timestamp), // Convert timestamp back to Date object
          }));
          console.log(
            'Workflow history loaded from storage:',
            snapshots.value.length,
            'snapshots',
          );
        } else {
          // Clear expired data
          localStorage.removeItem(STORAGE_KEY);
          console.log('Expired workflow history cleared from storage');
        }
      }
    } catch (error) {
      console.error('Failed to load workflow history from storage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const cleanupExpiredHistory = () => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - HISTORY_EXPIRY_DAYS);

      const initialCount = snapshots.value.length;
      snapshots.value = snapshots.value.filter(
        (s) => new Date(s.timestamp) > expiryDate,
      );

      const removedCount = initialCount - snapshots.value.length;
      if (removedCount > 0) {
        persistToStorage();
        console.log(
          `Cleaned up ${removedCount} expired workflow history entries`,
        );
      }
    } catch (error) {
      console.error('Failed to cleanup expired workflow history:', error);
    }
  };

  // Initialize store
  const initialize = () => {
    loadFromStorage();
    cleanupExpiredHistory();
  };

  // Auto-initialize when store is created
  initialize();

  return {
    // State
    snapshots,
    currentSessionId,

    // Computed
    sortedSnapshots,
    snapshotsByStep,

    // Actions
    setCurrentSessionId,
    saveWorkflowSnapshot,
    restoreWorkflowSnapshot,
    getWorkflowHistory,
    hasHistoryForStep,
    clearWorkflowHistory,
    getLatestSnapshotForStep,
    getStepsWithHistory,

    // Persistence
    persistToStorage,
    loadFromStorage,
    cleanupExpiredHistory,
    initialize,
  };
});
