-- Create a helper function to provision lookup tables for groups.
-- The function will create a table named lookup_<slug_safe> if it does not exist,
-- using the provided JSON columns schema. This is intended to be called via PostgREST RPC
-- endpoint: POST /rpc/ensure_lookup_table

CREATE OR REPLACE FUNCTION public.ensure_lookup_table(
  p_slug text,
  p_columns jsonb,
  p_code_format text DEFAULT NULL
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  tbl text;
  col jsonb;
  cols_sql text := '';
  col_name text;
  col_type text;
  first boolean := true;
BEGIN
  IF p_slug IS NULL OR length(p_slug) = 0 THEN
    RAISE EXCEPTION 'slug required';
  END IF;

  -- sanitize slug into a safe identifier (replace non-word chars with underscore)
  tbl := 'lookup_' || regexp_replace(lower(p_slug), '[^a-z0-9]+', '_', 'g');

  -- Build column definitions. Always include an id primary key.
  cols_sql := 'id bigserial primary key';

  IF p_columns IS NOT NULL THEN
    FOR col IN SELECT * FROM jsonb_array_elements(p_columns) LOOP
      col_name := coalesce((col->>'key'), (col->>'label'));
      IF col_name IS NULL THEN
        CONTINUE;
      END IF;
      -- map basic types; default to text
      col_type := lower(coalesce(col->>'type','text'));
      -- If this column is the special 'code' column, prefer the group's
      -- requested code format when deciding the SQL type. Numeric codes
      -- should be bigint; alphabetic/alphanumeric codes should be text.
      IF (col_name = 'code') THEN
        IF p_code_format IS NOT NULL AND lower(p_code_format) = 'numeric' THEN
          col_type := 'bigint';
        ELSE
          -- default to text for alphabetic/alphanumeric or when unspecified
          col_type := 'text';
        END IF;
      ELSE
        IF col_type = 'number' THEN
          col_type := 'bigint';
        ELSIF col_type = 'integer' THEN
          col_type := 'integer';
        ELSIF col_type = 'json' THEN
          col_type := 'jsonb';
        ELSE
          col_type := 'text';
        END IF;
      END IF;
      -- use quote_ident to avoid SQL injection on identifiers
      cols_sql := cols_sql || ', ' || quote_ident(col_name) || ' ' || col_type;
    END LOOP;
  END IF;

  -- If a numeric code is desired, ensure a numeric code column exists (named code)
  IF p_code_format IS NOT NULL THEN
    IF position(' code ' in cols_sql) = 0 THEN
      IF lower(p_code_format) = 'numeric' THEN
        cols_sql := cols_sql || ', code bigint';
      ELSE
        -- alphabetic / alphanumeric -> text column
        cols_sql := cols_sql || ', code text';
      END IF;
    END IF;
  END IF;

  -- create table if not exists
  EXECUTE format('CREATE TABLE IF NOT EXISTS public.%I (%s)', tbl, cols_sql);

  RETURN tbl;
END;
$$;

COMMENT ON FUNCTION public.ensure_lookup_table(text,jsonb,text) IS 'Create a lookup_<slug> table from a JSON columns schema. Returns the table name.';
