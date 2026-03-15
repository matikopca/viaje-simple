"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ItineraryProvider, useItinerary } from "@/contexts/ItineraryContext";
import type { ItineraryDay } from "@/types/itinerary";
import Timeline from "@/components/itinerary/Timeline";
import DayCard from "@/components/itinerary/DayCard";

function ItineraryContent() {
  const { countries, itinerary, loading, error } = useItinerary();
  const [allExpanded, setAllExpanded] = useState<boolean | null>(null);
  const [expandedCountryIds, setExpandedCountryIds] = useState<Set<string>>(new Set());
  const initialExpandDone = useRef(false);

  useEffect(() => {
    if (countries.length > 0 && !initialExpandDone.current) {
      initialExpandDone.current = true;
      setExpandedCountryIds(new Set(countries.map((c) => c.id)));
    }
  }, [countries]);

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

  const totalActivitiesCost = itinerary.reduce((sum: number, day: ItineraryDay) => {
    return sum + day.activities.reduce((acc: number, a) => acc + (a.priceUSD || 0), 0);
  }, 0);

  const totalPlaces = itinerary.reduce((sum: number, day: ItineraryDay) => {
    return sum + day.activities.length;
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
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar</span>
          </Link>
        </div>
      </header>

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
            <span>{totalPlaces} Lugares</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
            <span>${totalTransportCost + totalActivitiesCost} USD total</span>
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
                activities={day.activities}
                highlights={day.highlights}
                forceExpanded={allExpanded}
                onToggle={() => setAllExpanded(null)}
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
                        activities={day.activities}
                        highlights={day.highlights}
                        forceExpanded={allExpanded}
                        onToggle={() => setAllExpanded(null)}
                      />
                    ))}
                </Timeline>
              </div>
            )}
          </div>
        );
      })}
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
