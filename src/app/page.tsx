"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ItineraryProvider, useItinerary } from "@/contexts/ItineraryContext";
import type { ItineraryDay } from "@/types/itinerary";
import Timeline from "@/components/itinerary/Timeline";
import DayCard from "@/components/itinerary/DayCard";
import DayEditor from "@/components/admin/DayEditor";
import TripCountdown from "@/components/itinerary/TripCountdown";

/** Fecha para la cuenta atrás: `NEXT_PUBLIC_TRIP_START_DATE` (YYYY-MM-DD) o el primer día del itinerario. */
function getCountdownTargetDate(itinerary: ItineraryDay[]): string | null {
  const env = process.env.NEXT_PUBLIC_TRIP_START_DATE?.trim();
  if (env && /^\d{4}-\d{2}-\d{2}/.test(env)) return env.slice(0, 10);
  if (itinerary.length === 0) return null;
  return [...itinerary].sort((a, b) => a.date.localeCompare(b.date))[0].date;
}

function ItineraryContent() {
  const { countries, itinerary, loading, error } = useItinerary();
  const [allExpanded, setAllExpanded] = useState<boolean | null>(null);
  const [expandedCountryIds, setExpandedCountryIds] = useState<Set<string>>(new Set());
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const initialExpandDone = useRef(false);

  const closeDayEditor = useCallback(() => setEditingDayId(null), []);

  useEffect(() => {
    if (!editingDayId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDayEditor();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [editingDayId, closeDayEditor]);

  const editingDay = editingDayId ? itinerary.find((d) => d.id === editingDayId) : undefined;

  useEffect(() => {
    if (editingDayId && !itinerary.some((d) => d.id === editingDayId)) {
      setEditingDayId(null);
    }
  }, [editingDayId, itinerary]);

  useEffect(() => {
    if (countries.length > 0 && !initialExpandDone.current) {
      initialExpandDone.current = true;
      setExpandedCountryIds(new Set(countries.map((c) => c.id)));
    }
  }, [countries]);

  const countdownTarget = getCountdownTargetDate(itinerary);

  const toggleCountry = (countryId: string) => {
    setExpandedCountryIds((prev) => {
      const next = new Set(prev);
      if (next.has(countryId)) next.delete(countryId);
      else next.add(countryId);
      return next;
    });
  };

  const expandAllCountries = () => {
    setExpandedCountryIds(new Set(countries.map((c) => c.id)));
  };

  const collapseAllCountries = () => {
    setExpandedCountryIds(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando itinerario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const totalTransportCost = itinerary.reduce((sum: number, day: ItineraryDay) => {
    return sum + (day.transport?.priceUSD || 0);
  }, 0);

  const totalFilledSlots = itinerary.reduce((sum: number, day: ItineraryDay) => {
    return (
      sum +
      [day.morningDescription, day.middayDescription, day.afternoonDescription].filter((s) => s.trim()).length
    );
  }, 0);

  const handleExpandAll = () => {
    expandAllCountries();
    setAllExpanded(true);
  };

  const handleCollapseAll = () => {
    collapseAllCountries();
    setAllExpanded(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Cabecera fija al scroll: cuenta atrás + barra de navegación */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/90 shadow-sm backdrop-blur-md">
        <TripCountdown targetDate={countdownTarget} />
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2 sm:px-6 sm:py-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">🌍</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">
              {countries.length > 0 ? (countries.length === 1 ? `${countries[0].name} • ${itinerary.length} días` : `${countries.length} países • ${itinerary.length} días`) : `${itinerary.length} días`}
            </span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="hidden sm:inline">Países y orden</span>
            <span className="sm:hidden">Orden</span>
          </Link>
        </div>
      </header>

      <div className="overflow-x-hidden">
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide">
              {countries.length > 0 ? (countries.length === 1 ? countries[0].name : "Tu itinerario") : "Itinerario"}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {countries.length === 1 ? `Viaje a ${countries[0].name}` : countries.length > 1 ? `${itinerary.length} días en ${countries.length} países` : "Itinerario de viaje"}
            </h1>
          </div>
        </div>
        
        <p className="text-lg text-gray-500 mt-4 max-w-2xl">
          {countries.length === 1 ? "Tu agenda día a día." : countries.length > 1 ? "Tu ruta por país, en el orden que configuraste." : "Añade países y días en el editor."}
        </p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span>{itinerary.length} Días</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-pink-500" />
            <span>{totalFilledSlots} tramos con plan</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
            <span>${totalTransportCost} USD transporte</span>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleExpandAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Expandir todo
          </button>
          <button
            onClick={handleCollapseAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Colapsar todo
          </button>
        </div>
      </section>

      {countries.length === 0 && itinerary.length === 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-24 text-center text-gray-500">
          <p>No hay días en el itinerario. Ve a Editar para añadir países y días.</p>
        </div>
      )}

      {countries.length === 0 && itinerary.length > 0 && (
        <Timeline>
          {[...itinerary]
            .sort((a: ItineraryDay, b: ItineraryDay) => a.day - b.day)
            .map((day: ItineraryDay) => (
              <DayCard
                key={day.id}
                day={day.day}
                date={day.date}
                title={day.title}
                location={day.location}
                transport={day.transport}
                morningDescription={day.morningDescription}
                middayDescription={day.middayDescription}
                afternoonDescription={day.afternoonDescription}
                highlights={day.highlights}
                forceExpanded={allExpanded}
                onToggle={() => setAllExpanded(null)}
                onEditDay={() => setEditingDayId(day.id)}
              />
            ))}
        </Timeline>
      )}

      {countries.map((country) => {
        const isExpanded = expandedCountryIds.has(country.id);
        return (
          <div key={country.id} className="mb-10">
            <button
              type="button"
              onClick={() => toggleCountry(country.id)}
              className="max-w-4xl mx-auto w-full px-6 py-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl flex-shrink-0">{country.flagEmoji || "🌍"}</span>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{country.name}</h2>
                  <p className="text-sm text-gray-500">{country.days.length} días</p>
                </div>
              </div>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isExpanded && (
              <div className="mt-4">
                <Timeline>
                  {[...country.days]
                    .sort((a: ItineraryDay, b: ItineraryDay) => a.day - b.day)
                    .map((day: ItineraryDay) => (
                      <DayCard
                        key={day.id}
                        day={day.day}
                        date={day.date}
                        title={day.title}
                        location={day.location}
                        transport={day.transport}
                        morningDescription={day.morningDescription}
                        middayDescription={day.middayDescription}
                        afternoonDescription={day.afternoonDescription}
                        highlights={day.highlights}
                        forceExpanded={allExpanded}
                        onToggle={() => setAllExpanded(null)}
                        onEditDay={() => setEditingDayId(day.id)}
                      />
                    ))}
                </Timeline>
              </div>
            )}
          </div>
        );
      })}
      </div>

      {editingDay && (
        <div
          className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="main-day-editor-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm hidden sm:block"
            aria-label="Cerrar"
            onClick={closeDayEditor}
          />
          <div className="relative z-10 flex w-full flex-1 flex-col overflow-hidden bg-white min-h-[100dvh] sm:min-h-0 sm:h-auto sm:max-h-[min(92vh,900px)] sm:max-w-xl sm:flex-none sm:rounded-2xl sm:border sm:border-gray-200 sm:shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-slate-100 to-white px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top,0px))] sm:px-5 sm:py-4">
              <h2 id="main-day-editor-title" className="text-lg sm:text-xl font-bold text-slate-900 truncate pr-2">
                Día {editingDay.day} · {editingDay.title}
              </h2>
              <button
                type="button"
                onClick={closeDayEditor}
                className="shrink-0 w-11 h-11 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-4 sm:p-5">
              <DayEditor key={editingDay.id} day={editingDay} variant="main" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThailandPage() {
  return (
    <ItineraryProvider>
      <ItineraryContent />
    </ItineraryProvider>
  );
}
