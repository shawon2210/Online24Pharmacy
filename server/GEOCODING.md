# Server-side Geocoding

This project adds server-side geocoding for pickup locations.

How it works

- A utility `server/utils/geocoding.js` exposes `geocodeAddress(address)` which tries MapTiler (if `MAPTILER_KEY`) then falls back to Nominatim.
- `batchGeocodeMissing(prisma)` finds pickup locations with missing `lat`/`lng` and updates them.

Endpoints

- `POST /api/admin/pickup-locations` (admin): will geocode the address if `lat`/`lng` are missing.
- `PUT  /api/admin/pickup-locations/:id` (admin): will geocode if updated data has missing coordinates.
- `POST /api/admin/pickup-locations/batch-geocode` (admin): batch geocodes all locations missing coordinates.
- `POST /api/admin/pickup-locations/start-geocode-job` (admin): starts a background rate-limited batch job (returns 202 accepted)
- `GET /api/admin/pickup-locations/geocode-status` (admin): returns status of last geocode job and whether a job is running

Configuration

- Add `MAPTILER_KEY` (or `GEOCODING_KEY`) to your `.env` to use MapTiler geocoding and map styles.
- If no key is set, Nominatim (OpenStreetMap) will be used as a fallback (note rate limits and usage policy).

Recommendation

- For production consider batching geocoding offline and storing coordinates in the database to avoid runtime delays and rate limits.

Caching & Background Jobs

- Geocode results are now cached in the `GeocodeCache` table. The system checks cache before calling external providers.
- A cron job runs every 30 minutes and processes pickup locations in small batches (default 20) with a default 1s delay between calls to respect provider rate limits.
- Admin endpoints are available to trigger the job on demand and to view the last run status.

> Note: After pulling these changes, run `npx prisma migrate dev --name add-geocode-cache` to apply the database schema changes and create the `geocode_cache` table.
