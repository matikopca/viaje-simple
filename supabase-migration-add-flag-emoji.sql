-- Add flag_emoji to countries (emoji bandera; si no hay bandera usar 🌍)
ALTER TABLE countries ADD COLUMN IF NOT EXISTS flag_emoji TEXT DEFAULT '🌍';
UPDATE countries SET flag_emoji = '🌍' WHERE flag_emoji IS NULL;
