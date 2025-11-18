/**
 * @file Mock implementation for managing items within a specific lookup group's table.
 * @summary
 * This module provides an in-memory mock that mirrors the behaviour of a
 * real backend service responsible for CRUD operations on per-group lookup
 * tables (for example `lookup_countries`, `lookup_state_code`, etc.).
 *
 * The intent of these comments is to help backend engineers implement the
 * production service with compatible semantics. Key expectations:
 * - Per-group tables are named using a predictable convention derived from
 *   the group's slug.
 * - APIs should be implemented as atomic operations where necessary (e.g.
 *   optimistic concurrency checks applied in the same update statement).
 * - The mock uses a shared in-memory `db` object; all browser clients talking
 *   to the same dev server share the same memory. Ensure production services
 *   use real persistence and appropriate concurrency controls.
 */

import { db, delay, genId } from './';

/**
 * tableNameFor()
 *
 * Derive the concrete table name used for a group's items. The mock keeps
 * each group's items in a top-level array on the `db` object keyed by this
 * name.
 *
 * Backend guidance:
 * - In production the lookup group's data will typically be stored in a
 *   dedicated table or collection. The server should map the group's slug
 *   to the physical storage location using the same sanitisation rules so
 *   client code can rely on a predictable naming scheme when necessary.
 * - Use a safe transformation: lowercase, replace non-alphanumerics with
 *   underscores, and trim leading/trailing underscores.
 */
function tableNameFor(groupId: string | null) {
  return `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
}

/**
 * normalizeRow()
 *
 * Convert a flat database row to the normalized `{ id, columns }` shape used
 * by the frontend services. If the backend already returns a normalized
 * shape, this is a no-op.
 *
 * Backend guidance:
 * - The production API may choose to return either flat rows or a
 *   normalized payload. Document the chosen format and keep clients
 *   consistent. If returning flat rows, consider providing a small
 *   transformation layer server-side so clients do less work.
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
 * listItems()
 *
 * Retrieve a page of items for a lookup group. Supports simple free-text
 * searching and pagination. The mock implementation performs an in-memory
 * filter; production implementations should push filtering and pagination
 * into the database for performance.
 *
 * Backend guidance:
 * - Implement filtering and pagination at the DB/query layer (use
 *   LIMIT/OFFSET, cursors or server-side pagination depending on scale).
 * - For full-text search, use a proper text index (Postgres `tsvector` or a
 *   dedicated search index) instead of client-side substring search.
 * - If `count` is requested, return the total matching count alongside
 *   the page (or provide an efficient estimate if counting is expensive).
 * - Consider exposing `nextCursor` instead of `page` for more robust
 *   pagination.
 * @security
 * TODO: Implement authorization logic.
 * - Admin roles should be able to call this for any `groupId`.
 * - Other roles should only be allowed to call this for generic, public groups (e.g., 'countries', 'states').
 * The backend API should enforce these rules based on the user's session/token.
 */
/**
 * List items for a given group with support for pagination and searching.
 * @param {string | null} groupId - The ID of the group whose items are to be listed.
 * @param {any} [opts] - Options object: { page, perPage, q, count }.
 * @returns {Promise<Array<any> | {items: Array<any>, total: number}>} An array of items or an object with items and total count.
 *
 * @backend_implementation
 * This function should query the specific table for the given `groupId` (e.g., `lookup_countries`).
 * - `page` & `perPage`: Implement pagination using `LIMIT` and `OFFSET`.
 * - `q`: Implement full-text search across all relevant text/JSON columns. The original used `ilike` with wildcards.
 * - `count`: If true, the response must include the total number of matching records, typically via a `Content-Range` header or in the response body.
 * Original Supabase/PostgREST URL: `/rest/v1/lookup_my_group?limit=10&offset=0&or=(col1.ilike.*search*,col2.ilike.*search*)`
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
 * getItem()
 *
 * Return a single normalized item from the group's backing table by its
 * primary key. Production backends should perform a simple indexed lookup
 * and return 404 when not found.
 */
export async function getItem(groupId: string | null, itemId: any) {
  await delay();
  const table = db[tableNameFor(groupId)] || [];
  const row = table.find((r: any) => String(r.id) === String(itemId));
  return normalizeRow(row);
}

/**
 * findItemsByCode()
 *
 * Look up items by their `code` column (exact match). Typically used to
 * validate uniqueness before creating/updating items. Production services
 * should ensure an index exists on the `code` column for the group's
 * table and return a small paginated result or single item.
 */
export async function findItemsByCode(groupId: string | null, code: any) {
  await delay();
  if (!groupId) return [];
  const table = db[tableNameFor(groupId)] || [];
  const rows = table.filter((r: any) => String(r.code) === String(code));
  return rows.map((row: any) => normalizeRow(row));
}

/**
 * createItem()
 *
 * Insert a new item into the group's table. The mock assigns an `id`
 * when none is provided and returns the normalized result.
 *
 * Backend guidance:
 * - Validate the payload server-side. Do not trust client-supplied ids or
 *   other invariant fields.
 * - To enforce uniqueness (e.g., unique `code`), use a database unique
 *   constraint and surface a clear 409 Conflict when the constraint is
 *   violated.
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
 * updateItem()
 *
 * Update an existing item in the group's table. The mock simply merges the
 * provided changes and replaces the row in-memory. Production backends must
 * treat updates as atomic operations and consider optimistic concurrency
 * when multiple actors may modify the same row.
 *
 * Backend guidance (optimistic concurrency):
 * - Prefer a single atomic update that includes a concurrency predicate
 *   in the filter. Examples:
 *   - SQL: `UPDATE ... WHERE id = :id AND version = :clientVersion` and
 *     check affected rows.
 *   - MongoDB: `findOneAndUpdate({ _id: id, version: clientVersion }, { $set: ..., $inc: { version: 1 } }, { returnDocument: 'after' })`.
 * - If the update affects no document, return 409 Conflict (client has a
 *   stale copy).
 * - Ensure the server sets `updated_at` and increments `version` (server-
 *   authoritative values) rather than relying on client-supplied values.
 * - Keep update payload validation strict and ignore or reject writes to
 *   view-only columns where appropriate.
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
 * deleteItem()
 *
 * Remove an item from the group's table. Production implementations should
 * perform an indexed delete and return an appropriate 404 when the item
 * does not exist.
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
 * getTableColumns()
 *
 * Return the column metadata for a group's table. In production this
 * should be driven by the database schema (information_schema) or a
 * documented schema store rather than ad-hoc JSON.
 *
 * Backend guidance:
 * - Expose stable metadata for client-side form generation and validation.
 * - Consider caching or a lightweight schema registry for performance
 *   rather than querying database system tables on every request.
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
 * ensureTableForGroup()
 *
 * Ensure that a physical backing table/collection exists for the provided
 * group. In the mock this simply ensures there's an array on `db` for the
 * derived table name.
 *
 * Backend guidance:
 * - Creating/dropping tables is a privileged operation and should be
 *   guarded. Consider migrations and schema versioning when supporting
 *   dynamic table creation.
 * - The production implementation may use a transactional step or a
 *   provisioning job to create the table and any required indexes.
 */
export async function ensureTableForGroup(group: any) {
  await delay();
  const tname = tableNameFor(
    group && (group.slug || group.id) ? group.slug || group.id : null,
  );
  if (!db[tname]) db[tname] = [];
  return { ok: true };
}
