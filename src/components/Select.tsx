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
          'w-full h-11 appearance-none rounded-xl border border-neutral-300 bg-white px-3.5 pr-10 text-sm text-neutral-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-neutral-50 disabled:text-neutral-500',
          props.value === '' && 'text-neutral-400',
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
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}
