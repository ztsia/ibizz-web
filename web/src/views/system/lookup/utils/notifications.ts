// Minimal in-app notification shim (typed)
export function notifySuccess(message: string) {}

export function notifyError(message: string): void {
  console.error('ERROR:', message);
}
