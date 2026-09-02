import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, CheckCircle2, BarChart3, TrendingUp, Flame, ArrowRight,
  MessageSquare, History, Target, Award, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardHeader } from '@/components/Card';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { scoreColor } from '@/components/ScoreCard';
import { useAuth } from '@/context/AuthContext';
import { getInterviews } from '@/lib/storage';
import { getStats, formatDate } from '@/lib/stats';
import type { InterviewSession } from '@/lib/types';
import { cn } from '@/lib/cn';

export default function DashboardPage() {
  const { fullUser } = useAuth();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fullUser?.id) return;
    let active = true;
    (async () => {
      const data = await getInterviews(fullUser.id);
      if (!active) return;
      if (data === null) {
        setError('Could not load your dashboard. Please try again.');
        setLoading(false);
        return;
      }
      setInterviews(data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [fullUser?.id]);

  const stats = useMemo(() => getStats(interviews), [interviews]);
  const isEmpty = stats.completedCount === 0;

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading dashboard…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-500/15 border border-error-400/20">
          <AlertCircle className="h-7 w-7 text-error-400" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-white">Something went wrong</h2>
        <p className="mt-1 text-sm text-slate-400">{error}</p>
        <Button to="/dashboard" className="mt-6" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Welcome */}
      <div className="flex flex-col gap-4 animate-fade-in sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Welcome back, {fullUser?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isEmpty
              ? "Ready for your first mock interview? Let's get started."
              : "Keep up the momentum. Here's your interview progress."}
          </p>
        </div>
        <Button to="/interview/new" size="md">
          <PlusCircle className="h-4 w-4" /> Start New Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={MessageSquare} label="Total Interviews" value={stats.totalCount} color="brand" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedCount} color="accent" />
        <StatCard icon={BarChart3} label="Average Score" value={stats.averageScore || '—'} color="success" />
        <StatCard icon={Award} label="Best Score" value={stats.bestScore || '—'} color="warning" />
        <StatCard icon={Flame} label="Current Streak" value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`} color="brand" />
      </div>

      {isEmpty ? (
        <div className="mt-8 animate-fade-in">
          <EmptyState
            icon={<MessageSquare className="h-7 w-7" />}
            title="No interviews yet"
            description="Your first mock interview is just a click away. Pick a role, choose your difficulty, and start practicing."
            action={<Button to="/interview/new" size="lg"><PlusCircle className="h-4 w-4" /> Start your first interview</Button>}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: Target, title: 'Pick your role', desc: '8 specialized roles with curated question banks.' },
              { icon: MessageSquare, title: 'Answer questions', desc: '5, 10, or 15 unique questions per session.' },
              { icon: TrendingUp, title: 'Get feedback', desc: 'Instant scores across 4 dimensions.' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} hover className="text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-400/20">
                    <Icon className="h-5 w-5 text-brand-400" />
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Performance chart */}
          <Card className="lg:col-span-2 animate-fade-in">
            <CardHeader
              title="Performance trend"
              subtitle="Your overall score across recent interviews"
              action={<TrendingUp className="h-5 w-5 text-success-400" />}
            />
            <PerformanceChart scores={stats.scores} />
          </Card>

          {/* Quick actions */}
          <Card className="animate-fade-in">
            <CardHeader title="Quick actions" subtitle="Jump back in" />
            <div className="mt-4 space-y-2.5">
              <Link to="/interview/new" className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3.5 transition hover:border-brand-400/30 hover:bg-brand-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15">
                    <PlusCircle className="h-4 w-4 text-brand-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">New Interview</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
              <Link to="/history" className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3.5 transition hover:border-brand-400/30 hover:bg-brand-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <History className="h-4 w-4 text-slate-300" />
                  </div>
                  <span className="text-sm font-semibold text-white">View History</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
              <Link to="/profile" className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3.5 transition hover:border-brand-400/30 hover:bg-brand-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                    <Target className="h-4 w-4 text-slate-300" />
                  </div>
                  <span className="text-sm font-semibold text-white">Edit Profile</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </Link>
            </div>
          </Card>

          {/* Recent interviews */}
          <Card className="lg:col-span-3 animate-fade-in">
            <CardHeader
              title="Recent interviews"
              subtitle="Your latest practice sessions"
              action={<Button to="/history" variant="ghost" size="sm">View all <ArrowRight className="h-3.5 w-3.5" /></Button>}
            />
            <div className="mt-4 space-y-2.5">
              {stats.recent.map((iv) => (
                <Link
                  key={iv.id}
                  to={`/results/${iv.id}`}
                  className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-4 transition hover:border-brand-400/30 hover:bg-brand-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15">
                      <MessageSquare className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{iv.role}</p>
                      <p className="text-xs text-slate-500">
                        {iv.type} · {iv.difficulty} · {formatDate(iv.completedAt!)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn('text-lg font-bold', scoreColor(iv.result!.overall))}>
                      {iv.result!.overall}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof PlusCircle; label: string; value: string | number; color: 'brand' | 'accent' | 'success' | 'warning' }) {
  const colors = {
    brand: 'bg-brand-500/15 text-brand-400 border-brand-400/20',
    accent: 'bg-accent-500/15 text-accent-400 border-accent-400/20',
    success: 'bg-success-500/15 text-success-400 border-success-400/20',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-400/20',
  };
  return (
    <Card hover className="flex items-center gap-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border', colors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-white">{value}</p>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

function PerformanceChart({ scores }: { scores: number[] }) {
  if (scores.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">No data yet.</p>;
  }
  const max = 100;
  const recent = scores.slice(-12);
  return (
    <div className="mt-6">
      <div className="flex h-40 items-end gap-2">
        {recent.map((s, i) => (
          <div key={i} className="group flex flex-1 flex-col items-center gap-1.5">
            <div className="relative w-full">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500 hover:from-brand-500 hover:to-brand-300"
                style={{ height: `${(s / max) * 140}px` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 border border-white/10">
                {s}
              </div>
            </div>
            <span className="text-[10px] text-slate-500">#{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
        <span>Last {recent.length} interviews</span>
        <span className="font-semibold text-success-400">
          Avg {Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)}
        </span>
      </div>
    </div>
  );
}
