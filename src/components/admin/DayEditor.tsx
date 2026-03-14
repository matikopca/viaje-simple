"use client";

import { useState } from "react";
import { ItineraryDay } from "@/types/itinerary";
import { useItinerary } from "@/contexts/ItineraryContext";
import ActivityEditor from "./ActivityEditor";

interface DayEditorProps {
  day: ItineraryDay;
}

export default function DayEditor({ day }: DayEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newHighlight, setNewHighlight] = useState("");
  const { updateDay, deleteDay, addActivity, updateActivity, deleteActivity, reorderActivities, addHighlight, removeHighlight } = useItinerary();

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      addHighlight(day.id, newHighlight.trim());
      setNewHighlight("");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors gap-3"
      >
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
            {day.day}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">{day.title}</h3>
            <p className="text-xs md:text-sm text-gray-600 truncate">{day.location} • {day.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hidden sm:inline-block">
            {day.activities.length} actividades
          </span>
          <span className="text-xs bg-blue-50 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center sm:hidden">
            {day.activities.length}
          </span>
          <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-4 md:p-5 space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Día #</label>
              <input
                type="number"
                value={day.day}
                onChange={(e) => updateDay(day.id, { day: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={day.date}
                onChange={(e) => updateDay(day.id, { date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={day.title}
              onChange={(e) => updateDay(day.id, { title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Título del día"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={day.location}
              onChange={(e) => updateDay(day.id, { location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ej: Bangkok → Krabi"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Transporte</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={day.transport?.type || ""}
                  onChange={(e) => updateDay(day.id, { transport: { ...day.transport, type: e.target.value, duration: day.transport?.duration || "" } })}
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duración</label>
                <input
                  type="text"
                  value={day.transport?.duration || ""}
                  onChange={(e) => updateDay(day.id, { transport: { ...day.transport, type: day.transport?.type || "", duration: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="ej: 2h 30m"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio USD</label>
                <input
                  type="number"
                  value={day.transport?.priceUSD ?? ""}
                  onChange={(e) => updateDay(day.id, { transport: { ...day.transport, type: day.transport?.type || "", duration: day.transport?.duration || "", priceUSD: e.target.value ? parseFloat(e.target.value) : undefined } })}
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

          <div className="border-t border-gray-100 pt-4 flex justify-end">
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de eliminar este día?")) {
                  deleteDay(day.id);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar día
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
