"use client";

import { useState, useEffect } from "react";
import type { ItineraryDay } from "@/types/itinerary";
import { useItinerary } from "@/contexts/ItineraryContext";

const SLOTS: { key: "morningDescription" | "middayDescription" | "afternoonDescription"; label: string }[] = [
  { key: "morningDescription", label: "Mañana" },
  { key: "middayDescription", label: "Tarde" },
  { key: "afternoonDescription", label: "Noche" },
];

interface DaySlotsEditorProps {
  day: ItineraryDay;
  /** Modal edición día: fuentes un nivel más grandes */
  largeText?: boolean;
}

export default function DaySlotsEditor({ day, largeText = false }: DaySlotsEditorProps) {
  const { updateDay } = useItinerary();
  const [open, setOpen] = useState(true);
  const [morning, setMorning] = useState(day.morningDescription);
  const [midday, setMidday] = useState(day.middayDescription);
  const [afternoon, setAfternoon] = useState(day.afternoonDescription);

  useEffect(() => {
    setMorning(day.morningDescription);
    setMidday(day.middayDescription);
    setAfternoon(day.afternoonDescription);
  }, [day.id, day.morningDescription, day.middayDescription, day.afternoonDescription]);

  const commit = (key: (typeof SLOTS)[number]["key"], raw: string) => {
    const next = raw.trim();
    const prev =
      key === "morningDescription"
        ? day.morningDescription.trim()
        : key === "middayDescription"
          ? day.middayDescription.trim()
          : day.afternoonDescription.trim();
    if (next !== prev) updateDay(day.id, { [key]: next } as Partial<ItineraryDay>);
  };

  const fields: Record<(typeof SLOTS)[number]["key"], [string, (s: string) => void]> = {
    morningDescription: [morning, setMorning],
    middayDescription: [midday, setMidday],
    afternoonDescription: [afternoon, setAfternoon],
  };

  const filled = [day.morningDescription, day.middayDescription, day.afternoonDescription].filter((s) => s.trim()).length;
  const summary =
    filled === 0 ? "Sin contenido en mañana, tarde ni noche" : `${filled}/3 tramos · mañana · tarde · noche`;

  const blockHdr = largeText ? "text-sm font-bold text-slate-900 uppercase tracking-wide" : "text-xs font-bold text-slate-900 uppercase tracking-wide";
  const summaryCls = largeText ? "text-sm text-slate-700 font-medium truncate mt-1.5" : "text-xs text-slate-700 font-medium truncate mt-1";
  const lbl = largeText ? "block text-sm font-bold text-slate-800 mb-1.5" : "block text-xs font-bold text-slate-800 mb-1";
  const hintCls = "text-sm text-slate-700 leading-snug mb-2 font-medium";
  const taCls = largeText
    ? "w-full px-3 py-2.5 border-2 border-slate-300 rounded-lg text-base text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 resize-y min-h-[5.5rem]"
    : "w-full px-2.5 py-2 border-2 border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 resize-y min-h-[4.5rem]";
  const chevWrap = largeText
    ? "shrink-0 w-9 h-9 rounded-full bg-violet-600 text-white border-2 border-violet-700 shadow flex items-center justify-center transition-transform"
    : "shrink-0 w-8 h-8 rounded-full bg-violet-600 text-white border-2 border-violet-700 shadow flex items-center justify-center transition-transform";
  const chevIcon = largeText ? "w-5 h-5" : "w-4 h-4";
  const btnPad = largeText ? "px-3 py-3.5" : "px-3 py-2.5";
  const innerPad = largeText ? "px-4 pb-4 pt-3 space-y-3" : "px-3 pb-3 pt-3 space-y-3";

  return (
    <div className="rounded-xl border-2 border-slate-300 shadow-md overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 text-left bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 hover:from-violet-100/80 hover:to-fuchsia-100/80 transition-colors border-b-2 border-slate-200/80 ${btnPad}`}
      >
        <div className="min-w-0 flex-1 pl-1 border-l-4 border-violet-600">
          <span className={blockHdr}>Actividades</span>
          {!open && <p className={summaryCls}>{summary}</p>}
        </div>
        <span className={`${chevWrap} ${open ? "rotate-180" : ""}`}>
          <svg className={chevIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div className={`${innerPad} bg-slate-50`}>
          <p className={hintCls}>
            <span className="font-bold text-violet-800">#</span> título · <span className="font-bold text-violet-800">- </span> lista · párrafo
          </p>
          {SLOTS.map(({ key, label }) => {
            const [val, setVal] = fields[key];
            return (
              <div key={key}>
                <label className={lbl}>{label}</label>
                <textarea
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onBlur={(e) => commit(key, e.target.value)}
                  rows={largeText ? 5 : 4}
                  className={taCls}
                  placeholder={`${label}…`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
