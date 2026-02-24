import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5-chat';
  const apiVersion = '2025-01-01-preview';

  if (!endpoint || !apiKey) {
    console.error('Missing env vars:', { 
      hasEndpoint: !!endpoint, 
      hasKey: !!apiKey,
      envKeys: Object.keys(process.env).filter(k => k.includes('AZURE') || k.includes('OPENAI'))
    });
    return new Response(JSON.stringify({ 
      answer: "Chat is currently unavailable. The AI endpoint is not configured.",
      debug: { hasEndpoint: !!endpoint, hasKey: !!apiKey }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
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
      const errorText = await response.text();
      console.error('Azure API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        answer: `Azure error (${response.status}): ${errorText.slice(0, 100)}`,
        error: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ 
      answer: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
