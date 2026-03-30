"use client";

import { useState, useEffect, useLayoutEffect, useMemo, type RefObject } from "react";
import { parseDateOnlyLocal } from "@/lib/dateOnly";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

interface TripCountdownProps {
  targetDate: string | null;
  scrollTopSentinelRef: RefObject<HTMLDivElement | null>;
}

function cn(...parts: (string | boolean | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Misma fila de tiempo en ambos modos; solo cambian tamaño y etiqueta (arriba vs sufijo). */
function TimeUnit({
  value,
  atTop,
  longLabel,
  shortSuffix,
  pad,
}: {
  value: number;
  atTop: boolean;
  longLabel: string;
  shortSuffix: string;
  pad: boolean;
}) {
  const v = pad ? pad2(value) : String(value);
  return (
    <div
      className={cn(
        "flex min-w-0 transition-[gap] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
        atTop ? "flex-col items-center gap-0.5 sm:min-w-[4rem]" : "flex-row items-baseline gap-0.5"
      )}
    >
      <span
        className={cn(
          "font-mono font-bold tabular-nums leading-none transition-[font-size] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
          atTop ? "text-xl sm:text-2xl" : "text-sm sm:text-base"
        )}
      >
        {v}
      </span>
      <span
        className={cn(
          "font-medium text-white/80 transition-[font-size,opacity] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
          atTop
            ? "text-[10px] uppercase tracking-wider sm:text-xs"
            : "text-[9px] leading-none text-white/75 sm:text-[10px]"
        )}
      >
        {atTop ? longLabel : shortSuffix}
      </span>
    </div>
  );
}

function DotSep({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block select-none text-center text-white/35 transition-[opacity,width,margin,max-width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
        visible ? "mx-0.5 w-[0.35em] max-w-[1rem] opacity-100 sm:mx-1" : "mx-0 w-0 max-w-0 overflow-hidden opacity-0"
      )}
    >
      ·
    </span>
  );
}

export default function TripCountdown({ targetDate, scrollTopSentinelRef }: TripCountdownProps) {
  const [tick, setTick] = useState(0);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    if (!targetDate) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  const { diffMs, ended } = useMemo(() => {
    if (!targetDate) return { diffMs: 0, ended: true };
    const target = parseDateOnlyLocal(targetDate);
    if (Number.isNaN(target.getTime())) return { diffMs: 0, ended: true };
    const diff = target.getTime() - Date.now();
    return { diffMs: diff, ended: diff <= 0 };
  }, [targetDate, tick]);

  useLayoutEffect(() => {
    if (!targetDate || ended) return;
    const el = scrollTopSentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setAtTop(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "32px 0px 0px 0px",
        threshold: 0,
      }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [targetDate, ended, scrollTopSentinelRef]);

  if (!targetDate) return null;

  if (ended) {
    return (
      <div className="border-b border-emerald-700/30 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-center text-[11px] font-semibold text-white sm:text-xs">
        ¡El viaje ya comenzó!
      </div>
    );
  }

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const compactSep = !atTop;

  return (
    <div
      className={cn(
        "border-b border-violet-800/30 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white backdrop-blur-sm",
        "transition-[padding,box-shadow] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
        atTop ? "px-3 py-3 shadow-md sm:px-6" : "px-2 py-1.5 shadow-sm sm:px-4"
      )}
    >
      {/* Título: colapsa con altura + opacidad (un solo árbol DOM) */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
          atTop ? "mb-2 max-h-14 opacity-100" : "mb-0 max-h-0 opacity-0"
        )}
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-100 sm:text-xs">
          Cuenta atrás para el viaje
        </p>
      </div>

      <div
        className={cn(
          "mx-auto flex max-w-4xl flex-wrap justify-center transition-[gap] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
          atTop ? "items-end gap-3 sm:gap-6" : "items-center gap-x-0 gap-y-1 sm:gap-x-0"
        )}
      >
        {days > 0 && (
          <>
            <TimeUnit value={days} atTop={atTop} longLabel="días" shortSuffix="d" pad={false} />
            <DotSep visible={compactSep} />
          </>
        )}
        <TimeUnit value={hours} atTop={atTop} longLabel="horas" shortSuffix="h" pad />
        <DotSep visible={compactSep} />
        <TimeUnit value={minutes} atTop={atTop} longLabel="min" shortSuffix="m" pad />
        <DotSep visible={compactSep} />
        <TimeUnit value={seconds} atTop={atTop} longLabel="seg" shortSuffix="s" pad />
      </div>
    </div>
  );
}
