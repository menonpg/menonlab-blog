/**
 * Simple JSON-based analytics counter
 * Stores page views in a local JSON file
 * 
 * Endpoints:
 *   POST /hit      - Record a page view { path: "/blog/foo" }
 *   GET  /stats    - Get all stats (protected by API key)
 *   GET  /stats/:path - Get stats for specific path
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.ANALYTICS_API_KEY || 'dev-key';
const DATA_FILE = process.env.DATA_FILE || './analytics.json';

// Initialize or load data
let data = { views: {}, daily: {}, referrers: {}, lastUpdated: null };

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

function saveData() {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// Load on startup
loadData();

// Save periodically (every 30 seconds)
setInterval(saveData, 30000);

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  cors(res);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // POST /hit - Record a page view
    if (req.method === 'POST' && pathname === '/hit') {
      const body = await parseBody(req);
      const pagePath = body.path || '/';
      const referrer = body.referrer || 'direct';
      const today = getToday();

      // Increment total views
      data.views[pagePath] = (data.views[pagePath] || 0) + 1;

      // Increment daily views
      if (!data.daily[today]) data.daily[today] = {};
      data.daily[today][pagePath] = (data.daily[today][pagePath] || 0) + 1;

      // Track referrers
      if (!data.referrers[pagePath]) data.referrers[pagePath] = {};
      data.referrers[pagePath][referrer] = (data.referrers[pagePath][referrer] || 0) + 1;

      return json(res, { ok: true, views: data.views[pagePath] });
    }

    // GET /stats - Get all stats (requires API key)
    if (req.method === 'GET' && pathname === '/stats') {
      const apiKey = req.headers['x-api-key'] || url.searchParams.get('key');
      if (apiKey !== API_KEY) {
        return json(res, { error: 'Unauthorized' }, 401);
      }

      // Calculate summary stats
      const totalViews = Object.values(data.views).reduce((a, b) => a + b, 0);
      const topPages = Object.entries(data.views)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([path, views]) => ({ path, views }));

      // Last 7 days
      const last7Days = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        last7Days[key] = data.daily[key] || {};
      }

      return json(res, {
        totalViews,
        uniquePages: Object.keys(data.views).length,
        topPages,
        last7Days,
        lastUpdated: data.lastUpdated
      });
    }

    // GET /stats/:path - Get stats for specific path
    if (req.method === 'GET' && pathname.startsWith('/stats/')) {
      const pagePath = decodeURIComponent(pathname.replace('/stats', ''));
      return json(res, {
        path: pagePath,
        views: data.views[pagePath] || 0,
        referrers: data.referrers[pagePath] || {}
      });
    }

    // GET /health - Health check
    if (req.method === 'GET' && pathname === '/health') {
      return json(res, { status: 'ok', uptime: process.uptime() });
    }

    // 404
    json(res, { error: 'Not found' }, 404);

  } catch (err) {
    console.error('Error:', err);
    json(res, { error: 'Internal error' }, 500);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down, saving data...');
  saveData();
  process.exit(0);
});

server.listen(PORT, () => {
  console.log(`Analytics server running on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
