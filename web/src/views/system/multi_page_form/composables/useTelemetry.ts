export function useTelemetry() {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log(`[Telemetry] Event: ${eventName}`, properties);
    }
    // In a real implementation, this would send data to a telemetry service.
  };

  const trackError = (error: Error, properties?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.error(`[Telemetry] Error: ${error.message}`, {
        error,
        ...properties,
      });
    }
    // In a real implementation, this would send data to an error tracking service.
  };

  return { trackEvent, trackError };
}
