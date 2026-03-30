"use client";

import { useState, useEffect, useRef } from "react";
import { ItineraryProvider, useItinerary } from "@/contexts/ItineraryContext";
import type { ItineraryDay, Country } from "@/types/itinerary";
import DraggableDayList from "@/components/admin/DraggableDayList";
import Link from "next/link";

/** Banderas para elegir al crear/editar país. Si no está el país, usar Planeta Tierra. */
const COUNTRY_FLAGS: { name: string; emoji: string }[] = [
  { name: "Argentina", emoji: "🇦🇷" },
  { name: "Australia", emoji: "🇦🇺" },
  { name: "Brasil", emoji: "🇧🇷" },
  { name: "Canadá", emoji: "🇨🇦" },
  { name: "Chile", emoji: "🇨🇱" },
  { name: "China", emoji: "🇨🇳" },
  { name: "Colombia", emoji: "🇨🇴" },
  { name: "Corea del Sur", emoji: "🇰🇷" },
  { name: "España", emoji: "🇪🇸" },
  { name: "Estados Unidos", emoji: "🇺🇸" },
  { name: "Francia", emoji: "🇫🇷" },
  { name: "India", emoji: "🇮🇳" },
  { name: "Indonesia", emoji: "🇮🇩" },
  { name: "Italia", emoji: "🇮🇹" },
  { name: "Japón", emoji: "🇯🇵" },
  { name: "México", emoji: "🇲🇽" },
  { name: "Perú", emoji: "🇵🇪" },
  { name: "Portugal", emoji: "🇵🇹" },
  { name: "Reino Unido", emoji: "🇬🇧" },
  { name: "Tailandia", emoji: "🇹🇭" },
  { name: "Vietnam", emoji: "🇻🇳" },
  { name: "Planeta Tierra (otro)", emoji: "🌍" },
];

/** Normaliza texto para comparar (minúsculas, sin acentos). */
function normalizeForMatch(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Sugiere emoji de bandera según el nombre del país. Devuelve el emoji o null si no hay match. */
function suggestFlagEmoji(countryName: string): string | null {
  if (!countryName.trim()) return null;
  const normalized = normalizeForMatch(countryName);
  const list = COUNTRY_FLAGS.filter((c) => c.emoji !== "🌍");
  const exact = list.find((c) => normalizeForMatch(c.name) === normalized);
  if (exact) return exact.emoji;
  const starts = list.find((c) => normalizeForMatch(c.name).startsWith(normalized) || normalized.startsWith(normalizeForMatch(c.name)));
  if (starts) return starts.emoji;
  const includes = list.find((c) => normalizeForMatch(c.name).includes(normalized) || normalized.includes(normalizeForMatch(c.name)));
  return includes ? includes.emoji : null;
}

function AdminContent() {
  const { countries, itinerary, addDay, addCountry, updateCountry, deleteCountry, reorderCountries, exportData, loading, error } = useItinerary();
  const [showExport, setShowExport] = useState(false);
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryFlag, setNewCountryFlag] = useState(COUNTRY_FLAGS[COUNTRY_FLAGS.length - 1].emoji);
  const [showEditCountryModal, setShowEditCountryModal] = useState(false);
  const [editCountryId, setEditCountryId] = useState<string | null>(null);
  const [editCountryName, setEditCountryName] = useState("");
  const [editCountryFlag, setEditCountryFlag] = useState("🌍");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [draggedCountryIndex, setDraggedCountryIndex] = useState<number | null>(null);
  const [dropCountryIndex, setDropCountryIndex] = useState<number | null>(null);
  const draggedCountryIndexRef = useRef<number | null>(null);
  const userCollapsedRef = useRef(false);

  // Al cargar: expandir el primero. Si el usuario colapsó, no volver a expandir. Si eliminaron el país actual, elegir otro.
  useEffect(() => {
    if (countries.length === 0) {
      setExpandedCountry(null);
      userCollapsedRef.current = false;
      return;
    }
    setExpandedCountry((current) => {
      if (current && !countries.some((c) => c.id === current)) return countries[0].id; // País eliminado
      if (!current && userCollapsedRef.current) return null; // Usuario colapsó: respetar
      if (!current) return countries[0].id; // Carga inicial: expandir el primero
      return current;
    });
  }, [countries]);

  const handleToggleCountry = (countryId: string) => {
    setExpandedCountry((current) => {
      const next = current === countryId ? null : countryId;
      userCollapsedRef.current = next === null;
      return next;
    });
  };

  const totalCost = itinerary.reduce((sum: number, day: ItineraryDay) => {
    return sum + (day.transport?.priceUSD || 0);
  }, 0);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportData());
    alert("Datos copiados al portapapeles");
  };

  const openAddCountryModal = () => {
    setNewCountryName("");
    setNewCountryFlag(COUNTRY_FLAGS[COUNTRY_FLAGS.length - 1].emoji);
    setShowAddCountryModal(true);
  };

  const handleAddCountrySubmit = () => {
    const name = newCountryName.trim();
    if (!name) return;
    setShowAddCountryModal(false);
    userCollapsedRef.current = false;
    addCountry(name, newCountryFlag).then((id) => id && setExpandedCountry(id));
  };

  const openEditCountryModal = (country: Country) => {
    setEditCountryId(country.id);
    setEditCountryName(country.name);
    setEditCountryFlag(country.flagEmoji || "🌍");
    setShowEditCountryModal(true);
  };

  const handleEditCountrySubmit = () => {
    const name = editCountryName.trim();
    if (!editCountryId || !name) return;
    setShowEditCountryModal(false);
    updateCountry(editCountryId, name, editCountryFlag);
    setEditCountryId(null);
  };

  const handleDeleteCountry = (countryId: string, countryName: string) => {
    if (!confirm(`¿Eliminar el país "${countryName}" y todos sus días? Esta acción no se puede deshacer.`)) return;
    deleteCountry(countryId);
    setExpandedCountry((current) => (current === countryId ? null : current));
  };

  const handleCountryDragStart = (e: React.DragEvent, index: number) => {
    draggedCountryIndexRef.current = index;
    setDraggedCountryIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "country", index }));
  };
  const handleCountryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDropCountryIndex(index);
  };
  const handleCountryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropCountryIndex(null);
  };
  const handleCountryDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    const fromIndex = draggedCountryIndexRef.current;
    draggedCountryIndexRef.current = null;
    setDraggedCountryIndex(null);
    setDropCountryIndex(null);
    if (fromIndex !== null && fromIndex !== toIndex) reorderCountries(fromIndex, toIndex);
  };
  const handleCountryDragEnd = () => {
    draggedCountryIndexRef.current = null;
    setDraggedCountryIndex(null);
    setDropCountryIndex(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de conexión</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">Administrar Itinerario</h1>
              <p className="text-xs md:text-sm text-gray-500">{itinerary.length} días • ${totalCost.toFixed(0)} USD</p>
            </div>
            <div className="flex items-center gap-1 md:gap-3 ml-2">
              <Link
                href="/"
                className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ver itinerario"
              >
                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden md:inline md:ml-2">Ver</span>
              </Link>
              <button
                onClick={() => setShowExport(!showExport)}
                className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors"
                title="Exportar"
              >
                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden md:inline md:ml-2">Exportar</span>
              </button>
              <button
                onClick={openAddCountryModal}
                className="relative flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                title="Añadir país"
              >
                <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-amber-600 flex items-center justify-center text-amber-600 text-xs font-bold leading-none">+</span>
                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden md:inline md:ml-2">Añadir país</span>
              </button>
              <button
                onClick={() => addDay()}
                className="relative flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                title="Añadir día"
              >
                <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white border border-purple-600 flex items-center justify-center text-purple-600 text-xs font-bold leading-none">+</span>
                <span className="text-lg md:text-xl" aria-hidden>📅</span>
                <span className="hidden md:inline md:ml-2">Añadir día</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {showAddCountryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddCountryModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Añadir país</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del país</label>
              <input
                type="text"
                value={newCountryName}
                onChange={(e) => {
                  setNewCountryName(e.target.value);
                  const suggested = suggestFlagEmoji(e.target.value);
                  setNewCountryFlag(suggested ?? COUNTRY_FLAGS[COUNTRY_FLAGS.length - 1].emoji);
                }}
                placeholder="Ej. Tailandia, Japón..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bandera</label>
              <div className="flex flex-wrap gap-2">
                {COUNTRY_FLAGS.map(({ name, emoji }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setNewCountryFlag(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center transition-colors ${newCountryFlag === emoji ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    title={name}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Si tu país no está, elige Planeta Tierra (🌍).</p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddCountryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCountrySubmit}
                disabled={!newCountryName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditCountryModal && editCountryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEditCountryModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900">Editar país</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del país</label>
              <input
                type="text"
                value={editCountryName}
                onChange={(e) => {
                  setEditCountryName(e.target.value);
                  const suggested = suggestFlagEmoji(e.target.value);
                  setEditCountryFlag(suggested ?? COUNTRY_FLAGS[COUNTRY_FLAGS.length - 1].emoji);
                }}
                placeholder="Ej. Tailandia, Japón..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bandera</label>
              <div className="flex flex-wrap gap-2">
                {COUNTRY_FLAGS.map(({ name, emoji }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setEditCountryFlag(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg border-2 flex items-center justify-center transition-colors ${editCountryFlag === emoji ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    title={name}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Si tu país no está, elige Planeta Tierra (🌍).</p>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowEditCountryModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEditCountrySubmit}
                disabled={!editCountryName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showExport && (
        <div className="max-w-5xl mx-auto px-6 pt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Exportar datos JSON</h3>
              <button
                onClick={handleCopyExport}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Copiar al portapapeles
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {exportData()}
            </pre>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-5">
        <p className="text-xs text-gray-500 mb-2">Arrastra el icono ⋮⋮ de cada país para reordenar.</p>
        {countries.map((country: Country, index: number) => (
          <section
            key={country.id}
            onDragOver={(e) => handleCountryDragOver(e, index)}
            onDragLeave={handleCountryDragLeave}
            onDrop={(e) => handleCountryDrop(e, index)}
            className={`mb-4 transition-opacity ${draggedCountryIndex === index ? "opacity-50" : ""} ${dropCountryIndex === index ? "ring-2 ring-amber-400 ring-offset-2 rounded-2xl" : ""}`}
          >
            <div className="flex items-center gap-1.5">
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.stopPropagation();
                  handleCountryDragStart(e, index);
                }}
                onDragEnd={handleCountryDragEnd}
                className="cursor-grab active:cursor-grabbing touch-none p-1.5 text-gray-400 hover:text-gray-600 flex-shrink-0 rounded-lg hover:bg-gray-100 select-none"
                title="Arrastrar para reordenar países"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleCountry(country.id)}
                  className="flex-1 flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left min-w-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flagEmoji || "🌍"}</span>
                    <div>
                      <h2 className="font-semibold text-gray-900">{country.name}</h2>
                      <p className="text-sm text-gray-500">{country.days.length} días</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform flex-shrink-0 ${expandedCountry === country.id ? "rotate-180" : ""}`}>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditCountryModal(country);
                  }}
                  className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                  title="Editar nombre y bandera"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCountry(country.id, country.name);
                  }}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                  title="Eliminar país"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {expandedCountry === country.id && (
              <div className="mt-2 pl-0">
                <p className="text-xs text-gray-500 mb-2">Arrastra los días para reordenar. Se renumeran automáticamente.</p>
                <DraggableDayList countryId={country.id} days={country.days} />
                <button
                  onClick={() => addDay(country.id)}
                  className="w-full mt-2 py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir día
                </button>
              </div>
            )}
          </section>
        ))}

        {countries.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay países</h3>
            <p className="text-gray-500 mb-4">Añade un país y dentro de él crea la agenda con días reordenables.</p>
            <button
              onClick={openAddCountryModal}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir primer país
            </button>
          </div>
        )}

        {countries.length > 0 && itinerary.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Expande un país arriba y usa &quot;Añadir día&quot; para crear la agenda.
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ItineraryProvider>
      <AdminContent />
    </ItineraryProvider>
  );
}
