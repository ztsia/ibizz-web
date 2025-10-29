-- mock_lookup_samples.sql
-- Paste this into the Supabase SQL editor (Postgres) to collect the first 15 rows
-- from each table whose name starts with "lookup_" and return them as JSON.
-- The script builds a temporary table with columns (table_name, rows jsonb)
-- where `rows` is a JSON array of up to 15 row objects from that table.

CREATE TEMP TABLE IF NOT EXISTS tmp_lookup_samples (
  table_name text,
  rows jsonb
);
TRUNCATE tmp_lookup_samples;

DO $$
DECLARE
  t record;
  js jsonb;
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'lookup_%'
  LOOP
    -- Use format + EXECUTE to safely reference the table name
    EXECUTE format($f$
      SELECT jsonb_agg(row_to_json(x)) FROM (SELECT * FROM %I LIMIT 15) x
    $f$, t.tablename) INTO js;

    INSERT INTO tmp_lookup_samples(table_name, rows)
    VALUES (t.tablename, COALESCE(js, '[]'::jsonb));
  END LOOP;
END
$$;

-- Return one row per lookup table with the sampled rows as JSON
SELECT table_name, rows
FROM tmp_lookup_samples
ORDER BY table_name;

-- Optional: return as a single JSON object mapping table names to arrays
-- SELECT jsonb_object_agg(table_name, rows) FROM tmp_lookup_samples;
