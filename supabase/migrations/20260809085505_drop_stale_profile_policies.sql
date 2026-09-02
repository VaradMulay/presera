/*
# Remove stale broken policies from profiles

## Overview
The profiles table inherited legacy policies from a prior schema attempt
that reference a `user_id` column. The current profiles table uses `id`
(not `user_id`), so those policies error on every query and break access.

## Changes
1. Drop the four stale policies:
   - "Users can view their own profile" (SELECT, TO public, using user_id)
   - "Users can insert their own profile" (INSERT, TO public, using user_id)
   - "Users can update their own profile" (UPDATE, TO public, using user_id)
2. The correct authenticated-scoped policies (select_own_profile,
   insert_own_profile, update_own_profile, delete_own_profile) created in
   the previous migration remain intact.

## Notes
- No data is touched. Only invalid policy definitions are removed.
- The authenticated policies keyed on `id = auth.uid()` are authoritative.
*/

DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
