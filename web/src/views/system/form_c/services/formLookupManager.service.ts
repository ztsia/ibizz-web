/**
 * @file Mock implementation for managing items within form-specific lookup tables.
 * @summary
 * This module provides CRUD operations for form lookup tables, which are stored
 * separately from generic system lookups in form_lookup_data.json.
 *
 * Backend implementation notes:
 * - Form lookup tables should be stored in a separate collection (form_lookup_tables)
 * - This ensures isolation from generic system lookups
 * - The data structure mirrors the format in lookup_data.json
 */

import formLookupData from './mock_data/form_lookup_data.json';
import { delay, genId } from '../../services';

// In-memory store initialized from JSON
const db: Record<string, any[]> = {};

/**
 * Initialize the in-memory DB from the JSON file
 */
function initializeDB() {
    if (Object.keys(db).length > 0) return; // Already initialized

    formLookupData.forEach((group: any) => {
        const tableName = tableNameFor(group.slug);
        db[tableName] = group.rows || [];
    });
}

/**
 * tableNameFor()
 *
 * Derive the table name for a form lookup group.
 * Form lookups use a consistent naming scheme to ensure isolation.
 */
function tableNameFor(groupId: string | null) {
    return `form_lookup_${String(groupId || '').replaceAll(/\\W/g, '_')}`.toLowerCase();
}

/**
 * normalizeRow()
 *
 * Convert a flat database row to the normalized `{ id, columns }` shape.
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
 * List items for a given form lookup group.
 *
 * @endpoint GET /api/form-lookup/data/:slug
 * @backend_implementation
 * Query `form_lookup_tables` collection.
 */
export async function listItems(groupId: string | null, opts: any = {}) {
    initializeDB();
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
 * Get a single item by ID.
 */
export async function getItem(groupId: string | null, itemId: any) {
    initializeDB();
    await delay();
    const table = db[tableNameFor(groupId)] || [];
    const row = table.find((r: any) => String(r.id) === String(itemId));
    return normalizeRow(row);
}

/**
 * Get multiple items by IDs.
 */
export async function getItems(groupId: string | null, itemIds: any[]) {
    initializeDB();
    await delay();
    const table = db[tableNameFor(groupId)] || [];
    const rows = table.filter((r: any) =>
        itemIds.some((id) => String(id) === String(r.id)),
    );
    return rows.map((row: any) => normalizeRow(row));
}

/**
 * Find items by code column.
 */
export async function findItemsByCode(groupId: string | null, code: any) {
    initializeDB();
    await delay();
    if (!groupId) return [];
    const table = db[tableNameFor(groupId)] || [];
    const rows = table.filter((r: any) => String(r.code) === String(code));
    return rows.map((row: any) => normalizeRow(row));
}

/**
 * Create a new item.
 *
 * @endpoint POST /api/form-lookup/data/:slug
 */
export async function createItem(groupId: string | null, item: any) {
    initializeDB();
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
 * Update an existing item.
 *
 * @endpoint PUT /api/form-lookup/data/:slug/row/:rowId
 */
export async function updateItem(
    groupId: string | null,
    itemId: any,
    updates: any,
) {
    initializeDB();
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
 * Delete a single item.
 */
export async function deleteItem(groupId: string | null, itemId: any) {
    initializeDB();
    await delay();
    const table = db[tableNameFor(groupId)] || [];
    const idx = table.findIndex((r: any) => String(r.id) === String(itemId));
    if (idx === -1) return null;
    const removed = table.splice(idx, 1)[0];
    return normalizeRow(removed);
}

/**
 * Delete multiple items.
 */
export async function deleteItems(groupId: string | null, itemIds: any[]) {
    initializeDB();
    await delay();
    const table = db[tableNameFor(groupId)] || [];
    if (!itemIds || itemIds.length === 0) return 0;

    const initialLength = table.length;
    const newTable = table.filter(
        (r: any) => !itemIds.some((id) => String(id) === String(r.id)),
    );

    db[tableNameFor(groupId)] = newTable;
    return initialLength - newTable.length;
}

/**
 * Get table columns metadata.
 * This reads from the form_lookup_data.json schema.
 */
export async function getTableColumns(groupSlug: string | null) {
    await delay();
    if (!groupSlug) return [];
    const group = formLookupData.find((x: any) => String(x.slug) === String(groupSlug));
    if (!group) return [];
    const cols = (group as any).columns_schema || (group as any).columns || [];
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
 * Ensure table exists for a group.
 */
export async function ensureTableForGroup(group: any) {
    initializeDB();
    await delay();
    const tname = tableNameFor(
        group && (group.slug || group.id) ? group.slug || group.id : null,
    );
    if (!db[tname]) db[tname] = [];
    return { ok: true };
}
