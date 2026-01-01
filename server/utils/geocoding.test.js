import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as geocoding from './geocoding.js';

const origEnv = { ...process.env };

describe('geocoding util', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it('returns null for empty address', async () => {
    const r = await geocoding.geocodeAddress('');
    expect(r).toBeNull();
  });

  it('uses MapTiler when key present', async () => {
    process.env.MAPTILER_KEY = 'test-key';
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [ { geometry: { coordinates: [90.0, 23.0] } } ] })
    });

    const r = await geocoding.geocodeAddress('Some Place');
    expect(global.fetch).toHaveBeenCalled();
    expect(r).toEqual({ lat: 23.0, lng: 90.0, provider: 'maptiler' });
  });

  it('falls back to nominatim when maptiler fails', async () => {
    delete process.env.MAPTILER_KEY;
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false }) // maptiler not used
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ lat: '24.5', lon: '91.2' }]) });

    const r = await geocoding.geocodeAddress('Other Place');
    expect(r).toEqual({ lat: 24.5, lng: 91.2, provider: 'nominatim' });
  });

  it('uses cache when available', async () => {
    const mockPrisma = {
      geocodeCache: {
        findUnique: vi.fn().mockResolvedValue({
          query: 'Cached Place',
          lat: 22.0,
          lng: 88.0,
          provider: 'nominatim',
          status: 'SUCCESS'
        })
      }
    };

    const r = await geocoding.geocodeAddress('Cached Place', mockPrisma);
    expect(mockPrisma.geocodeCache.findUnique).toHaveBeenCalled();
    expect(r).toEqual({ lat: 22.0, lng: 88.0, provider: 'nominatim' });
  });

  it('batchGeocodeMissing respects limit and updates entries', async () => {
    // Mock prisma with two locations missing coords
    const mockLocations = [
      { id: 'loc-1', name: 'L1', address: 'Addr 1', lat: null, lng: null },
      { id: 'loc-2', name: 'L2', address: 'Addr 2', lat: null, lng: null },
    ];

    const mockPrisma = {
      pickupLocation: {
        findMany: vi.fn().mockResolvedValue(mockLocations),
        update: vi.fn().mockResolvedValue(true),
      },
      geocodeCache: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue(true),
      }
    };

    // Spy on geocodeWithNominatim by stubbing fetch
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ([{ lat: '10.5', lon: '20.5' }]) })
                              .mockResolvedValueOnce({ ok: true, json: async () => ([{ lat: '11.5', lon: '21.5' }]) });

    const result = await geocoding.batchGeocodeMissing(mockPrisma, { limit: 2, delayMs: 1 });
    expect(result.total).toBe(2);
    expect(result.updated).toBe(2);
    expect(mockPrisma.pickupLocation.update).toHaveBeenCalledTimes(2);
  });
});