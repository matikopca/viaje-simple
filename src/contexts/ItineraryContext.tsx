"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Itinerary, ItineraryDay, Activity } from "@/types/itinerary";
import { supabase } from "@/lib/supabase";

function generateId(): string {
  return crypto.randomUUID();
}

interface ItineraryContextType {
  itinerary: Itinerary;
  loading: boolean;
  error: string | null;
  updateDay: (dayId: string, updates: Partial<ItineraryDay>) => Promise<void>;
  addDay: () => Promise<void>;
  deleteDay: (dayId: string) => Promise<void>;
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

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<Itinerary>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      const itineraryData: Itinerary = (days || []).map((day) => ({
        id: day.id,
        day: day.day,
        date: day.date,
        location: day.location,
        title: day.title,
        transport: day.transport,
        highlights: day.highlights || [],
        activities: (activities || [])
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

  const addDay = useCallback(async () => {
    try {
      const maxDay = itinerary.length > 0 ? Math.max(...itinerary.map((d) => d.day)) : 0;
      const lastDate = itinerary.length > 0 ? new Date(itinerary[itinerary.length - 1].date) : new Date();
      lastDate.setDate(lastDate.getDate() + 1);

      const newDay = {
        day: maxDay + 1,
        date: lastDate.toISOString().split("T")[0],
        location: "",
        title: "Nuevo día",
        transport: undefined,
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
        },
      ]);
    } catch (err) {
      console.error("Error adding day:", err);
      setError(err instanceof Error ? err.message : "Error al añadir día");
    }
  }, [itinerary]);

  const deleteDay = useCallback(async (dayId: string) => {
    try {
      const { error } = await supabase.from("days").delete().eq("id", dayId);
      if (error) throw error;

      setItinerary((prev) => prev.filter((d) => d.id !== dayId));
    } catch (err) {
      console.error("Error deleting day:", err);
      setError(err instanceof Error ? err.message : "Error al eliminar día");
    }
  }, []);

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
        loading,
        error,
        updateDay,
        addDay,
        deleteDay,
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
