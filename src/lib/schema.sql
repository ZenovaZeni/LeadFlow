-- ============================================
-- SUPABASE SCHEMA SETUP (COMPLETE)
-- ============================================

-- 1. Businesses Table (Profile & Settings)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  missed_call_enabled BOOLEAN DEFAULT TRUE,
  vacation_mode BOOLEAN DEFAULT FALSE,
  after_hours_mode BOOLEAN DEFAULT TRUE,
  landing_theme TEXT DEFAULT 'modern_split',
  smart_delay TEXT DEFAULT '30s',
  branding JSONB DEFAULT '{"headline": "Get a Free Estimate", "subheadline": "Fill out the form and we''ll get back to you right away.", "color": "#4F46E5", "logo": "🚀"}'::jsonb,
  ai_rules JSONB DEFAULT '{"bio": "", "goal": "", "custom_rules": ""}'::jsonb,
  business_hours JSONB DEFAULT '{"monday": {"open": "08:00", "close": "17:00", "closed": false}, "tuesday": {"open": "08:00", "close": "17:00", "closed": false}, "wednesday": {"open": "08:00", "close": "17:00", "closed": false}, "thursday": {"open": "08:00", "close": "17:00", "closed": false}, "friday": {"open": "08:00", "close": "17:00", "closed": false}, "saturday": {"open": "00:00", "close": "00:00", "closed": true}, "sunday": {"open": "00:00", "close": "00:00", "closed": true}}'::jsonb,
  operational_bounds JSONB DEFAULT '{"min_ticket": "$500", "service_fee": "$99", "service_radii": ""}'::jsonb,
  integrations JSONB DEFAULT '{"cal_com": {"enabled": false, "api_key": null, "service_mappings": {}}}'::jsonb,
  telnyx_phone_number TEXT UNIQUE, -- The Telnyx number assigned to this client
  has_trained_ai BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Policies for businesses
CREATE POLICY "Users can manage their own business" 
ON businesses FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service TEXT,
  summary TEXT,
  status TEXT DEFAULT 'new', -- 'new', 'waiting', 'booked', 'ai_handling'
  status_label TEXT DEFAULT 'New Lead',
  temperature TEXT DEFAULT 'Cold',
  is_urgent BOOLEAN DEFAULT FALSE,
  voicemail_transcript TEXT,
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policies for leads
CREATE POLICY "Users can manage their own leads" 
ON leads FOR ALL 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
) 
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

-- 3. Questions Table (AI Intake)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Policies for questions
CREATE POLICY "Users can manage their own questions" 
ON questions FOR ALL 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
) 
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

-- 4. FAQs Table (AI Knowledge Base)
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  q TEXT NOT NULL,
  a TEXT NOT NULL,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policies for FAQs
CREATE POLICY "Users can manage their own faqs" 
ON faqs FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = faqs.business_id 
    AND user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = faqs.business_id 
    AND user_id = auth.uid()
  )
);

-- 5. Onboarding Submissions (Public Tracking)
CREATE TABLE IF NOT EXISTS onboarding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  services_offered TEXT,
  service_area TEXT,
  business_hours TEXT,
  preferred_booking TEXT DEFAULT 'Link',
  booking_link TEXT,
  qual_questions TEXT,
  faq TEXT,
  assistant_tone TEXT DEFAULT 'Professional',
  assistant_avoid TEXT,
  additional_notes TEXT
);

ALTER TABLE onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Policy (Allow Public Inserts)
CREATE POLICY "Enable insert for public" 
ON onboarding_submissions FOR INSERT 
WITH CHECK (true);

-- Policy (Read-only for Authenticated Admins)
CREATE POLICY "Enable reads for authenticated users" 
ON onboarding_submissions FOR SELECT 
TO authenticated 
USING (true);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'urgent_lead', 'new_booking', etc.
  message TEXT NOT NULL,
  link_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications" 
ON notifications FOR ALL 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
) 
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
);

-- 7. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  service_type TEXT,
  booking_status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled', 'Callback Needed'
  requested_time_text TEXT,
  selected_slot TIMESTAMP WITH TIME ZONE,
  date TEXT,
  time TEXT,
  notes TEXT,
  source TEXT DEFAULT 'Assistant',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookings" 
ON bookings FOR ALL 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
) 
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  )
-- 8. Onboarding Drafts (The Drafting Assistant)
CREATE TABLE IF NOT EXISTS onboarding_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  city TEXT,
  state TEXT,
  niche TEXT DEFAULT 'General',
  scrape_data JSONB DEFAULT '{}',
  scrape_confidence_score FLOAT DEFAULT 0.0,
  draft_status TEXT DEFAULT 'scraping', -- 'scraping', 'review_ready', 'activated'
  activated_business_id UUID REFERENCES businesses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE onboarding_drafts ENABLE ROW LEVEL SECURITY;

-- Admins (Hardcoded emails) can manage all drafts
CREATE POLICY "Admins can manage all drafts" 
ON onboarding_drafts FOR ALL 
TO authenticated 
USING (
  auth.jwt() ->> 'email' IN ('jdouglas8585@gmail.com', 'officialzenovaai@gmail.com')
)
WITH CHECK (
  auth.jwt() ->> 'email' IN ('jdouglas8585@gmail.com', 'officialzenovaai@gmail.com')
);

