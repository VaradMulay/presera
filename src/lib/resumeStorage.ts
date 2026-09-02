import { supabase } from './supabase';

export interface ResumeRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

const BUCKET = 'resumes';
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

function getExt(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

export function validateResumeFile(file: File): string | null {
  if (file.size > MAX_SIZE) {
    return 'File is too large. Maximum size is 5 MB.';
  }
  const ext = getExt(file.name);
  const typeOk = ALLOWED_TYPES.includes(file.type);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);
  if (!typeOk && !extOk) {
    return 'Only PDF, DOC, and DOCX files are accepted.';
  }
  return null;
}

export async function uploadResume(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ data: ResumeRecord | null; error: string | null }> {
  const validationError = validateResumeFile(file);
  if (validationError) {
    return { data: null, error: validationError };
  }

  const ext = getExt(file.name);
  const uniqueName = `${crypto.randomUUID()}${ext}`;
  const filePath = `${userId}/${uniqueName}`;

  const { error: upError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (upError) {
    return { data: null, error: upError.message };
  }

  onProgress?.(100);

  const { data, error: dbError } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type || ext,
      file_size: file.size,
    })
    .select('*')
    .single();

  if (dbError) {
    return { data: null, error: dbError.message };
  }

  return { data: data as ResumeRecord, error: null };
}

export async function getResumes(userId: string): Promise<ResumeRecord[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getResumes error:', error.message);
    return [];
  }
  return (data ?? []) as ResumeRecord[];
}

export async function deleteResume(resumeId: string, filePath: string): Promise<string | null> {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (storageError) {
    console.error('deleteResume: storage error:', storageError.message);
  }

  const { error: dbError } = await supabase.from('resumes').delete().eq('id', resumeId);
  if (dbError) {
    return dbError.message;
  }
  return null;
}

export async function getResumePublicUrl(filePath: string): Promise<string | null> {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? null;
}
