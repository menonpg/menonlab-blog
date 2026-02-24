/**
 * Cloudflare Worker: Blog Analytics with hostname breakdown + date range
 * Query params: ?days=7|14|30|90 (default: 7)
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const ZONE_ID = '04ed85d1d8067cd9981b29085f2dc2d5';
const API_TOKEN = 'dlwjTMNhyyYsEfdJuXoDr68MjxaKRNREZhId1mey';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const days = Math.min(parseInt(url.searchParams.get('days') || '7'), 90);

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const query = `{
      viewer {
        zones(filter: {zoneTag: "${ZONE_ID}"}) {
          aggregate: httpRequests1dGroups(
            limit: ${days}
            filter: {date_gt: "${startDate}"}
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { requests pageViews bytes cachedBytes threats }
            uniq { uniques }
          }
          byHost: httpRequests1dGroups(
            limit: ${days * 3}
            filter: {date_gt: "${startDate}"}
            orderBy: [date_ASC]
          ) {
            dimensions { date clientRequestHTTPHost }
            sum { requests pageViews bytes cachedBytes threats }
            uniq { uniques }
          }
        }
      }
    }`;

    try {
      const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }
  }
};
