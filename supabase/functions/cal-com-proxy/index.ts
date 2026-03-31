import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const CAL_API_URL = "https://api.cal.com/v2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    // The path in the request should match Cal.com endpoints
    // e.g. /slots?userId=...
    const calPath = url.pathname.split('/cal-com-proxy')[1] || ''
    
    const apiKey = Deno.env.get("CAL_COM_API_KEY")
    if (!apiKey) throw new Error("CAL_COM_API_KEY secret is not configured in Supabase.")

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "cal-api-version": "2024-08-13"
      }
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = await req.text()
    }

    const response = await fetch(`${CAL_API_URL}${calPath}${url.search}`, fetchOptions)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
