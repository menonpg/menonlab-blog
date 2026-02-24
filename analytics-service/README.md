# Menon Lab Analytics

Simple JSON-based page view counter. No external dependencies.

## Setup

### 1. Deploy the analytics service

Deploy to Railway as a separate service:

```bash
cd analytics-service
railway init
railway up
```

Or run locally:
```bash
node server.js
```

### 2. Configure the blog

Set the environment variable in Railway (blog service):
```
PUBLIC_ANALYTICS_URL=https://your-analytics-service.railway.app
ANALYTICS_API_KEY=your-secret-key
```

### 3. View your stats

```bash
# Get all stats (requires API key)
curl -H "X-API-Key: your-secret-key" https://your-analytics-service.railway.app/stats

# Get stats for a specific page
curl https://your-analytics-service.railway.app/stats/blog/some-post
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hit` | POST | Record a page view. Body: `{ "path": "/blog/foo", "referrer": "..." }` |
| `/stats` | GET | Get all stats (requires `X-API-Key` header) |
| `/stats/:path` | GET | Get stats for specific path |
| `/health` | GET | Health check |

## Data Storage

Views are stored in `analytics.json` in the service directory. Data is auto-saved every 30 seconds and on shutdown.

Example data structure:
```json
{
  "views": {
    "/blog/grokking": 142,
    "/blog/tiny-transformers": 89
  },
  "daily": {
    "2026-02-24": {
      "/blog/grokking": 23
    }
  },
  "referrers": {
    "/blog/grokking": {
      "twitter.com": 45,
      "direct": 97
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `ANALYTICS_API_KEY` | dev-key | API key for `/stats` endpoint |
| `DATA_FILE` | ./analytics.json | Path to data file |
