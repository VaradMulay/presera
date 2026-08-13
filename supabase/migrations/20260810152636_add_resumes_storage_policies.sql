/*
# Add storage RLS policies for the resumes bucket

## Overview
The "resumes" storage bucket exists but has no RLS policies, so no
authenticated user can upload or read files. We add per-user policies
scoped by the object path prefix: files are stored at `{user_id}/{filename}`.

## Changes
1. INSERT policy: user can upload to a path starting with their own uid.
2. SELECT policy: user can read files from a path starting with their own uid.
3. DELETE policy: user can delete files from their own path.
4. UPDATE policy: user can update files in their own path.

## Notes
1. Smallest possible change — only adds storage object policies for the
   resumes bucket. No tables are created, renamed, or modified.
2. No auth changes. No existing schema changes.
3. Path convention: `resumes/{auth.uid()}/{filename}`
*/

-- Allow users to upload files to their own folder in the resumes bucket
CREATE POLICY "resumes_upload_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read files from their own folder
CREATE POLICY "resumes_read_own"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update files in their own folder
CREATE POLICY "resumes_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete files from their own folder
CREATE POLICY "resumes_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
