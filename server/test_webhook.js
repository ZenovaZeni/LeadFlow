// Node 18+ supports native fetch
const payload = {
  data: {
    event_type: 'message.received',
    payload: {
      from: { phone_number: '+15551234567' },
      text: 'Hello, what are your rates for emergency pipe repair?'
    }
  }
};

console.log('📡 Dispatching Simulated Telnyx Webhook...');

fetch('http://localhost:3001/api/webhooks/telnyx', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(async (res) => {
    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${text}`);
  })
  .catch((err) => {
    console.error('❌ Network Error running simulation trigger:', err);
  });
