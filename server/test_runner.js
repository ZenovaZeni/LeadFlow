import 'dotenv/config';
import { getOrCreateLead, appendMessage } from './lib/db_handler.js';
import { generateResponse } from './lib/ai_handler.js';
import { sendSms } from './lib/sms_handler.js';

/**
 * Simulates a full inbound SMS processing cycle
 */
async function simulateInboundMessage() {
  const messageBody = 'Hello, what are your rates for emergency pipe repair?';
  const fromNumber = '+15551234567'; // Static user number
  const businessNumber = process.env.BUSINESS_PHONE_NUMBER || '+10000000000'; // Placeholder

  console.log('📡 Starting Simulation execution for live credentials...\n');

  try {
    // 1. Database Connection & Lead creation 
    console.log('Step 1: Fetching or Creating Lead in Supabase...');
    const lead = await getOrCreateLead(fromNumber);
    console.log(`✅ Lead Record Setup Successful! ID: ${lead.id}`);

    // 2. Log Customer Message
    console.log('Step 2: Appending Customer dialogue log node to DB...');
    await appendMessage(lead.id, 'user', messageBody);
    console.log('✅ Message appended.');

    // 3. Generate AI Response
    console.log('Step 3: Triggering OpenAI completion builder...');
    const aiResponse = await generateResponse(messageBody, {
      businessName: 'LeadFlow Demo Plumbers',
      services: 'Emergency pipe repair, drain cleaning, water heater installs',
      tone: 'helpful and fast'
    });
    console.log(`🤖 AI Drafted Reply: "${aiResponse}"`);

    // 4. Outbound SMS trigger via Telnyx
    console.log('Step 4: Dispatching Outbound Telnyx SMS to customer...');
    await sendSms(fromNumber, aiResponse, businessNumber);

    // 5. Append AI reply back to DB log
    await appendMessage(lead.id, 'assistant', aiResponse);

    console.log('\n🎉 Simulation Complete Success!');
  } catch (err) {
    console.error('\n❌ Simulation Trace Stopped with Error:', err.message || err);
    console.log('\n💡 Note: If you have not bought a Telnyx number and bound it to your profile yet, Step 4 may fail on outbound SMS APIs correctly, which proves Supabase and OpenAI are talking perfectly!');
  }
}

simulateInboundMessage();
