/**
 * @file Mock implementation for managing items within a specific lookup group's table.
 * @summary This file provides an in-memory mock for CRUD operations on dynamically managed lookup tables.
 * The comments describe the expected behavior of the real backend API.
 * The original implementation used Supabase, where each lookup group had its own table (e.g., `lookup_countries`).
 */

import { db, delay, genId } from './mock_db';

/**
 * (Internal Helper) Compute the per-group table name used in the mock DB.
 * @param {string | null} groupId - The slug or ID of the group.
 * @returns {string} The derived table name (e.g., 'lookup_countries').
 *
 * @backend_implementation
 * The backend will derive the table name from the group ID/slug.
 * The convention is `lookup_<safe_slug>`, where `safe_slug` is a sanitized version of the group slug.
 */
function tableNameFor(groupId: string | null) {
  return `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
}

/**
 * (Internal Helper) Normalize a database row to the frontend's expected shape.
 * @param {any} r - The raw database row.
 * @returns {any} The normalized row in `{ id, columns: { ... } }` format.
 *
 * @backend_implementation
 * The backend API should ideally return data in this normalized format.
 * If the backend returns flat rows from the table, the client-side service is responsible for this transformation.
 * The original Supabase service performed this normalization client-side.
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
 * Retrieve a single item by its ID from a group's table.
 * @param {string | null} groupId - The ID of the group.
 * @param {any} itemId - The ID of the item to retrieve.
 * @returns {Promise<any>} The normalized item object `{ id, columns }` or `undefined` if not found.
 *
 * @backend_implementation
 * This function should perform a `SELECT` on the group-specific table, filtering by the primary key (`id`).
 * Original Supabase/PostgREST URL: `/rest/v1/lookup_my_group?id=eq.{itemId}`
 */
export async function getItem(groupId: string | null, itemId: any) {
  await delay();
  const table = db[tableNameFor(groupId)] || [];
  const row = table.find((r: any) => String(r.id) === String(itemId));
  return normalizeRow(row);
}

/**
 * Find items by an exact `code` value. Used for uniqueness checks.
 * @param {string | null} groupId - The ID of the group.
 * @param {any} code - The code value to search for.
 * @returns {Promise<Array<any>>} An array of normalized item objects.
 *
 * @backend_implementation
 * This function should query the group-specific table for rows with an exact match on the `code` column.
 * It should be optimized to be fast, as it's used for UI validation.
 * Original Supabase/PostgREST URL: `/rest/v1/lookup_my_group?code=eq.{code}&limit=1`
 */
export async function findItemsByCode(groupId: string | null, code: any) {
  await delay();
  if (!groupId) return [];
  const table = db[tableNameFor(groupId)] || [];
  const rows = table.filter((r: any) => String(r.code) === String(code));
  return rows.map((row: any) => normalizeRow(row));
}

/**
 * Create a new item in a group's table.
 * @param {string | null} groupId - The ID of the group.
 * @param {any} item - The item data to insert. Can be a flat object or in `{ columns: {...} }` format.
 * @returns {Promise<any>} The created item, normalized to `{ id, columns }` format.
 *
 * @backend_implementation
 * This function should perform an `INSERT` into the group-specific table.
 * The payload should be the flat object corresponding to the table's columns.
 * The API should return the newly created row.
 * Original Supabase/PostgREST URL: `POST /rest/v1/lookup_my_group`
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
 * Update an existing item in a group's table.
 * @param {string | null} groupId - The ID of the group.
 * @param {any} itemId - The ID of the item to update.
 * @param {any} updates - An object with the fields to update.
 * @returns {Promise<any|null>} The updated item, normalized, or `null` if not found.
 *
 * @backend_implementation
 * This function should perform an `UPDATE` (or `PATCH`) on the group-specific table, filtering by `id`.
 * The payload should be a flat object of the columns to be changed.
 * Original Supabase/PostgREST URL: `PATCH /rest/v1/lookup_my_group?id=eq.{itemId}`
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
 * Delete an item from a group's table.
 * @param {string | null} groupId - The ID of the group.
 * @param {any} itemId - The ID of the item to delete.
 * @returns {Promise<any|null>} The deleted item, normalized, or `null` if not found.
 *
 * @backend_implementation
 * This function should perform a `DELETE` from the group-specific table, filtering by `id`.
 * Original Supabase/PostgREST URL: `DELETE /rest/v1/lookup_my_group?id=eq.{itemId}`
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
 * Get column metadata for a group's table.
 * @param {string | null} groupSlug - The slug of the group.
 * @returns {Promise<Array<any>>} An array of `{ column_name, data_type }` objects.
 *
 * @backend_implementation
 * This function should provide the schema of a given lookup table.
 * The original implementation first tried to query `information_schema.columns`.
 * As a fallback, it read the `columns_schema` JSON from the group's record in the `lookup_groups` table.
 * A robust backend might expose a dedicated endpoint for this.
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
 * Ensures a backing table exists for the group. Called after group creation/update.
 * @param {any} group - The group object, containing slug and schema information.
 * @returns {Promise<any>} A promise that resolves when the operation is complete.
 *
 * @backend_implementation
 * This function should trigger a backend process to create or verify a database table for the lookup group.
 * It is idempotent. If the table already exists, it does nothing.
 * The original implementation used a Supabase RPC function `ensure_lookup_table` that took `p_slug`, `p_columns`, and `p_code_format` as parameters.
 * This allows for dynamic table creation based on the schema provided by the user.
 */
export async function ensureTableForGroup(group: any) {
  await delay();
  const tname = tableNameFor(
    group && (group.slug || group.id) ? group.slug || group.id : null,
  );
  if (!db[tname]) db[tname] = [];
  return { ok: true };
}
