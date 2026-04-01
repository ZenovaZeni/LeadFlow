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

import { 
  getOrCreateLead, 
  appendMessage, 
  getBusinessByPhone, 
  createCallRecord, 
  updateCallStatus, 
  markCallAnswered, 
  getCallRecord, 
  logWebhook 
} from './lib/db_handler.js';
import { generateResponse } from './lib/ai_handler.js';
import { sendSms } from './lib/sms_handler.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Telnyx from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY || 'placeholder_api_key');

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

// --- Admin: Test AI (Simulator) ---
app.post('/api/admin/test-ai', async (req, res) => {
  const { message, config } = req.body;

  try {
    const aiResponse = await generateResponse(message, {
      businessName: config.businessName || 'Test Business',
      services: config.services?.join(', ') || 'general services',
      tone: config.tone || 'professional',
      bio: config.bio || '',
      customRules: config.customRules || ''
    });

    res.json({ success: true, response: aiResponse });
  } catch (err) {
    console.error('Test AI error:', err);
    res.status(500).json({ error: err.message });
  }
});


// --- Telnyx Webhook ---
app.post('/api/webhooks/telnyx', async (req, res) => {
  const payload = req.body;
  const eventId = payload.data?.id;
  const eventType = payload.data?.event_type;

  // 1. Return 200 OK fast
  res.status(200).json({ status: 'received' });

  // 2. Signature verification (Day-One Reliability)
  const signature = req.headers['telnyx-signature-ed25519'];
  const timestamp = req.headers['telnyx-timestamp'];
  const publicKey = process.env.TELNYX_PUBLIC_KEY;

  if (publicKey && signature && timestamp) {
    try {
      telnyx.webhooks.constructEvent(JSON.stringify(payload), signature, timestamp, publicKey);
    } catch (err) {
      console.error('⚠️ Telnyx Signature Verification Failed:', err.message);
      return; // Stop processing unverified webhooks if public key is set
    }
  }

  try {
    const messageData = payload.data?.payload;
    if (!messageData) return;

    const callControlId = messageData.call_control_id;
    const fromNumber = messageData.from?.phone_number || messageData.from;
    const toNumber = (messageData.to?.[0]?.phone_number || messageData.to) || '';

    // 3. Deduplication & Logging
    // We try to log the webhook; if it returns 'duplicate', we skip the logic.
    const logStatus = await logWebhook({
      eventId,
      eventType,
      payload,
      outcomeStatus: 'processing'
    });

    if (logStatus === 'duplicate') {
      console.log(`♻️ Duplicate event ignored: ${eventId}`);
      return;
    }

    // --- CALL EVENTS ---

    if (eventType === 'call.initiated') {
      console.log(`📞 Inbound Call from ${fromNumber} to ${toNumber}`);
      const business = await getBusinessByPhone(toNumber);
      
      if (business) {
        // Record initiated call
        await createCallRecord({
          callControlId,
          callSessionId: messageData.call_session_id,
          businessId: business.id,
          fromNumber,
          toNumber
        });

        // Use Call Control to "Answer" then "Dial" (forwarding)
        // This gives us explicit events for the entire session.
        await telnyx.calls.answer(callControlId);
        
        // Forwarding logic: we simulate forwarding by dialing out.
        // For a true GTM setup, the user will configure the "Dial" action toJoe's actual cell.
        // Since we don't have Joe's number yet, we'll just log it.
        console.log(`⏩ Call Control: Ready to dial forwarding for ${business.name}`);
      }
    }

    if (eventType === 'call.answered') {
      console.log(`✅ Call Answered: ${callControlId}`);
      await markCallAnswered(callControlId);
    }

    if (eventType === 'call.hangup') {
      console.log(`🛑 Call Hangup: ${callControlId}`);
      
      // Update status
      await updateCallStatus(callControlId, 'hungup');

      // Check if it was a MISSED call
      const callData = await getCallRecord(callControlId);
      if (callData && !callData.is_answered) {
        console.log(`🚨 MISSED CALL DETECTED for ${callData.to_number}. Triggering SMS response...`);
        
        const business = await getBusinessByPhone(callData.to_number);
        if (business && business.workflow?.missed_call_msg) {
          const smsText = business.workflow.missed_call_msg;
          await sendSms(callData.from_number, smsText, callData.to_number);
          
          // Log as a lead interaction
          const lead = await getOrCreateLead(callData.from_number, business.id);
          await appendMessage(lead.id, 'assistant', `[Missed Call Auto-Reply] ${smsText}`);
        }
      }
    }

    // --- SMS EVENTS ---

    if (eventType === 'message.received') {
      const messageBody = messageData.text;
      console.log(`📩 SMS from ${fromNumber} to ${toNumber}: "${messageBody}"`);

      const business = await getBusinessByPhone(toNumber);
      if (!business) return;

      const lead = await getOrCreateLead(fromNumber, business.id);
      await appendMessage(lead.id, 'user', messageBody);

      // AI Response Logic
      const aiResponse = await generateResponse(messageBody, {
        businessName: business.name,
        services: business.operational_bounds?.services || 'general services',
        tone: business.ai_rules?.tone || 'professional',
        bio: business.ai_rules?.bio || '',
        customRules: business.ai_rules?.custom_rules || ''
      });

      console.log(`🤖 AI Reply for ${business.name}: "${aiResponse}"`);
      await sendSms(fromNumber, aiResponse, toNumber);
      await appendMessage(lead.id, 'assistant', aiResponse);
    }

  } catch (err) {
    console.error('Webhook processing error:', err);
    // Update log with error
    await logWebhook({
      eventId,
      eventType: eventType || 'unknown',
      payload: payload || {},
      outcomeStatus: 'failed',
      errorMessage: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Telnyx webhook: http://[your-domain]/api/webhooks/telnyx`);
});
