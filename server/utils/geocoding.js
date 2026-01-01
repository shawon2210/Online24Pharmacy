async function geocodeWithMapTiler(query, key) {
  try {
    const q = encodeURIComponent(query);
    const url = `https://api.maptiler.com/geocoding/${q}.json?key=${key}&limit=1&language=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.features || data.features.length === 0) return null;
    const [lng, lat] = data.features[0].geometry.coordinates;
    return { lat: parseFloat(lat), lng: parseFloat(lng), provider: 'maptiler' };
  } catch (err) {
    console.error('MapTiler geocode error', err);
    return null;
  }
}

async function geocodeWithNominatim(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), provider: 'nominatim' };
  } catch (err) {
    console.error('Nominatim geocode error', err);
    return null;
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function geocodeAddress(address, prisma = null) {
  if (!address || address.trim() === '') return null;
  const query = address.trim();

  // Check cache if prisma provided
  if (prisma) {
    try {
      const cached = await prisma.geocodeCache.findUnique({ where: { query } });
      if (cached) {
        if (cached.status === 'SUCCESS' && cached.lat != null && cached.lng != null) {
          return { lat: cached.lat, lng: cached.lng, provider: cached.provider };
        }
        // if failed recently, skip trying again (simple policy: retry after 1 day)
        if (cached.status === 'FAILED' && cached.lastAttempt) {
          const oneDay = 24 * 60 * 60 * 1000;
          if (new Date() - new Date(cached.lastAttempt) < oneDay) {
            return null;
          }
        }
      }
    } catch (err) {
      console.error('Error reading geocode cache:', err);
    }
  }

  const maptilerKey = process.env.MAPTILER_KEY || process.env.GEOCODING_KEY || null;
  let geo = null;
  let usedProvider = null;

  if (maptilerKey) {
    geo = await geocodeWithMapTiler(address, maptilerKey);
    if (geo) usedProvider = 'maptiler';
  }

  if (!geo) {
    geo = await geocodeWithNominatim(address);
    if (geo) usedProvider = 'nominatim';
  }

  // Write to cache if prisma provided
  if (prisma) {
    try {
      const status = geo ? 'SUCCESS' : 'FAILED';
      await prisma.geocodeCache.upsert({
        where: { query },
        update: {
          lat: geo ? geo.lat : null,
          lng: geo ? geo.lng : null,
          provider: geo ? usedProvider : null,
          status,
          attempts: { increment: 1 },
          lastAttempt: new Date(),
          error: geo ? null : (geo === null ? 'not found' : null),
        },
        create: {
          query,
          lat: geo ? geo.lat : null,
          lng: geo ? geo.lng : null,
          provider: geo ? usedProvider : null,
          status,
          attempts: 1,
          lastAttempt: new Date(),
          error: geo ? null : 'not found',
        }
      });
    } catch (err) {
      console.error('Error writing geocode cache:', err);
    }
  }

  return geo ? { lat: geo.lat, lng: geo.lng, provider: usedProvider } : null;
}

/**
 * Batch geocode missing pickup locations with rate limiting/options
 * options: { limit: number, delayMs: number }
 */
export async function batchGeocodeMissing(prisma, options = {}) {
  const { limit = 20, delayMs = 1000 } = options;
  const result = { updated: 0, failed: 0, total: 0, details: [] };

  const locations = await prisma.pickupLocation.findMany({
    where: {
      OR: [{ lat: null }, { lng: null }]
    },
    take: limit
  });

  for (const loc of locations) {
    result.total += 1;
    const query = loc.address || loc.name || null;
    if (!query) {
      result.failed += 1;
      result.details.push({ id: loc.id, reason: 'no address or name' });
      continue;
    }

    const geo = await geocodeAddress(query, prisma);
    if (!geo) {
      result.failed += 1;
      result.details.push({ id: loc.id, reason: 'not found' });
      // wait a bit to avoid hammering provider on failures
      await sleep(delayMs);
      continue;
    }

    try {
      await prisma.pickupLocation.update({
        where: { id: loc.id },
        data: { lat: geo.lat, lng: geo.lng }
      });
      result.updated += 1;
      result.details.push({ id: loc.id, lat: geo.lat, lng: geo.lng, provider: geo.provider });
    } catch (err) {
      result.failed += 1;
      result.details.push({ id: loc.id, reason: err.message });
    }

    // Respect provider limits - wait between requests
    await sleep(delayMs);
  }

  return result;
}

export default { geocodeAddress, batchGeocodeMissing };