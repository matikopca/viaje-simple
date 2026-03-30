export interface Transport {
  type: string;
  from?: string;
  to?: string;
  duration: string;
  priceUSD?: number;
  company?: string;
  route?: string;
}

export interface ItineraryDay {
  id: string;
  day: number;
  date: string;
  location: string;
  title: string;
  transport?: Transport;
  /** Texto libre (# título, - ítem, párrafos). Tramos: mañana / tarde / noche (BD: morning_, midday_, afternoon_). */
  morningDescription: string;
  middayDescription: string;
  afternoonDescription: string;
  highlights?: string[];
  countryId?: string;
}

export interface Country {
  id: string;
  name: string;
  /** Emoji de bandera; si no hay bandera usar 🌍 */
  flagEmoji: string;
  days: ItineraryDay[];
}

export type Itinerary = ItineraryDay[];
