import { Link } from 'react-router-dom';
import { AudioLines } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl';
  return (
    <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-white">
      <span className={`flex ${dims} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow border border-brand-400/30`}>
        <AudioLines className="h-1/2 w-1/2" />
      </span>
      <span className={text}>Presera</span>
    </Link>
  );
}
