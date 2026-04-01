import { getOrCreateLead, appendMessage, getBusinessByPhone } from '../_lib/db_handler.js';
import { generateResponse } from '../_lib/ai_handler.js';
import { sendSms } from '../_lib/sms_handler.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    return res.status(200).json({ status: 'processed' });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
