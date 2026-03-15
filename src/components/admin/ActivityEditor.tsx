"use client";

import { useState, useRef, useEffect } from "react";
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

function normalizeDescription(activity: Activity): string[] {
  if (!activity.description) return [];
  if (Array.isArray(activity.description)) return activity.description;
  if (typeof activity.description === "string") return activity.description ? [activity.description] : [];
  return [];
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
  const initialItems = normalizeDescription(activity);
  const [localItems, setLocalItems] = useState<string[]>(initialItems);
  const [newLine, setNewLine] = useState("");
  const [place, setPlace] = useState(activity.place);
  const [duration, setDuration] = useState(activity.duration ?? "");
  const [priceUSD, setPriceUSD] = useState(
    activity.priceUSD !== undefined && activity.priceUSD !== null ? String(activity.priceUSD) : ""
  );
  const [mapUrl, setMapUrl] = useState(activity.mapUrl ?? "");
  const newLineRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<string[]>(localItems);
  itemsRef.current = localItems;

  useEffect(() => {
    setLocalItems(normalizeDescription(activity));
  }, [activity.id]);

  useEffect(() => {
    setPlace(activity.place);
    setDuration(activity.duration ?? "");
    setPriceUSD(activity.priceUSD !== undefined && activity.priceUSD !== null ? String(activity.priceUSD) : "");
    setMapUrl(activity.mapUrl ?? "");
  }, [activity.id, activity.place, activity.duration, activity.priceUSD, activity.mapUrl]);

  const commitItems = (items: string[]) => {
    setLocalItems(items);
    onUpdate({ description: items });
  };

  const handleAddLine = () => {
    const t = newLine.trim();
    if (t) {
      const next = [...localItems, t];
      setNewLine("");
      commitItems(next);
      requestAnimationFrame(() => newLineRef.current?.focus());
    }
  };

  const handleNewLineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLine();
    }
  };

  const handleNewLineBlur = () => {
    if (newLine.trim()) handleAddLine();
  };

  const handleItemBlur = (itemIndex: number, value: string) => {
    const current = itemsRef.current;
    const t = value.trim();
    if (t) {
      const next = [...current];
      next[itemIndex] = t;
      commitItems(next);
    } else {
      const next = current.filter((_, i) => i !== itemIndex);
      commitItems(next);
    }
  };

  const handleItemChange = (itemIndex: number, value: string) => {
    setLocalItems((prev) => {
      const next = [...prev];
      next[itemIndex] = value;
      return next;
    });
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, itemIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleRemoveItem = (itemIndex: number) => {
    const next = localItems.filter((_, i) => i !== itemIndex);
    commitItems(next);
  };

  const commitPlace = () => {
    const v = place.trim();
    if (v !== activity.place) onUpdate({ place: v || "Nueva actividad" });
  };
  const commitDuration = () => {
    const v = duration.trim();
    if (v !== (activity.duration ?? "")) onUpdate({ duration: v || undefined });
  };
  const commitPrice = () => {
    const num = priceUSD === "" ? undefined : parseFloat(String(priceUSD));
    const same = (num === activity.priceUSD) || (Number.isNaN(num) && activity.priceUSD === undefined);
    if (!same) onUpdate({ priceUSD: num });
  };
  const commitMapUrl = () => {
    const v = mapUrl.trim();
    if (v !== (activity.mapUrl ?? "")) onUpdate({ mapUrl: v || undefined });
  };

  return (
    <div className="bg-gray-100 rounded-xl p-3 md:p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] md:max-w-none">
            {place || "Nueva actividad"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="w-8 h-8 rounded-lg bg-white border-2 border-gray-400 flex items-center justify-center text-gray-800 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Mover arriba"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="w-8 h-8 rounded-lg bg-white border-2 border-gray-400 flex items-center justify-center text-gray-800 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Lugar (salir = guardar)</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            onBlur={commitPlace}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del lugar"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Qué hacer (Enter = nueva línea, salir = guardar)</label>
          <div className="space-y-2">
            {localItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleItemChange(i, e.target.value)}
                  onBlur={(e) => handleItemBlur(i, e.target.value)}
                  onKeyDown={(e) => handleItemKeyDown(e, i)}
                  className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
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
                ref={newLineRef}
                type="text"
                value={newLine}
                onChange={(e) => setNewLine(e.target.value)}
                onKeyDown={handleNewLineKeyDown}
                onBlur={handleNewLineBlur}
                className="flex-1 min-w-0 px-3 py-1.5 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-solid"
                placeholder="Añadir item..."
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Duración</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              onBlur={commitDuration}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ej: 2-3h"
            />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Costo (USD)</label>
            <input
              type="number"
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Link de Google Maps</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              onBlur={commitMapUrl}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://maps.app.goo.gl/..."
            />
            {mapUrl && (
              <a
                href={mapUrl}
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
