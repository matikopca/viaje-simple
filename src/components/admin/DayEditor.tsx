"use client";

import { useState, useEffect } from "react";
import { ItineraryDay, Transport } from "@/types/itinerary";
import { useItinerary } from "@/contexts/ItineraryContext";
import DaySlotsEditor from "./DaySlotsEditor";

interface DayEditorProps {
  day: ItineraryDay;
  /** Para lista reordenable: índice y handlers de drag (si no se pasan, no se muestra el grip) */
  index?: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  /** main: solo formulario (fecha, título, ubicación, plan del día…), sin cabecera colapsable ni eliminar día */
  variant?: "admin" | "main";
}

export default function DayEditor({ day, index, onDragStart, onDragEnd, variant = "admin" }: DayEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metaOpen, setMetaOpen] = useState(false);
  const [newHighlight, setNewHighlight] = useState("");
  const [dayNum, setDayNum] = useState(String(day.day));
  const [date, setDate] = useState(day.date);
  const [title, setTitle] = useState(day.title);
  const [location, setLocation] = useState(day.location);
  const [transport, setTransport] = useState<Transport | undefined>(day.transport);
  const { updateDay, deleteDay, addHighlight, removeHighlight } = useItinerary();

  useEffect(() => {
    setDayNum(String(day.day));
    setDate(day.date);
    setTitle(day.title);
    setLocation(day.location);
    setTransport(day.transport);
  }, [day.id, day.day, day.date, day.title, day.location, day.transport]);

  const commitDayNum = () => {
    const n = parseInt(dayNum, 10) || 1;
    if (n !== day.day) updateDay(day.id, { day: n });
  };
  const commitDate = () => {
    if (date !== day.date) updateDay(day.id, { date });
  };
  const commitTitle = () => {
    const t = title.trim();
    if (t !== day.title) updateDay(day.id, { title: t || day.title });
  };
  const commitLocation = () => {
    const l = location.trim();
    if (l !== day.location) updateDay(day.id, { location: l || day.location });
  };
  const commitTransport = () => {
    const same =
      transport?.type === day.transport?.type &&
      transport?.duration === day.transport?.duration &&
      transport?.priceUSD === day.transport?.priceUSD;
    if (!same) {
      const next =
        transport?.type || transport?.duration
          ? { type: transport?.type ?? "", duration: transport?.duration ?? "", priceUSD: transport?.priceUSD }
          : undefined;
      updateDay(day.id, { transport: next });
    }
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      addHighlight(day.id, newHighlight.trim());
      setNewHighlight("");
    }
  };

  const handleDeleteDay = () => {
    if (confirm("¿Eliminar este día?")) deleteDay(day.id);
  };

  const metaSummaryLine1 = `Día ${dayNum || "?"} · ${title.trim() || "Sin título"}`;
  const metaSummaryLine2 = `${date || "—"} · ${location.trim() || "Sin ubicación"}`;
  const transportTypeLabels: Record<string, string> = {
    flight: "Vuelo",
    ferry: "Ferry",
    bus: "Bus",
    train: "Tren",
    taxi: "Taxi",
    "high-speed ferry": "Ferry rápido",
    "longtail boat": "Longtail",
    "boat tour": "Tour barco",
    "speedboat tour": "Speedboat",
  };
  const transportSummary =
    transport?.type || transport?.duration
      ? [
          transportTypeLabels[transport?.type || ""] || transport?.type || "Traslado",
          transport?.duration,
          transport?.priceUSD != null && transport.priceUSD > 0 ? `$${transport.priceUSD}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "Sin transporte";

  const isMain = variant === "main";
  const inputClass = isMain
    ? "w-full px-3 py-2.5 text-base border-2 border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
    : "w-full px-2.5 py-2 text-sm border-2 border-slate-300 rounded-lg text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";
  const lbl = isMain ? "block text-sm font-bold text-slate-800 mb-1.5" : "block text-xs font-bold text-slate-800 mb-1";
  const secTitle = isMain ? "text-sm font-bold text-slate-900 uppercase tracking-wide mb-2" : "text-xs font-bold text-slate-900 uppercase tracking-wide mb-2";
  const blockHdr = isMain ? "text-sm font-bold text-slate-900 uppercase tracking-wide" : "text-xs font-bold text-slate-900 uppercase tracking-wide";
  const sum1 = isMain ? "text-base text-slate-900 font-semibold truncate" : "text-sm text-slate-900 font-semibold truncate";
  const sum2 = isMain ? "text-sm text-slate-700 truncate" : "text-xs text-slate-700 truncate";
  const sum3 = isMain ? "text-sm text-indigo-800 font-medium truncate" : "text-xs text-indigo-800 font-medium truncate";
  const chevWrap = isMain ? "shrink-0 w-9 h-9 rounded-full bg-indigo-600 text-white border-2 border-indigo-700 shadow flex items-center justify-center transition-transform" : "shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white border-2 border-indigo-700 shadow flex items-center justify-center transition-transform";
  const chevIcon = isMain ? "w-5 h-5" : "w-4 h-4";
  const transportEmoji = isMain ? "text-lg" : "text-base";

  const formBody = (
        <div className={`${isMain ? "p-4 md:p-5 space-y-4" : "p-3 md:p-4 space-y-3"} ${variant === "admin" ? "border-t border-slate-200" : ""}`}>
          <div className="rounded-xl border-2 border-slate-300 shadow-md overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setMetaOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-2 px-3 text-left bg-gradient-to-r from-indigo-50 via-white to-violet-50 hover:from-indigo-100/80 hover:to-violet-100/80 transition-colors border-b-2 border-slate-200/80 ${isMain ? "py-3.5" : "py-2.5"}`}
            >
              <div className="min-w-0 flex-1 pl-1 border-l-4 border-indigo-500">
                <span className={blockHdr}>Día y título</span>
                {!metaOpen && (
                  <div className={`${isMain ? "mt-1.5 space-y-1" : "mt-1 space-y-0.5"}`}>
                    <p className={sum1}>{metaSummaryLine1}</p>
                    <p className={sum2}>{metaSummaryLine2}</p>
                    <p className={sum3}>{transportSummary}</p>
                  </div>
                )}
              </div>
              <span className={`${chevWrap} ${metaOpen ? "rotate-180" : ""}`}>
                <svg className={chevIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {metaOpen && (
              <div className={`${isMain ? "px-4 pb-4 pt-4 space-y-5" : "px-3 pb-3 pt-3 space-y-4"} bg-slate-50`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Fecha</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onBlur={commitDate}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={lbl}>Ubicación</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onBlur={commitLocation}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className={inputClass}
                      placeholder="ej: Bangkok → Krabi"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-16 shrink-0">
                    <label className={lbl}>Día #</label>
                    <input
                      type="number"
                      value={dayNum}
                      onChange={(e) => setDayNum(e.target.value === "" ? "" : e.target.value)}
                      onBlur={commitDayNum}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className={inputClass}
                      min="1"
                    />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className={lbl}>Título</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={commitTitle}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className={inputClass}
                      placeholder="Título del día"
                    />
                  </div>
                </div>

                <div className={`${isMain ? "pt-4" : "pt-3"} border-t-2 border-slate-200`}>
                  <h4 className={`${secTitle} flex items-center gap-2`}>
                    <span className={transportEmoji} aria-hidden>
                      🚌
                    </span>
                    Transporte
                  </h4>
                  <div className="flex flex-nowrap items-end gap-2 flex-wrap">
                    <div className="min-w-[110px] flex-1">
                      <label className={isMain ? "block text-sm font-bold text-slate-700 mb-1.5" : "block text-xs font-bold text-slate-700 mb-1"}>Tipo</label>
                      <select
                        value={transport?.type || ""}
                        onChange={(e) => setTransport((prev) => ({ ...prev, type: e.target.value, duration: prev?.duration ?? "", priceUSD: prev?.priceUSD }))}
                        onBlur={commitTransport}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="">Sin transporte</option>
                        <option value="flight">Vuelo</option>
                        <option value="ferry">Ferry</option>
                        <option value="high-speed ferry">Ferry rápido</option>
                        <option value="longtail boat">Longtail boat</option>
                        <option value="boat tour">Tour en barco</option>
                        <option value="speedboat tour">Speedboat tour</option>
                        <option value="bus">Bus</option>
                        <option value="train">Tren</option>
                        <option value="taxi">Taxi</option>
                      </select>
                    </div>
                    <div className="min-w-[80px] flex-1">
                      <label className={isMain ? "block text-sm font-bold text-slate-700 mb-1.5" : "block text-xs font-bold text-slate-700 mb-1"}>Duración</label>
                      <input
                        type="text"
                        value={transport?.duration || ""}
                        onChange={(e) => setTransport((prev) => ({ ...prev, type: prev?.type ?? "", duration: e.target.value, priceUSD: prev?.priceUSD }))}
                        onBlur={commitTransport}
                        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                        className={inputClass}
                        placeholder="2h"
                      />
                    </div>
                    <div className="min-w-[80px] flex-1">
                      <label className={isMain ? "block text-sm font-bold text-slate-700 mb-1.5" : "block text-xs font-bold text-slate-700 mb-1"}>Costo USD</label>
                      <input
                        type="number"
                        value={transport?.priceUSD ?? ""}
                        onChange={(e) =>
                          setTransport((prev) => ({
                            ...prev,
                            type: prev?.type ?? "",
                            duration: prev?.duration ?? "",
                            priceUSD: e.target.value ? parseFloat(e.target.value) : undefined,
                          }))
                        }
                        onBlur={commitTransport}
                        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                        className={inputClass}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DaySlotsEditor day={day} largeText={isMain} />

          <div className={`rounded-xl border-2 border-slate-300 shadow-md bg-gradient-to-br from-amber-50/80 to-orange-50/50 ${isMain ? "px-4 py-4" : "px-3 py-3"}`}>
            <h4 className={`${isMain ? "text-sm" : "text-xs"} font-bold text-slate-900 uppercase tracking-wide mb-2 pl-1 border-l-4 border-amber-500`}>Destacados</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {day.highlights?.map((h, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 font-medium bg-amber-100 text-amber-950 border-2 border-amber-400 rounded-full shadow-sm ${isMain ? "text-base px-3.5 py-1.5" : "text-sm px-3 py-1"}`}
                >
                  {h}
                  <button
                    type="button"
                    onClick={() => removeHighlight(day.id, i)}
                    className="w-4 h-4 rounded-full hover:bg-amber-300/80 flex items-center justify-center text-amber-900"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHighlight()}
                className={`flex-1 min-w-0 border-2 border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 ${isMain ? "px-3 py-2.5 text-base" : "px-2.5 py-2 text-sm"}`}
                placeholder="Añadir destacado..."
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className={`bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 shadow-sm transition-colors flex-shrink-0 ${isMain ? "px-4 py-2.5 text-sm" : "px-3 py-2 text-xs"}`}
              >
                <span className="hidden sm:inline">Añadir</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

        </div>
  );

  const filledSlots = [day.morningDescription, day.middayDescription, day.afternoonDescription].filter((s) => s.trim()).length;

  if (variant === "main") {
    return (
      <div className="bg-slate-100/90 rounded-xl shadow-lg border-2 border-slate-300 overflow-hidden">
        {formBody}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-xl shadow-md border-2 border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 p-3 md:p-4 border-b border-gray-100">
        <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
          {day.day}
        </span>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left flex items-center justify-between gap-2 min-w-0 hover:bg-gray-50 rounded-lg -m-1 p-1 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 break-words min-w-0">{day.title}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs bg-blue-50 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-medium" title={`${filledSlots}/3 tramos con texto`}>
              {filledSlots}
            </span>
            <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 pb-3 md:px-4 md:pb-4 pt-0 flex-wrap">
        {typeof index === "number" && onDragStart && onDragEnd ? (
          <div
            draggable={true}
            onDragStart={(e) => {
              e.stopPropagation();
              onDragStart(e, index);
            }}
            onDragEnd={onDragEnd}
            className="cursor-grab active:cursor-grabbing touch-none p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 select-none rounded-lg border border-blue-200"
            title="Arrastrar para reordenar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
            </svg>
          </div>
        ) : (
          <div className="w-8" aria-hidden />
        )}
        {day.date && (
          <span className="text-sm text-gray-600 whitespace-nowrap" title="Fecha">
            {day.date}
          </span>
        )}
        {day.location && (
          <span className="text-sm text-gray-600 min-w-0 truncate max-w-[120px] md:max-w-[180px]" title={day.location}>
            {day.location}
          </span>
        )}
        <button
          type="button"
          onClick={handleDeleteDay}
          className="ml-auto w-auto min-w-0 px-2 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
          title="Eliminar día"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {isExpanded && formBody}
    </div>
  );
}
