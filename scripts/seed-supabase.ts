/**
 * Script to seed initial data into Supabase (with countries)
 *
 * Prerequisite: Run supabase-schema.sql + migrations (columnas mañana/tarde/noche → morning/midday/afternoon en days)
 *
 * Usage:
 * 1. Create a .env.local file with your Supabase credentials
 * 2. Run: npm run seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { thailandItinerary } from "../src/app/data/thailand-itinerary";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DEFAULT_COUNTRY_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase credentials in .env.local");
  console.error("Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

type LegacyActivity = {
  place: string;
  mapUrl?: string;
  description?: string[] | string;
};

function activityToText(a: LegacyActivity): string {
  const lines: string[] = [`# ${a.place}`];
  if (a.mapUrl) lines.push(a.mapUrl);
  const d = a.description;
  if (Array.isArray(d) && d.length) lines.push(...d);
  else if (typeof d === "string" && d.trim()) lines.push(d);
  return lines.join("\n");
}

/** Reparte actividades legacy en mañana / tarde / noche. */
function activitiesToSlotDescriptions(activities: LegacyActivity[] | undefined): [string, string, string] {
  if (!activities?.length) return ["", "", ""];
  const n = activities.length;
  const end1 = Math.max(1, Math.ceil(n / 3));
  const end2 = Math.max(end1, Math.ceil((2 * n) / 3));
  const chunks = [activities.slice(0, end1), activities.slice(end1, end2), activities.slice(end2)];
  return chunks.map((c) => c.map(activityToText).join("\n\n")) as [string, string, string];
}

async function seedData() {
  console.log("🚀 Starting data seed...\n");

  console.log("🌍 Ensuring country (Tailandia)...");
  const { error: countryError } = await supabase.from("countries").upsert(
    { id: DEFAULT_COUNTRY_ID, name: "Tailandia", sort_order: 0 },
    { onConflict: "id" }
  );
  if (countryError) {
    console.error("❌ Country error (run migration first?):", countryError.message);
    process.exit(1);
  }

  console.log("🗑️  Clearing existing data...");
  await supabase.from("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("days").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("📅 Inserting days (plan por tramos)...\n");

  for (const day of thailandItinerary) {
    const [morning, midday, afternoon] = activitiesToSlotDescriptions(
      (day as { activities?: LegacyActivity[] }).activities
    );

    const dayData = {
      country_id: DEFAULT_COUNTRY_ID,
      day: day.day,
      date: day.date,
      location: day.location,
      title: day.title,
      transport: day.transport || null,
      highlights: day.highlights || [],
      morning_description: morning,
      midday_description: midday,
      afternoon_description: afternoon,
    };

    const { error: dayError } = await supabase.from("days").insert(dayData);

    if (dayError) {
      console.error(`❌ Error inserting day ${day.day}:`, dayError.message);
      continue;
    }

    console.log(`✅ Day ${day.day}: ${day.title}`);
  }

  console.log("\n✨ Seed complete!");
}

seedData().catch(console.error);
