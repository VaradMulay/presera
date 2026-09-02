import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from './Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <nav className="container-app flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button to="/dashboard" size="sm">Go to Dashboard</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">Login</Button>
              <Button to="/signup" size="sm">Start Free Interview</Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="animate-fade-in border-t border-white/10 bg-slate-950/80 backdrop-blur-xl md:hidden">
          <div className="container-app flex flex-col gap-1 py-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10',
                  location.pathname === l.href && 'bg-white/10',
                )}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <Button to="/dashboard" size="md">Go to Dashboard</Button>
              ) : (
                <>
                  <Button to="/login" variant="outline" size="md">Login</Button>
                  <Button to="/signup" size="md">Start Free Interview</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
