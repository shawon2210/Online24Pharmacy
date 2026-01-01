import geocoding from '../utils/geocoding.js';

let running = false;
let lastRun = null;
let lastResult = null;

export async function startJob(prisma, options = {}) {
  if (running) {
    return { started: false, reason: 'Job already running', lastRun, lastResult };
  }
  running = true;
  lastRun = new Date();
  try {
    const result = await geocoding.batchGeocodeMissing(prisma, options);
    lastResult = { startedAt: lastRun, finishedAt: new Date(), result };
    return { started: true, result: lastResult };
  } catch (err) {
    lastResult = { startedAt: lastRun, finishedAt: new Date(), error: err.message };
    throw err;
  } finally {
    running = false;
  }
}

export function status() {
  return { running, lastRun, lastResult };
}

export default { startJob, status };