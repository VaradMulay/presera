import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Option {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[] | string[];
  placeholder?: string;
}

export function Select({ options, placeholder, className, ...props }: SelectProps) {
  const opts: Option[] = (options as Option[]).every((o) => typeof o === 'string')
    ? (options as string[]).map((v) => ({ label: v, value: v }))
    : (options as Option[]);

  return (
    <div className="relative">
      <select
        className={cn(
          'w-full h-11 appearance-none rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-3.5 pr-10 text-sm text-white transition focus:border-brand-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50',
          props.value === '' && 'text-slate-500',
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {opts.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900 text-white">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
