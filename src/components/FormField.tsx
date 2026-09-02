import { cn } from '@/lib/cn';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, htmlFor, error, hint, required, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-200">
        {label}
        {required && <span className="ml-0.5 text-error-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-error-400">{error}</p>}
    </div>
  );
}

export const inputClasses =
  'w-full h-11 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-3.5 text-sm text-white placeholder:text-slate-500 transition focus:border-brand-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-white/5 disabled:text-slate-500';
