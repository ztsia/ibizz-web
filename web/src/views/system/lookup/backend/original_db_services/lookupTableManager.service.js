import http from './http.client.js';
/* global URLSearchParams */

/**
 * lookupTableManager.service.js
 * Scaffold for managing lookup items per group with Plan B fallback support.
 * Exposes: listItems, getItem, createItem, updateItem, deleteItem, ensureTableForGroup
 */

/**
 * List items for a group with optional pagination/filter opts
 * @param {string} groupId
 * @param {object} [opts] { page, perPage, q }
 */
export async function listItems(groupId, opts = {}) {
  // Use limit/offset pagination so we only fetch the needed records from the DB.
  // opts: { page, perPage, q }
  const page = Math.max(1, Number(opts.page) || 1);
  const perPage = Math.max(1, Number(opts.perPage) || 10);
  // compute offset based on the display perPage. By default we request
  // one extra row (perPage + 1) so the caller can detect whether there are
  // strictly more than `perPage` results. If opts.extra is explicitly set
  // to false, we'll only request exactly `perPage` rows.
  const offset = (page - 1) * perPage;
  let limitToUse;
  if (opts && Object.prototype.hasOwnProperty.call(opts, 'extra')) {
    limitToUse = opts.extra ? perPage + 1 : perPage;
  } else {
    limitToUse = perPage + 1;
  }

  const params = new URLSearchParams();
  params.append('limit', String(limitToUse));
  params.append('offset', String(offset));
  // translate free-text `q` into PostgREST filters (ilike) for searchable columns.
  // We'll try to introspect the actual table columns (information_schema) so
  // we search across the real columns instead of a hard-coded list.
  let orRaw = null;
  if (opts.q) {
    const q = String(opts.q).trim();
    if (q.length > 0) {
      // default fallback fields (used if introspection fails)
      let fields = [
        'code',
        'label',
        'short_description',
        'description',
        'name',
      ];
      try {
        // attempt to get actual table columns for this group; getTableColumns
        // returns [{ column_name, data_type }, ...]
        const meta = await getTableColumns(groupId);
        if (Array.isArray(meta) && meta.length > 0) {
          // include textual-like columns (char/varchar/text) and jsonb
          fields = meta
            .filter((c) => c && c.column_name)
            .filter((c) => {
              const dt = String(c.data_type || '').toLowerCase();
              // include char/text types and json/jsonb and also numeric (we'll still ilike them)
              return (
                dt.includes('char') ||
                dt === 'text' ||
                dt === 'json' ||
                dt === 'jsonb' ||
                dt.includes('varchar') ||
                dt.includes('character') ||
                dt.includes('int') ||
                dt.includes('numeric')
              );
            })
            .map((c) => c.column_name)
            .filter((n) => !['id', 'created_at', 'updated_at'].includes(n));
        }
      } catch {
        // introspection failed; fall back to default `fields`
      }

      if (!fields || fields.length === 0) fields = ['code', 'label'];
      // escape the search term but keep literal * wildcards around it
      const safe = encodeURIComponent(q);
      const conditions = fields.map((f) => `${f}.ilike.*${safe}*`);
      orRaw = `or=(${conditions.join(',')})`;
    }
  }

  // Build query string. If we created a raw `or=` expression, append it as-is
  // so commas/parentheses remain literal for PostgREST.
  let queryStr = params.toString();
  if (orRaw) {
    // if params already has content, append with &
    queryStr = queryStr ? `${queryStr}&${orRaw}` : orRaw;
  }
  const query = queryStr ? `?${queryStr}` : '';
  // construct the per-group table name used by PostgREST
  const tableName =
    `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
  // If the caller requested a total count, ask PostgREST for count=exact and
  // return an object { items, total }. Otherwise return the legacy array.
  if (opts && opts.count) {
    const res = await http.get(`/rest/v1/${tableName}${query}`, {
      headers: { Prefer: 'count=exact' },
      returnHeaders: true,
    });
    const payload = res && res.body ? res.body : [];
    const rows = Array.isArray(payload) ? payload : payload?.items || [];
    // parse total from Content-Range header (format: "start-end/total")
    let total = null;
    try {
      const cr =
        res && res.headers
          ? res.headers['content-range'] || res.headers['Content-Range'] || null
          : null;
      if (cr) {
        const parts = String(cr).split('/');
        if (parts.length === 2) total = Number(parts[1]);
      }
    } catch {
      total = null;
    }
    // Normalize rows to { id, columns }
    const norm =
      rows && rows.length > 0 && rows[0].columns
        ? rows
        : rows.map((r) => {
            const id = r.id || r.id === 0 ? r.id : undefined;
            const columns = {};
            Object.keys(r || {}).forEach((k) => {
              if (k === 'id') return;
              columns[k] = r[k];
            });
            return { id, columns };
          });
    return { items: norm, total };
  }

  const res = await http.get(`/rest/v1/${tableName}${query}`);
  // Normalize responses so the frontend always receives items as { id, columns: { ... } }
  const rows = Array.isArray(res) ? res : res?.items || [];
  if (!rows || rows.length === 0) return rows;
  // If rows already contain a `columns` property, assume they are in expected format
  if (rows[0].columns) return rows;
  // Otherwise, transform flat rows (DB table rows) into the { id, columns } shape
  return rows.map((r) => {
    const id = r.id || r.id === 0 ? r.id : undefined;
    const columns = {};
    Object.keys(r || {}).forEach((k) => {
      if (k === 'id') return;
      columns[k] = r[k];
    });
    return { id, columns };
  });
}

export async function getItem(groupId, itemId) {
  const tableName =
    `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
  const res = await http.get(
    `/rest/v1/${tableName}?id=eq.${encodeURIComponent(itemId)}`,
  );
  // normalize single item to { id, columns }
  if (!res) return res;
  const row = Array.isArray(res) ? res[0] : res;
  if (row.columns) return row;
  const columns = {};
  Object.keys(row || {}).forEach((k) => {
    if (k === 'id') return;
    columns[k] = row[k];
  });
  return { id: row.id, columns };
}

/**
 * Find items by exact code value for a group. Returns an array of matching rows
 * normalized to { id, columns } shape. This is used for uniqueness checks.
 */
export async function findItemsByCode(groupId, code) {
  if (!groupId) return [];
  const tableName =
    `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
  const q = `?code=eq.${encodeURIComponent(String(code))}&limit=1`;
  const res = await http.get(`/rest/v1/${tableName}${q}`);
  const rows = Array.isArray(res) ? res : res?.items || [];
  if (!rows || rows.length === 0) return [];
  if (rows[0].columns) return rows;
  return rows.map((r) => {
    const id = r.id || r.id === 0 ? r.id : undefined;
    const columns = {};
    Object.keys(r || {}).forEach((k) => {
      if (k === 'id') return;
      columns[k] = r[k];
    });
    return { id, columns };
  });
}

export async function createItem(groupId, item) {
  // If the item is in { columns: {...} } shape, flatten it for DB table insertion
  const payload = item && item.columns ? item.columns : item;
  const tableName =
    `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
  const res = await http.post(`/rest/v1/${tableName}`, payload);
  // Normalize returned row to { id, columns }
  if (!res) return res;
  const row = Array.isArray(res) ? res[0] : res;
  if (row.columns) return row;
  const columns = {};
  Object.keys(row || {}).forEach((k) => {
    if (k === 'id') return;
    columns[k] = row[k];
  });
  return { id: row.id, columns };
}

export async function updateItem(groupId, itemId, updates) {
  // Flatten updates if they're provided as { columns: {...} }
  const payload = updates && updates.columns ? updates.columns : updates;
  const tableName =
    `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
  const res = await http.patch(
    `/rest/v1/${tableName}?id=eq.${encodeURIComponent(itemId)}`,
    payload,
  );
  if (!res) return res;
  const row = Array.isArray(res) ? res[0] : res;
  if (row.columns) return row;
  const columns = {};
  Object.keys(row || {}).forEach((k) => {
    if (k === 'id') return;
    columns[k] = row[k];
  });
  return { id: row.id, columns };
}

export async function deleteItem(groupId, itemId) {
  const tableName =
    `lookup_${String(groupId || '').replaceAll(/\W/g, '_')}`.toLowerCase();
  return http.delete(
    `/rest/v1/${tableName}?id=eq.${encodeURIComponent(itemId)}`,
  );
}

/**
 * Retrieve column metadata for a provisioned per-group table from the DB.
 * Returns array of { column_name, data_type } or throws if the info schema is inaccessible.
 * @param {string} groupSlug
 */
export async function getTableColumns(groupSlug) {
  if (!groupSlug) return [];
  // table name used by provisioning function: lookup_<slug>
  const tableName = `lookup_${String(groupSlug).replaceAll(/\W/g, '_')}`;
  // First try: query PostgREST information_schema.columns view for the table (if exposed)
  try {
    const params = new URLSearchParams();
    params.append('table_name', `eq.${tableName}`);
    params.append('select', 'column_name,data_type');
    const query = `?${params.toString()}`;
    const res = await http.get(`/rest/v1/information_schema.columns${query}`);
    // If we got a valid array, return it
    if (Array.isArray(res) && res.length > 0) return res;
    // fallthrough to fallback below when information_schema is not exposed or empty
  } catch {
    // ignore and try fallback below
  }

  // Fallback: read the group's columns_schema from lookup_groups table
  try {
    const q = `?slug=eq.${encodeURIComponent(groupSlug)}&select=columns_schema`;
    const grpRes = await http.get(`/rest/v1/lookup_groups${q}`);
    const row = Array.isArray(grpRes) ? grpRes[0] : grpRes;
    const cols =
      row && (row.columns_schema || row.columns)
        ? row.columns_schema || row.columns
        : [];
    if (!Array.isArray(cols)) return [];
    // Map the UI columns schema to { column_name, data_type }
    return cols.map((c) => {
      const name = c.key || c.name || c.label;
      let dt = (c.type || 'text').toLowerCase();
      if (dt === 'number' || dt === 'integer') dt = 'bigint';
      else if (dt === 'json') dt = 'jsonb';
      else dt = 'text';
      return { column_name: name, data_type: dt };
    });
  } catch {
    // give up
    return [];
  }
}

/**
 * Ensure a backing table exists for the group. This is a best-effort call: backend may respond
 * with 202 Accepted or 200 OK, or return an error if DDL provisioning is disallowed. The frontend
 * should surface 'pending_table' state and provide a retry UI when applicable.
 * @param {object} group - Group object (should include id or slug and columns_schema)
 */
export async function ensureTableForGroup(group) {
  // Use PostgREST RPC to call the DB function ensure_lookup_table
  // tolerate columns_schema being a JSON string or an object
  const cols =
    typeof group.columns_schema === 'string'
      ? JSON.parse(group.columns_schema)
      : group.columns_schema;
  // Post to the PostgREST RPC endpoint (note the /rest/v1/rpc prefix) so the request
  // is handled by PostgREST and returns appropriate headers for browser clients.
  return http.post(`/rest/v1/rpc/ensure_lookup_table`, {
    p_slug: group.slug || group.id,
    p_columns: cols,
    p_code_format: group.code_format || null,
  });
}
