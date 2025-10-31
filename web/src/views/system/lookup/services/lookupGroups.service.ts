import { db, delay, genId } from './mock_db';

/**
 * List lookup groups.
 * Inputs:
 *  - categoryId: when provided, only groups with matching `category_id` are returned.
 * Outputs: Promise<Array<any>> - shallow copy of matching group objects.
 * Behavior: returns all groups when `categoryId` is falsy. Uses in-memory `lookup_groups` table.
 */
export async function listGroups(categoryId: string) {
  await delay();
  const tbl = db.lookup_groups || [];
  if (!categoryId) return [...tbl];
  return tbl.filter((g: any) => String(g.category_id) === String(categoryId));
}

/**
 * Get a single lookup group by category and slug.
 * Inputs:
 *  - categoryId: id of the category the group belongs to
 *  - slug: group slug to match
 * Outputs: Promise<object|null> - the matched group object, or null if not found.
 * Behavior: Exact match on both `category_id` and `slug` (stringified for robustness).
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
 * Create a new lookup group.
 * Inputs: group object (may omit `id`)
 * Outputs: Promise<object> - the newly created row (with `id` assigned if missing).
 * Behavior: shallow-copies provided object, assigns an id when absent, appends to `lookup_groups`.
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
 * Create an in-memory lookup table representation for the provided slug.
 * - Sanitizes the slug into a safe table name: `lookup_<slug_safe>`
 * - Ensures `db[tableName]` exists (an array of rows)
 * - Stores the provided columns schema & code_format in
 *   `db.lookup_table_schemas[tableName]` for consumers to inspect.
 *
 * This is intentionally best-effort and idempotent.
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
 * Inputs:
 *  - id: id of the group to update
 *  - updates: partial object with fields to replace/merge
 * Outputs: Promise<object|null> - updated row, or null if the id was not found.
 * Behavior: merges existing row with updates (shallow) and replaces it in-place.
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
      db[oldTable] = undefined;
    }
    // update slug in the existing metadata row (will be persisted below)
    existing.slug = newSlug;
  }

  // Prepare resulting columns/code_format for ensure step
  let v_cols = existing.columns_schema;
  let v_code_fmt = existing.code_format;
  if (updates && updates.columns_schema !== undefined)
    v_cols = updates.columns_schema;
  if (updates && updates.code_format !== undefined)
    v_code_fmt = updates.code_format;

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
    // Only set code_regex when caller explicitly requests it via set_code_regex flag
    code_regex:
      updates && updates.set_code_regex
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
 * Delete a lookup group by id.
 * Inputs: id string
 * Outputs: Promise<object|null> - removed row if found, otherwise null.
 * Behavior: mutates the in-memory `lookup_groups` table by splicing out the item.
 */
export async function deleteGroup(id: string) {
  await delay();
  const tbl = db.lookup_groups || [];
  const idx = tbl.findIndex((r: any) => String(r.id) === String(id));
  if (idx === -1) return null;
  const removed = tbl.splice(idx, 1)[0];
  return removed;
}
