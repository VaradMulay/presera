import { Link } from 'react-router-dom';
import { AudioLines } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl';
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-neutral-900">
      <span className={`flex ${dims} items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft`}>
        <AudioLines className="h-1/2 w-1/2" />
      </span>
      <span className={text}>Presera</span>
    </Link>
  );
}
