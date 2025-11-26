/**
 * @file Mock implementation for lookup group services.
 * @summary This file provides an in-memory mock of the backend services for managing lookup groups.
 * It is intended for frontend development and testing purposes.
 * The comments below describe the expected behavior of the real backend API that will replace this mock.
 * The original implementation used Supabase with a `lookup_groups` table and several RPC functions.
 */

import { db, delay, genId } from './';

/**
 * List lookup groups for a specific category.
 * @param {string} categoryId - The ID/slug of the category to filter by.
 * @returns {Promise<Array<any>>} A promise that resolves to an array of group objects.
 *
 * @endpoint GET /api/lookup/groups?category_id={categoryId}
 * @backend_implementation
 * Query `lookup_tables` collection.
 * Filter by `metadata.category_id` if provided.
 * Project `metadata` field.
 * See `migration_guide.md` for details.
 */
export async function listGroups(categoryId: string) {
  await delay();
  const tbl = db.lookup_groups || [];
  if (!categoryId) return [...tbl]; // If no categoryId, return all groups
  return tbl.filter((g: any) => String(g.category_id) === String(categoryId));
}

/**
 * Get a single lookup group by its category and slug.
 * @param {string} categoryId - The ID of the category the group belongs to.
 * @param {string} slug - The unique slug of the group.
 * @returns {Promise<object|null>} A promise that resolves to the matched group object, or null if not found.
 *
 * @endpoint GET /api/lookup/groups/:slug
 * @backend_implementation
 * Query `lookup_tables` collection.
 * Find one document where `slug` matches.
 * Return `metadata` only (exclude `rows`).
 */
export async function getGroup(categoryId: string, slug: string) {
  await delay();
  const tbl = db.lookup_groups || [];
  return (
    tbl.find(
      (g: any) =>
        String(g.category_id) === String(categoryId) &&
        String(g.slug) === String(slug),
    ) || null
  );
}

/**
 * Create a new lookup group and its associated data table.
 * @param {any} group - The group data to create.
 * @returns {Promise<object>} A promise that resolves to the newly created group object.
 *
 * @endpoint POST /api/lookup/groups
 * @backend_implementation
 * Insert new document into `lookup_tables`.
 * Structure: `{ slug, metadata: group, rows: [] }`.
 */
export async function createGroup(group: any) {
  await delay();
  const tbl = db.lookup_groups || (db.lookup_groups = []);
  const newRow = Object.assign({}, group);
  if (!newRow.id) newRow.id = genId();
  tbl.push(newRow);
  // Provision a backing lookup table for this group in the mock DB.
  // This mirrors the behavior of the PostgREST RPC `ensure_lookup_table`
  // used in production: create a table named `lookup_<slug_safe>` and
  // record the column schema so the mock `lookupTableManager` can use it.
  try {
    ensureLookupTableForGroup(newRow.slug);
  } catch (error) {
    // best-effort in the mock environment; log for visibility but don't fail
    // the createGroup call in tests/dev iterations.

    console.error('Failed to provision lookup table for group', error);
  }
  return newRow;
}

/**
 * (Internal mock helper) Create an in-memory lookup table representation for the provided slug.
 */
function ensureLookupTableForGroup(slug: string) {
  const raw = String(slug ?? '');
  // sanitize similar to the SQL function: lowercase, replace non-alphanum with _
  const safe =
    raw
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '_')
      .replaceAll(/^_+|_+$/g, '') || String(genId());
  const tableName = `lookup_${safe}`;
  // ensure table array exists
  if (!db[tableName]) db[tableName] = [];
  // In this mock we don't maintain a separate schema registry; the group's
  // `columns_schema` is authoritative and stored in `db.lookup_groups`. Only
  // ensure the backing table array exists so items can be inserted.
  return tableName;
}

/**
 * Update an existing lookup group.
 * @param {string} id - The UUID of the group to update.
 * @param {any} updates - An object containing the fields to update.
 * @returns {Promise<object|null>} A promise that resolves to the updated group object, or null if not found.
 *
 * @endpoint PUT /api/lookup/groups/:slug
 * @backend_implementation
 * Update document in `lookup_tables` where `metadata.id` matches.
 * Update fields within `metadata` object.
 */
export async function updateGroup(id: string, updates: any) {
  await delay();
  const tbl = db.lookup_groups || [];
  const idx = tbl.findIndex((r: any) => String(r.id) === String(id));
  if (idx === -1) return null;

  const existing = tbl[idx];

  // compute new slug: prefer explicit slug, else derive from provided title, else keep existing
  const deriveSafe = (raw: string) =>
    String(raw || '')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '_')
      .replaceAll(/_+/g, '_')
      .replaceAll(/^_+|_+$/g, '');

  const newSlug = existing.slug;

  const oldSlug = existing.slug;
  const oldTable = `lookup_${deriveSafe(oldSlug)}`;
  const newTable = `lookup_${deriveSafe(newSlug)}`;

  // If slug changed, rename backing table in the mock DB (move array)
  if (oldSlug !== newSlug) {
    if (db[oldTable]) {
      // rename by moving the array value
      db[newTable] = db[oldTable];
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete db[oldTable];
    }
    // update slug in the existing metadata row (will be persisted below)
    existing.slug = newSlug;
  }

  // Prepare resulting columns/code_format for ensure step

  // Persist metadata updates (apply partial updates similar to SQL)
  const updated = Object.assign({}, existing, {
    title:
      updates && updates.title !== undefined ? updates.title : existing.title,
    short_description:
      updates && updates.short_description !== undefined
        ? updates.short_description
        : existing.short_description,
    slug: newSlug || existing.slug,
    columns_schema:
      updates && updates.columns_schema !== undefined
        ? updates.columns_schema
        : existing.columns_schema,
    code_format:
      updates && updates.code_format !== undefined
        ? updates.code_format
        : existing.code_format,
    code_regex:
      updates && updates.code_regex !== undefined
        ? updates.code_regex
        : existing.code_regex,
    updated_at: new Date().toISOString(),
  });

  // Replace row in table
  tbl.splice(idx, 1, updated);

  // Ensure backing table exists for new slug
  if (!db[newTable]) db[newTable] = [];

  // If new columns schema provided, ensure table is empty before allowing schema change
  if (updates && updates.columns_schema !== undefined) {
    const count = (db[newTable] || []).length;
    if (count > 0) {
      // Mirror DB behavior by throwing an error when table contains data
      throw new Error(
        `Cannot modify schema of ${newTable} because it contains data`,
      );
    }
    // table is empty: no structural changes needed for mock; metadata already updated
  }

  return updated;
}

/**
 * Delete a lookup group and its associated data table.
 * @param {string} id - The UUID of the group to delete.
 * @returns {Promise<object|null>} A promise that resolves to the removed group object, or null if not found.
 *
 * @endpoint DELETE /api/lookup/groups/:slug
 * @backend_implementation
 * Delete document from `lookup_tables` where `metadata.id` matches.
 */
export async function deleteGroup(id: string) {
  await delay();
  const tbl = db.lookup_groups || [];
  const idx = tbl.findIndex((r: any) => String(r.id) === String(id));
  if (idx === -1) return null;
  const removed = tbl.splice(idx, 1)[0];
  return removed;
}

/**
 * Find a single lookup group by its slug.
 * @param {string} slug - The unique slug of the group.
 * @returns {Promise<object|null>} A promise that resolves to the matched group object, or null if not found.
 */
export async function findGroupBySlug(slug: string) {
  await delay();
  const tbl = db.lookup_groups || [];
  return tbl.find((g: any) => String(g.slug) === String(slug)) || null;
}
