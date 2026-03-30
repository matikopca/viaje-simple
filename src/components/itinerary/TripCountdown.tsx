"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const SCROLL_COMPACT_PX = 32;

function parseLocalDayStart(isoDate: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!m) return new Date(NaN);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d, 0, 0, 0, 0);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

interface TripCountdownProps {
  /** YYYY-MM-DD; inicio del día en hora local */
  targetDate: string | null;
}

function BigUnit({ value, label, pad }: { value: number; label: string; pad: boolean }) {
  return (
    <div className="flex min-w-[3rem] flex-col items-center sm:min-w-[4rem]">
      <span className="font-mono text-xl font-bold tabular-nums tracking-tight sm:text-2xl">
        {pad ? pad2(value) : String(value)}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/80 sm:text-xs">{label}</span>
    </div>
  );
}

function CompactUnit({ value, suffix, pad }: { value: number; suffix: string; pad: boolean }) {
  const v = pad ? pad2(value) : String(value);
  return (
    <span className="inline-flex items-baseline gap-0.5 tabular-nums">
      <span className="font-mono text-sm font-bold leading-none sm:text-base">{v}</span>
      <span className="text-[9px] font-medium leading-none text-white/75 sm:text-[10px]">{suffix}</span>
    </span>
  );
}

export default function TripCountdown({ targetDate }: TripCountdownProps) {
  const [tick, setTick] = useState(0);
  const [atTop, setAtTop] = useState(true);

  const updateScroll = useCallback(() => {
    setAtTop(typeof window !== "undefined" && window.scrollY < SCROLL_COMPACT_PX);
  }, []);

  useEffect(() => {
    if (!targetDate) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [targetDate]);

  useEffect(() => {
    if (!targetDate) return;
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [targetDate, updateScroll]);

  const { diffMs, ended } = useMemo(() => {
    if (!targetDate) return { diffMs: 0, ended: true };
    const target = parseLocalDayStart(targetDate);
    if (Number.isNaN(target.getTime())) return { diffMs: 0, ended: true };
    const diff = target.getTime() - Date.now();
    return { diffMs: diff, ended: diff <= 0 };
  }, [targetDate, tick]);

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

  const sep = <span className="select-none text-white/35">·</span>;

  const baseBar =
    "border-b border-violet-800/30 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white backdrop-blur-sm transition-[padding] duration-200 ease-out";

  if (atTop) {
    return (
      <div className={`${baseBar} px-3 py-3 shadow-md sm:px-6`}>
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-100 sm:text-xs">
          Cuenta atrás para el viaje
        </p>
        <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-center gap-3 sm:gap-6">
          {days > 0 && <BigUnit value={days} label="días" pad={false} />}
          <BigUnit value={hours} label="horas" pad />
          <BigUnit value={minutes} label="min" pad />
          <BigUnit value={seconds} label="seg" pad />
        </div>
      </div>
    );
  }

  return (
    <div className={`${baseBar} px-2 py-1 shadow-sm sm:px-4`}>
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 sm:gap-x-2">
        {days > 0 && (
          <>
            <CompactUnit value={days} suffix="d" pad={false} />
            {sep}
          </>
        )}
        <CompactUnit value={hours} suffix="h" pad />
        {sep}
        <CompactUnit value={minutes} suffix="m" pad />
        {sep}
        <CompactUnit value={seconds} suffix="s" pad />
      </div>
    </div>
  );
}
