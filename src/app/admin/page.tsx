"use client";

import { useState } from "react";
import { ItineraryProvider, useItinerary } from "@/contexts/ItineraryContext";
import DayEditor from "@/components/admin/DayEditor";
import Link from "next/link";

function AdminContent() {
  const { itinerary, addDay, exportData, loading, error } = useItinerary();
  const [showExport, setShowExport] = useState(false);

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

  const totalCost = itinerary.reduce((sum, day) => {
    const transportCost = day.transport?.priceUSD || 0;
    const activitiesCost = day.activities.reduce((acc, a) => acc + (a.priceUSD || 0), 0);
    return sum + transportCost + activitiesCost;
  }, 0);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportData());
    alert("Datos copiados al portapapeles");
  };

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
                onClick={addDay}
                className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto md:px-4 md:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                title="Añadir día"
              >
                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden md:inline md:ml-2">Añadir día</span>
              </button>
            </div>
          </div>
        </div>
      </header>

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

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {itinerary
            .sort((a, b) => a.day - b.day)
            .map((day) => (
              <DayEditor key={day.id} day={day} />
            ))}
        </div>

        {itinerary.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay días en el itinerario</h3>
            <p className="text-gray-500 mb-4">Comienza añadiendo tu primer día de viaje.</p>
            <button
              onClick={addDay}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir primer día
            </button>
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
