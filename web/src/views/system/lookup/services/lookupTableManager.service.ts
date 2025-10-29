import { db, delay, genId } from './mock_db';

/**
 * Compute the per-group table name used in the mock DB.
 * Example: groupId = 'countries' -> 'lookup_countries'
 */
function tableNameFor(groupId: string | null) {
  return `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
}

/**
 * Normalize different persisted row shapes to the frontend's expected shape:
 * If the row already has `{ id, columns }` return as-is. Otherwise flatten a DB
 * row into `{ id, columns: { ... } }` where `id` is taken from the `id` field if present.
 */
function normalizeRow(r: any) {
  if (!r) return r;
  if (r.columns) return r;
  const id = r.id === undefined ? undefined : r.id;
  const cols: Record<string, any> = {};
  Object.keys(r || {}).forEach((k) => {
    if (k === 'id') return;
    cols[k] = r[k];
  });
  return { id, columns: cols };
}

/**
 * List items for a given group.
 * - Supports optional pagination via `opts.page` and `opts.perPage`.
 * - Supports a simple free-text search via `opts.q` (searches string fields only).
 * - If `opts.count` is truthy, returns `{ items, total }` where `total` is the
 *   number of matched rows (useful for paginated UIs).
 */
export async function listItems(groupId: string | null, opts: any = {}) {
  await delay();
  const page = Math.max(1, Number(opts.page) || 1);
  const perPage = Math.max(1, Number(opts.perPage) || 10);
  const table = db[tableNameFor(groupId)] || [];

  // simple free-text search across string fields
  let filtered = [...table];
  if (opts.q) {
    const q = String(opts.q).toLowerCase();
    filtered = filtered.filter((r: any) => {
      return Object.keys(r || {}).some((k) => {
        const v = r[k];
        return typeof v === 'string' && v.toLowerCase().includes(q);
      });
    });
  }

  const total = filtered.length;
  const start = (page - 1) * perPage;
  const pageRows = filtered.slice(start, start + perPage);

  const normalized = pageRows.map((row: any) => normalizeRow(row));
  if (opts && opts.count) return { items: normalized, total };
  return normalized;
}

/**
 * Retrieve a single item by id for a group.
 * Returns the normalized `{ id, columns }` shape or `undefined` when not found.
 */
export async function getItem(groupId: string | null, itemId: any) {
  await delay();
  const table = db[tableNameFor(groupId)] || [];
  const row = table.find((r: any) => String(r.id) === String(itemId));
  return normalizeRow(row);
}

/**
 * Find items by exact `code` value. Used for uniqueness checks in the UI.
 * Returns an array of normalized rows.
 */
export async function findItemsByCode(groupId: string | null, code: any) {
  await delay();
  if (!groupId) return [];
  const table = db[tableNameFor(groupId)] || [];
  const rows = table.filter((r: any) => String(r.code) === String(code));
  return rows.map((row: any) => normalizeRow(row));
}

/**
 * Create a new item in the group's table.
 * Accepts either a flat payload (DB shape) or the frontend shape `{ columns: { ... } }`.
 * Returns the created row normalized to `{ id, columns }`.
 */
export async function createItem(groupId: string | null, item: any) {
  await delay();
  const table = db[tableNameFor(groupId)] || (db[tableNameFor(groupId)] = []);
  const payload =
    item && item.columns
      ? Object.assign({}, item.columns)
      : Object.assign({}, item);
  if (payload.id === undefined || payload.id === null) payload.id = genId();
  table.push(payload);
  return normalizeRow(payload);
}

/**
 * Update an existing item. `updates` can be either flat or `{ columns: {...} }`.
 * Returns the updated normalized row or `null` when the row does not exist.
 */
export async function updateItem(
  groupId: string | null,
  itemId: any,
  updates: any,
) {
  await delay();
  const table = db[tableNameFor(groupId)] || [];
  const idx = table.findIndex((r: any) => String(r.id) === String(itemId));
  if (idx === -1) return null;
  const payload =
    updates && updates.columns
      ? Object.assign({}, table[idx], updates.columns)
      : Object.assign({}, table[idx], updates);
  table.splice(idx, 1, payload);
  return normalizeRow(payload);
}

/**
 * Delete an item by id. Returns the deleted normalized row or `null` when not found.
 */
export async function deleteItem(groupId: string | null, itemId: any) {
  await delay();
  const table = db[tableNameFor(groupId)] || [];
  const idx = table.findIndex((r: any) => String(r.id) === String(itemId));
  if (idx === -1) return null;
  const removed = table.splice(idx, 1)[0];
  return normalizeRow(removed);
}

/**
 * Get column metadata for a group's table by reading the `lookup_groups` entry in
 * the mock DB. Returns an array of `{ column_name, data_type }` objects suitable
 * for client-side introspection.
 */
export async function getTableColumns(groupSlug: string | null) {
  await delay();
  if (!groupSlug) return [];
  const groups = db.lookup_groups || [];
  const g = groups.find((x: any) => String(x.slug) === String(groupSlug));
  if (!g) return [];
  const cols = g.columns_schema || g.columns || [];
  if (!Array.isArray(cols)) return [];
  return cols.map((c: any) => {
    const name = c.key || c.name || c.label;
    let dt = (c.type || 'text').toLowerCase();
    if (dt === 'number' || dt === 'integer') dt = 'bigint';
    else if (dt === 'json') dt = 'jsonb';
    else dt = 'text';
    return { column_name: name, data_type: dt };
  });
}

/**
 * Ensure a backing table exists for the group in the mock DB. For mocks this is a
 * no-op that creates an empty table array when missing and returns `{ ok: true }`.
 */
export async function ensureTableForGroup(group: any) {
  await delay();
  const tname = tableNameFor(
    group && (group.slug || group.id) ? group.slug || group.id : null,
  );
  if (!db[tname]) db[tname] = [];
  return { ok: true };
}
