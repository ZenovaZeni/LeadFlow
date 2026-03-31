import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Looks up a business by their Telnyx phone number
 * @param {string} phone - The Telnyx number the SMS was sent to
 * @returns {Promise<object|null>}
 */
export async function getBusinessByPhone(phone) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, ai_rules, operational_bounds, workflow')
    .eq('telnyx_phone_number', phone)
    .maybeSingle();

  if (error) console.warn('getBusinessByPhone error:', error);
  return data || null;
}

/**
 * Finds or Creates a lead row by phone number, scoped to a business
 * @param {string} phone - Customer's SMS number (+1...)
 * @param {string} businessId - UUID of the business receiving the SMS
 * @returns {Promise<object>} - Lead record
 */
export async function getOrCreateLead(phone, businessId) {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .eq('business_id', businessId)
      .maybeSingle();

    if (error) console.warn('Query warning in getOrCreateLead:', error);
    if (lead) return lead;

    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert([{
        phone,
        business_id: businessId,
        name: 'New Lead',
        status: 'unresponded',
        status_label: 'Unresponded',
        temperature: 'Warm',
        conversation: []
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return newLead;
  } catch (err) {
    console.error('Database Error in getOrCreateLead:', err);
    throw err;
  }
}

/**
 * Appends a message to a lead's conversation array
 * @param {string} leadId - UUID of the lead
 * @param {string} role - 'user' or 'assistant'
 * @param {string} text - Message body
 */
export async function appendMessage(leadId, role, text) {
  try {
    const { data: lead } = await supabase.from('leads').select('conversation').eq('id', leadId).single();
    const conversation = lead?.conversation || [];

    conversation.push({ role, text, timestamp: new Date().toISOString() });

    const { error } = await supabase
      .from('leads')
      .update({
        conversation,
        last_message_time: 'Just now',
        status: role === 'assistant' ? 'ai_handling' : 'unresponded'
      })
      .eq('id', leadId);

    if (error) throw error;
    console.log(`✅ Appended ${role} message to Lead ${leadId}`);
  } catch (err) {
    console.error('Database Error appending message:', err);
  }
}
