-- Migration: Add countries (País) to ViajeSimple
-- Run this in Supabase SQL Editor if you already have days/activities tables.

-- 1. Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add country_id to days (nullable first for backfill)
ALTER TABLE days ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id) ON DELETE CASCADE;

-- 3. Create default country and assign existing days to it
INSERT INTO countries (id, name, sort_order)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tailandia', 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

UPDATE days SET country_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' WHERE country_id IS NULL;

-- 4. Make country_id required
ALTER TABLE days ALTER COLUMN country_id SET NOT NULL;

-- 5. RLS and policy for countries
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access to countries" ON countries
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Index and trigger for countries
CREATE INDEX IF NOT EXISTS idx_countries_sort_order ON countries(sort_order);
CREATE INDEX IF NOT EXISTS idx_days_country_id ON days(country_id);

CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
