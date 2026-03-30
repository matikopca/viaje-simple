"use client";

import type { ReactNode } from "react";
import { activityDescriptionPlainText } from "@/lib/activityDescription";
import type { RichDescription } from "@/lib/activityDescription";

interface ActivityDescriptionContentProps {
  description: RichDescription;
  /** Por defecto `mt-2 space-y-1` */
  className?: string;
}

function isGoogleMapsUrl(s: string): boolean {
  const t = s.trim().toLowerCase();
  if (!t.startsWith("https://") && !t.startsWith("http://")) return false;
  return (
    t.includes("google.com/maps") ||
    t.includes("maps.google.") ||
    t.includes("goo.gl/maps") ||
    t.includes("maps.app.goo.gl")
  );
}

function GoogleMapsLink({ href }: { href: string }) {
  const url = href.trim();
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir en Google Maps"
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full shadow-sm transition-colors border border-blue-700/30"
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      VER EN GOOGLE
    </a>
  );
}

function renderLine(line: string): ReactNode {
  return isGoogleMapsUrl(line) ? <GoogleMapsLink href={line} /> : line;
}

/**
 * Un bloque de texto: líneas con "# " o "#" → título en negrita;
 * líneas que empiezan por "- " (tras espacios) → lista;
 * el resto → párrafo (respeta saltos de línea dentro del párrafo).
 * URLs de Google Maps se muestran como enlace «VER EN GOOGLE».
 */
export default function ActivityDescriptionContent({ description, className }: ActivityDescriptionContentProps) {
  const text = activityDescriptionPlainText(description);
  if (!text.trim()) return null;

  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      nodes.push(<div key={`sp-${key++}`} className="h-2 shrink-0" aria-hidden />);
      i++;
      continue;
    }

    const trimmed = line.trim();

    if (trimmed.startsWith("#")) {
      const titleText = trimmed.replace(/^#+\s*/, "").trim();
      if (titleText) {
        nodes.push(
          <div key={`h-${key++}`} className="text-lg sm:text-xl font-bold text-violet-700 tracking-tight">
            {isGoogleMapsUrl(titleText) ? <GoogleMapsLink href={titleText} /> : titleText}
          </div>
        );
      }
      i++;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length) {
        const L = lines[i];
        const t = L.trim();
        if (t === "") break;
        if (!t.startsWith("- ")) break;
        items.push(t.slice(2).trimEnd());
        i++;
      }
      nodes.push(
        <ul key={`ul-${key++}`} className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          {items.map((item, j) => (
            <li key={j} className="break-words marker:text-gray-400">
              {renderLine(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const L = lines[i];
      const t = L.trim();
      if (t === "") break;
      if (t.startsWith("#") || t.startsWith("- ")) break;
      para.push(L);
      i++;
    }
    nodes.push(
      <div key={`p-${key++}`} className="text-sm text-gray-600 space-y-2 break-words">
        {para.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap">
            {renderLine(line)}
          </div>
        ))}
      </div>
    );
  }

  return <div className={className ?? "mt-2 space-y-1"}>{nodes}</div>;
}
