import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, Briefcase, MessageSquare, Gauge, ListOrdered, FileText, Play,
  Info, AlertCircle, FileText as FileIcon, Check,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormField, inputClasses } from '@/components/FormField';
import { FileUpload } from '@/components/FileUpload';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

import { ROLES, EXPERIENCE_LEVELS, INTERVIEW_TYPES, DIFFICULTIES, QUESTION_COUNTS } from '@/lib/constants';
import type { Role, ExperienceLevel, InterviewType, Difficulty } from '@/lib/types';
import { createInterview } from '@/lib/storage';
import { getResumes, type ResumeRecord } from '@/lib/resumeStorage';
import { cn } from '@/lib/cn';

export default function NewInterviewPage() {
  const { fullUser } = useAuth();
  const { info, error: showError } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>(fullUser?.onboarding?.role ?? 'Software Developer');
  const [experience, setExperience] = useState<ExperienceLevel>(fullUser?.onboarding?.experience ?? 'Fresher');
  const [type, setType] = useState<InterviewType>(fullUser?.onboarding?.interviewType ?? 'Technical');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [count, setCount] = useState<number>(10);
  const [jobDescription, setJobDescription] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');

  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>();
  const [resumeJustUploaded, setResumeJustUploaded] = useState<ResumeRecord | null>(null);

  useEffect(() => {
    if (!fullUser?.id) return;
    let active = true;
    (async () => {
      const data = await getResumes(fullUser.id);
      if (!active) return;
      setResumes(data);
      setLoadingResumes(false);
    })();
    return () => { active = false; };
  }, [fullUser?.id]);

  const handleStart = async () => {
    if (role === 'Other') {
      info('Note', '"Other" uses a general question bank. Pick a specific role for tailored questions.');
    }
    setStarting(true);
    setStartError('');

    const selectedResume = resumes.find((r) => r.id === selectedResumeId) ?? resumeJustUploaded;

    const result = await createInterview(fullUser!.id, {
      role,
      experience,
      type,
      difficulty,
      questionCount: count,
      jobDescription,
      resumeName: selectedResume?.file_name,
      resumeId: selectedResume?.id,
    });

    if ('error' in result) {
      setStarting(false);
      setStartError(result.error);
      showError('Could not start interview', result.error);
      return;
    }

    navigate(`/interview/${result.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">New Mock Interview</h1>
        <p className="mt-1 text-sm text-neutral-500">Configure your session, then start practicing.</p>
      </div>

      <div className="space-y-6">
        {/* Role + experience + type */}
        <Card>
          <SectionTitle icon={Target} title="Interview setup" subtitle="Choose your target role and format" />

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Target role" htmlFor="role" required>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-semibold transition',
                      role === r ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </FormField>

            <div className="space-y-5">
              <FormField label="Experience level" htmlFor="exp" required>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setExperience(lvl)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition',
                        experience === lvl ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      <Briefcase className="h-3 w-3" /> {lvl}
                    </button>
                  ))}
                </div>
              </FormField>

              <FormField label="Interview type" htmlFor="type" required>
                <div className="grid grid-cols-2 gap-2">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition',
                        type === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      <MessageSquare className="h-3 w-3" /> {t}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </div>
        </Card>

        {/* Difficulty + count */}
        <Card>
          <SectionTitle icon={Gauge} title="Difficulty & length" subtitle="Tune the challenge and number of questions" />

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Difficulty" htmlFor="diff" required>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-sm font-semibold transition',
                      difficulty === d
                        ? d === 'Hard' ? 'border-error-500 bg-error-50 text-error-700'
                          : d === 'Medium' ? 'border-warning-500 bg-warning-50 text-warning-700'
                          : 'border-success-500 bg-success-50 text-success-700'
                        : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Number of questions" htmlFor="count" required>
              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold transition',
                      count === n ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                    )}
                  >
                    <ListOrdered className="h-3.5 w-3.5" /> {n}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </Card>

        {/* Resume + JD */}
        <Card>
          <SectionTitle icon={FileText} title="Optional context" subtitle="Upload or select a resume to tailor the session" />

          <div className="mt-5 space-y-5">
            {/* Resume selection */}
            <FormField label="Your resumes" htmlFor="resume">
              {loadingResumes ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-brand-600" />
                  Loading your resumes…
                </div>
              ) : resumes.length > 0 ? (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedResumeId(undefined)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition',
                      !selectedResumeId ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 hover:border-neutral-300',
                    )}
                  >
                    <FileIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="flex-1 text-sm font-medium text-neutral-700">No resume</span>
                  </button>
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResumeId(r.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition',
                        selectedResumeId === r.id ? 'border-brand-500 bg-brand-50' : 'border-neutral-200 hover:border-neutral-300',
                      )}
                    >
                      <FileIcon className="h-4 w-4 shrink-0 text-brand-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">{r.file_name}</p>
                        <p className="text-xs text-neutral-500">
                          {r.file_size ? `${(r.file_size / 1024).toFixed(1)} KB` : ''}
                        </p>
                      </div>
                      {selectedResumeId === r.id && (
                        <Check className="h-4 w-4 shrink-0 text-brand-600" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No resumes uploaded yet.</p>
              )}
            </FormField>

            {/* Upload new resume */}
            <FileUpload
              hint="PDF, DOC, or DOCX up to 5MB"
              onUploaded={(resume) => {
                setResumeJustUploaded(resume);
                if (resume) {
                  setSelectedResumeId(resume.id);
                  setResumes((prev) => [resume, ...prev]);
                }
              }}
            />

            <FormField
              label="Job description"
              htmlFor="jd"
              hint="Paste a JD to make the session feel more targeted (optional)"
            >
              <textarea
                id="jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={5}
                placeholder="Paste the job description here…"
                className={`${inputClasses} h-auto resize-y py-3 leading-relaxed`}
              />
            </FormField>
          </div>
        </Card>

        {/* Info note */}
        <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-sm text-neutral-600">
            Questions are drawn from a local, curated bank for your role — no AI needed. After you finish, you'll get instant scores and feedback. <span className="font-semibold">AI-powered evaluation is coming soon.</span>
          </p>
        </div>

        {/* Start */}
        <div className="space-y-4">
          {startError && (
            <div className="flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-600" />
              <div>
                <p className="text-sm font-semibold text-error-900">Could not start interview</p>
                <p className="text-sm text-error-700">{startError}</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              {count} {type} questions · {difficulty} difficulty
            </p>
            <Button onClick={handleStart} size="lg" disabled={starting}>
              {starting ? (
                <><span className="h-4 w-4 animate-pulse">…</span> Starting…</>
              ) : (
                <><Play className="h-4 w-4" /> Start Interview</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: typeof Target; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
        <Icon className="h-5 w-5 text-brand-600" />
      </div>
      <div>
        <h2 className="font-bold text-neutral-900">{title}</h2>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
    </div>
  );
}
