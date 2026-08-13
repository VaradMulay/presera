import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-soft',
  secondary:
    'bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-950 shadow-soft',
  outline:
    'border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50',
  ghost:
    'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  danger:
    'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-soft',
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
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
