const EARTH_RADIUS_MILES = 3958.8;

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

interface GeocodeResult {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!address.trim()) {
    return { latitude: null, longitude: null, error: "Empty address" };
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "JohnDeliveryAdminPortal/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return {
        latitude: null,
        longitude: null,
        error: `Geocoding failed (${response.status})`,
      };
    }

    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (!Array.isArray(data) || data.length === 0) {
      return { latitude: null, longitude: null, error: "Address not found" };
    }

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      error: null,
    };
  } catch (err) {
    return {
      latitude: null,
      longitude: null,
      error: err instanceof Error ? err.message : "Geocoding failed",
    };
  }
}

export function calculateDistanceCharge(
  distance: number | null,
  freeLimit: number,
  rate: number,
): number {
  if (distance == null) return 0;
  return Math.max(0, distance - freeLimit) * rate;
}
