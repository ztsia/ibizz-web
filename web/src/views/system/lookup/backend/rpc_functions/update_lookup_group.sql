-- Migration: update_lookup_group with schema sync
-- Date: 2025-10-29

CREATE OR REPLACE FUNCTION public.update_lookup_group(
  p_group_id uuid,
  p_title text DEFAULT NULL,
  p_short_description text DEFAULT NULL,
  p_slug text DEFAULT NULL,
  p_columns jsonb DEFAULT NULL,
  p_code_format text DEFAULT NULL,
  p_code_regex text DEFAULT NULL,
  p_set_code_regex boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_old_slug text;
  v_new_slug text;
  v_old_tbl text;
  v_new_tbl text;
  v_result jsonb;
  v_cols jsonb;
  v_code_fmt text;
  v_count bigint;
  col jsonb;
  col_name text;
  col_type text;
BEGIN
  -- Fetch current slug
  SELECT slug INTO v_old_slug FROM public.lookup_groups WHERE id = p_group_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'lookup_group not found: %', p_group_id;
  END IF;

  -- Compute new slug
  IF p_slug IS NOT NULL THEN
    v_new_slug := lower(regexp_replace(regexp_replace(regexp_replace(p_slug, '[^a-z0-9]+', '_', 'g'),'_+', '_', 'g'),'(^_+)|(_+$)', '', 'g'));
  ELSIF p_title IS NOT NULL THEN
    v_new_slug := lower(regexp_replace(regexp_replace(regexp_replace(p_title, '[^a-z0-9]+', '_', 'g'),'_+', '_', 'g'),'(^_+)|(_+$)', '', 'g'));
  ELSE
    v_new_slug := v_old_slug;
  END IF;

  -- Prepare columns/code_format
  SELECT columns_schema, code_format INTO v_cols, v_code_fmt FROM public.lookup_groups WHERE id = p_group_id;
  IF p_columns IS NOT NULL THEN v_cols := p_columns; END IF;
  IF p_code_format IS NOT NULL THEN v_code_fmt := p_code_format; END IF;

  -- Rename table if slug changed
  IF v_old_slug IS DISTINCT FROM v_new_slug THEN
    v_old_tbl := 'lookup_' || regexp_replace(lower(v_old_slug), '[^a-z0-9]+', '_', 'g');
    v_new_tbl := 'lookup_' || regexp_replace(lower(v_new_slug), '[^a-z0-9]+', '_', 'g');
    EXECUTE format('ALTER TABLE IF EXISTS public.%I RENAME TO %I', v_old_tbl, v_new_tbl);
    UPDATE public.lookup_groups SET slug = v_new_slug WHERE id = p_group_id;
  ELSE
    v_new_tbl := 'lookup_' || regexp_replace(lower(v_new_slug), '[^a-z0-9]+', '_', 'g');
  END IF;

  -- Update metadata row
  UPDATE public.lookup_groups
  SET
    title = COALESCE(p_title, title),
    short_description = COALESCE(p_short_description, short_description),
    slug = COALESCE(v_new_slug, slug),
    columns_schema = CASE WHEN p_columns IS NOT NULL THEN p_columns ELSE columns_schema END,
    code_format = CASE WHEN p_code_format IS NOT NULL THEN p_code_format ELSE code_format END,
    code_regex = CASE WHEN p_set_code_regex THEN p_code_regex ELSE code_regex END,
    updated_at = NOW()
  WHERE id = p_group_id;

  -- Ensure table exists
  PERFORM public.ensure_lookup_table(v_new_slug, v_cols, v_code_fmt);

  -- If new columns schema provided, attempt to sync physical table
  IF p_columns IS NOT NULL THEN
    EXECUTE format('SELECT count(*) FROM public.%I', v_new_tbl) INTO v_count;
    IF v_count > 0 THEN
      RAISE EXCEPTION 'Cannot modify schema of % because it contains data', v_new_tbl;
    END IF;

    -- Table is empty, safe to add missing columns
    FOR col IN SELECT * FROM jsonb_array_elements(v_cols) LOOP
      col_name := col->>'key';
      IF col_name IS NULL THEN CONTINUE; END IF;
      col_type := lower(coalesce(col->>'type','text'));
      IF col_type = 'number' THEN
        col_type := 'bigint';
      ELSIF col_type = 'integer' THEN
        col_type := 'integer';
      ELSIF col_type = 'json' THEN
        col_type := 'jsonb';
      ELSE
        col_type := 'text';
      END IF;

      -- Add column if missing
      PERFORM 1 FROM information_schema.columns
       WHERE table_schema='public' AND table_name=v_new_tbl AND column_name=col_name;
      IF NOT FOUND THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', v_new_tbl, col_name, col_type);
      END IF;
    END LOOP;
  END IF;

  -- Return updated row
  SELECT row_to_json(t) INTO v_result FROM (SELECT * FROM public.lookup_groups WHERE id = p_group_id) t;
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.update_lookup_group(uuid,text,text,text,jsonb,text,text,boolean) IS
  'Update a lookup_groups row, optionally rename backing lookup_<slug> table, ensure table exists, and if new schema provided, alter table (only if empty). Returns updated row as jsonb.';
