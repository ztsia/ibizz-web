// Minimal in-app notification shim (typed)
export function notifySuccess(message: string): void {
  // minimal in-app notification shim; replace with Vuetify snackbar integration later
  // For tests we can spy on this function
  // Keep behavior the same as the JS version

  console.log('SUCCESS:', message);
}

export function notifyError(message: string): void {
  console.error('ERROR:', message);
}
