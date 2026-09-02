import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic, Brain, BarChart3, Target, Zap, ShieldCheck, Check, ChevronDown,
  Sparkles, ArrowRight, MessageSquare, TrendingUp, Clock,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Logo } from '@/components/Logo';

const FEATURES = [
  { icon: Brain, title: 'Role-specific question banks', desc: 'Practice with realistic questions curated for your exact target role and experience level.' },
  { icon: BarChart3, title: 'Instant detailed feedback', desc: 'Get scored on technical depth, communication, problem-solving, and answer relevance after every session.' },
  { icon: Target, title: 'Tailored to you', desc: 'Set your role, experience, and interview type. Presera adapts questions to match your goals.' },
  { icon: Zap, title: 'Practice anytime', desc: 'No scheduling, no waiting. Start an interview in seconds and complete it at your own pace.' },
  { icon: TrendingUp, title: 'Track your progress', desc: 'Every session is saved. Watch your scores and streak improve as you practice consistently.' },
  { icon: ShieldCheck, title: 'Build real confidence', desc: 'Walk into your actual interview having already answered similar questions dozens of times.' },
];

const STEPS = [
  { icon: Target, title: 'Set your target role', desc: 'Pick from Software Developer, Frontend, Backend, Data Analyst, QA, and more. Tell us your experience level.' },
  { icon: Mic, title: 'Take a mock interview', desc: 'Answer 5, 10, or 15 questions drawn from a curated bank. Technical, HR, behavioral, or mixed.' },
  { icon: BarChart3, title: 'Get instant feedback', desc: 'Receive scores across four dimensions plus strengths, improvements, and a personalized practice plan.' },
];

const PLANS = [
  {
    name: 'Free', price: '₹0', period: 'forever', desc: 'Perfect for getting started.',
    features: ['3 mock interviews / month', 'Basic scoring & feedback', 'Question banks for all roles', 'Interview history'],
    cta: 'Start Free', highlight: false,
  },
  {
    name: 'Pro', price: '₹499', period: 'per month', desc: 'For serious job seekers.',
    features: ['Unlimited mock interviews', 'AI-powered personalized feedback', 'Resume-aware questions', 'Detailed performance analytics', 'Priority question updates'],
    cta: 'Coming Soon', highlight: true,
  },
  {
    name: 'Campus', price: '₹199', period: 'per month', desc: 'For students & freshers.',
    features: ['Unlimited mock interviews', 'Basic AI feedback', 'All role question banks', 'Interview history', 'Email support'],
    cta: 'Coming Soon', highlight: false,
  },
];

const FAQS = [
  { q: 'Is Presera free to use?', a: 'Yes. The Free plan lets you take 3 mock interviews every month with basic scoring across all supported roles. No credit card required.' },
  { q: 'Do I need to install anything?', a: 'No. Presera runs entirely in your browser. Sign up, pick your role, and start your first interview in under a minute.' },
  { q: 'How does the scoring work?', a: 'Every answer is scored on four dimensions — technical knowledge, communication, problem-solving, and answer relevance. During the MVP this uses a local evaluation engine; AI-powered feedback is on the roadmap.' },
  { q: 'Which roles are supported?', a: 'Software Developer, Frontend, Backend, Full Stack, Python, Java, Data Analyst, and QA Engineer — each with 15+ realistic questions across technical, HR, and behavioral categories.' },
  { q: 'Will my data be saved?', a: 'Yes. Your profile, interviews, and scores are saved to your account securely in the cloud. Sign in from any device and your progress follows you.' },
  { q: 'Can I practice for HR and behavioral rounds?', a: 'Absolutely. Choose Technical, HR, Behavioral, or Mixed when starting an interview — Mixed gives you a balanced set across all categories.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Preview />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-3xl animate-drift"
        aria-hidden
      />
      <div className="container-app py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-400/20 bg-brand-500/10 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered mock interviews
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Practice Your Interview.<br />
              <span className="text-brand-400 glow-text-brand">Get Hired With Confidence.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
              Practice realistic interviews tailored to your role, resume, and experience level.
              Get instant feedback and discover exactly what you need to improve.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/signup" size="lg">
                Start Free Interview <ArrowRight className="h-4 w-4" />
              </Button>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">See how it works</Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-500">No credit card required · Free forever plan</p>
          </div>

          <div className="animate-scale-in lg:pl-4">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 shadow-glass">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Welcome back,</p>
            <p className="text-lg font-bold text-white">Aarav</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-brand-500/15 border border-brand-400/20 px-3 py-1.5">
            <span className="flex h-2 w-2 rounded-full bg-success-400 animate-glow-pulse" />
            <span className="text-xs font-semibold text-brand-300">5 day streak</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Completed', value: '12', icon: Check },
            { label: 'Avg Score', value: '74', icon: BarChart3 },
            { label: 'Best Score', value: '91', icon: TrendingUp },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-white/15 bg-white/5 p-3">
                <Icon className="h-4 w-4 text-brand-400" />
                <p className="mt-2 text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-[11px] text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Performance trend</p>
            <span className="text-xs font-medium text-success-400">+18% this month</span>
          </div>
          <div className="mt-3 flex h-24 items-end gap-1.5">
            {[40, 52, 48, 61, 58, 70, 66, 78, 74, 85, 80, 91].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {[
            { role: 'Frontend Developer', score: 88, type: 'Technical' },
            { role: 'Frontend Developer', score: 72, type: 'Behavioral' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 border border-brand-400/20">
                  <MessageSquare className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.role}</p>
                  <p className="text-xs text-slate-500">{r.type} · 2 days ago</p>
                </div>
              </div>
              <span className="rounded-lg bg-success-500/15 border border-success-400/20 px-2.5 py-1 text-sm font-bold text-success-300">{r.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-3 -top-3 hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-3 shadow-glass sm:block animate-float">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-500/15 border border-success-400/20">
            <Sparkles className="h-4 w-4 text-success-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Feedback ready</p>
            <p className="text-[11px] text-slate-500">Instant scoring</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-white/5 backdrop-blur-md">
      <div className="container-app py-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
          Built for college students, freshers, and early-career professionals
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="container-app py-20 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Everything you need to ace your next interview
        </h2>
        <p className="mt-4 text-lg text-slate-400">
          From your first practice round to your final offer — Presera has you covered.
        </p>
      </div>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} hover className="group">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-400/20 text-brand-400 transition group-hover:bg-brand-500 group-hover:text-white group-hover:shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white/5 backdrop-blur-md py-20 lg:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-slate-400">Three steps to interview-ready.</p>
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-glass">
                  <Icon className="h-6 w-6 text-brand-400" />
                </div>
                <span className="mt-4 inline-block rounded-full bg-brand-500/15 border border-brand-400/20 px-3 py-0.5 text-xs font-bold text-brand-300">
                  Step {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="absolute right-0 top-7 hidden h-0.5 w-1/2 translate-x-1/2 bg-gradient-to-r from-brand-400/40 to-transparent md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Preview() {
  return (
    <section className="container-app py-20 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Real questions. Real practice.
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Each role has a curated bank of 15+ realistic questions spanning technical, problem-solving, HR, and behavioral rounds. Questions never repeat within a session.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Unique questions every session',
              'Progress tracking with a clear question counter',
              'Technical, HR, Behavioral, or Mixed modes',
              'Choose 5, 10, or 15 questions per interview',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success-500/15 border border-success-400/20">
                  <Check className="h-3 w-3 text-success-400" />
                </span>
                <span className="text-sm font-medium text-slate-300">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button to="/signup" size="lg">Try a free interview <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <Card className="bg-slate-900/60" padded={false}>
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-error-400" />
                <span className="flex h-2 w-2 rounded-full bg-warning-400" />
                <span className="flex h-2 w-2 rounded-full bg-success-400" />
              </div>
              <span className="text-xs font-medium text-white/50">presera · interview</span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-brand-500/20 border border-brand-400/20 px-3 py-1 text-xs font-semibold text-brand-300">Frontend Developer</span>
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">Technical</span>
              <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-white/70">Medium</span>
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-white/40">Question 3 of 10</p>
            <ProgressBar value={30} color="brand" className="mt-2" />
            <p className="mt-5 text-lg font-semibold leading-relaxed text-white">
              Explain the difference between controlled and uncontrolled components in React.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Controlled components are form elements whose value is controlled by React state…
              <span className="inline-block w-2 animate-pulse text-white">|</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" /> 42 words · take your time
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="bg-white/5 backdrop-blur-md py-20 lg:py-28">
      <div className="container-app">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-slate-400">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.name} className={`relative flex flex-col ${p.highlight ? 'border-brand-400/30 ring-2 ring-brand-500/20 shadow-glow' : ''}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-1 text-xs font-bold text-white shadow-glow">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-white">{p.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">{p.price}</span>
                <span className="text-sm text-slate-500">/ {p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {p.cta === 'Start Free' ? (
                  <Button to="/signup" className="w-full" variant={p.highlight ? 'primary' : 'outline'}>
                    {p.cta}
                  </Button>
                ) : (
                  <Button className="w-full" variant={p.highlight ? 'primary' : 'outline'} disabled>
                    {p.cta}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="container-app py-20 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <Card key={i} padded={false} className="overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-white">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-slate-400">
                  {f.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container-app py-20">
      <div className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-indigo-950/80 backdrop-blur-md px-8 py-14 text-center shadow-glass sm:px-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-600/20 blur-3xl animate-drift" aria-hidden />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent-600/15 blur-3xl animate-drift" style={{ animationDelay: '7s' }} aria-hidden />
        <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Your dream job is one interview away.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Start practicing today. It's free, takes a minute, and could change your career.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button to="/signup" size="lg" variant="secondary">
            Start Free Interview <ArrowRight className="h-4 w-4" />
          </Button>
          <Link to="/login">
            <Button size="lg" variant="ghost" className="text-slate-300 hover:bg-white/10">I already have an account</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="container-app py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo />
            <p className="text-sm text-slate-500">Practice smarter. Interview better.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="#features" className="text-slate-400 transition hover:text-white">Features</a>
            <a href="#how-it-works" className="text-slate-400 transition hover:text-white">How it works</a>
            <a href="#pricing" className="text-slate-400 transition hover:text-white">Pricing</a>
            <a href="#faq" className="text-slate-400 transition hover:text-white">FAQ</a>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Presera. Built for ambitious early-career talent.
        </div>
      </div>
    </footer>
  );
}
