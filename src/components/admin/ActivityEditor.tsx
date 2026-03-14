"use client";

import { useState, useRef } from "react";
import { Activity } from "@/types/itinerary";

interface ActivityEditorProps {
  activity: Activity;
  index: number;
  onUpdate: (updates: Partial<Activity>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function ActivityEditor({
  activity,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ActivityEditorProps) {
  const [newItem, setNewItem] = useState("");
  const newItemInputRef = useRef<HTMLInputElement>(null);

  const normalizeDescription = (): string[] => {
    if (!activity.description) return [];
    if (Array.isArray(activity.description)) return activity.description;
    if (typeof activity.description === "string") return activity.description ? [activity.description] : [];
    return [];
  };

  const descriptions = normalizeDescription();

  const handleAddItem = () => {
    if (newItem.trim()) {
      onUpdate({ description: [...descriptions, newItem.trim()] });
      setNewItem("");
      requestAnimationFrame(() => {
        newItemInputRef.current?.focus();
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleBlur = () => {
    if (newItem.trim()) {
      handleAddItem();
    }
  };

  const handleExistingItemKeyDown = (e: React.KeyboardEvent, itemIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (descriptions[itemIndex]?.trim()) {
        newItemInputRef.current?.focus();
      }
    }
  };

  const handleRemoveItem = (itemIndex: number) => {
    const updated = descriptions.filter((_, i) => i !== itemIndex);
    onUpdate({ description: updated });
  };

  const handleUpdateItem = (itemIndex: number, value: string) => {
    const updated = [...descriptions];
    updated[itemIndex] = value;
    onUpdate({ description: updated });
  };

  return (
    <div className="bg-gray-100 rounded-xl p-3 md:p-4 border border-gray-200">
      {/* Header with number and actions - mobile friendly */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] md:max-w-none">
            {activity.place || "Nueva actividad"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Mover arriba"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Mover abajo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
            title="Eliminar actividad"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        {/* Place name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Lugar</label>
          <input
            type="text"
            value={activity.place}
            onChange={(e) => onUpdate({ place: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del lugar"
          />
        </div>

        {/* Description items */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Qué hacer (Enter para añadir)</label>
          <div className="space-y-2">
            {descriptions.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateItem(i, e.target.value)}
                  onKeyDown={(e) => handleExistingItemKeyDown(e, i)}
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveItem(i)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs flex-shrink-0">
                +
              </span>
              <input
                ref={newItemInputRef}
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-solid"
                placeholder="Añadir item..."
              />
            </div>
          </div>
        </div>

        {/* Duration and Cost - stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Duración</label>
            <input
              type="text"
              value={activity.duration || ""}
              onChange={(e) => onUpdate({ duration: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ej: 2-3h"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Costo (USD)</label>
            <input
              type="number"
              value={activity.priceUSD ?? ""}
              onChange={(e) => onUpdate({ priceUSD: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Map URL */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Link de Google Maps</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={activity.mapUrl || ""}
              onChange={(e) => onUpdate({ mapUrl: e.target.value })}
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://maps.app.goo.gl/..."
            />
            {activity.mapUrl && (
              <a
                href={activity.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors"
                title="Abrir en Google Maps"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
