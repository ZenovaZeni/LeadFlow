import { supabase } from './supabase.js'
import { firecrawl } from '../services/firecrawl.js'

// Fallback Mock Data for Dev (when placeholder keys exist)
const MOCK_STATS = {
  leadsCaptured: 23,
  avgResponseTime: '1.2 min',
  jobsBooked: 8,
  pendingBookings: 3,
  confirmedToday: 2,
  leadsWaiting: 4,
  estimatedRevenue: '$2,150'
}

const MOCK_LEADS = [
  { 
    id: 'sample-1', 
    name: 'Marcus Rivera', 
    phone: '(555) 012-3456', 
    email: 'marcus@example.com', 
    service: 'Tree Removal & Stumping', 
    address: '123 Oak Lane, Austin, TX', 
    urgency: 'High', 
    timestamp: 'Today, 10:15 AM', 
    timeAgo: '15m ago', 
    status: 'new', 
    statusLabel: 'New Lead', 
    temperature: 'Hot',
    is_sample: true,
    is_urgent: true,
    last_call_received: 'Today, 10:10 AM',
    voicemail_transcript: 'Hey Marcus, calling about that oak tree. It is really leaning now after the wind picked up. Need someone out here today if possible.',
    summary: 'EMERGENCY: Customer looking for a quote on a large oak removal and stump grinding. High urgency due to leaning tree.', 
    conversation: [
      { role: 'user', text: 'Hi, I have a large oak tree leaning toward my house after the storm. Need a removal quote ASAP.' },
      { role: 'assistant', text: 'Hello Marcus! We can definitely help with an emergency removal. I am the LeadFlow Assistant. Do you have a rough idea of the tree height, or can you send a photo?' }
    ]
  },
  { 
    id: 1, 
    name: 'Sarah Jenkins', 
    phone: '(555) 123-4567', 
    email: 'sarah@example.com', 
    service: 'Tree Trimming', 
    address: '123 Oak St, Austin', 
    urgency: 'Medium', 
    timestamp: 'Today, 2:15 PM', 
    timeAgo: '2m ago', 
    status: 'unresponded', 
    statusLabel: 'Unresponded', 
    temperature: 'Hot',
    responseTime: '—',
    lastMessageTime: '2m ago',
    summary: 'Customer needs a large oak tree trimmed away from roof line.', 
    conversation: [
      { role: 'user', text: 'Hi, I need an estimate for tree trimming.' }
    ]
  },
  { 
    id: 2, 
    name: 'David Miller', 
    phone: '(555) 987-6543', 
    email: 'david@example.com', 
    service: 'Burst Pipe Repair', 
    address: '456 Pine Ave, Austin', 
    urgency: 'High', 
    timestamp: 'Today, 10:00 AM', 
    timeAgo: '1h ago', 
    is_urgent: true,
    last_call_received: 'Today, 9:55 AM',
    voicemail_transcript: 'Water is everywhere in the basement. I turned off the main but I need someone here right now.',
    status: 'waiting', 
    statusLabel: 'Waiting', 
    temperature: 'Warm',
    responseTime: '15.4 min',
    lastMessageTime: '1h ago',
    summary: 'Emergency pipe repair. Water leaking into basement ceiling.', 
    conversation: [
      { role: 'user', text: 'I have a burst pipe in my basement discharging water. Need help ASAP!' },
      { role: 'assistant', text: 'We can dispatch a plumber within 1 hour. Can you shut off the main valve?' }
    ]
  },
  { 
    id: 3, 
    name: 'Michael Chen', 
    phone: '(555) 456-7890', 
    email: 'michael@example.com', 
    service: 'Mortgage Pre-Approval', 
    address: '789 Maple Dr, Austin', 
    urgency: 'Urgent', 
    timestamp: 'Today, 1:30 PM', 
    timeAgo: '45m ago', 
    status: 'assistant_handling', 
    statusLabel: 'System Handling', 
    temperature: 'Hot',
    responseTime: '45s',
    lastMessageTime: '45m ago',
    summary: 'Checking rates for a 30yr fixed, wants to lock rate to pre-qualify today.', 
    conversation: [
      { role: 'user', text: 'Hi, looking into current rates for a 30-yr fixed loan qualification.' },
      { role: 'assistant', text: 'Hello Michael! I can provide rate tiers. What is the approximate loan amount and credit range?' },
      { role: 'user', text: 'Looking around $450k, score is 740+ range.' },
      { role: 'assistant', text: 'Got it! It looks like you qualify for our locked tier. We can book a lock setup for tomorrow.' }
    ]
  },
  { 
    id: 4, 
    name: 'Emily Davis', 
    phone: '(555) 321-6540', 
    email: 'emily@example.com', 
    service: 'Deep House Cleaning', 
    address: '101 Cedar Ln, Austin', 
    urgency: 'Low', 
    timestamp: 'Yesterday, 4:00 PM', 
    timeAgo: '1d ago', 
    status: 'booked', 
    statusLabel: 'Booked', 
    temperature: 'Cold',
    responseTime: '1.2 min',
    lastMessageTime: '1d ago',
    summary: 'Move-in deep clean booked for Tuesday 10am.', 
    conversation: [
      { role: 'user', text: 'Estimating package for a move-in deep clean.' },
      { role: 'assistant', text: 'Our move-in packages start at $250. Includes inside cabinets, appliances, and walls. Book now?' },
      { role: 'user', text: 'Yes next Tuesday works.' },
      { role: 'assistant', text: 'Awesome, booked for Tuesday 10am.' }
    ]
  }
]

const MOCK_EVENTS = [
  { id: 1, type: 'lead_received', text: 'New lead received', leadName: 'Sarah Jenkins', timeAgo: '2m ago' },
  { id: 2, type: 'assistant_responded', text: 'Assistant answered question', leadName: 'Michael Chen', timeAgo: '42s ago' },
  { id: 3, type: 'customer_replied', text: 'Customer replied: "3 large oak stumps..."', leadName: 'Michael Chen', timeAgo: '45m ago' },
  { id: 4, type: 'job_booked', text: 'Booking Confirmed', leadName: 'Emily Davis', timeAgo: '1d ago', amount: '$450' }
]

const MOCK_BOOKINGS = [
  {
    id: 'b-1',
    lead_id: 'sample-1',
    customer_name: 'Marcus Rivera',
    phone: '(555) 012-3456',
    service_type: 'Tree Removal',
    booking_status: 'Confirmed',
    requested_time_text: 'Tomorrow morning',
    selected_slot: '2026-03-28T09:00:00',
    date: '2026-03-28',
    time: '09:00 AM',
    notes: 'Access through side gate.',
    source: 'Assistant',
    created_at: '2026-03-26T10:00:00',
    updated_at: '2026-03-26T10:00:00'
  },
  {
    id: 'b-2',
    lead_id: '1',
    customer_name: 'Sarah Jenkins',
    phone: '(555) 123-4567',
    service_type: 'Tree Trimming',
    booking_status: 'Pending',
    requested_time_text: 'Sometime next week',
    selected_slot: null,
    date: '2026-04-02',
    time: '02:00 PM',
    notes: 'Needs estimate first.',
    source: 'Manual',
    created_at: '2026-03-27T11:00:00',
    updated_at: '2026-03-27T11:00:00'
  },
  {
    id: 'b-3',
    lead_id: '2',
    customer_name: 'David Miller',
    phone: '(555) 987-6543',
    service_type: 'Burst Pipe',
    booking_status: 'Callback Needed',
    requested_time_text: 'ASAP',
    selected_slot: null,
    date: '2026-03-27',
    time: '04:00 PM',
    notes: 'Emergency leak.',
    source: 'Assistant',
    created_at: '2026-03-27T12:00:00',
    updated_at: '2026-03-27T12:00:00'
  }
]

const isPlaceholder = () => {
  return import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' || !import.meta.env.VITE_SUPABASE_URL
}

export async function getDashboardStats(isDemo = false, businessId = null) {
  if (isPlaceholder() || isDemo) {
    return MOCK_STATS
  }
  
  try {
    // 1. Fetch Leads
    let query = supabase.from('leads').select('*')
    if (businessId) query = query.eq('business_id', businessId)
    const { data: leads } = await query

    // 2. Fetch Bookings for stats
    let bQuery = supabase.from('bookings').select('*')
    if (businessId) bQuery = bQuery.eq('business_id', businessId)
    const { data: bookings } = await bQuery

    // 3. Fetch Business Bounds for smarter estimation
    let minTicketValue = 250;
    if (businessId) {
      const { data: biz } = await supabase.from('businesses').select('operational_bounds').eq('id', businessId).single();
      if (biz?.operational_bounds?.min_ticket) {
        // Extract number from string like "$500" or "500"
        const extracted = biz.operational_bounds.min_ticket.replace(/[^0-9]/g, '');
        if (extracted) minTicketValue = parseInt(extracted);
      }
    }
    
    const bookedLeads = leads?.filter(l => l.status === 'booked') || []
    const confirmedBookings = bookings?.filter(b => b.booking_status === 'Confirmed') || []
    const pendingBookings = bookings?.filter(b => b.booking_status === 'Pending') || []
    
    const estimatedRev = bookedLeads.length * minTicketValue
    
    return {
      leadsCaptured: leads?.length || 0,
      avgResponseTime: '1.2 min',
      jobsBooked: bookedLeads.length + confirmedBookings.length,
      pendingBookings: pendingBookings.length,
      confirmedToday: confirmedBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
      leadsWaiting: leads?.filter(l => l.status === 'unresponded' || l.status === 'waiting' || l.status === 'new' || l.status === 'assistant_handling').length || 0,
      estimatedRevenue: `$${estimatedRev.toLocaleString()}`
    }
  } catch (err) {
    console.warn('Fallback to mock stats due to query failure:', err)
    return MOCK_STATS
  }
}

/**
 * Fetch Live Activity Feed Events
 */
export async function getLiveEvents(isDemo = false, businessId = null) {
  if (isPlaceholder() || isDemo) {
    return MOCK_EVENTS
  }

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (businessId) query = query.eq('business_id', businessId)

    const { data, error } = await query
    if (error) throw error
    
    // Fallback to mock if no live data yet
    if (!data || data.length === 0) return MOCK_EVENTS

    return data.map(n => {
      const timeAgo = (new Date() - new Date(n.created_at)) / 1000;
      let timeText = 'Just now';
      if (timeAgo > 3600) timeText = `${Math.floor(timeAgo / 3600)}h ago`;
      else if (timeAgo > 60) timeText = `${Math.floor(timeAgo / 60)}m ago`;

      return {
        id: n.id,
        title: n.message.replace('🚨 URGENT: ', '').replace('⚡ Manual Escalation: ', ''),
        time: timeText,
        icon: n.type === 'urgent_lead' ? 'emergency' : n.type === 'new_booking' ? 'calendar_month' : 'info',
        color: n.type === 'urgent_lead' ? 'text-rose-500' : n.type === 'new_booking' ? 'text-emerald-500' : 'text-indigo-500'
      };
    });
  } catch (err) {
    console.warn('Fallback to mock events:', err)
    return MOCK_EVENTS
  }
}

/**
 * Fetch All Leads
 */
export async function getLeads(isDemo = false, businessId = null) {
  let rawLeads = MOCK_LEADS;
  if (!isPlaceholder() && !isDemo) {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (businessId) query = query.eq('business_id', businessId)

      const { data, error } = await query
      if (error) throw error
      rawLeads = data || []
    } catch (err) {
      console.warn('Fallback to mock leads due to query failure:', err)
    }
  }

  // Automatic Lead Temperature Scoring & Urgency Normalization
  return rawLeads.map(lead => {
    const text = ((lead.summary || '') + ' ' + (lead.service || '') + ' ' + (lead.voicemail_transcript || '')).toLowerCase();
    let temp = lead.temperature || 'Cold';
    
    // Auto-urgency detection if not already manually set
    const hasUrgentKeywords = text.includes('emergency') || text.includes('asap') || text.includes('urgent') || text.includes('leak') || text.includes('today') || text.includes('broken');
    const isUrgent = lead.is_urgent || hasUrgentKeywords;

    if (isUrgent) {
      temp = 'Hot';
    } else if (text.includes('tomorrow') || text.includes('quote') || text.includes('soon')) {
      temp = 'Warm';
    }
    
    return { ...lead, temperature: temp, is_urgent: isUrgent };
  });
}

/**
 * Update Lead Status
 */
export async function updateLeadStatus(leadId, status) {
  if (isPlaceholder()) {
    console.log(`[Mock] Updated lead ${leadId} status to ${status}`)
    return true
  }

  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', leadId)

  if (error) throw error
  return true
}

/**
 * Add a new Lead
 */
export async function addLead(businessId, leadData) {
  // Keyword-based auto-urgency
  const text = ((leadData.summary || '') + ' ' + (leadData.service || '') + ' ' + (leadData.name || '')).toLowerCase();
  const isUrgent = leadData.is_urgent || text.includes('emergency') || text.includes('asap') || text.includes('leak') || text.includes('today') || text.includes('broken');

  const finalLead = { ...leadData, business_id: businessId, is_urgent: isUrgent };

  if (isPlaceholder()) {
    console.log('[Mock] Added lead:', finalLead)
    return { id: Math.random(), ...finalLead }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert([finalLead])
    .select()
    .single()

  if (error) throw error

  // If urgent, create a notification
  if (isUrgent) {
    await createNotification(businessId, {
      type: 'urgent_lead',
      message: `🚨 URGENT: New lead from ${leadData.name} regarding "${leadData.service}"`,
      link_id: data.id
    });
  }

  return data
}

/**
 * Toggle Lead Urgency (Manual Escalation)
 */
export async function toggleLeadUrgency(leadId, isUrgent) {
  if (isPlaceholder()) {
    console.log(`[Mock] Toggled lead ${leadId} urgency to ${isUrgent}`)
    return true
  }

  const { error } = await supabase
    .from('leads')
    .update({ is_urgent: isUrgent })
    .eq('id', leadId)

  if (error) throw error

  // If manual escalation, notify
  if (isUrgent) {
    const { data: lead } = await supabase.from('leads').select('name, business_id').eq('id', leadId).single();
    if (lead) {
      await createNotification(lead.business_id, {
        type: 'urgent_lead',
        message: `⚡ Manual Escalation: ${lead.name} flagged as urgent.`,
        link_id: leadId
      });
    }
  }

  return true
}

/**
 * Delete a Lead
 */
export async function deleteLead(leadId) {
  if (isPlaceholder()) {
    console.log('[Mock] Deleted lead:', leadId)
    return true
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)

  if (error) throw error
  return true
}

/**
 * Create a Sample Lead for a new business
 */
export async function createSampleLead(businessId) {
  const sampleLead = {
    name: 'Marcus Rivera',
    phone: '(555) 012-3456',
    email: 'marcus@example.com',
    service: 'Tree Removal & Stumping',
    address: '123 Oak Lane, Austin, TX',
    urgency: 'High',
    status: 'new',
    is_sample: true,
    summary: 'Customer looking for a quote on a large oak removal and stump grinding. Matches our ideal lead profile.',
    conversation: [
      { role: 'user', text: 'Hi, I have a large oak tree leaning toward my house after the storm. Need a removal quote ASAP.' },
      { role: 'assistant', text: 'Hello Marcus! We can definitely help with an emergency removal. I am the LeadFlow assistant. Do you have a rough idea of the tree height, or can you send a photo?' },
      { role: 'user', text: 'It is about 40ft tall. I will send a photo now.' },
      { role: 'assistant', text: 'Got it. I have flagged this as high urgency. We have a crew in Austin today—would you like a same-day estimate?' }
    ]
  }

  return addLead(businessId, sampleLead)
}

/**
 * Fetch All Bookings
 */
export async function getBookings(isDemo = false, businessId = null) {
  if (isPlaceholder() || isDemo) {
    return MOCK_BOOKINGS
  }

  try {
    let query = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (businessId) query = query.eq('business_id', businessId)

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) {
    console.warn('Fallback to mock bookings due to query failure:', err)
    return MOCK_BOOKINGS
  }
}

/**
 * Update Booking Status
 */
export async function updateBookingStatus(bookingId, status) {
  if (isPlaceholder()) {
    console.log(`[Mock] Updated booking ${bookingId} status to ${status}`)
    return true
  }

  const { error } = await supabase
    .from('bookings')
    .update({ booking_status: status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)

  if (error) throw error
  return true
}

/**
 * Create a new Booking
 */
export async function createBooking(businessId, bookingData) {
  if (isPlaceholder()) {
    console.log('[Mock] Created booking:', bookingData)
    return { id: `b-${Math.random()}`, ...bookingData, created_at: new Date().toISOString() }
  }

  // 1. Check if Cal.com is enabled
  try {
    const { data: business } = await supabase
      .from('businesses')
      .select('integrations')
      .eq('id', businessId)
      .single()

    if (business?.integrations?.cal_com?.enabled) {
      const mappings = business.integrations.cal_com.service_mappings || {}
      const eventTypeId = mappings[bookingData.service_type] || mappings['default']
      if (eventTypeId) {
        await createCalBooking(businessId, eventTypeId, bookingData)
      }
    }
  } catch (err) {
    console.warn('Cal.com integration check failed, falling back to local-only:', err)
  }

  // 2. Always record in local Supabase for dashboard availability
  const { data, error } = await supabase
    .from('bookings')
    .insert([{ ...bookingData, business_id: businessId }])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get Available Slots
 */
export async function getAvailableSlots(businessId, date, serviceName = null) {
  // 1. Check if Cal.com is enabled for this business
  if (!isPlaceholder()) {
    try {
      const { data: business } = await supabase
        .from('businesses')
        .select('integrations')
        .eq('id', businessId)
        .single()

      if (business?.integrations?.cal_com?.enabled) {
        const mappings = business.integrations.cal_com.service_mappings || {}
        const eventTypeId = mappings[serviceName] || mappings['default']
        
        if (eventTypeId) {
          return await getCalAvailability(eventTypeId, date)
        }
      }
    } catch (err) {
      console.warn('Cal.com config fetch failed, falling back to native slots:', err)
    }
  }

  // 2. Fallback to Native Business Hours mapping
  const duration = 30; // mins
  const buffer = 15; // mins
  const businessHours = {
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '00:00', close: '00:00', closed: true },
    sunday: { open: '00:00', close: '00:00', closed: true }
  };

  // Parse date as local time to avoid UTC day-shift issues
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  const dayOfWeek = localDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySettings = businessHours[dayOfWeek];

  if (!daySettings || daySettings.closed) return [];

  const slots = [];
  let currentTime = new Date(`${date}T${daySettings.open}:00`);
  const endTime = new Date(`${date}T${daySettings.close}:00`);

  // Fetch existing bookings, guard against missing businessId
  let existingBookings = [];
  if (businessId) {
    try {
      const allBookings = await getBookings(false, businessId);
      existingBookings = allBookings.filter(b => b.date === date && (b.booking_status === 'Confirmed' || b.booking_status === 'Pending'));
    } catch (err) {
      console.warn('Could not fetch existing bookings:', err);
    }
  }

  while (currentTime < endTime) {
    const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Check if slot is taken
    const isTaken = existingBookings.some(b => b.time === timeString);
    
    if (!isTaken) {
      slots.push(timeString);
    }

    // Advance by duration + buffer
    currentTime = new Date(currentTime.getTime() + (duration + buffer) * 60000);
  }

  return slots;
}

/**
 * Cal.com Proxy Hall (Edge Functions)
 */
async function getCalAvailability(eventTypeId, date) {
  try {
    const startTime = new Date(`${date}T00:00:00Z`).toISOString()
    const endTime = new Date(`${date}T23:59:59Z`).toISOString()
    
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('cal-com-proxy', {
      method: 'GET',
      body: {}, // GET query params handled in URL
      headers: {},
      url: `/slots?eventTypeId=${eventTypeId}&startTime=${startTime}&endTime=${endTime}`
    })

    if (error) throw error
    
    // Map Cal.com slots to our string format
    // Cal.com returns { slots: { "2024-03-28": [{ time: "2024-03-28T09:00:00Z" }] } }
    const daySlots = data?.slots?.[date] || []
    return daySlots.map(s => new Date(s.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))

  } catch (err) {
    console.error('Cal.com API error:', err)
    return []
  }
}

export async function createCalBooking(businessId, eventTypeId, bookingData) {
  try {
    // LeadData should include start, end, name, email
    const { data, error } = await supabase.functions.invoke('cal-com-proxy', {
      method: 'POST',
      body: {
        eventTypeId: parseInt(eventTypeId),
        start: new Date(`${bookingData.date} ${bookingData.time}`).toISOString(),
        responses: {
          name: bookingData.customer_name,
          email: bookingData.email || 'lead@leadflow.ai',
          location: bookingData.address || 'Phone Call'
        },
        metadata: {
          leadflow_id: bookingData.id
        }
      },
      url: '/bookings'
    })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Cal.com Create Booking error:', err)
    throw err
  }
}

/**
 * Notifications Logic
 */
export async function getNotifications(isDemo = false, businessId = null) {
  if (isPlaceholder() || isDemo) return []

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (businessId) query = query.eq('business_id', businessId)

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching notifications:', err)
    return []
  }
}

export async function createNotification(businessId, notificationData) {
  if (isPlaceholder()) return { id: Math.random(), ...notificationData }

  const { data, error } = await supabase
    .from('notifications')
    .insert([{ ...notificationData, business_id: businessId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markNotificationRead(notificationId) {
  if (isPlaceholder()) return true

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) throw error
  return true
}

/**
 * 👑 MASTER ADMIN QUERIES
 */

export async function getAdminStats() {
  if (isPlaceholder()) return { totalLeads: 124, totalClients: 8, totalRevenue: 62000 }

  try {
    // 1. Total Clients
    const { count: clientCount, error: cErr } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
    if (cErr) throw cErr

    // 2. Total Leads & Potential Revenue
    const { data: leads, error: lErr } = await supabase
      .from('leads')
      .select('business_id, businesses(operational_bounds)')
    if (lErr) throw lErr

    let totalRev = 0
    leads?.forEach(l => {
        const bounds = l.businesses?.operational_bounds
        if (bounds?.min_ticket) {
            const val = parseInt(bounds.min_ticket.replace(/[^0-9]/g, '')) || 0
            totalRev += val
        }
    })

    return {
      totalLeads: leads?.length || 0,
      totalClients: clientCount || 0,
      totalRevenue: totalRev
    }
  } catch (err) {
    console.error('Admin Stats error:', err)
    return { totalLeads: 0, totalClients: 0, totalRevenue: 0 }
  }
}

export async function getAllBusinesses() {
  if (isPlaceholder()) return []

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        leads(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching all businesses:', err)
    return []
  }
}

export async function updateBusinessAdmin(id, updates) {
  if (isPlaceholder()) return true
  
  const { error } = await supabase
    .from('businesses')
    .update({ 
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * OPERATIONAL DASHBOARD QUERIES
 */

export async function getAdminOperationalStats() {
  if (isPlaceholder()) return {
    activeClients: 8,
    draftsAwaitingReview: 3,
    clientsInOnboarding: 2,
    clientsMissingNumber: 1,
    clientsMissingWebhook: 1,
    clientsAwaitingQA: 2,
    failedWebhooksToday: 0,
    messagesSentToday: 145,
    missedCallsRecoveredToday: 12
  };

  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Active Clients (Business Status: Live)
    const { count: activeClients } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Live');

    // 2. Drafts Awaiting Review
    const { count: draftsAwaitingReview } = await supabase
      .from('onboarding_drafts')
      .select('*', { count: 'exact', head: true })
      .eq('draft_status', 'Needs Review');

    // 3. Clients In Onboarding
    const { count: clientsInOnboarding } = await supabase
      .from('onboarding_drafts')
      .select('*', { count: 'exact', head: true })
      .in('draft_status', ['Ready for Onboarding', 'Ready to Activate']);

    // 4. Clients Missing Number
    const { count: clientsMissingNumber } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .is('telnyx_phone_number', null);

    // 5. Failed Webhooks Today
    const { count: failedWebhooksToday } = await supabase
      .from('webhook_logs')
      .select('*', { count: 'exact', head: true })
      .eq('outcome_status', 'failed')
      .gte('created_at', today);

    // 6. Messages Sent Today (Assistant role in conversation)
    const { data: leads } = await supabase
      .from('leads')
      .select('conversation')
      .gte('updated_at', today);
    
    let messagesSentToday = 0;
    leads?.forEach(l => {
      const msgs = l.conversation || [];
      messagesSentToday += msgs.filter(m => m.role === 'assistant').length;
    });

    // 7. Missed Calls handled (Calls not answered but lead exists)
    const { count: missedCallsToday } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .eq('is_answered', false)
      .gte('created_at', today);

    return {
      activeClients: activeClients || 0,
      draftsAwaitingReview: draftsAwaitingReview || 0,
      clientsInOnboarding: clientsInOnboarding || 0,
      clientsMissingNumber: clientsMissingNumber || 0,
      clientsMissingWebhook: 0, 
      clientsAwaitingQA: 0,
      failedWebhooksToday: failedWebhooksToday || 0,
      messagesSentToday: messagesSentToday || 0,
      missedCallsRecoveredToday: missedCallsToday || 0
    };
  } catch (err) {
    console.error('Operational Stats error:', err);
    return null;
  }
}


export async function getActionQueue() {
  if (isPlaceholder()) return [
    { title: 'Review scraped draft', target: 'Acme Plumbing', type: 'draft_review', priority: 'high' },
    { title: 'Assign Telnyx number', target: 'Joe Tree Service', type: 'phone_setup', priority: 'medium' }
  ];

  try {
    const actions = [];
    const { data: drafts } = await supabase
      .from('onboarding_drafts')
      .select('id, business_name')
      .eq('draft_status', 'Needs Review');
    drafts?.forEach(d => actions.push({ id: d.id, title: 'Review scraped draft', target: d.business_name, type: 'draft_review', priority: 'high' }));

    const { data: missingNumbers } = await supabase
      .from('businesses')
      .select('id, name')
      .is('telnyx_phone_number', null);
    missingNumbers?.forEach(b => actions.push({ id: b.id, title: 'Assign Telnyx number', target: b.name, type: 'phone_setup', priority: 'medium' }));

    return actions;
  } catch (err) { return []; }
}

export async function createManualDraft(draftData) {
  if (isPlaceholder()) return { id: 'manual-draft', ...draftData, draft_status: 'Needs Review' };
  const { data, error } = await supabase.from('onboarding_drafts').insert([{ ...draftData, is_manual: true, draft_status: 'Needs Review' }]).select().single();
  if (error) throw error;
  return data;
}

export async function updateDraftStatus(id, draft_status, extra = {}) {
  const { data, error } = await supabase.from('onboarding_drafts').update({ draft_status, ...extra }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}


export async function saveDraftStep(id, updates) {
  if (isPlaceholder()) return { id, ...updates };
  const { data, error } = await supabase
    .from('onboarding_drafts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function activateClient(draftId) {
  if (isPlaceholder()) return { success: true, businessId: 'new-biz-123' };
  
  // 1. Fetch draft info
  const { data: draft, error: draftErr } = await supabase
    .from('onboarding_drafts')
    .select('*')
    .eq('id', draftId)
    .single();
  if (draftErr) throw draftErr;

  // 2. Create business entry
  const bizData = {
    name: draft.business_name,
    email: draft.business_email,
    phone: draft.business_phone,
    telnyx_phone_number: draft.telnyx_phone_number || null,
    brand_tone: draft.brand_tone,
    short_summary: draft.short_business_summary,
    cta_style: draft.cta_style,
    missed_call_message: draft.missed_call_message,
    after_hours_message: draft.after_hours_message,
    ai_niche: draft.industry,
    ai_rules: {
      bio: draft.company_background,
      goal: draft.primary_goal,
      custom_rules: draft.hard_response_rules?.join('\n') || ''
    },
    workflow: {
      booking_url: draft.booking_url,
      handoff_keywords: draft.handoff_keywords || []
    },
    status: 'Live',
    activated_at: new Date().toISOString()
  };

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .insert([bizData])
    .select()
    .single();
  if (bizErr) throw bizErr;

  // 3. Update draft with activated business ID and mark as Completed
  await supabase
    .from('onboarding_drafts')
    .update({ 
      draft_status: 'Completed', 
      activated_business_id: biz.id 
    })
    .eq('id', draftId);

  return { success: true, businessId: draft.id };
}

export async function getRecentOnboardingDrafts(limit = 5) {
  if (isPlaceholder()) return [
    { id: '1', business_name: 'Acme Plumbing', draft_status: 'Onboarding (2/6)', updated_at: new Date().toISOString() },
    { id: '2', business_name: 'Joe Tree Service', draft_status: 'Ready to Activate', updated_at: new Date().toISOString() }
  ];

  const { data, error } = await supabase
    .from('onboarding_drafts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * ADMINISTRATIVE DRAFTING ENGINE (Proof & Acquisition)
 */

export async function createDraftWithFirecrawl(websiteUrl) {
  if (isPlaceholder()) return { id: 'mock-draft', draft_status: 'review_ready' }

  // 1. Create Initial Draft
  const { data: draft, error: createError } = await supabase
    .from('onboarding_drafts')
    .insert([{ 
      business_name: 'Scanning...', 
      website_url: websiteUrl, 
      draft_status: 'scraping' 
    }])
    .select()
    .single()

  if (createError) throw createError

  try {
    // 2. Scrape with Firecrawl
    const scrapeResult = await firecrawl.scrape(websiteUrl)
    const content = scrapeResult.data?.markdown || '';

    // Simple heuristic parser for the draft
    const lines = content.split('\n');
    const name = lines.find(l => l.trim().length > 3)?.replace(/#|[*]/g, '').trim() || 'New Business';
    
    // Heuristic for niche (search for keywords)
    let detectedNiche = 'General';
    const niches = ['Plumbing', 'HVAC', 'Real Estate', 'Roofing', 'Lawn Service', 'Handyman', 'Wedding Planner', 'DJ'];
    for (const n of niches) {
      if (content.toLowerCase().includes(n.toLowerCase())) {
        detectedNiche = n;
        break;
      }
    }

    // 3. Update Draft with Scraped Data
    const { data: updated, error: updateError } = await supabase
      .from('onboarding_drafts')
      .update({
        business_name: name,
        niche: detectedNiche,
        scrape_data: {
          bio: content.slice(0, 500) + '...',
          raw: content
        },
        scrape_confidence_score: 0.85,
        draft_status: 'Needs Review'
      })
      .eq('id', draft.id)
      .select()
      .single()

    if (updateError) throw updateError
    return updated
  } catch (err) {
    console.error('Scrape failure:', err)
    await supabase.from('onboarding_drafts').update({ draft_status: 'error' }).eq('id', draft.id)
    throw err
  }
}
export async function getRecentErrors(limit = 10) {
  if (isPlaceholder()) return [
    { id: '1', status: 'Error', service: 'SMS', message: 'Telnyx Rate Limit', created_at: new Date().toISOString() },
    { id: '2', status: 'Error', service: 'AI', message: 'Gemini Context Overflow', created_at: new Date().toISOString() }
  ];

  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .ilike('status', 'Error')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function toggleGlobalPause(isPaused) {
  if (isPlaceholder()) return { success: true, is_paused: isPaused };

  const { data, error } = await supabase
    .from('system_config') // Assuming a system_config table exists
    .upsert([{ key: 'global_pause', value: isPaused }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
