"use client";

import { useState } from "react";
import { Transport } from "@/types/itinerary";
import ActivityDescriptionContent from "@/components/itinerary/ActivityDescriptionContent";

interface DayCardProps {
  day: number;
  date?: string;
  title: string;
  location: string;
  transport?: Transport;
  morningDescription: string;
  middayDescription: string;
  afternoonDescription: string;
  highlights?: string[];
  forceExpanded?: boolean | null;
  onToggle?: () => void;
  onEditDay?: () => void;
}

const transportIcons: Record<string, string> = {
  flight: "✈️",
  ferry: "⛴️",
  "high-speed ferry": "🚤",
  "longtail boat": "🛶",
  "boat tour": "🚤",
  "speedboat tour": "🚤",
  "ferry + flight": "⛴️✈️",
  bus: "🚌",
  train: "🚂",
  taxi: "🚕",
};

export default function DayCard({
  day,
  date,
  title,
  location,
  transport,
  morningDescription,
  middayDescription,
  afternoonDescription,
  highlights,
  forceExpanded,
  onToggle,
  onEditDay,
}: DayCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);

  const isExpanded = forceExpanded !== null && forceExpanded !== undefined ? forceExpanded : localExpanded;

  const handleToggle = () => {
    setLocalExpanded(!isExpanded);
    onToggle?.();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  const slots = [
    { label: "Mañana", text: morningDescription },
    { label: "Tarde", text: middayDescription },
    { label: "Noche", text: afternoonDescription },
  ];

  const hasAnySlot = slots.some((s) => s.text.trim());

  return (
    <div className="relative pl-8 md:pl-12">
      <div
        className={`absolute left-0 md:left-2 w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
          isExpanded ? "bg-gradient-to-br from-orange-400 to-pink-500 scale-125" : "bg-gradient-to-br from-blue-500 to-purple-600"
        }`}
      />

      <div
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
          isExpanded ? "shadow-lg" : "hover:shadow-md"
        }`}
      >
        <div className="flex items-stretch gap-0">
          <button
            type="button"
            onClick={handleToggle}
            className="flex-1 min-w-0 p-4 md:p-6 text-left flex items-center justify-between group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Día {day}
                </p>
                {date && (
                  <>
                    <span className="text-sm text-gray-300">•</span>
                    <span className="text-sm font-medium text-gray-500">{formatDate(date)}</span>
                  </>
                )}
              </div>

              <h2 className="text-xl font-semibold mt-1 text-gray-900">{title}</h2>

              <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </p>

              {transport && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">{transportIcons[transport.type] || "🚗"}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{transport.duration}</span>
                  {transport.priceUSD !== undefined && transport.priceUSD > 0 && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">${transport.priceUSD} USD</span>
                  )}
                </div>
              )}

              {highlights && highlights.length > 0 && (
                <ul className="flex flex-wrap gap-2 mt-3">
                  {highlights.map((h, i) => (
                    <li key={i} className="text-sm bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          {onEditDay && (
            <div className="flex flex-col justify-center pr-3 md:pr-4 py-3 border-l border-gray-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDay();
                }}
                className="shrink-0 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 shadow-sm transition-all"
              >
                Editar día
              </button>
            </div>
          )}
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[2400px] opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-100 pt-4 space-y-5">
            {!hasAnySlot ? (
              <p className="text-sm text-gray-400 text-center py-2">No hay plan por tramos para este día.</p>
            ) : (
              slots.map(
                (slot) =>
                  slot.text.trim() && (
                    <section key={slot.label}>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 mb-2">{slot.label}</h3>
                      <div className="bg-gray-50 rounded-xl p-3 md:p-4 border border-slate-200">
                        <ActivityDescriptionContent description={slot.text} className="space-y-1" />
                      </div>
                    </section>
                  )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
