import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle, CheckCircle2, AlertTriangle, Lightbulb, RotateCcw,
  History, Brain, MessageSquare, Puzzle, Target, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardHeader } from '@/components/Card';
import { LoadingState } from '@/components/EmptyState';
import { ScoreRing, ScoreCard, scoreColor, scoreLabel } from '@/components/ScoreCard';
import { ProgressBar } from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { getInterview } from '@/lib/storage';
import { formatDate } from '@/lib/stats';
import type { InterviewSession } from '@/lib/types';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { fullUser } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      const s = await getInterview(id);
      if (!active) return;
      if (!s) {
        setError('Results not found.');
        setLoading(false);
        return;
      }
      if (s.userId !== fullUser?.id) {
        setError('This report does not belong to you.');
        setLoading(false);
        return;
      }
      if (!s.completedAt || !s.result) {
        navigate(`/interview/${s.id}`, { replace: true });
        return;
      }
      setSession(s);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id, fullUser?.id, navigate]);

  const completionRate = useMemo(() => {
    if (!session) return 0;
    const answered = session.answers.filter((a) => a.answer.trim().length > 0).length;
    return session.answers.length ? (answered / session.answers.length) * 100 : 0;
  }, [session]);

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading results…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50">
          <AlertCircle className="h-7 w-7 text-error-600" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-neutral-900">{error}</h2>
        <Button to="/history" className="mt-6">View history</Button>
      </div>
    );
  }

  if (!session || !session.result) return null;
  const r = session.result;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {session.role}
            </span>
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {session.type}
            </span>
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {session.difficulty}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900">Interview Results</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {session.questionCount} questions · completed {formatDate(session.completedAt!)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button to="/interview/new" size="md">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
          <Button to="/history" variant="outline" size="md">
            <History className="h-4 w-4" /> View History
          </Button>
        </div>
      </div>

      {/* Scoring notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
        <p className="text-sm text-neutral-700">
          <span className="font-semibold">AI-evaluated feedback.</span> Your answers were assessed by an AI interviewer for technical depth, communication, problem-solving, and relevance. If AI evaluation is unavailable, scores fall back to a local heuristic.
        </p>
      </div>

      {/* Overall score */}
      <Card className="flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center">
          <ScoreRing score={r.overall} size={140} label="Overall" />
          <span className={`mt-3 rounded-full px-3 py-1 text-sm font-bold ${scoreColor(r.overall)} bg-neutral-50`}>
            {scoreLabel(r.overall)}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-neutral-900">Your performance summary</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">{r.feedback}</p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-neutral-700">Completion rate</span>
              <span className="font-bold text-neutral-900">{Math.round(completionRate)}%</span>
            </div>
            <ProgressBar
              value={completionRate}
              className="mt-2"
              color={completionRate === 100 ? 'success' : completionRate >= 50 ? 'brand' : 'warning'}
            />
          </div>
        </div>
      </Card>

      {/* Sub-scores */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ScoreCard label="Technical" score={r.technical} icon={<Brain className="h-4 w-4" />} />
        <ScoreCard label="Communication" score={r.communication} icon={<MessageSquare className="h-4 w-4" />} />
        <ScoreCard label="Problem Solving" score={r.problemSolving} icon={<Puzzle className="h-4 w-4" />} />
        <ScoreCard label="Relevance" score={r.relevance} icon={<Target className="h-4 w-4" />} />
      </div>

      {/* Strengths + Improvements */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader
            title="What you did well"
            subtitle="Keep doing these"
            action={<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50"><CheckCircle2 className="h-5 w-5 text-success-600" /></div>}
          />
          <ul className="mt-4 space-y-3">
            {r.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Areas to improve"
            subtitle="Focus on these next"
            action={<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning-50"><AlertTriangle className="h-5 w-5 text-warning-600" /></div>}
          />
          <ul className="mt-4 space-y-3">
            {r.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Interviewer feedback */}
      <Card className="mt-6">
        <CardHeader
          title="Interviewer feedback"
          subtitle="Your AI interviewer's notes"
          action={<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><Sparkles className="h-5 w-5 text-brand-600" /></div>}
        />
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">{r.feedback}</p>
      </Card>

      {/* Recommended practice */}
      <Card className="mt-6">
        <CardHeader
          title="Recommended practice"
          subtitle="Actionable next steps"
          action={<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50"><Lightbulb className="h-5 w-5 text-accent-600" /></div>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {r.recommended.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <span className="text-sm text-neutral-700">{rec}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Question-by-question */}
      <Card className="mt-6">
        <CardHeader title="Question breakdown" subtitle={`How you answered each of ${session.answers.length} questions`} />
        <div className="mt-4 space-y-3">
          {session.answers.map((a, i) => {
            const avg = Math.round((a.scores.technical + a.scores.communication + a.scores.problemSolving + a.scores.relevance) / 4);
            const empty = a.answer.trim().length === 0;
            return (
              <details key={i} className="group rounded-xl border border-neutral-200">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-900">{a.question}</p>
                      <p className="text-xs text-neutral-500">{a.category}{empty ? ' · skipped' : ''}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 text-sm font-bold ${scoreColor(avg)}`}>{avg}</span>
                </summary>
                <div className="border-t border-neutral-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Your answer</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                    {empty ? <span className="italic text-neutral-400">No answer provided.</span> : a.answer}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {([
                      ['Technical', a.scores.technical],
                      ['Communication', a.scores.communication],
                      ['Problem Solving', a.scores.problemSolving],
                      ['Relevance', a.scores.relevance],
                    ] as const).map(([label, val]) => (
                      <div key={label} className="rounded-lg bg-neutral-50 p-2.5 text-center">
                        <p className={`text-base font-bold ${scoreColor(val)}`}>{val}</p>
                        <p className="text-[10px] font-medium text-neutral-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </Card>

      {/* Bottom actions */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Link to="/dashboard" className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900">
          ← Back to dashboard
        </Link>
        <div className="flex gap-2">
          <Button to="/history" variant="outline" size="md">
            <History className="h-4 w-4" /> View History
          </Button>
          <Button to="/interview/new" size="md">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
        </div>
      </div>
    </div>
  );
}
