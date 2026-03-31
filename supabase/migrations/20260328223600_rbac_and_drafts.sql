-- ============================================
-- RBAC & ONBOARDING DRAFTS (MIGRATION)
-- ============================================

-- 1. Profiles Table for RBAC
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user', -- 'user', 'admin'
  is_master_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Trigger: Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, is_master_admin)
  VALUES (
    NEW.id, 
    NEW.email, 
    'user', 
    CASE WHEN NEW.email = 'officialzenovaai@gmail.com' THEN TRUE ELSE FALSE END
  );
  
  -- If they are the master admin, also set the role to admin
  IF NEW.email = 'officialzenovaai@gmail.com' THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Be careful with trigger creation: check if it exists or drop and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Initial Setup for existing user (if any)
INSERT INTO public.profiles (id, email, role, is_master_admin)
SELECT id, email, 'admin', TRUE 
FROM auth.users 
WHERE email = 'officialzenovaai@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', is_master_admin = TRUE;

-- 3. Onboarding Drafts Table
CREATE TABLE IF NOT EXISTS onboarding_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Tracking
  draft_status TEXT DEFAULT 'queued', -- 'queued', 'scraping_site', 'scraped', 'review_required', 'approved', 'activated', 'failed'
  scrape_confidence_score NUMERIC DEFAULT 0,
  missing_fields TEXT[],
  review_notes TEXT,
  error_message TEXT,
  
  -- Basics
  business_name TEXT,
  website_url TEXT,
  business_phone TEXT,
  business_email TEXT,
  business_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  service_area_text TEXT,
  service_radius_miles NUMERIC,
  business_hours JSONB,
  booking_url TEXT,
  google_business_profile_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  
  -- Industry & Scope
  industry TEXT,
  sub_industry TEXT,
  services_offered TEXT[],
  service_categories TEXT[],
  emergency_services_offered BOOLEAN,
  after_hours_available BOOLEAN,
  appointment_required BOOLEAN,
  free_estimates BOOLEAN,
  licensed_and_insured BOOLEAN,
  
  -- Tone & Branding
  brand_tone TEXT,
  tone_notes TEXT,
  short_business_summary TEXT,
  company_background TEXT,
  value_props TEXT[],
  cta_style TEXT,
  
  -- Response Drafts
  missed_call_message TEXT,
  after_hours_message TEXT,
  vacation_message TEXT,
  followup_message TEXT,
  booking_prompt TEXT,
  callback_prompt TEXT,
  
  -- AI Intelligence Rules
  primary_goal TEXT,
  pricing_policy TEXT,
  max_questions INTEGER DEFAULT 2,
  escalation_preference TEXT,
  response_length TEXT DEFAULT 'Short',
  owner_review_mode BOOLEAN DEFAULT FALSE,
  hard_response_rules TEXT[],
  handoff_keywords TEXT[],
  
  -- Structured Knowledge
  qualification_questions TEXT[],
  faq_entries JSONB DEFAULT '[]'::jsonb,
  knowledge_base_entries JSONB DEFAULT '[]'::jsonb
);

-- 4. Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR is_master_admin = TRUE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Security Policies
ALTER TABLE onboarding_drafts ENABLE ROW LEVEL SECURITY;

-- Only Admins or Master Admins can see/manage drafts
CREATE POLICY "Admins can manage drafts"
ON onboarding_drafts FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Profiles policy
CREATE POLICY "Profile access policy"
ON profiles FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR (is_admin())
);
