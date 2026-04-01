import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
    return res.status(200).json({ success: true, businessId: biz.id, userId });

  } catch (err) {
    console.error('Create client error:', err);
    return res.status(500).json({ error: err.message });
  }
}
