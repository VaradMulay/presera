import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'success' | 'warning' | 'error';
}

const COLORS = {
  brand: 'bg-brand-600',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

const SIZES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export function ProgressBar({ value, max = 100, className, showLabel = false, size = 'md', color = 'brand' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full overflow-hidden rounded-full bg-neutral-200', SIZES[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', COLORS[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs font-medium text-neutral-500">{Math.round(pct)}%</div>
      )}
    </div>
  );
}
