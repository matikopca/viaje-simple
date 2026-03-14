export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Activity {
  id: string;
  place: string;
  description?: string[] | string;
  coordinates?: Coordinates;
  mapUrl?: string;
  duration?: string;
  priceUSD?: number;
}

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
  activities: Activity[];
  highlights?: string[];
}

export type Itinerary = ItineraryDay[];
