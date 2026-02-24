import type { APIRoute } from 'astro';

// Keep this endpoint server-rendered (not static)
export const prerender = false;

export const GET: APIRoute = async () => {
  const envCheck = {
    hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
    hasKey: !!process.env.AZURE_OPENAI_KEY,
    endpointStart: process.env.AZURE_OPENAI_ENDPOINT?.slice(0, 20) + '...',
    keyStart: process.env.AZURE_OPENAI_KEY?.slice(0, 10) + '...',
    nodeEnv: process.env.NODE_ENV,
    allAzureVars: Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('azure') || k.toLowerCase().includes('openai')
    ),
  };
  
  return new Response(JSON.stringify(envCheck, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
