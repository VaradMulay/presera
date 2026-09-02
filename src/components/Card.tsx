import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ className, hover = false, padded = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 shadow-glass',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover hover:border-white/30',
        padded && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
