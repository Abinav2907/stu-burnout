-- ============================================================
-- PrepPilot — Supabase Database Setup
-- Run this entire file in Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ── 1. QUIZ RESULTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          text NOT NULL,
  subject          text,
  topic            text,
  score            int,
  total_questions  int,
  percentage       int,
  difficulty       text,
  created_at       timestamptz DEFAULT now()
);

-- Enable Row Level Security (open policy for anon key)
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_quiz_results" ON public.quiz_results;
CREATE POLICY "allow_all_quiz_results" ON public.quiz_results
  FOR ALL USING (true) WITH CHECK (true);

-- ── 2. CHAT HISTORY ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_history (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    text NOT NULL,
  role       text NOT NULL,       -- 'user' | 'assistant'
  content    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_chat_history" ON public.chat_history;
CREATE POLICY "allow_all_chat_history" ON public.chat_history
  FOR ALL USING (true) WITH CHECK (true);

-- ── 3. BURNOUT PREDICTIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.burnout_predictions (
  id                   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              text UNIQUE NOT NULL,
  risk_level           text,                        -- 'LOW' | 'MEDIUM' | 'HIGH'
  risk_score           int,
  burnout_probability  int,
  dropout_probability  int,
  model_confidence     float,
  source               text,                        -- 'ml_model' | 'ai_fallback' | 'local_formula'
  top_risk_factors     jsonb,
  recommendations      jsonb,
  weekly_plan          jsonb,
  updated_at           timestamptz DEFAULT now()
);

ALTER TABLE public.burnout_predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_burnout_predictions" ON public.burnout_predictions;
CREATE POLICY "allow_all_burnout_predictions" ON public.burnout_predictions
  FOR ALL USING (true) WITH CHECK (true);

-- ── 4. NOTES HISTORY ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes_history (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    text NOT NULL,
  subject    text,
  topic      text,
  content    jsonb,              -- full notes JSON
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notes_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_notes_history" ON public.notes_history;
CREATE POLICY "allow_all_notes_history" ON public.notes_history
  FOR ALL USING (true) WITH CHECK (true);

-- ── Done ──────────────────────────────────────────────────
-- After running, verify in Table Editor that all 4 tables appear.
