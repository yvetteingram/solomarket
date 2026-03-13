-- SoloMarket Schema Additions
-- Run this in your Supabase SQL Editor.
-- These statements ADD missing columns to your existing tables.
-- Settings are stored in the existing profiles.system_profile jsonb column.

-- ============================================================
-- ADD user_id AND name TO MARKETING TABLES
-- (products already has user_id)
-- ============================================================

ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE marketing_leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE marketing_plans ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE marketing_posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_user_id ON marketing_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_plans_user_id ON marketing_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_user_id ON marketing_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_status ON marketing_posts(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_stage ON marketing_leads(stage);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable on marketing tables (products likely has it already)
-- ============================================================

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage own campaigns" ON marketing_campaigns
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own leads" ON marketing_leads
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own plans" ON marketing_plans
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users manage own posts" ON marketing_posts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- BACKFILL user_id (run after adding columns)
-- Replace 'YOUR_USER_UUID' with your actual auth user ID
-- You can find it in Supabase > Authentication > Users
-- ============================================================

-- UPDATE marketing_campaigns SET user_id = 'YOUR_USER_UUID' WHERE user_id IS NULL;
-- UPDATE marketing_leads SET user_id = 'YOUR_USER_UUID' WHERE user_id IS NULL;
-- UPDATE marketing_plans SET user_id = 'YOUR_USER_UUID' WHERE user_id IS NULL;
-- UPDATE marketing_posts SET user_id = 'YOUR_USER_UUID' WHERE user_id IS NULL;
