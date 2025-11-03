-- Migration: create RPC for deleting lookup_groups (drop backing table optional)
-- Date: 2025-10-27

CREATE OR REPLACE FUNCTION public.delete_lookup_group(
  p_group_id uuid,
  p_drop_table boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_slug text;
  v_tbl text;
  v_result jsonb;
BEGIN
  SELECT slug INTO v_slug FROM public.lookup_groups WHERE id = p_group_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'lookup_group not found: %', p_group_id;
  END IF;

  IF p_drop_table THEN
    v_tbl := 'lookup_' || regexp_replace(lower(v_slug), '[^a-z0-9]+', '_', 'g');
    EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', v_tbl);
  END IF;

  DELETE FROM public.lookup_groups WHERE id = p_group_id
  RETURNING row_to_json(public.lookup_groups.*) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

COMMENT ON FUNCTION public.delete_lookup_group(uuid,boolean) IS
  'Delete a lookup_groups row and optionally drop its lookup_<slug> table. Returns the deleted row as jsonb.';
