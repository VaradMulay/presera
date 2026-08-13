import { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Target, Briefcase, MessageSquare, Save, Check, FileText, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardHeader } from '@/components/Card';
import { FormField, inputClasses } from '@/components/FormField';
import { Select } from '@/components/Select';
import { FileUpload } from '@/components/FileUpload';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROLES, EXPERIENCE_LEVELS, INTERVIEW_TYPES } from '@/lib/constants';
import type { Role, ExperienceLevel, InterviewType } from '@/lib/types';
import { formatDate } from '@/lib/stats';
import { getResumes, deleteResume, type ResumeRecord } from '@/lib/resumeStorage';

export default function ProfilePage() {
  const { fullUser, updateProfile, completeOnboarding } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState(fullUser?.name ?? '');
  const [role, setRole] = useState<Role>(fullUser?.onboarding?.role ?? 'Software Developer');
  const [experience, setExperience] = useState<ExperienceLevel>(fullUser?.onboarding?.experience ?? 'Fresher');
  const [interviewType, setInterviewType] = useState<InterviewType>(fullUser?.onboarding?.interviewType ?? 'Technical');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile({ name });
    await completeOnboarding({ role, experience, interviewType });
    setSaving(false);
    success('Profile updated', 'Your changes have been saved.');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your account and interview preferences.</p>
      </div>

      {/* Profile header card */}
      <Card className="mb-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-extrabold text-white shadow-soft">
            {fullUser?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-neutral-900">{fullUser?.name}</h2>
            <p className="text-sm text-neutral-500">{fullUser?.email}</p>
            <p className="mt-1 text-xs text-neutral-400">
              Member since {fullUser ? formatDate(fullUser.createdAt) : '—'}
            </p>
          </div>
        </div>
      </Card>

      {/* Resume management */}
      <ResumeSection userId={fullUser?.id ?? ''} />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Account */}
        <Card>
          <CardHeader title="Account details" subtitle="Your basic information" />
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="name" required>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="name" value={name} onChange={(e) => setName(e.target.value)}
                  className={`${inputClasses} pl-10`} placeholder="Your name"
                />
              </div>
            </FormField>
            <FormField label="Email" htmlFor="email" hint="Email cannot be changed in the MVP">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email" value={fullUser?.email ?? ''} disabled
                  className={`${inputClasses} pl-10 bg-neutral-50 text-neutral-500`}
                />
              </div>
            </FormField>
          </div>
        </Card>

        {/* Interview preferences */}
        <Card>
          <CardHeader title="Interview preferences" subtitle="Used to pre-fill new interviews" />
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <FormField label="Target role" htmlFor="role">
              <Select
                id="role" value={role} onChange={(e) => setRole(e.target.value as Role)}
                options={ROLES}
              />
            </FormField>
            <FormField label="Experience level" htmlFor="exp">
              <Select
                id="exp" value={experience} onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                options={EXPERIENCE_LEVELS}
              />
            </FormField>
            <FormField label="Preferred interview type" htmlFor="type">
              <Select
                id="type" value={interviewType} onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                options={INTERVIEW_TYPES}
              />
            </FormField>
          </div>

          {/* Preference preview chips */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Target className="h-3 w-3" /> {role}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              <Briefcase className="h-3 w-3" /> {experience}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              <MessageSquare className="h-3 w-3" /> {interviewType}
            </span>
          </div>
        </Card>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" size="md" disabled={saving || !name.trim()}>
            {saving ? (
              <>Saving…</>
            ) : (
              <><Save className="h-4 w-4" /> Save changes</>
            )}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-400">
        <Check className="mr-1 inline h-3 w-3 text-success-500" />
        Your profile and interviews are saved to your account securely.
      </p>
    </div>
  );
}

function ResumeSection({ userId }: { userId: string }) {
  const { success, error: showError } = useToast();
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!userId) return;
    const data = await getResumes(userId);
    setResumes(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleDelete = async (id: string, filePath: string) => {
    setDeleting(id);
    const err = await deleteResume(id, filePath);
    setDeleting(null);
    if (err) {
      showError('Could not delete resume', err);
      return;
    }
    setResumes((prev) => prev.filter((r) => r.id !== id));
    success('Resume deleted', 'Your resume has been removed.');
  };

  return (
    <Card>
      <CardHeader
        title="My Resumes"
        subtitle="Upload and manage resumes used during interviews"
      />

      <div className="mt-4 space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-3 py-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-600" />
            <p className="text-sm text-error-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600" />
            Loading resumes…
          </div>
        ) : resumes.length > 0 ? (
          <div className="space-y-2">
            {resumes.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <FileText className="h-5 w-5 text-brand-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{r.file_name}</p>
                  <p className="text-xs text-neutral-500">
                    {r.file_size ? `${(r.file_size / 1024).toFixed(1)} KB · ` : ''}Uploaded {formatDate(r.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id, r.file_path)}
                  disabled={deleting === r.id}
                  className="rounded-lg p-2 text-neutral-400 transition hover:bg-error-50 hover:text-error-600 disabled:opacity-50"
                  aria-label="Delete resume"
                >
                  {deleting === r.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-error-600" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No resumes uploaded yet.</p>
        )}

        <FileUpload
          label="Upload new resume"
          onUploaded={(resume) => {
            if (resume) {
              setResumes((prev) => [resume, ...prev]);
              success('Resume uploaded', resume.file_name);
            }
          }}
        />
      </div>
    </Card>
  );
}
