import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const onboardingAssistant = {
  async startScrape(companyName, websiteUrl, onStatusUpdate) {
    let draftId = null;

    const updateStatus = async (status, extra = {}) => {
      if (onStatusUpdate) onStatusUpdate(status);
      if (draftId) {
        await supabase
          .from('onboarding_drafts')
          .update({ draft_status: status, updated_at: new Date().toISOString(), ...extra })
          .eq('id', draftId);
      }
    };

    try {
      // 1. Create draft record
      const { data: draft, error: draftError } = await supabase
        .from('onboarding_drafts')
        .insert([{ business_name: companyName, website_url: websiteUrl, draft_status: 'queued' }])
        .select()
        .single();

      if (draftError) throw draftError;
      draftId = draft.id;
      await updateStatus('scraping_site');

      // 2. Call server — Firecrawl + Gemini happen there (keys stay private)
      await updateStatus('extracting_profile');
      const res = await fetch(`${API_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl, companyName })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Scrape failed');

      const extractedData = result.data;

      // 3. Save extracted data to draft
      // We map the Gemini JSON fields to the flat table structure in Supabase
      await updateStatus('review_ready', {
        business_name: extractedData.business_name || companyName,
        business_email: extractedData.business_email,
        business_phone: extractedData.business_phone,
        city: extractedData.city,
        state: extractedData.state,
        industry: extractedData.industry,
        sub_industry: extractedData.sub_industry,
        services_offered: extractedData.services_offered,
        service_area_text: extractedData.service_area_text,
        business_hours: extractedData.business_hours ? { raw: extractedData.business_hours } : null,
        brand_tone: extractedData.brand_tone,
        short_business_summary: extractedData.short_business_summary,
        missed_call_message: extractedData.missed_call_message,
        after_hours_message: extractedData.after_hours_message,
        booking_prompt: extractedData.booking_prompt,
        primary_goal: extractedData.primary_goal,
        hard_response_rules: extractedData.hard_response_rules,
        handoff_keywords: extractedData.handoff_keywords,
        qualification_questions: extractedData.qualification_questions,
        faq_entries: extractedData.faq_entries,
        scrape_confidence_score: extractedData.scrape_confidence_score || 0.85,
        scrape_data: extractedData // Keep the raw JSON too
      });

      return { success: true, draftId };
    } catch (err) {
      console.error('[Assistant] Fatal Error:', err);
      if (draftId) {
        await supabase
          .from('onboarding_drafts')
          .update({ 
            draft_status: 'failed', 
            error_message: err.message,
            updated_at: new Date().toISOString() 
          })
          .eq('id', draftId);
      }
      return { success: false, error: err.message };
    }
  }
};
