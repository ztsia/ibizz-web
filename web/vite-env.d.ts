/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_NAMESPACE: string;
  readonly VITE_BASE: string;
  readonly VITE_ROUTER_HISTORY: string;
  readonly VITE_AI_SERVICE_URL: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}