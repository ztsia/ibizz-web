import { onMounted, onUnmounted } from 'vue';

interface PerfMarker {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

const markers = new Map<string, PerfMarker>();

export function usePerfMarkers() {
  const startMarker = (name: string) => {
    if (import.meta.env.DEV) {
      const startTime = performance.now();
      markers.set(name, { name, startTime });
      console.log(`[Perf] Start: ${name}`);
    }
  };

  const endMarker = (name: string) => {
    if (import.meta.env.DEV && markers.has(name)) {
      const marker = markers.get(name)!;
      marker.endTime = performance.now();
      marker.duration = marker.endTime - marker.startTime;
      console.log(`[Perf] End: ${name} (${marker.duration.toFixed(2)}ms)`);
    }
  };

  onMounted(() => {
    markers.clear();
  });

  onUnmounted(() => {
    // You might want to log any markers that were started but not ended
    for (const [name, marker] of markers.entries()) {
      if (!marker.endTime) {
        console.warn(`[Perf] Marker "${name}" was started but not ended.`);
      }
    }
  });

  return { startMarker, endMarker };
}
