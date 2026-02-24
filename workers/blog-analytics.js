/**
 * Cloudflare Worker: Blog Analytics + GPT-5 Chat
 * 
 * Environment Variables needed:
 * - CLOUDFLARE_ZONE_ID
 * - CLOUDFLARE_API_TOKEN
 * - AZURE_OPENAI_ENDPOINT
 * - AZURE_OPENAI_KEY
 * - AZURE_OPENAI_DEPLOYMENT
 * 
 * Deploy: wrangler deploy
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Route: /chat - GPT-5 powered analytics chat
    if (url.pathname === '/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    // Route: / - Cloudflare Analytics
    return handleAnalytics(env);
  }
};

async function handleAnalytics(env) {
  const zoneId = env.CLOUDFLARE_ZONE_ID;
  const token = env.CLOUDFLARE_API_TOKEN;

  if (!zoneId || !token) {
    return new Response(JSON.stringify({ error: 'Missing Cloudflare credentials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  // Calculate date range (last 7 days)
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const query = `{
    viewer {
      zones(filter: {zoneTag: "${zoneId}"}) {
        httpRequests1dGroups(
          limit: 7
          filter: {date_gt: "${startDate}"}
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

async function handleChat(request, env) {
  const endpoint = env.AZURE_OPENAI_ENDPOINT;
  const apiKey = env.AZURE_OPENAI_KEY;
  const deployment = env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5-chat';
  const apiVersion = '2025-01-01-preview';

  if (!endpoint || !apiKey) {
    return new Response(JSON.stringify({ 
      answer: "Chat is currently unavailable. Please try the quick responses instead." 
    }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  try {
    const { question, context } = await request.json();

    const systemPrompt = `You are Monica, an AI assistant helping analyze website analytics for The Menon Lab blog. 
You have access to the following analytics data:

${context}

Be helpful, concise, and insightful. Use specific numbers from the data. 
Format key metrics with <strong> tags for emphasis.
Keep responses under 100 words unless the question requires more detail.`;

    const azureUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 300,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "I couldn't generate a response. Try asking differently.";

    return new Response(JSON.stringify({ answer }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ 
      answer: null,
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}
