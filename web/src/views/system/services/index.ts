// Barrel export for lookup services (TypeScript)
export * from './lookupGroups.service';
export * from './lookupTableManager.service';
export * from './mock_db';
export * from './profile.service';

// NOTE: `http.client`, `config`, and `supabase` were removed in favor of the
// in-repo `mock_data.json` based implementations. If you re-add a real backend
// later, re-introduce appropriate exports here.
