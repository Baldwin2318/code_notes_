import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CRIME_SOURCE_URL = 'https://donnees.montreal.ca/dataset/5829b5b0-ea6f-476f-be94-bc2b8797769a/resource/aacc4576-97b3-4d8d-883d-22bbca41dbe6/download/actes-criminels.geojson';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, '../data/mtl_map_crime');
const cacheFilePath = path.join(cacheDir, 'actes-criminels.geojson');
const metaFilePath = path.join(cacheDir, 'actes-criminels.meta.json');

let refreshPromise = null;
let refreshTimer = null;

function ensureCacheDir() {
  fs.mkdirSync(cacheDir, { recursive: true });
}

function readJsonIfExists(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
}

function getNextNoonDelayMs(now = new Date()) {
  const next = new Date(now);
  next.setHours(12, 0, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}

async function refreshCrimeData(reason = 'manual') {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    ensureCacheDir();

    const startedAt = new Date().toISOString();
    const response = await fetch(CRIME_SOURCE_URL);
    if (!response.ok) {
      throw new Error(`Crime dataset refresh failed with HTTP ${response.status}`);
    }

    const payload = await response.json();
    const meta = {
      source_url: CRIME_SOURCE_URL,
      refreshed_at: new Date().toISOString(),
      refresh_reason: reason,
      feature_count: Array.isArray(payload?.features) ? payload.features.length : 0,
      started_at: startedAt
    };

    fs.writeFileSync(cacheFilePath, JSON.stringify(payload));
    writeJson(metaFilePath, meta);

    return meta;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function scheduleDailyRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);

  refreshTimer = setTimeout(async () => {
    try {
      await refreshCrimeData('scheduled-noon');
      console.log('[mtl_map_crime] Refreshed Montréal crime data at scheduled noon run.');
    } catch (error) {
      console.error('[mtl_map_crime] Scheduled refresh failed:', error);
    } finally {
      scheduleDailyRefresh();
    }
  }, getNextNoonDelayMs());
}

async function ensureCrimeDataReady() {
  ensureCacheDir();

  if (fs.existsSync(cacheFilePath) && fs.existsSync(metaFilePath)) {
    return readJsonIfExists(metaFilePath, {});
  }

  return refreshCrimeData('startup-miss');
}

function mtl_map_crime_router(app) {
  ensureCacheDir();
  ensureCrimeDataReady()
    .then(() => {
      console.log('[mtl_map_crime] Cache ready.');
    })
    .catch((error) => {
      console.error('[mtl_map_crime] Initial cache load failed:', error);
    });

  scheduleDailyRefresh();

  app.get('/api/mtl_map_crime/data', async (req, res) => {
    try {
      await ensureCrimeDataReady();
      return res.sendFile(cacheFilePath);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/mtl_map_crime/meta', async (req, res) => {
    try {
      const meta = await ensureCrimeDataReady();
      return res.json(meta);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/mtl_map_crime/refresh', async (req, res) => {
    try {
      const meta = await refreshCrimeData('manual-api');
      return res.json({ ok: true, meta });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
}

export default mtl_map_crime_router;
