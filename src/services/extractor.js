/**
 * Extractor Service
 * Handles extracting structured JSON from raw website markdown using Gemini 2.0 Flash.
 */

export class ExtractorService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  /**
   * Extracts structured business profile from markdown.
   * @param {string} markdown - The crawled markdown content.
   */
  async extractProfile(markdown) {
    if (!this.apiKey) {
      throw new Error('Gemini API Key (VITE_GOOGLE_AI_API_KEY) is missing.');
    }

    const systemPrompt = `
      You are an expert Business Analyst. Your goal is to extract structured information from a website's markdown content to build an AI Assistant profile.
      
      ## EXTRACTION RULES:
      1. RETURN ONLY VALID JSON.
      2. If a field is uncertain, set confidence low (0-0.5) and include it in 'review_notes'.
      3. If a field is missing, use null or an empty string/array.
      4. DO NOT HALLUCINATE.
      
      ## JSON SCHEMA:
      {
        "business_name": "string",
        "website_url": "string",
        "business_phone": "string",
        "business_email": "string",
        "business_address": "string",
        "city": "string",
        "state": "string",
        "zip_code": "string",
        "service_area_text": "string",
        "service_radius_miles": number | null,
        "business_hours": {
          "monday": { "open": "HH:mm", "close": "HH:mm", "closed": boolean },
          ...
        },
        "booking_url": "string",
        "google_business_profile_url": "string",
        "facebook_url": "string",
        "instagram_url": "string",
        "industry": "string",
        "sub_industry": "string",
        "services_offered": ["string"],
        "service_categories": ["string"],
        "emergency_services_offered": boolean | null,
        "after_hours_available": boolean | null,
        "appointment_required": boolean | null,
        "free_estimates": boolean | null,
        "licensed_and_insured": boolean | null,
        "brand_tone": "professional | friendly | premium | no-nonsense | local",
        "tone_notes": "string",
        "short_business_summary": "string",
        "company_background": "string",
        "value_props": ["string"],
        "cta_style": "string",
        "missed_call_message": "string",
        "after_hours_message": "string",
        "vacation_message": "string",
        "followup_message": "string",
        "booking_prompt": "string",
        "callback_prompt": "string",
        "primary_goal": "Book jobs | Collect lead details",
        "pricing_policy": "string",
        "max_questions": 2,
        "escalation_preference": "string",
        "response_length": "Short",
        "owner_review_mode": false,
        "hard_response_rules": ["string"],
        "handoff_keywords": ["string"],
        "qualification_questions": ["string"],
        "faq_entries": [
          { "question": "string", "answer": "string", "category": "services|pricing|booking|etc", "confidence": number }
        ],
        "knowledge_base_entries": [
          { "title": "string", "category": "string", "content": "string", "tags": ["string"], "confidence": number }
        ],
        "scrape_confidence_score": number,
        "missing_fields": ["string"],
        "review_notes": "string"
      }
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nCONTENT TO ANALYZE:\n${markdown}`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error ${response.status}: ${errData?.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini returned an empty response. Check your API key and quota.');

      // Clean up markdown code blocks if the LLM wrapped it
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('[Extractor] Extraction failed:', err);
      throw err;
    }
  }
}

export const extractor = new ExtractorService(import.meta.env.VITE_GOOGLE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY);
