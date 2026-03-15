"use client";

import { useState, useEffect } from "react";
import { ItineraryDay, Transport } from "@/types/itinerary";
import { useItinerary } from "@/contexts/ItineraryContext";
import ActivityEditor from "./ActivityEditor";

interface DayEditorProps {
  day: ItineraryDay;
  /** Para lista reordenable: índice y handlers de drag (si no se pasan, no se muestra el grip) */
  index?: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
}

export default function DayEditor({ day, index, onDragStart, onDragEnd }: DayEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newHighlight, setNewHighlight] = useState("");
  const [dayNum, setDayNum] = useState(String(day.day));
  const [date, setDate] = useState(day.date);
  const [title, setTitle] = useState(day.title);
  const [location, setLocation] = useState(day.location);
  const [transport, setTransport] = useState<Transport | undefined>(day.transport);
  const { updateDay, deleteDay, addActivity, updateActivity, deleteActivity, reorderActivities, addHighlight, removeHighlight } = useItinerary();

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
    if (confirm("¿Eliminar este día y todas sus actividades?")) deleteDay(day.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Nivel 1: ID - Título - Nº actividades - Botón expandir */}
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
            <span className="text-xs bg-blue-50 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center font-medium" title={`${day.activities.length} actividades`}>
              {day.activities.length}
            </span>
            <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>
      {/* Nivel 2: Draggable - Fecha - Lugar - Nº actividades - Botón eliminar */}
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

      {isExpanded && (
        <div className="border-t border-gray-100 p-3 md:p-4 space-y-4">
          <div className="flex flex-nowrap items-end gap-3">
            <div className="min-w-[140px] flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={commitDate}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={commitLocation}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ej: Bangkok → Krabi"
              />
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-end gap-4">
            <div className="w-14 flex-shrink-0">
              <label className="block text-xs font-medium text-gray-500 mb-1">Día #</label>
              <input
                type="number"
                value={dayNum}
                onChange={(e) => setDayNum(e.target.value === "" ? "" : e.target.value)}
                onBlur={commitDayNum}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full px-2 py-1.5 text-sm text-gray-500 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Título del día"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Transporte</h4>
            <div className="flex flex-nowrap items-end gap-3">
              <div className="min-w-[120px] flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={transport?.type || ""}
                  onChange={(e) => setTransport((prev) => ({ ...prev, type: e.target.value, duration: prev?.duration ?? "", priceUSD: prev?.priceUSD }))}
                  onBlur={commitTransport}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              <div className="min-w-[90px] flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Duración</label>
                <input
                  type="text"
                  value={transport?.duration || ""}
                  onChange={(e) => setTransport((prev) => ({ ...prev, type: prev?.type ?? "", duration: e.target.value, priceUSD: prev?.priceUSD }))}
                  onBlur={commitTransport}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="ej: 2h 30m"
                />
              </div>
              <div className="min-w-[80px] flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Costo USD</label>
                <input
                  type="number"
                  value={transport?.priceUSD ?? ""}
                  onChange={(e) => setTransport((prev) => ({ ...prev, type: prev?.type ?? "", duration: prev?.duration ?? "", priceUSD: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  onBlur={commitTransport}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Actividades</h4>
            
            <div className="space-y-3">
              {day.activities.map((activity, index) => (
                <ActivityEditor
                  key={activity.id}
                  activity={activity}
                  index={index}
                  onUpdate={(updates) => updateActivity(day.id, activity.id, updates)}
                  onDelete={() => deleteActivity(day.id, activity.id)}
                  onMoveUp={() => reorderActivities(day.id, index, index - 1)}
                  onMoveDown={() => reorderActivities(day.id, index, index + 1)}
                  isFirst={index === 0}
                  isLast={index === day.activities.length - 1}
                />
              ))}
              {day.activities.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay actividades. Añade una para comenzar.
                </p>
              )}
              
              <button
                onClick={() => addActivity(day.id)}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir actividad
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Destacados</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {day.highlights?.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full"
                >
                  {h}
                  <button
                    onClick={() => removeHighlight(day.id, i)}
                    className="w-4 h-4 rounded-full hover:bg-orange-200 flex items-center justify-center"
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
                className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Añadir destacado..."
              />
              <button
                onClick={handleAddHighlight}
                className="px-3 md:px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex-shrink-0"
              >
                <span className="hidden sm:inline">Añadir</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
