-- Schema for ViajeSimple Itinerary App
-- Run this in Supabase SQL Editor

-- Days table
CREATE TABLE days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TABLE activities (
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

-- Enable Row Level Security (optional but recommended)
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (for demo purposes - adjust for production)
CREATE POLICY "Allow public access to days" ON days
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to activities" ON activities
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_activities_day_id ON activities(day_id);
CREATE INDEX idx_activities_sort_order ON activities(sort_order);
CREATE INDEX idx_days_day ON days(day);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER days_updated_at
  BEFORE UPDATE ON days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
