import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let { url, companyName } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  try {
    console.log(`🔍 Scraping site: ${url} for ${companyName}`);

    // 1. Firecrawl — scrape the site
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not set on server');

    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${firecrawlKey}` 
      },
      body: JSON.stringify({ url, formats: ['markdown'] })
    });

    if (!scrapeRes.ok) {
      const err = await scrapeRes.json().catch(() => ({}));
      throw new Error(`Firecrawl error: ${err.error || scrapeRes.statusText}`);
    }

    const scrapeData = await scrapeRes.json();
    const markdown = scrapeData.data?.markdown || '';
    if (!markdown) throw new Error('Firecrawl returned no content for that URL');

    // 2. Gemini — extract structured business profile
    const geminiKey = process.env.GOOGLE_AI_API_KEY;
    if (!geminiKey) throw new Error('GOOGLE_AI_API_KEY not set on server');

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert Business Analyst. Extract structured information from this website content to build an AI Assistant profile.

RULES:
1. Return ONLY valid JSON — no markdown, no explanation.
2. If a field is missing use null or empty array.
3. Do not hallucinate.

JSON SCHEMA:
{
  "business_name": "string",
  "website_url": "string",
  "business_phone": "string",
  "business_email": "string",
  "city": "string",
  "state": "string",
  "service_area_text": "string",
  "business_hours": "string",
  "industry": "string",
  "sub_industry": "string",
  "services_offered": ["string"],
  "brand_tone": "professional | friendly | premium | no-nonsense | local",
  "short_business_summary": "string",
  "missed_call_message": "string",
  "after_hours_message": "string",
  "booking_prompt": "string",
  "primary_goal": "Book jobs | Collect lead details",
  "hard_response_rules": ["string"],
  "handoff_keywords": ["string"],
  "qualification_questions": ["string"],
  "faq_entries": [{ "question": "string", "answer": "string", "category": "string" }],
  "scrape_confidence_score": 0.0,
  "review_notes": "string"
}

WEBSITE CONTENT:
${markdown.slice(0, 20000)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let text = responseText.replace(/```json|```/g, '').trim();
    
    let extracted;
    try {
      extracted = JSON.parse(text);
    } catch (parseErr) {
      console.error('[Scrape] JSON parse error. Raw text:', text);
      throw new Error('Failed to parse AI extraction results');
    }

    // Use provided company name if Gemini missed it
    if (companyName && !extracted.business_name) extracted.business_name = companyName;

    console.log(`✅ Scraping complete for ${extracted.business_name}`);
    return res.status(200).json({ success: true, data: extracted });

  } catch (err) {
    console.error('[Scrape] Fatal Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
