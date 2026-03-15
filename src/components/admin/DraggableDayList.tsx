"use client";

import { useState, useRef } from "react";
import { ItineraryDay } from "@/types/itinerary";
import { useItinerary } from "@/contexts/ItineraryContext";
import DayEditor from "./DayEditor";

interface DraggableDayListProps {
  countryId: string;
  days: ItineraryDay[];
}

export default function DraggableDayList({ countryId, days }: DraggableDayListProps) {
  const { reorderDays } = useItinerary();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    draggedIndexRef.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "day", index }));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDropIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const fromIndex = draggedIndexRef.current;
    draggedIndexRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderDays(countryId, fromIndex, toIndex);
    }
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
    setDraggedIndex(null);
    setDropIndex(null);
  };

  return (
    <div className="space-y-2">
      {days.map((day, index) => (
        <div
          key={day.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`transition-opacity ${draggedIndex === index ? "opacity-50" : ""} ${dropIndex === index ? "ring-2 ring-blue-400 ring-offset-2 rounded-xl" : ""}`}
        >
          <DayEditor
            day={day}
            index={index}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        </div>
      ))}
    </div>
  );
}
