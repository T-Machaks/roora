export type VenueInfo = {
  isTBA: boolean;
  name: string | null;
  address: string | null;
  mapUrl: string | null;
  lat: number | null;
  lng: number | null;
};

/** A Google Maps "get directions" deep link, preferring exact coordinates
 * over a text address/name search. Null when there's nothing to point at
 * (TBA, or no name/address/coordinates set yet). */
export function directionsUrl(venue: VenueInfo): string | null {
  if (venue.isTBA) return null;
  if (venue.lat != null && venue.lng != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`;
  }
  const query = venue.address || venue.name;
  if (!query) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}
