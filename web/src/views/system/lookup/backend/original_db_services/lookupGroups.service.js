import http from './http.client.js';

/**
 * Lookup Groups Data Access Object
 * Provides CRUD operations for lookup_groups table
 */

/**
 * List all lookup groups for a category
 * @param {string} categoryId - Category slug/id
 * @returns {Promise<Array>} Array of lookup groups
 */
export async function listGroups(categoryId) {
  // PostgREST expects filter operators like `eq.` for exact matches
  // Request groups ordered by title ascending so UI tabs render alphabetically
  return http.get(
    `/rest/v1/lookup_groups?category_id=eq.${encodeURIComponent(categoryId)}&order=title.asc`,
  );
}

/**
 * Get a single lookup group by category and slug
 * @param {string} categoryId - Category slug/id
 * @param {string} slug - Group slug
 * @returns {Promise<object|null>} Lookup group or null if not found
 */
export async function getGroup(categoryId, slug) {
  // Query by category_id and slug using PostgREST filter syntax and return the first match
  const res = await http.get(
    `/rest/v1/lookup_groups?category_id=eq.${encodeURIComponent(categoryId)}&slug=eq.${encodeURIComponent(slug)}`,
  );
  if (Array.isArray(res)) return res[0] || null;
  return null;
}

/**
 * Create a new lookup group
 * @param {object} group - Group data
 * @param {string} group.category_id - Category slug/id
 * @param {string} group.slug - Group slug
 * @param {string} group.title - Display title
 * @param {string} group.short_description - Short description
 * @param {object} group.columns_schema - Column schema (array of columns). May omit a 'code' column if not desired.
 * @param {string} [group.code_format] - Code format (regex or preset). If omitted/null, no code column will be provisioned.
 * @returns {Promise<object>} Created lookup group
 */
export async function createGroup(group) {
  // Ask PostgREST to return the created representation so the frontend can use it
  const res = await http.post(
    '/rest/v1/lookup_groups',
    {
      category_id: group.category_id,
      slug: group.slug,
      title: group.title,
      short_description: group.short_description,
      columns_schema: group.columns_schema,
      code_format: group.code_format || null,
      code_regex: group.code_regex || null,
    },
    { headers: { Prefer: 'return=representation' } },
  );

  // PostgREST may return an array of rows or a single object depending on config
  if (Array.isArray(res)) return res[0] || null;
  return res;
}

/**
 * Update an existing lookup group
 * @param {string} id - Group UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated lookup group
 */
export async function updateGroup(id, updates) {
  // Use RPC to update group and ensure backing table exists. The RPC accepts
  // named parameters; include p_set_code_regex when updates.code_regex is provided.
  const body = {
    p_group_id: id,
    p_title: updates.title ?? null,
    p_short_description: updates.short_description ?? null,
    p_columns: updates.columns_schema ?? null,
    p_code_format: updates.code_format ?? null,
    p_code_regex: updates.code_regex ?? null,
    p_set_code_regex: Object.prototype.hasOwnProperty.call(
      updates,
      'code_regex',
    ),
  };
  return http.post('/rest/v1/rpc/update_lookup_group', body);
}

/**
 * Delete a lookup group
 * @param {string} id - Group UUID
 * @returns {Promise<void>}
 */
export async function deleteGroup(id) {
  // Call RPC to delete the group and drop backing table by default
  const body = { p_group_id: id, p_drop_table: true };
  return http.post('/rest/v1/rpc/delete_lookup_group', body);
}
