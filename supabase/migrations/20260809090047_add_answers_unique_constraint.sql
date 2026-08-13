/*
# Add unique constraint on answers(interview_id, question_id)

## Overview
The answers table needs a unique constraint on (interview_id, question_id)
so that upserting an answer for a given question replaces the existing one
rather than creating a duplicate. Without this, the app's "save after each
question" pattern would create duplicate answer rows.

## Changes
1. Add UNIQUE constraint on answers(interview_id, question_id).

## Notes
1. No data is affected — the table is empty.
2. This allows the storage layer to use .upsert(..., { onConflict: 'interview_id,question_id' }).
*/

CREATE UNIQUE INDEX IF NOT EXISTS answers_interview_question_unique
ON answers(interview_id, question_id);
