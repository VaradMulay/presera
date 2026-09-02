import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:from-brand-400 hover:to-brand-600 shadow-glow active:translate-y-0.5 active:shadow-inner border border-brand-400/30',
  secondary:
    'bg-white/10 text-white hover:bg-white/20 active:translate-y-0.5 active:shadow-inner border border-white/20 backdrop-blur-md',
  outline:
    'border border-white/20 bg-white/5 text-slate-200 hover:border-white/40 hover:bg-white/10 backdrop-blur-md',
  ghost:
    'text-slate-400 hover:bg-white/10 hover:text-white',
  danger:
    'bg-gradient-to-br from-error-500 to-error-700 text-white hover:from-error-400 hover:to-error-600 shadow-glow-error active:translate-y-0.5 active:shadow-inner border border-error-400/30',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined };

type LinkButtonProps = BaseProps & {
  to: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps | LinkButtonProps) {
  const classes = twMerge(
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if ('to' in props && props.to) {
    const { to, ...rest } = props as LinkButtonProps;
    return (
      <Link to={to} className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
