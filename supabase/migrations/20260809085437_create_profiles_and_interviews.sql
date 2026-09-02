/*
# Create profiles and interviews tables for Presera

## Overview
Migrates Presera from local-only storage to Supabase. Creates two tables:
- `profiles`: user profile data (name, onboarding) linked 1:1 to auth.users
- `interviews`: mock interview sessions with questions, answers, and results

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users ON DELETE CASCADE)
- `name` (text, not null) — display name
- `onboarded` (boolean, default false) — has the user completed onboarding
- `onboarding` (jsonb, nullable) — { role, experience, interviewType }
- `created_at` (timestamptz, default now())

### interviews
- `id` (uuid, primary key, default gen_random_uuid())
- `user_id` (uuid, not null, references auth.users ON DELETE CASCADE, default auth.uid())
- `role` (text, not null)
- `experience` (text, not null)
- `type` (text, not null)
- `difficulty` (text, not null)
- `question_count` (integer, not null)
- `job_description` (text, nullable)
- `resume_name` (text, nullable)
- `started_at` (timestamptz, not null, default now())
- `completed_at` (timestamptz, nullable)
- `questions` (jsonb, not null) — array of Question objects
- `answers` (jsonb, not null, default '[]') — array of AnswerRecord objects
- `result` (jsonb, nullable) — InterviewResult object
- `created_at` (timestamptz, default now())

## 2. Indexes
- `interviews_user_id_idx` on interviews(user_id) for dashboard queries
- `interviews_completed_at_idx` on interviews(completed_at DESC) for history sorting

## 3. Security (RLS)
- Both tables have RLS enabled.
- profiles: owner-scoped CRUD (id = auth.uid()).
- interviews: owner-scoped CRUD (user_id = auth.uid()).
- user_id defaults to auth.uid() so client inserts without user_id succeed.

## 4. Important Notes
1. profiles.id matches auth.users.id exactly — no separate user id.
2. interviews.user_id has DEFAULT auth.uid() so frontend inserts omitting user_id succeed.
3. JSONB columns store the full questions/answers/result arrays — no separate child tables needed for MVP.
4. No data migration from localStorage — existing local data is abandoned (mock MVP).
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  onboarded boolean NOT NULL DEFAULT false,
  onboarding jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  experience text NOT NULL,
  type text NOT NULL,
  difficulty text NOT NULL,
  question_count integer NOT NULL,
  job_description text,
  resume_name text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  questions jsonb NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS interviews_user_id_idx ON interviews(user_id);
CREATE INDEX IF NOT EXISTS interviews_completed_at_idx ON interviews(completed_at DESC);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- profiles policies (owner = auth.uid(), keyed on id)
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
ON profiles FOR DELETE
TO authenticated USING (auth.uid() = id);

-- interviews policies (owner = auth.uid(), keyed on user_id)
DROP POLICY IF EXISTS "select_own_interviews" ON interviews;
CREATE POLICY "select_own_interviews"
ON interviews FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_interviews" ON interviews;
CREATE POLICY "insert_own_interviews"
ON interviews FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_interviews" ON interviews;
CREATE POLICY "update_own_interviews"
ON interviews FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_interviews" ON interviews;
CREATE POLICY "delete_own_interviews"
ON interviews FOR DELETE
TO authenticated USING (auth.uid() = user_id);
