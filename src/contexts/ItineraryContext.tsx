"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Itinerary, ItineraryDay, Activity } from "@/types/itinerary";
import { thailandItinerary as initialData } from "@/app/data/thailand-itinerary";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function migrateData(data: unknown[]): Itinerary {
  return data.map((day: unknown) => {
    const d = day as Record<string, unknown>;
    return {
      id: generateId(),
      day: d.day as number,
      date: d.date as string,
      location: d.location as string,
      title: d.title as string,
      transport: d.transport as ItineraryDay["transport"],
      activities: (d.activities as unknown[]).map((act: unknown) => {
        const a = act as Record<string, unknown>;
        return {
          id: generateId(),
          place: a.place as string,
          description: a.description as string | undefined,
          coordinates: a.coordinates as Activity["coordinates"],
          mapUrl: a.mapUrl as string | undefined,
          duration: a.duration as string | undefined,
          priceUSD: a.priceUSD as number | undefined,
        };
      }),
      highlights: d.highlights as string[] | undefined,
    };
  });
}

interface ItineraryContextType {
  itinerary: Itinerary;
  updateDay: (dayId: string, updates: Partial<ItineraryDay>) => void;
  addDay: () => void;
  deleteDay: (dayId: string) => void;
  addActivity: (dayId: string) => void;
  updateActivity: (dayId: string, activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (dayId: string, activityId: string) => void;
  reorderActivities: (dayId: string, fromIndex: number, toIndex: number) => void;
  addHighlight: (dayId: string, highlight: string) => void;
  removeHighlight: (dayId: string, index: number) => void;
  exportData: () => string;
}

const ItineraryContext = createContext<ItineraryContextType | null>(null);

export function ItineraryProvider({ children }: { children: ReactNode }) {
  const [itinerary, setItinerary] = useState<Itinerary>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("itinerary");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return migrateData(initialData);
        }
      }
    }
    return migrateData(initialData);
  });

  const saveToStorage = useCallback((data: Itinerary) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("itinerary", JSON.stringify(data));
    }
  }, []);

  const updateDay = useCallback((dayId: string, updates: Partial<ItineraryDay>) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => (d.id === dayId ? { ...d, ...updates } : d));
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const addDay = useCallback(() => {
    setItinerary((prev) => {
      const maxDay = Math.max(...prev.map((d) => d.day), 0);
      const lastDate = prev.length > 0 ? new Date(prev[prev.length - 1].date) : new Date();
      lastDate.setDate(lastDate.getDate() + 1);
      
      const newDay: ItineraryDay = {
        id: generateId(),
        day: maxDay + 1,
        date: lastDate.toISOString().split("T")[0],
        location: "",
        title: "Nuevo día",
        activities: [],
        highlights: [],
      };
      const updated = [...prev, newDay];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteDay = useCallback((dayId: string) => {
    setItinerary((prev) => {
      const updated = prev.filter((d) => d.id !== dayId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const addActivity = useCallback((dayId: string) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dayId) {
          return {
            ...d,
            activities: [
              ...d.activities,
              {
                id: generateId(),
                place: "Nueva actividad",
                description: "",
              },
            ],
          };
        }
        return d;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const updateActivity = useCallback((dayId: string, activityId: string, updates: Partial<Activity>) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dayId) {
          return {
            ...d,
            activities: d.activities.map((a) =>
              a.id === activityId ? { ...a, ...updates } : a
            ),
          };
        }
        return d;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteActivity = useCallback((dayId: string, activityId: string) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dayId) {
          return {
            ...d,
            activities: d.activities.filter((a) => a.id !== activityId),
          };
        }
        return d;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const reorderActivities = useCallback((dayId: string, fromIndex: number, toIndex: number) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dayId) {
          const activities = [...d.activities];
          const [removed] = activities.splice(fromIndex, 1);
          activities.splice(toIndex, 0, removed);
          return { ...d, activities };
        }
        return d;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const addHighlight = useCallback((dayId: string, highlight: string) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dayId) {
          return {
            ...d,
            highlights: [...(d.highlights || []), highlight],
          };
        }
        return d;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const removeHighlight = useCallback((dayId: string, index: number) => {
    setItinerary((prev) => {
      const updated = prev.map((d) => {
        if (d.id === dayId) {
          const highlights = [...(d.highlights || [])];
          highlights.splice(index, 1);
          return { ...d, highlights };
        }
        return d;
      });
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const exportData = useCallback(() => {
    return JSON.stringify(itinerary, null, 2);
  }, [itinerary]);

  return (
    <ItineraryContext.Provider
      value={{
        itinerary,
        updateDay,
        addDay,
        deleteDay,
        addActivity,
        updateActivity,
        deleteActivity,
        reorderActivities,
        addHighlight,
        removeHighlight,
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
