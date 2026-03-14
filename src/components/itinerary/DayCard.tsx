"use client";

import { useState } from "react";
import { Activity, Transport } from "@/types/itinerary";

interface DayCardProps {
  day: number;
  date?: string;
  title: string;
  location: string;
  transport?: Transport;
  activities: Activity[];
  highlights?: string[];
  forceExpanded?: boolean | null;
  onToggle?: () => void;
}

const transportIcons: Record<string, string> = {
  flight: "✈️",
  ferry: "⛴️",
  "high-speed ferry": "🚤",
  "longtail boat": "🛶",
  "boat tour": "🚤",
  "speedboat tour": "🚤",
  "ferry + flight": "⛴️✈️",
  bus: "🚌",
  train: "🚂",
  taxi: "🚕",
};

export default function DayCard({ 
  day, 
  date, 
  title, 
  location, 
  transport, 
  activities, 
  highlights,
  forceExpanded,
  onToggle 
}: DayCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  
  const isExpanded = forceExpanded !== null && forceExpanded !== undefined 
    ? forceExpanded 
    : localExpanded;

  const handleToggle = () => {
    setLocalExpanded(!isExpanded);
    onToggle?.();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
  };

  const totalActivitiesCost = activities.reduce((sum, a) => sum + (a.priceUSD || 0), 0);

  return (
    <div className="relative pl-12">
      <div 
        className={`absolute left-2 w-4 h-4 rounded-full transition-all duration-300 ${
          isExpanded 
            ? "bg-gradient-to-br from-orange-400 to-pink-500 scale-125" 
            : "bg-gradient-to-br from-blue-500 to-purple-600"
        }`} 
      />
      
      <div 
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
          isExpanded ? "shadow-lg" : "hover:shadow-md"
        }`}
      >
        <button
          onClick={handleToggle}
          className="w-full p-6 text-left flex items-center justify-between group"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Día {day}
              </p>
              {date && (
                <>
                  <span className="text-sm text-gray-300">•</span>
                  <span className="text-sm font-medium text-gray-500">
                    {formatDate(date)}
                  </span>
                </>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mt-1 text-gray-900">
              {title}
            </h2>
            
            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </p>

            {transport && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg">{transportIcons[transport.type] || "🚗"}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {transport.duration}
                </span>
                {transport.priceUSD !== undefined && transport.priceUSD > 0 && (
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    ${transport.priceUSD} USD
                  </span>
                )}
                {totalActivitiesCost > 0 && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    +${totalActivitiesCost} actividades
                  </span>
                )}
              </div>
            )}

            {highlights && highlights.length > 0 && (
              <ul className="flex flex-wrap gap-2 mt-3">
                {highlights.map((h, i) => (
                  <li
                    key={i}
                    className="text-sm bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 px-3 py-1 rounded-full font-medium"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}>
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Actividades</h3>
            <ul className="text-gray-600 space-y-3">
              {activities.map((activity, i) => (
                <li key={activity.id || i} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{activity.place}</span>
                        {activity.duration && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {activity.duration}
                          </span>
                        )}
                        {activity.priceUSD !== undefined && activity.priceUSD > 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ${activity.priceUSD}
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        Array.isArray(activity.description) ? (
                          activity.description.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {activity.description.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-gray-400 mt-0.5">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )
                        ) : (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )
                      )}
                    </div>
                    {activity.mapUrl && (
                      <a
                        href={activity.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </li>
              ))}
              {activities.length === 0 && (
                <li className="text-sm text-gray-400 text-center py-4">
                  No hay actividades para este día.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
