-- This script defines the static tables for the lookup module.
-- It is intended for a PostgreSQL database.

-- Enable the pgcrypto extension to generate UUIDs if not already enabled.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--
-- Table structure for table `lookup_groups`
--
-- This table stores the metadata for each lookup group.
--
DROP TABLE IF EXISTS lookup_groups CASCADE;
CREATE TABLE public.lookup_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT,
    columns_schema JSONB NOT NULL,
    code_format TEXT,
    code_regex TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category_id, slug)
);

COMMENT ON TABLE public.lookup_groups IS 'Stores metadata for each lookup group, including the schema for its dynamic data table.';

--
-- Table structure for `lookup_asset_type`
--
DROP TABLE IF EXISTS lookup_asset_type CASCADE;
CREATE TABLE public.lookup_asset_type (
    id TEXT PRIMARY KEY,
    code TEXT,
    asset_name TEXT
);

--
-- Table structure for `lookup_bank_code`
--
DROP TABLE IF EXISTS lookup_bank_code CASCADE;
CREATE TABLE public.lookup_bank_code (
    id TEXT PRIMARY KEY,
    code TEXT,
    bank_name TEXT
);

--
-- Table structure for `lookup_country_code`
--
DROP TABLE IF EXISTS lookup_country_code CASCADE;
CREATE TABLE public.lookup_country_code (
    id TEXT PRIMARY KEY,
    code TEXT,
    country_name TEXT
);

--
-- Table structure for `lookup_currency_code`
--
DROP TABLE IF EXISTS lookup_currency_code CASCADE;
CREATE TABLE public.lookup_currency_code (
    id TEXT PRIMARY KEY,
    code TEXT,
    currency_name TEXT
);

--
-- Table structure for `lookup_headers`
--
DROP TABLE IF EXISTS lookup_headers CASCADE;
CREATE TABLE public.lookup_headers (
    id TEXT PRIMARY KEY,
    value TEXT
);

--
-- Table structure for `lookup_msic_code`
--
DROP TABLE IF EXISTS lookup_msic_code CASCADE;
CREATE TABLE public.lookup_msic_code (
    id TEXT PRIMARY KEY,
    code TEXT,
    description TEXT,
    section TEXT,
    category TEXT,
    sub_category TEXT
);

--
-- Table structure for `lookup_state_code`
--
DROP TABLE IF EXISTS lookup_state_code CASCADE;
CREATE TABLE public.lookup_state_code (
    id TEXT PRIMARY KEY,
    value TEXT
);

--
-- Table structure for `lookup_type_of_interest_income`
--
DROP TABLE IF EXISTS lookup_type_of_interest_income CASCADE;
CREATE TABLE public.lookup_type_of_interest_income (
    id TEXT PRIMARY KEY,
    value TEXT
);