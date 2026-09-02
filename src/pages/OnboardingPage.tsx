import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Briefcase, MessageSquare, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROLES, EXPERIENCE_LEVELS, INTERVIEW_TYPES } from '@/lib/constants';
import type { Role, ExperienceLevel, InterviewType, OnboardingProfile } from '@/lib/types';
import { cn } from '@/lib/cn';

const STEPS = ['Target role', 'Experience', 'Interview preference'] as const;

const ROLE_ICONS: Record<string, string> = {
  'Software Developer': '💻',
  'Frontend Developer': '🎨',
  'Backend Developer': '⚙️',
  'Full Stack Developer': '🧩',
  'Python Developer': '🐍',
  'Java Developer': '☕',
  'Data Analyst': '📊',
  'QA Engineer': '✅',
  Other: '🚀',
};

export default function OnboardingPage() {
  const { fullUser, completeOnboarding } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | ''>('');
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');
  const [interviewType, setInterviewType] = useState<InterviewType | ''>('');

  const canProceed = step === 0 ? !!role : step === 1 ? !!experience : !!interviewType;

  const handleNext = async () => {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    if (role && experience && interviewType) {
      await completeOnboarding({ role, experience, interviewType });
      success('All set!', 'Your preferences have been saved.');
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="container-app flex h-16 items-center justify-between">
          <Logo />
          <p className="text-sm text-slate-400">
            Welcome, <span className="font-semibold text-white">{fullUser?.name}</span>
          </p>
        </div>
      </header>

      <main className="container-app flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          {/* Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition',
                        i < step && 'bg-success-500 text-white',
                        i === step && 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow',
                        i > step && 'bg-white/10 text-slate-500 border border-white/10',
                      )}
                    >
                      {i < step ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={cn('hidden text-sm font-medium sm:block', i <= step ? 'text-white' : 'text-slate-500')}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn('mx-3 h-0.5 w-8 rounded-full sm:w-16', i < step ? 'bg-success-500' : 'bg-white/10')} />
                  )}
                </div>
              ))}
            </div>
            <ProgressBar value={((step + 1) / STEPS.length) * 100} className="mt-5" size="sm" />
            <p className="mt-2 text-xs font-medium text-slate-500">Step {step + 1} of {STEPS.length}</p>
          </div>

          <div className="animate-fade-in rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-glass sm:p-8">
            {step === 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-400/20">
                    <Target className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">What role are you targeting?</h2>
                    <p className="text-sm text-slate-400">Pick the role you're preparing interviews for.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3.5 text-left transition backdrop-blur-sm',
                        role === r ? 'border-brand-400 bg-brand-500/15 ring-2 ring-brand-500/20' : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10',
                      )}
                    >
                      <span className="text-xl">{ROLE_ICONS[r]}</span>
                      <span className="text-sm font-semibold text-white">{r}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-400/20">
                    <Briefcase className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">What's your experience level?</h2>
                    <p className="text-sm text-slate-400">This helps tailor question difficulty.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setExperience(lvl)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-4 text-left transition backdrop-blur-sm',
                        experience === lvl ? 'border-brand-400 bg-brand-500/15 ring-2 ring-brand-500/20' : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10',
                      )}
                    >
                      <span className="font-semibold text-white">{lvl}</span>
                      {experience === lvl && <Check className="h-5 w-5 text-brand-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-400/20">
                    <MessageSquare className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Preferred interview type?</h2>
                    <p className="text-sm text-slate-400">You can change this anytime — and mix it up.</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setInterviewType(t)}
                      className={cn(
                        'rounded-xl border p-4 text-left transition backdrop-blur-sm',
                        interviewType === t ? 'border-brand-400 bg-brand-500/15 ring-2 ring-brand-500/20' : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10',
                      )}
                    >
                      <p className="font-semibold text-white">{t}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {t === 'Technical' && 'Coding, DSA, and core CS concepts.'}
                        {t === 'HR' && 'Resume, motivation, and culture-fit questions.'}
                        {t === 'Behavioral' && 'Past experiences using the STAR method.'}
                        {t === 'Mixed' && 'A balanced set across all categories.'}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceed}>
                {step === 2 ? 'Finish setup' : 'Continue'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
