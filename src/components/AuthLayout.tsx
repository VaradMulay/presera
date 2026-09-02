import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-1/2 lg:px-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <Logo size="lg" />
          <h1 className="mt-8 text-2xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
        </div>
      </div>

      {/* Right — promo panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-l border-white/10 bg-slate-900/50 p-12 lg:flex">
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl animate-drift"
          aria-hidden
        />
        <div
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-accent-600/15 blur-3xl animate-drift"
          style={{ animationDelay: '5s' }}
          aria-hidden
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white/80">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered mock interviews
          </span>
          <h2 className="mt-8 text-3xl font-extrabold leading-tight text-white">
            Practice smarter.<br />Interview better.
          </h2>
          <p className="mt-4 max-w-md text-white/60">
            Join thousands of students and early-career professionals preparing for their dream roles.
          </p>
        </div>

        <div className="relative space-y-4">
          {[
            '8 specialized role question banks',
            'Instant scoring across 4 dimensions',
            'Technical, HR, behavioral & mixed rounds',
            'Track your progress over time',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 border border-brand-400/20">
                <Check className="h-3.5 w-3.5 text-brand-300" />
              </span>
              <span className="text-sm font-medium text-white/90">{item}</span>
            </div>
          ))}
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <p className="text-sm leading-relaxed text-white/80">
            "I landed my first developer role after 2 weeks of daily practice on Presera. The instant feedback showed me exactly where I was weak."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">P</div>
            <div>
              <p className="text-sm font-semibold text-white">Priya S.</p>
              <p className="text-xs text-white/50">Frontend Developer · Bangalore</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
