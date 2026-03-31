import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

import { getOrCreateLead, appendMessage, getBusinessByPhone } from './lib/db_handler.js';
import { generateResponse } from './lib/ai_handler.js';
import { sendSms } from './lib/sms_handler.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Scrape + Extract (keeps API keys server-side) ---
app.post('/api/scrape', async (req, res) => {
  let { url, companyName } = req.body;
  if (!url) return res.status(400).json({ error: 'url is required' });

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  try {
    // 1. Firecrawl — scrape the site
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) throw new Error('FIRECRAWL_API_KEY not set on server');

    const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${firecrawlKey}` },
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
    console.log('[Scrape] Gemini raw response text:', responseText.slice(0, 100) + '...');
    
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

    res.json({ success: true, data: extracted });

  } catch (err) {
    console.error('[Scrape] Fatal Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Admin: Create Client ---
// Called by DraftReviewView when admin hits "Approve & Activate"
app.post('/api/admin/create-client', async (req, res) => {
  const { draft } = req.body;

  if (!draft?.business_email) {
    return res.status(400).json({ error: 'business_email is required' });
  }

  try {
    // 1. Create Supabase auth user and send invite email
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      draft.business_email,
      {
        data: { business_name: draft.business_name }
      }
    );
    if (inviteError) throw inviteError;

    const userId = inviteData.user.id;

    // 2. Create the business record linked to the new user
    const { data: biz, error: bizError } = await supabase
      .from('businesses')
      .insert([{
        user_id: userId,
        name: draft.business_name,
        email: draft.business_email,
        phone: draft.business_phone,
        ai_niche: draft.industry || draft.niche || 'General',
        brand_tone: draft.brand_tone,
        short_summary: draft.short_business_summary || draft.bio,
        ai_rules: {
          bio: draft.short_business_summary || draft.bio || '',
          goal: draft.primary_goal || 'Book jobs',
          tone: draft.brand_tone || 'professional',
          custom_rules: draft.hard_response_rules?.join('\n') || ''
        },
        operational_bounds: {
          service_area: draft.service_area_text,
          service_radius: draft.service_radius_miles,
          hours: draft.business_hours
        },
        workflow: {
          missed_call_msg: draft.missed_call_message,
          after_hours_msg: draft.after_hours_message,
          booking_prompt: draft.booking_prompt,
          urgency_keywords: draft.handoff_keywords?.join(', ') || 'emergency, urgent'
        }
      }])
      .select()
      .single();

    if (bizError) throw bizError;

    // 3. Insert qualification questions
    if (draft.qualification_questions?.length) {
      await supabase.from('questions').insert(
        draft.qualification_questions.map(q => ({ business_id: biz.id, question: q }))
      );
    }

    // 4. Insert FAQs
    if (draft.faq_entries?.length) {
      await supabase.from('faqs').insert(
        draft.faq_entries.map(f => ({
          business_id: biz.id,
          q: f.question,
          a: f.answer
        }))
      );
    }

    // 5. Mark draft as activated
    if (draft.id) {
      await supabase
        .from('onboarding_drafts')
        .update({ draft_status: 'activated', activated_business_id: biz.id })
        .eq('id', draft.id);
    }

    console.log(`✅ Client activated: ${draft.business_name} (${draft.business_email})`);
    res.json({ success: true, businessId: biz.id, userId });

  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Telnyx Webhook ---
app.post('/api/webhooks/telnyx', async (req, res) => {
  const payload = req.body;

  try {
    const eventType = payload.data?.event_type;

    if (eventType === 'message.received') {
      const messageData = payload.data.payload;
      const fromNumber = messageData.from.phone_number;
      const toNumber = messageData.to?.[0]?.phone_number;
      const messageBody = messageData.text;

      console.log(`📩 SMS from ${fromNumber} to ${toNumber}: "${messageBody}"`);

      // 1. Look up which business owns this Telnyx number
      const business = await getBusinessByPhone(toNumber);
      if (!business) {
        console.warn(`⚠️ No business found for number ${toNumber} — dropping message`);
        return res.status(200).json({ status: 'unrouted' });
      }

      // 2. Get or create lead tied to this business
      const lead = await getOrCreateLead(fromNumber, business.id);

      // 3. Log incoming message
      await appendMessage(lead.id, 'user', messageBody);

      // 4. Generate AI response using this business's config
      const aiResponse = await generateResponse(messageBody, {
        businessName: business.name,
        services: business.operational_bounds?.services || 'general services',
        tone: business.ai_rules?.tone || 'professional',
        bio: business.ai_rules?.bio || '',
        customRules: business.ai_rules?.custom_rules || ''
      });

      console.log(`🤖 AI Reply for ${business.name}: "${aiResponse}"`);

      // 5. Send SMS back from the business's Telnyx number
      await sendSms(fromNumber, aiResponse, toNumber);

      // 6. Log AI reply
      await appendMessage(lead.id, 'assistant', aiResponse);
    }

    res.status(200).json({ status: 'processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Telnyx webhook: http://[your-domain]/api/webhooks/telnyx`);
});
