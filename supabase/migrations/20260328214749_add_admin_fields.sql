-- Add Handoff Phone and AI Niche fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS handoff_phone TEXT,
ADD COLUMN IF NOT EXISTS ai_niche TEXT DEFAULT 'General';

-- Update existing businesses to have a default niche
UPDATE businesses SET ai_niche = 'General' WHERE ai_niche IS NULL;
