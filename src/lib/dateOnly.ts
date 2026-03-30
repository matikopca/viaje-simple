/**
 * Fechas solo calendario (YYYY-MM-DD) guardadas como string.
 * No usar `new Date("YYYY-MM-DD")`: en JS eso es medianoche UTC y al mostrar
 * en zona local (p. ej. América) el día puede verse un día antes.
 */

export function parseDateOnlyLocal(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return new Date(NaN);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return new Date(y, mo - 1, d);
}

export function formatDateOnlyLocal(
  iso: string,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseDateOnlyLocal(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, options);
}

/** Suma días a una fecha YYYY-MM-DD en calendario local; devuelve otro YYYY-MM-DD. */
export function addDaysToDateOnly(iso: string, deltaDays: number): string {
  const d = parseDateOnlyLocal(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + deltaDays);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
