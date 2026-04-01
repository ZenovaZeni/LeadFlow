const axios = require('axios');
const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/telnyx';
const TEST_PHONE = '+15551234567'; // The "Business" number in the DB
const CUSTOMER_PHONE = '+19998887777';

async function sendWebhook(eventType, callId, data = {}) {
  const eventId = crypto.randomUUID();
  const payload = {
    data: {
      event_type: eventType,
      id: eventId,
      payload: {
        call_control_id: callId,
        connection_id: 'conn_123',
        from: CUSTOMER_PHONE,
        to: TEST_PHONE,
        direction: 'inbound',
        state: eventType.split('.')[1],
        ...data
      }
    }
  };

  console.log(`\n--- Sending ${eventType} ---`);
  try {
    const res = await axios.post(WEBHOOK_URL, payload);
    console.log(`Response: ${res.status} ${res.statusText}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.response) console.error(err.response.data);
  }
}

async function runMissedCallTest() {
  const callId = `call_${Date.now()}`;
  
  // 1. Initiated
  await sendWebhook('call.initiated', callId);
  
  // Wait 1 second
  await new Promise(r => setTimeout(r, 1000));
  
  // 2. Hangup (without answering)
  await sendWebhook('call.hangup', callId, { duration: 0 });
  
  console.log('\n✅ Missed call simulation complete. Check logs/DB for results.');
}

async function runAnsweredCallTest() {
  const callId = `call_${Date.now()}`;
  
  // 1. Initiated
  await sendWebhook('call.initiated', callId);
  
  // 2. Answered
  await sendWebhook('call.answered', callId);
  
  // 3. Hangup
  await sendWebhook('call.hangup', callId, { duration: 15 });
  
  console.log('\n✅ Answered call simulation complete. No SMS should be triggered.');
}

// Default to missed call test
const mode = process.argv[2] || 'missed';
if (mode === 'missed') {
  runMissedCallTest();
} else {
  runAnsweredCallTest();
}
