"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import { Itinerary, ItineraryDay, Activity, Country } from "@/types/itinerary";
import { supabase } from "@/lib/supabase";

interface ItineraryContextType {
  itinerary: Itinerary;
  countries: Country[];
  loading: boolean;
  error: string | null;
  updateDay: (dayId: string, updates: Partial<ItineraryDay>) => Promise<void>;
  addCountry: (name: string, flagEmoji?: string) => Promise<string | null>;
  updateCountry: (countryId: string, name: string, flagEmoji?: string) => Promise<void>;
  deleteCountry: (countryId: string) => Promise<void>;
  reorderCountries: (fromIndex: number, toIndex: number) => Promise<void>;
  addDay: (countryId?: string) => Promise<void>;
  deleteDay: (dayId: string) => Promise<void>;
  reorderDays: (countryId: string, fromIndex: number, toIndex: number) => Promise<void>;
  addActivity: (dayId: string) => Promise<void>;
  updateActivity: (dayId: string, activityId: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (dayId: string, activityId: string) => Promise<void>;
  reorderActivities: (dayId: string, fromIndex: number, toIndex: number) => Promise<void>;
  addHighlight: (dayId: string, highlight: string) => Promise<void>;
  removeHighlight: (dayId: string, index: number) => Promise<void>;
  refreshData: () => Promise<void>;
  exportData: () => string;
}

const ItineraryContext = createContext<ItineraryContextType | null>(null);

interface CountryRow {
  id: string;
  name: string;
  sort_order: number;
  flag_emoji?: string | null;
}

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<Itinerary>([]);
  const [countriesRows, setCountriesRows] = useState<CountryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: countriesData, error: countriesError } = await supabase
        .from("countries")
        .select("*")
        .order("sort_order", { ascending: true });

      if (countriesError) throw countriesError;

      const { data: days, error: daysError } = await supabase
        .from("days")
        .select("*")
        .order("day", { ascending: true });

      if (daysError) throw daysError;

      const { data: activities, error: activitiesError } = await supabase
        .from("activities")
        .select("*")
        .order("sort_order", { ascending: true });

      if (activitiesError) throw activitiesError;

      const daysList = days || [];
      const activitiesList = activities || [];
      const itineraryData: Itinerary = daysList.map((day) => ({
        id: day.id,
        day: day.day,
        date: day.date,
        location: day.location,
        title: day.title,
        transport: day.transport,
        highlights: day.highlights || [],
        countryId: day.country_id,
        activities: activitiesList
          .filter((a) => a.day_id === day.id)
          .map((a) => ({
            id: a.id,
            place: a.place,
            description: a.description || [],
            mapUrl: a.map_url,
            duration: a.duration,
            priceUSD: a.price_usd ? parseFloat(a.price_usd) : undefined,
          })),
      }));

      setItinerary(itineraryData);
      setCountriesRows(countriesData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const countries = useMemo((): Country[] => {
    return countriesRows.map((c) => ({
      id: c.id,
      name: c.name,
      flagEmoji: c.flag_emoji && c.flag_emoji.trim() ? c.flag_emoji : "🌍",
      days: [...itinerary]
        .filter((d) => d.countryId === c.id)
        .sort((a, b) => a.day - b.day),
    }));
  }, [itinerary, countriesRows]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const updateDay = useCallback(async (dayId: string, updates: Partial<ItineraryDay>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.day !== undefined) dbUpdates.day = updates.day;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.transport !== undefined) dbUpdates.transport = updates.transport;
      if (updates.highlights !== undefined) dbUpdates.highlights = updates.highlights;

      const { error } = await supabase
        .from("days")
        .update(dbUpdates)
        .eq("id", dayId);

      if (error) throw error;

      setItinerary((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d))
      );
    } catch (err) {
      console.error("Error updating day:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar");
    }
  }, []);

  const addCountry = useCallback(async (name: string, flagEmoji?: string): Promise<string | null> => {
    try {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const flag = (flagEmoji?.trim() || "🌍").slice(0, 8);
      const maxOrder = countriesRows.length > 0 ? Math.max(...countriesRows.map((c) => c.sort_order)) : -1;
      const { data, error } = await supabase
        .from("countries")
        .insert({ name: trimmed, flag_emoji: flag, sort_order: maxOrder + 1 })
        .select("id")
        .single();
      if (error) throw error;
      await fetchData();
      return data?.id ?? null;
    } catch (err) {
      console.error("Error adding country:", err);
      setError(err instanceof Error ? err.message : "Error al añadir país");
      return null;
    }
  }, [countriesRows, fetchData]);

  const updateCountry = useCallback(async (countryId: string, name: string, flagEmoji?: string) => {
    try {
      const trimmed = name.trim();
      if (!trimmed) return;
      const updates: { name: string; flag_emoji?: string } = { name: trimmed };
      if (flagEmoji !== undefined) updates.flag_emoji = (flagEmoji?.trim() || "🌍").slice(0, 8);
      const { error } = await supabase.from("countries").update(updates).eq("id", countryId);
      if (error) throw error;
      setCountriesRows((prev) =>
        prev.map((c) =>
          c.id === countryId ? { ...c, name: trimmed, ...(updates.flag_emoji !== undefined && { flag_emoji: updates.flag_emoji }) } : c
        )
      );
    } catch (err) {
      console.error("Error updating country:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar país");
    }
  }, []);

  const deleteCountry = useCallback(async (countryId: string) => {
    try {
      const { error } = await supabase.from("countries").delete().eq("id", countryId);
      if (error) throw error;
      setCountriesRows((prev) => prev.filter((c) => c.id !== countryId));
      setItinerary((prev) => prev.filter((d) => d.countryId !== countryId));
    } catch (err) {
      console.error("Error deleting country:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar país");
    }
  }, []);

  const reorderCountries = useCallback(async (fromIndex: number, toIndex: number) => {
    try {
      if (fromIndex === toIndex) return;
      const reordered = [...countriesRows];
      const [removed] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, removed);
      const withNewOrder = reordered.map((c, i) => ({ ...c, sort_order: i }));
      setCountriesRows(withNewOrder);
      for (const c of withNewOrder) {
        await supabase.from("countries").update({ sort_order: c.sort_order }).eq("id", c.id);
      }
    } catch (err) {
      console.error("Error reordering countries:", err);
      setError(err instanceof Error ? err.message : "Error al reordenar países");
    }
  }, [countriesRows]);

  const reorderDays = useCallback(async (countryId: string, fromIndex: number, toIndex: number) => {
    try {
      const country = countries.find((c) => c.id === countryId);
      if (!country || fromIndex === toIndex) return;
      const days = [...country.days];
      const [removed] = days.splice(fromIndex, 1);
      days.splice(toIndex, 0, removed);
      const renumbered = days.map((d, i) => ({ ...d, day: i + 1 }));
      setItinerary((prev) => {
        const ids = new Set(renumbered.map((x) => x.id));
        const rest = prev.filter((d) => !ids.has(d.id));
        return [...rest, ...renumbered];
      });
      for (const d of renumbered) {
        await supabase.from("days").update({ day: d.day }).eq("id", d.id);
      }
    } catch (err) {
      console.error("Error reordering days:", err);
      setError(err instanceof Error ? err.message : "Error al reordenar días");
    }
  }, [countries]);

  const addDay = useCallback(async (countryId?: string) => {
    try {
      const targetCountryId = countryId ?? countries[0]?.id;
      if (!targetCountryId) {
        setError("Añade primero un país");
        return;
      }
      const countryDays = itinerary.filter((d) => d.countryId === targetCountryId);
      const maxDay = countryDays.length > 0 ? Math.max(...countryDays.map((d) => d.day)) : 0;
      const lastDay = countryDays.sort((a, b) => a.day - b.day)[countryDays.length - 1];
      const lastDate = lastDay ? new Date(lastDay.date) : new Date();
      lastDate.setDate(lastDate.getDate() + 1);

      const newDay = {
        country_id: targetCountryId,
        day: maxDay + 1,
        date: lastDate.toISOString().split("T")[0],
        location: "",
        title: "Nuevo día",
        transport: null,
        highlights: [] as string[],
      };

      const { data, error } = await supabase
        .from("days")
        .insert(newDay)
        .select()
        .single();

      if (error) throw error;

      setItinerary((prev) => [
        ...prev,
        {
          id: data.id,
          day: newDay.day,
          date: newDay.date,
          location: newDay.location,
          title: newDay.title,
          transport: undefined,
          highlights: [],
          activities: [],
          countryId: targetCountryId,
        },
      ]);
    } catch (err) {
      console.error("Error adding day:", err);
      setError(err instanceof Error ? err.message : "Error al añadir día");
    }
  }, [itinerary, countries]);

  const deleteDay = useCallback(async (dayId: string) => {
    try {
      const dayToDelete = itinerary.find((d) => d.id === dayId);
      if (!dayToDelete) return;

      const { error } = await supabase.from("days").delete().eq("id", dayId);
      if (error) throw error;

      const countryId = dayToDelete.countryId;
      const remaining = itinerary
        .filter((d) => d.countryId === countryId && d.id !== dayId)
        .sort((a, b) => a.day - b.day);
      const renumbered = remaining.map((d, i) => ({ ...d, day: i + 1 }));

      for (const d of renumbered) {
        await supabase.from("days").update({ day: d.day }).eq("id", d.id);
      }

      setItinerary((prev) => {
        const withoutDeleted = prev.filter((d) => d.id !== dayId);
        const dayById = new Map(renumbered.map((d) => [d.id, d.day]));
        return withoutDeleted.map((d) =>
          dayById.has(d.id) ? { ...d, day: dayById.get(d.id)! } : d
        );
      });
    } catch (err) {
      console.error("Error deleting day:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar día");
    }
  }, [itinerary]);

  const addActivity = useCallback(async (dayId: string) => {
    try {
      const day = itinerary.find((d) => d.id === dayId);
      const sortOrder = day ? day.activities.length : 0;

      const newActivity = {
        day_id: dayId,
        place: "Nueva actividad",
        description: [],
        map_url: null,
        duration: null,
        price_usd: null,
        sort_order: sortOrder,
      };

      const { data, error } = await supabase
        .from("activities")
        .insert(newActivity)
        .select()
        .single();

      if (error) throw error;

      setItinerary((prev) =>
        prev.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities: [
                ...d.activities,
                {
                  id: data.id,
                  place: "Nueva actividad",
                  description: [],
                },
              ],
            };
          }
          return d;
        })
      );
    } catch (err) {
      console.error("Error adding activity:", err);
      setError(err instanceof Error ? err.message : "Error al añadir actividad");
    }
  }, [itinerary]);

  const updateActivity = useCallback(async (dayId: string, activityId: string, updates: Partial<Activity>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.place !== undefined) dbUpdates.place = updates.place;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.mapUrl !== undefined) dbUpdates.map_url = updates.mapUrl;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.priceUSD !== undefined) dbUpdates.price_usd = updates.priceUSD;

      const { error } = await supabase
        .from("activities")
        .update(dbUpdates)
        .eq("id", activityId);

      if (error) throw error;

      setItinerary((prev) =>
        prev.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities: d.activities.map((a) =>
                a.id === activityId ? { ...a, ...updates } : a
              ),
            };
          }
          return d;
        })
      );
    } catch (err) {
      console.error("Error updating activity:", err);
      setError(err instanceof Error ? err.message : "Error al actualizar actividad");
    }
  }, []);

  const deleteActivity = useCallback(async (dayId: string, activityId: string) => {
    try {
      const { error } = await supabase.from("activities").delete().eq("id", activityId);
      if (error) throw error;

      setItinerary((prev) =>
        prev.map((d) => {
          if (d.id === dayId) {
            return {
              ...d,
              activities: d.activities.filter((a) => a.id !== activityId),
            };
          }
          return d;
        })
      );
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar actividad");
    }
  }, []);

  const reorderActivities = useCallback(async (dayId: string, fromIndex: number, toIndex: number) => {
    try {
      const day = itinerary.find((d) => d.id === dayId);
      if (!day) return;

      const activities = [...day.activities];
      const [removed] = activities.splice(fromIndex, 1);
      activities.splice(toIndex, 0, removed);

      // Update local state immediately
      setItinerary((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, activities } : d))
      );

      // Update sort_order in database
      const updates = activities.map((a, index) => ({
        id: a.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("activities")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
    } catch (err) {
      console.error("Error reordering activities:", err);
      setError(err instanceof Error ? err.message : "Error al reordenar");
    }
  }, [itinerary]);

  const addHighlight = useCallback(async (dayId: string, highlight: string) => {
    try {
      const day = itinerary.find((d) => d.id === dayId);
      if (!day) return;

      const newHighlights = [...(day.highlights || []), highlight];

      const { error } = await supabase
        .from("days")
        .update({ highlights: newHighlights })
        .eq("id", dayId);

      if (error) throw error;

      setItinerary((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, highlights: newHighlights } : d))
      );
    } catch (err) {
      console.error("Error adding highlight:", err);
      setError(err instanceof Error ? err.message : "Error al añadir destacado");
    }
  }, [itinerary]);

  const removeHighlight = useCallback(async (dayId: string, index: number) => {
    try {
      const day = itinerary.find((d) => d.id === dayId);
      if (!day) return;

      const newHighlights = (day.highlights || []).filter((_, i) => i !== index);

      const { error } = await supabase
        .from("days")
        .update({ highlights: newHighlights })
        .eq("id", dayId);

      if (error) throw error;

      setItinerary((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, highlights: newHighlights } : d))
      );
    } catch (err) {
      console.error("Error removing highlight:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar destacado");
    }
  }, [itinerary]);

  const exportData = useCallback(() => {
    return JSON.stringify(itinerary, null, 2);
  }, [itinerary]);

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
        countries,
        loading,
        error,
        updateDay,
        addCountry,
        updateCountry,
        deleteCountry,
        reorderCountries,
        addDay,
        deleteDay,
        reorderDays,
        addActivity,
        updateActivity,
        deleteActivity,
        reorderActivities,
        addHighlight,
        removeHighlight,
        refreshData,
        exportData,
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error("useItinerary must be used within an ItineraryProvider");
  }
  return context;
}
