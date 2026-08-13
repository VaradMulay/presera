import { cn } from '@/lib/cn';

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-brand-600';
  if (score >= 40) return 'text-warning-600';
  return 'text-error-600';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-success-500';
  if (score >= 60) return 'bg-brand-600';
  if (score >= 40) return 'bg-warning-500';
  return 'bg-error-500';
}

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Needs Work';
  return 'Poor';
}

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
  className?: string;
}

export function ScoreRing({ score, size = 120, label = 'Overall', className }: ScoreRingProps) {
  const radius = (size - 14) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={cn('transition-all duration-700 ease-out', scoreColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-extrabold', scoreColor(score))}>{score}</span>
        <span className="text-xs font-medium text-neutral-500">{label}</span>
      </div>
    </div>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  icon?: React.ReactNode;
}

export function ScoreCard({ label, score, icon }: ScoreCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
          {icon}
          {label}
        </div>
        <span className={cn('text-lg font-bold', scoreColor(score))}>{score}</span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', scoreBg(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
