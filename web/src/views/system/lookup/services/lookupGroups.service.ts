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
  return newRow;
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
  const updated = Object.assign({}, tbl[idx], updates);
  tbl.splice(idx, 1, updated);
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
