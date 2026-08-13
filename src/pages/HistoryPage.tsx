import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MessageSquare, ArrowRight, FileBarChart, Filter, PlusCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState, LoadingState } from '@/components/EmptyState';
import { Select } from '@/components/Select';
import { scoreColor, scoreLabel } from '@/components/ScoreCard';
import { useAuth } from '@/context/AuthContext';
import { getInterviews } from '@/lib/storage';
import { formatDate } from '@/lib/stats';
import { ROLES, INTERVIEW_TYPES } from '@/lib/constants';
import type { InterviewSession } from '@/lib/types';
import { cn } from '@/lib/cn';

type SortKey = 'newest' | 'oldest' | 'highest' | 'lowest';
type StatusFilter = '' | 'completed' | 'in_progress';

export default function HistoryPage() {
  const { fullUser } = useAuth();
  const [all, setAll] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fullUser?.id) return;
    let active = true;
    (async () => {
      const data = await getInterviews(fullUser.id);
      if (!active) return;
      if (data === null) {
        setError('Could not load your interview history. Please try again.');
        setLoading(false);
        return;
      }
      setAll(data);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [fullUser?.id]);

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [sort, setSort] = useState<SortKey>('newest');

  const filtered = useMemo(() => {
    let list = [...all];
    if (statusFilter === 'completed') {
      list = list.filter((i) => i.completedAt && i.result);
    } else if (statusFilter === 'in_progress') {
      list = list.filter((i) => !i.completedAt);
    } else {
      list = list.filter((i) => i.completedAt && i.result);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (i) => i.role.toLowerCase().includes(q) || i.type.toLowerCase().includes(q),
      );
    }
    if (roleFilter) list = list.filter((i) => i.role === roleFilter);
    if (typeFilter) list = list.filter((i) => i.type === typeFilter);

    list = list.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.completedAt ?? a.startedAt).getTime() - new Date(b.completedAt ?? b.startedAt).getTime();
        case 'highest':
          return (b.result?.overall ?? 0) - (a.result?.overall ?? 0);
        case 'lowest':
          return (a.result?.overall ?? 0) - (b.result?.overall ?? 0);
        default:
          return new Date(b.completedAt ?? b.startedAt).getTime() - new Date(a.completedAt ?? a.startedAt).getTime();
      }
    });
    return list;
  }, [all, query, roleFilter, typeFilter, statusFilter, sort]);

  if (loading) return <LoadingState className="min-h-[60vh]" label="Loading history…" />;

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error-50">
          <AlertCircle className="h-7 w-7 text-error-600" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-neutral-900">Something went wrong</h2>
        <p className="mt-1 text-sm text-neutral-500">{error}</p>
        <Button to="/dashboard" className="mt-6">Back to dashboard</Button>
      </div>
    );
  }

  const completedCount = all.filter((i) => i.completedAt).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">Interview History</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {filtered.length} {filtered.length === 1 ? 'interview' : 'interviews'}
          </p>
        </div>
        <Button to="/interview/new" size="md">
          <PlusCircle className="h-4 w-4" /> New Interview
        </Button>
      </div>

      {completedCount === 0 ? (
        <EmptyState
          icon={<FileBarChart className="h-7 w-7" />}
          title="No interviews yet"
          description="Once you complete a mock interview, it will appear here with your scores and a detailed report."
          action={<Button to="/interview/new" size="lg"><PlusCircle className="h-4 w-4" /> Start your first interview</Button>}
        />
      ) : (
        <>
          {/* Filters */}
          <Card className="mb-6" padded={false}>
            <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by role or type…"
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  placeholder="All roles"
                  options={[{ label: 'All roles', value: '' }, ...ROLES.map((r) => ({ label: r, value: r }))]}
                  className="lg:w-40"
                />
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  placeholder="All types"
                  options={[{ label: 'All types', value: '' }, ...INTERVIEW_TYPES.map((t) => ({ label: t, value: t }))]}
                  className="lg:w-36"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  options={[
                    { label: 'Completed', value: '' },
                    { label: 'In progress', value: 'in_progress' },
                  ]}
                  className="lg:w-36"
                />
                <Select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  options={[
                    { label: 'Newest first', value: 'newest' },
                    { label: 'Oldest first', value: 'oldest' },
                    { label: 'Highest score', value: 'highest' },
                    { label: 'Lowest score', value: 'lowest' },
                  ]}
                  className="lg:w-40"
                />
              </div>
            </div>
          </Card>

          {/* List */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Filter className="h-7 w-7" />}
              title="No matches"
              description="Try adjusting your search or filters."
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((iv) => (
                <HistoryRow key={iv.id} interview={iv} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HistoryRow({ interview: iv }: { interview: InterviewSession }) {
  const inProgress = !iv.completedAt;
  return (
    <Link
      to={inProgress ? `/interview/${iv.id}` : `/results/${iv.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-card sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50">
          <MessageSquare className="h-5 w-5 text-brand-600" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-neutral-900">{iv.role}</p>
          <p className="mt-0.5 text-sm text-neutral-500">
            {iv.type} · {iv.difficulty} · {iv.questionCount} questions · {formatDate(iv.completedAt ?? iv.startedAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-3">
          {inProgress ? (
            <span className="rounded-full bg-warning-50 px-3 py-1 text-xs font-semibold text-warning-700">
              In progress
            </span>
          ) : (
            <div className="text-right">
              <p className={cn('text-2xl font-extrabold leading-none', scoreColor(iv.result!.overall))}>
                {iv.result!.overall}
              </p>
              <p className="mt-1 text-[11px] font-medium text-neutral-500">{scoreLabel(iv.result!.overall)}</p>
            </div>
          )}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition group-hover:border-brand-300 group-hover:text-brand-600">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
