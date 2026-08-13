import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ className, hover = false, padded = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-neutral-200 bg-white shadow-card',
        hover && 'transition-all duration-200 hover:shadow-float hover:border-neutral-300',
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
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
