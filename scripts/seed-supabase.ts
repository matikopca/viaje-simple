/**
 * Script to seed initial data into Supabase (with countries)
 *
 * Prerequisite: Run supabase-schema.sql or supabase-migration-add-countries.sql
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

async function seedData() {
  console.log("🚀 Starting data seed...\n");

  // Ensure default country exists
  console.log("🌍 Ensuring country (Tailandia)...");
  const { error: countryError } = await supabase.from("countries").upsert(
    { id: DEFAULT_COUNTRY_ID, name: "Tailandia", sort_order: 0 },
    { onConflict: "id" }
  );
  if (countryError) {
    console.error("❌ Country error (run migration first?):", countryError.message);
    process.exit(1);
  }

  // Clear existing data (activities first due to FK, then days)
  console.log("🗑️  Clearing existing data...");
  await supabase.from("activities").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("days").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("📅 Inserting days and activities...\n");

  for (const day of thailandItinerary) {
    const dayData = {
      country_id: DEFAULT_COUNTRY_ID,
      day: day.day,
      date: day.date,
      location: day.location,
      title: day.title,
      transport: day.transport || null,
      highlights: day.highlights || [],
    };

    const { data: insertedDay, error: dayError } = await supabase
      .from("days")
      .insert(dayData)
      .select()
      .single();

    if (dayError) {
      console.error(`❌ Error inserting day ${day.day}:`, dayError.message);
      continue;
    }

    console.log(`✅ Day ${day.day}: ${day.title}`);

    if (day.activities && day.activities.length > 0) {
      const activitiesData = day.activities.map((activity, index) => {
        const desc = (activity as Record<string, unknown>).description;
        return {
          day_id: insertedDay.id,
          place: activity.place,
          description: Array.isArray(desc) ? desc : desc ? [desc] : [],
          map_url: activity.mapUrl || null,
          duration: (activity as Record<string, unknown>).duration as string | null || null,
          price_usd: (activity as Record<string, unknown>).priceUSD as number | null || null,
          sort_order: index,
        };
      });

      const { error: activitiesError } = await supabase.from("activities").insert(activitiesData);

      if (activitiesError) {
        console.error(`   ❌ Error inserting activities:`, activitiesError.message);
      } else {
        console.log(`   📍 ${activitiesData.length} activities added`);
      }
    }
  }

  console.log("\n✨ Seed complete!");
}

seedData().catch(console.error);
