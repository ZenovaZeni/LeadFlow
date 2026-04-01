import Telnyx from 'telnyx';

const telnyx = new Telnyx(process.env.TELNYX_API_KEY || 'placeholder_api_key');

/**
 * Sends an outbound SMS via Telnyx
 * @param {string} toNumber - Customer phone number (+1...)
 * @param {string} text - Message body string
 * @param {string} fromNumber - Business Telnyx number
 * @returns {Promise<object>} - Telnyx API response data wrapper
 */
export async function sendSms(toNumber, text, fromNumber) {
  try {
    const response = await telnyx.messages.create({
      from: fromNumber,
      to: toNumber,
      text: text
    });
    
    console.log(`✅ Outbound SMS dispatched to ${toNumber} via Telnyx`);
    return response;
  } catch (error) {
    console.error('Error sending outbound SMS via Telnyx API:', error);
    throw error;
  }
}
