import { message as antMessage } from 'ant-design-vue';

// Minimal in-app notification shim (typed)
export function notifySuccess(message: string) {
  antMessage.success(message);
}

export function notifyError(message: string): void {
  antMessage.error(message);
  console.error('ERROR:', message);
}
