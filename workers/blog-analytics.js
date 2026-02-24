/**
 * Cloudflare Worker: Blog Analytics with hostname breakdown + date range
 * 
 * Query params:
 *   ?days=7|14|30|90 (default: 7)
 *   ?host=all|themenonlab.com|blog.themenonlab.com (default: all)
 * 
 * Environment Variables:
 * - CLOUDFLARE_ZONE_ID
 * - CLOUDFLARE_API_TOKEN
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    
    // Parse query params
    const days = Math.min(parseInt(url.searchParams.get('days') || '7'), 90);
    const hostFilter = url.searchParams.get('host') || 'all';

    return handleAnalytics(env, days, hostFilter);
  }
};

async function handleAnalytics(env, days, hostFilter) {
  const zoneId = env.CLOUDFLARE_ZONE_ID;
  const token = env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !token) {
    return new Response(JSON.stringify({ error: 'Missing Cloudflare credentials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Build host filter for GraphQL
  let hostFilterClause = '';
  if (hostFilter !== 'all') {
    hostFilterClause = `, clientRequestHTTPHost: "${hostFilter}"`;
  }

  // Query with hostname breakdown
  const query = `{
    viewer {
      zones(filter: {zoneTag: "${zoneId}"}) {
        # Aggregate data (optionally filtered by host)
        aggregate: httpRequests1dGroups(
          limit: ${days}
          filter: {date_gt: "${startDate}"${hostFilterClause}}
          orderBy: [date_ASC]
        ) {
          dimensions { date }
          sum {
            requests
            pageViews
            bytes
            cachedBytes
            threats
          }
          uniq { uniques }
        }
        
        # Per-host breakdown (always fetch both for comparison)
        byHost: httpRequests1dGroups(
          limit: ${days * 3}
          filter: {date_gt: "${startDate}"}
          orderBy: [date_ASC]
        ) {
          dimensions { 
            date
            clientRequestHTTPHost 
          }
          sum {
            requests
            pageViews
            bytes
            cachedBytes
            threats
          }
          uniq { uniques }
        }
      }
    }
  }`;

  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    // Add metadata
    const result = {
      ...data,
      meta: {
        days,
        hostFilter,
        startDate,
        endDate,
        hosts: ['themenonlab.com', 'blog.themenonlab.com']
      }
    };
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}
