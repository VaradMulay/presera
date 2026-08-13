/*
# Fix RLS policies for all tables

## Overview
The existing tables have RLS enabled but incorrect or missing policies:
- profiles: policies use `id = auth.uid()`, but profiles.id is a random UUID,
  not the auth user id. The link to auth.users is via `user_id`. These policies
  block all access — the app can never read or write profiles.
- questions, answers, evaluations, resumes: RLS is enabled but ZERO policies
  exist, so the tables are completely locked.

## Changes

### profiles
1. Drop the four broken policies keyed on `id = auth.uid()`.
2. Create four new policies keyed on `user_id = auth.uid()`.
3. Set `user_id` to NOT NULL with DEFAULT auth.uid() so inserts that omit
   user_id (as the Supabase client does) still satisfy the WITH CHECK.

### interviews
- Policies already exist and are correct (keyed on user_id = auth.uid()).
- No changes needed.

### questions
- Add four owner-scoped policies via parent: EXISTS(SELECT 1 FROM interviews
  WHERE interviews.id = questions.interview_id AND interviews.user_id = auth.uid()).

### answers
- Add four owner-scoped policies via parent interviews (through interview_id)
  AND through questions (through question_id). Either path must match.

### evaluations
- Add four owner-scoped policies via parent: EXISTS(SELECT 1 FROM interviews
  WHERE interviews.id = evaluations.interview_id AND interviews.user_id = auth.uid()).

### resumes
- Add four owner-scoped policies keyed on user_id = auth.uid().
- Set user_id to NOT NULL with DEFAULT auth.uid().

## Notes
1. All policies are TO authenticated — this app has a sign-in screen.
2. Child table ownership is verified through the parent interviews table,
   not a direct user_id column (questions/answers/evaluations don't have one).
3. No data is touched. Only policy definitions change.
*/

-- ===== profiles =====
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== questions =====
DROP POLICY IF EXISTS "select_own_questions" ON questions;
DROP POLICY IF EXISTS "insert_own_questions" ON questions;
DROP POLICY IF EXISTS "update_own_questions" ON questions;
DROP POLICY IF EXISTS "delete_own_questions" ON questions;

CREATE POLICY "select_own_questions" ON questions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "insert_own_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "update_own_questions" ON questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "delete_own_questions" ON questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = questions.interview_id
      AND interviews.user_id = auth.uid())
  );

-- ===== answers =====
DROP POLICY IF EXISTS "select_own_answers" ON answers;
DROP POLICY IF EXISTS "insert_own_answers" ON answers;
DROP POLICY IF EXISTS "update_own_answers" ON answers;
DROP POLICY IF EXISTS "delete_own_answers" ON answers;

CREATE POLICY "select_own_answers" ON answers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = answers.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "insert_own_answers" ON answers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = answers.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "update_own_answers" ON answers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = answers.interview_id
      AND interviews.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = answers.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "delete_own_answers" ON answers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = answers.interview_id
      AND interviews.user_id = auth.uid())
  );

-- ===== evaluations =====
DROP POLICY IF EXISTS "select_own_evaluations" ON evaluations;
DROP POLICY IF EXISTS "insert_own_evaluations" ON evaluations;
DROP POLICY IF EXISTS "update_own_evaluations" ON evaluations;
DROP POLICY IF EXISTS "delete_own_evaluations" ON evaluations;

CREATE POLICY "select_own_evaluations" ON evaluations FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "insert_own_evaluations" ON evaluations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "update_own_evaluations" ON evaluations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
      AND interviews.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
      AND interviews.user_id = auth.uid())
  );
CREATE POLICY "delete_own_evaluations" ON evaluations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM interviews
      WHERE interviews.id = evaluations.interview_id
      AND interviews.user_id = auth.uid())
  );

-- ===== resumes =====
ALTER TABLE resumes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE resumes ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;

CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
