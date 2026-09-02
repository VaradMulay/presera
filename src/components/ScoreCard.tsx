import { cn } from '@/lib/cn';

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-success-400 glow-text-success';
  if (score >= 60) return 'text-brand-400 glow-text-brand';
  if (score >= 40) return 'text-warning-400 glow-text-warning';
  return 'text-error-400 glow-text-error';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-success-500';
  if (score >= 60) return 'bg-brand-500';
  if (score >= 40) return 'bg-warning-500';
  return 'bg-error-500';
}

export function scoreStroke(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 60) return '#598cff';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
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
  const stroke = scoreStroke(score);
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${stroke}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-extrabold animate-count-up', scoreColor(score))}>{score}</span>
        <span className="text-xs font-medium text-slate-400">{label}</span>
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
    <div className="rounded-xl backdrop-blur-md bg-white/5 border border-white/15 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          {icon}
          {label}
        </div>
        <span className={cn('text-lg font-bold', scoreColor(score))}>{score}</span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10 border border-white/5">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out progress-glow', scoreBg(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
