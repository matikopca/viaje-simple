-- Tres descripciones por día (mañana / tarde / noche; columnas morning/midday/afternoon). Ejecutar en Supabase SQL.

ALTER TABLE days ADD COLUMN IF NOT EXISTS morning_description TEXT NOT NULL DEFAULT '';
ALTER TABLE days ADD COLUMN IF NOT EXISTS midday_description TEXT NOT NULL DEFAULT '';
ALTER TABLE days ADD COLUMN IF NOT EXISTS afternoon_description TEXT NOT NULL DEFAULT '';
