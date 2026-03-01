import type { GeoLocation } from '../../types';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

/**
 * Geocode an address string using OpenStreetMap Nominatim.
 * Returns the best matching location or null.
 */
export async function geocodeAddress(address: string): Promise<GeoLocation | null> {
    if (!address || address.trim().length < 3) return null;

    try {
        const params = new URLSearchParams({
            q: address,
            format: 'json',
            limit: '1',
            addressdetails: '1',
            countrycodes: 'fr',
        });

        const res = await fetch(`${NOMINATIM_API}?${params}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'CameronePassy-OSINT/1.0',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return null;

        const results = await res.json();
        if (!Array.isArray(results) || results.length === 0) return null;

        const best = results[0];
        return {
            lat: parseFloat(best.lat),
            lon: parseFloat(best.lon),
            displayName: best.display_name ?? address,
            type: best.type ?? 'unknown',
        };
    } catch (err) {
        console.warn('[GEOINT] Geocoding failed:', err);
        return null;
    }
}

/**
 * Geocode a company name + city (less precise, broader search).
 */
export async function geocodeCompany(companyName: string, city?: string): Promise<GeoLocation | null> {
    const query = city ? `${companyName}, ${city}, France` : `${companyName}, France`;
    return geocodeAddress(query);
}
