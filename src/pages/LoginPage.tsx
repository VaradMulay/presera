import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Chrome, AlertCircle } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField, inputClasses } from '@/components/FormField';
import { Spinner } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { signInWithGoogle } from '@/lib/googleAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setFormError('');
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setGoogleLoading(false);
      setFormError(googleError.message);
      showError('Google sign-in failed', googleError.message);
    }
    // On success, Supabase redirects — no need to reset state.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setNeedsVerification(false);
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      const msg = res.error ?? 'Login failed.';
      setFormError(msg);
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('not verified')) {
        setNeedsVerification(true);
      } else {
        showError('Login failed', msg);
      }
      return;
    }
    success('Welcome back!', 'You are now logged in.');
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your interview practice."
      footer={<>Don't have an account? <Link to="/signup" className="font-semibold text-brand-400 hover:text-brand-300">Sign up free</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email" htmlFor="email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className={`${inputClasses} pl-10`} autoComplete="email"
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="password" type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className={`${inputClasses} pl-10 pr-10`} autoComplete="current-password"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10 text-brand-500 focus:ring-brand-500/20" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-brand-400 hover:text-brand-300">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <div className="rounded-lg border border-error-400/20 bg-error-500/10 px-3.5 py-2.5 text-sm font-medium text-error-300">
            {formError}
          </div>
        )}

        {needsVerification && (
          <div className="flex items-start gap-3 rounded-lg border border-warning-400/20 bg-warning-500/10 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-400" />
            <div className="text-sm text-warning-300">
              <p className="font-semibold">Please verify your email</p>
              <p className="mt-0.5 text-warning-300/80">
                We sent a confirmation link to <span className="font-semibold">{email}</span>. Check your inbox (and spam folder) and click the link to activate your account.
              </p>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner /> : 'Log in'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-slate-500">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/30 active:translate-y-0.5 disabled:opacity-50"
      >
        {googleLoading ? (
          <Spinner />
        ) : (
          <Chrome className="h-5 w-5 text-white" />
        )}
        Continue with Google
      </button>
    </AuthLayout>
  );
}
