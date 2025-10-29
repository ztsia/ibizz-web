import mockData from './mock_data/mock_data.json';

/* Shared in-memory DB seeded from mock_data.json for lookup services.
   Exports:
     - db: mutable Record<string, any[]>
     - delay(): Promise<void> - simulated latency
     - genId(): string - simple id generator
*/

export const db: Record<string, any[]> = {};
try {
  if (Array.isArray(mockData)) {
    for (const t of mockData as any[]) {
      db[t.table_name] = Array.isArray(t.rows) ? [...(t.rows as any[])] : [];
    }
  }
} catch {
  // keep db empty on error
}

export function delay() {
  return new Promise((r) => setTimeout(r, 200));
}

export function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export default { db, delay, genId };
