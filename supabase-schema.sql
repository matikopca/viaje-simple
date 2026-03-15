-- Schema for ViajeSimple Itinerary App (with Countries / País)
-- Idempotente: se puede ejecutar varias veces sin error.

-- Countries table (País)
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Days table
CREATE TABLE IF NOT EXISTS days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  title TEXT NOT NULL,
  transport JSONB,
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID REFERENCES days(id) ON DELETE CASCADE,
  place TEXT NOT NULL,
  description TEXT[] DEFAULT '{}',
  map_url TEXT,
  duration TEXT,
  price_usd DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies (drop si existen para evitar duplicados)
DROP POLICY IF EXISTS "Allow public access to countries" ON countries;
CREATE POLICY "Allow public access to countries" ON countries
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to days" ON days;
CREATE POLICY "Allow public access to days" ON days
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access to activities" ON activities;
CREATE POLICY "Allow public access to activities" ON activities
  FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_countries_sort_order ON countries(sort_order);
CREATE INDEX IF NOT EXISTS idx_days_country_id ON days(country_id);
CREATE INDEX IF NOT EXISTS idx_days_day ON days(day);
CREATE INDEX IF NOT EXISTS idx_activities_day_id ON activities(day_id);
CREATE INDEX IF NOT EXISTS idx_activities_sort_order ON activities(sort_order);

-- Función y triggers updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS countries_updated_at ON countries;
CREATE TRIGGER countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS days_updated_at ON days;
CREATE TRIGGER days_updated_at
  BEFORE UPDATE ON days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS activities_updated_at ON activities;
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
