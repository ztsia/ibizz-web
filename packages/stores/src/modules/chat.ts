import { acceptHMRUpdate, defineStore } from 'pinia';

interface ChatMessage {
  content: string;
  id: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'guidance' | 'normal' | 'welcome' | 'workflow';
}

interface ChatState {
  /**
   * Auto-trigger settings
   */
  autoTriggerEnabled: boolean;
  /**
   * Current page context for smart messaging
   */
  currentPageContext: string;
  /**
   * Chat minimized state
   */
  isChatMinimized: boolean;
  /**
   * Chat visibility state
   */
  isChatOpen: boolean;
  /**
   * Typing indicator
   */
  isTyping: boolean;
  /**
   * Chat messages
   */
  messages: ChatMessage[];
  /**
   * Unread message count
   */
  unreadCount: number;
}

/**
 * @zh_CN 聊天相关状态管理
 */
export const useChatStore = defineStore('core-chat', {
  actions: {
    /**
     * Add a new message to the chat
     */
    addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
      const newMessage: ChatMessage = {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      this.messages.push(newMessage);

      // Increment unread count if chat is closed and message is from AI
      if (!this.isChatOpen && !message.isUser) {
        this.unreadCount++;
      }
    },

    /**
     * Clear all messages
     */
    clearMessages() {
      this.messages = [];
    },

    /**
     * Toggle chat visibility
     */
    toggleChat() {
      this.isChatOpen = !this.isChatOpen;
      if (this.isChatOpen) {
        this.isChatMinimized = false;
        this.unreadCount = 0; // Reset unread count when opening chat
      }
    },

    /**
     * Open chat
     */
    openChat() {
      this.isChatOpen = true;
      this.isChatMinimized = false;
      this.unreadCount = 0;
    },

    /**
     * Close chat
     */
    closeChat() {
      this.isChatOpen = false;
      this.isChatMinimized = false;
    },

    /**
     * Toggle minimize state
     */
    toggleMinimize() {
      this.isChatMinimized = !this.isChatMinimized;
    },

    /**
     * Set typing state
     */
    setTyping(isTyping: boolean) {
      this.isTyping = isTyping;
    },

    /**
     * Set current page context for smart messaging
     */
    setPageContext(context: string) {
      this.currentPageContext = context;
    },

    /**
     * Enable/disable auto-trigger
     */
    setAutoTrigger(enabled: boolean) {
      this.autoTriggerEnabled = enabled;
    },

    /**
     * Send a context-aware welcome message based on current page
     */
    sendContextualWelcome() {
      let welcomeMessage = '';

      switch (this.currentPageContext) {
        case 'dashboard': {
          welcomeMessage = `📊 **Dashboard Assistant**\n\nWelcome to your admin dashboard! I can help you with:\n\n• **Navigation** - Finding specific features\n• **Data interpretation** - Understanding your metrics\n• **Quick actions** - Performing common tasks\n• **System overview** - Current status and alerts\n\nWhat would you like to explore?`;
          break;
        }
        case 'tax-filing-create': {
          welcomeMessage = `🎯 **Welcome to Tax Filing Creation!**\n\nI'm here to guide you through the tax filing process. I can help you with:\n\n• **Form completion** - Tips for filling out client information\n• **Document requirements** - What documents you'll need\n• **Filing types** - Choosing the right filing type\n• **Workflow guidance** - Step-by-step process overview\n\nReady to get started? Just ask me anything!`;
          break;
        }
        case 'tax-filing-workflow': {
          welcomeMessage = `⚡ **Workflow Assistant Ready!**\n\nI'm here to help you navigate through the tax filing workflow. I can assist with:\n\n• **Current step guidance** - What to do next\n• **Document upload** - File requirements and tips\n• **Review process** - Checking for completeness\n• **Submission** - Final steps and confirmation\n\nHow can I help you progress through your workflow?`;
          break;
        }
        default: {
          welcomeMessage = `👋 **AI Assistant Ready!**\n\nI'm your intelligent assistant for this admin panel. I can help you with:\n\n• **Navigation** - Finding your way around\n• **Features** - Understanding available tools\n• **Troubleshooting** - Solving issues quickly\n• **Best practices** - Tips for efficient workflow\n\nHow can I assist you today?`;
        }
      }

      this.addMessage({
        content: welcomeMessage,
        isUser: false,
        type: 'welcome',
      });
    },

    /**
     * Send workflow guidance message
     */
    sendWorkflowGuidance() {
      const guidanceMessage = `🚀 **Starting Your Tax Filing Workflow**\n\nGreat! You're about to begin the tax filing process. Here's what happens next:\n\n**Step 1:** Complete client information\n**Step 2:** Upload required documents\n**Step 3:** Review and verify details\n**Step 4:** Submit for processing\n\n💡 **Pro Tips:**\n• Double-check all client details before proceeding\n• Ensure all required documents are ready\n• I'll be here to help at every step!\n\nReady to create your tax filing?`;

      this.addMessage({
        content: guidanceMessage,
        isUser: false,
        type: 'workflow',
      });
    },

    /**
     * Auto-trigger chat with contextual message
     */
    autoTriggerWithContext(context: string, delay: number = 2000) {
      if (!this.autoTriggerEnabled) return;

      this.setPageContext(context);

      setTimeout(() => {
        if (!this.isChatOpen) {
          this.openChat();
          // Small delay to ensure chat is open before sending message
          setTimeout(() => {
            this.sendContextualWelcome();
          }, 500);
        }
      }, delay);
    },

    /**
     * Trigger chat with workflow start message
     */
    triggerWorkflowStart() {
      this.openChat();
      setTimeout(() => {
        this.sendWorkflowGuidance();
      }, 500);
    },

    /**
     * Initialize chat with default settings
     */
    initializeChat() {
      // Add initial welcome message if no messages exist
      if (this.messages.length === 0) {
        this.addMessage({
          content: `👋 **Welcome to your AI Assistant!**\n\nI'm here to help you navigate and use this admin panel effectively. I can assist with:\n\n• **Navigation** - Finding features and tools\n• **Guidance** - Step-by-step help\n• **Troubleshooting** - Solving issues\n• **Tips** - Best practices and shortcuts\n\nFeel free to ask me anything!`,
          isUser: false,
          type: 'welcome',
        });
      }
    },
  },

  state: (): ChatState => ({
    messages: [],
    isChatOpen: false,
    isChatMinimized: false,
    isTyping: false,
    autoTriggerEnabled: true,
    currentPageContext: '',
    unreadCount: 0,
  }),
});

// 解决热更新问题
// 解决热更新问题 - 仅在开发环境启用
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useChatStore, import.meta.hot));
}
