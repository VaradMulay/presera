/*
# Add missing columns for app data model compatibility

## Overview
The existing normalized schema (interviews + questions + answers + evaluations)
is missing a few columns that the app's data model needs:
- questions.ideal_keywords (jsonb) — used for local scoring bias
- answers.scores (jsonb) — per-answer SubScore object
- interviews.resume_name (text) — uploaded resume filename

## Changes

### questions
1. Add `ideal_keywords` jsonb column (nullable, default '[]')

### answers
1. Add `scores` jsonb column (nullable) — stores SubScore {technical, communication, problemSolving, relevance}

### interviews
1. Add `resume_name` text column (nullable) — filename of uploaded resume

## Notes
1. All additions are nullable with safe defaults — no existing data is affected.
2. No column types are changed, no columns are dropped or renamed.
3. The profiles table needs no changes — existing columns (full_name, target_role,
   experience_level, preferred_interview_type) map directly to the app's data model.
   "Onboarded" is derived: target_role IS NOT NULL.
*/
ALTER TABLE questions ADD COLUMN IF NOT EXISTS ideal_keywords jsonb DEFAULT '[]'::jsonb;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS scores jsonb;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS resume_name text;
