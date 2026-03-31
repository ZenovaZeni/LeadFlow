import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder_api_key',
});

/**
 * Generates an SMS response using OpenAI
 * @param {string} userMessage - Incoming text from customer
 * @param {object} context - Business details (name, services, rules)
 * @returns {Promise<string>} - Generated reply message
 */
export async function generateResponse(userMessage, context = {}) {
  const businessName = context.businessName || 'LeadFlow Client';
  const services = context.services || 'general services';
  const tone = context.tone || 'professional and polite';
  const bio = context.bio || '';
  const customRules = context.customRules || '';

  const systemPrompt = `
You are an Automated Answering Assistant for ${businessName}.
Your goal is to reply to SMS inquiries professionally and CONCISELY. Maximum 160 characters if possible to fit SMS standards.

Business Overview:
- Name: ${businessName}
- About: ${bio}
- Services Provided: ${services}
- Reply Tone: ${tone}
${customRules ? `\nCustom Rules:\n${customRules}` : ''}
Rules & Safety Guidelines:
1. Be helpful and provide answers directly only if you know them 100%.
2. IF a customer asks about custom pricing, barter trades, extreme discounts, or high-risk edge cases, DEFER to the owner.
3. Polite deferment: "Let me route that to the owner so they can quote that exactly for you! They'll text you from this number shortly."
4. Always keep sentences short. Customers read this on lockscreens.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 140, // Keeps it tight
      temperature: 0.6, // Balanced response
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Thanks for reaching out! We received your message and will get back to you shortly.';
  }
}
