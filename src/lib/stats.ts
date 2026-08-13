import type { InterviewSession } from '@/lib/types';

export function getStreak(interviews: InterviewSession[]): number {
  const completed = interviews
    .filter((i) => i.completedAt)
    .map((i) => new Date(i.completedAt!).toDateString());
  if (completed.length === 0) return 0;

  const uniqueDays = Array.from(new Set(completed)).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime(),
  );

  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < uniqueDays.length; i++) {
    const day = new Date(uniqueDays[i]);
    const cursorStr = cursor.toDateString();
    if (day.toDateString() === cursorStr) {
      streak++;
      cursor = new Date(cursor.getTime() - 86400000);
    } else if (i === 0 && day.toDateString() !== cursorStr) {
      // Allow streak to count if last interview was yesterday
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (day.toDateString() === yesterday) {
        streak++;
        cursor = new Date(cursor.getTime() - 2 * 86400000);
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return streak;
}

export function getStats(interviews: InterviewSession[]) {
  const completed = interviews.filter((i) => i.completedAt && i.result);
  const scores = completed.map((i) => i.result!.overall);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;
  const streak = getStreak(completed);

  return {
    completedCount: completed.length,
    totalCount: interviews.length,
    averageScore: avg,
    bestScore: best,
    streak,
    scores,
    recent: [...completed].sort(
      (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime(),
    ).slice(0, 5),
  };
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
