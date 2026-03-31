import { INDUSTRY_PROMPTS } from '../data/industryPrompts';

/**
 * Elite Prompt Engine
 * Builds a context-aware system prompt using the client's niche and specialized rules.
 */
export function buildElitePrompt(business, niche = 'General') {
  const industry = INDUSTRY_PROMPTS[niche] || INDUSTRY_PROMPTS['General'];
  const handoffMsg = business.handoff_phone 
    ? `If the customer is urgent or asks for a human, say: "I'll loop the owner in right now at ${business.handoff_phone} so they can help you directly."`
    : `If the customer is urgent, promise a callback from the owner within 15 minutes.`;

  return `
SYSTEM INSTRUCTION: ${industry.persona}
TONE: ${industry.tone}

BUSINESS CONTEXT:
Name: ${business.name}
Services: ${business.ai_rules?.bio || 'Professional local services'}
Rules: ${business.ai_rules?.custom_rules || 'Always be polite.'}

INDUSTRY GUIDANCE:
${industry.prePrompt}

HANDOFF PROTOCOL:
${handoffMsg}

QUALIFICATION:
Min Job: ${business.operational_bounds?.min_ticket || '$500'}
Service Fee: ${business.operational_bounds?.service_fee || '$99'}
Area: ${business.operational_bounds?.service_radii || 'Local'}

GOAL: Move the customer toward booking a time or providing their details for a callback. Keep replies under 2 sentences.
`;
}
