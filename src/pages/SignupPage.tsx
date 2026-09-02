import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Chrome, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField, inputClasses } from '@/components/FormField';
import { Spinner } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { signInWithGoogle } from '@/lib/googleAuth';

export default function SignupPage() {
  const { signup } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setFormError('');
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setGoogleLoading(false);
      setFormError(googleError.message);
      showError('Google sign-up failed', googleError.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (!agree) {
      setFormError('Please accept the terms to continue.');
      return;
    }
    setLoading(true);
    const res = await signup(name, email, password);
    setLoading(false);
    if (!res.ok) {
      setFormError(res.error ?? 'Sign up failed.');
      showError('Sign up failed', res.error);
      return;
    }
    setSignedUp(true);
    success('Account created!', 'Check your email to verify your account.');
  };

  if (signedUp) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We sent you a verification link."
        footer={<>Already verified? <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">Log in</Link></>}
      >
        <div className="animate-scale-in rounded-xl border border-success-400/20 bg-success-500/10 backdrop-blur-md p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-500/15 border border-success-400/20">
            <CheckCircle2 className="h-6 w-6 text-success-400" />
          </div>
          <h3 className="mt-4 font-semibold text-white">Verify your email</h3>
          <p className="mt-1.5 text-sm text-slate-400">
            We sent a confirmation link to <span className="font-semibold text-white">{email}</span>. Click the link in your inbox to activate your account, then log in.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Didn't get the email? Check your spam folder.
          </p>
          <Link to="/login" className="mt-5 inline-block">
            <Button variant="outline" size="md">Go to login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your free account"
      subtitle="Start practicing interviews in under a minute."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Full name" htmlFor="name" required>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Aarav Sharma" className={`${inputClasses} pl-10`} autoComplete="name" />
          </div>
        </FormField>

        <FormField label="Email" htmlFor="email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className={`${inputClasses} pl-10`} autoComplete="email" />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password" required hint="At least 6 characters">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="password" type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
              className={`${inputClasses} pl-10 pr-10`} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <label className="flex items-start gap-2 text-sm text-slate-400">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-brand-500 focus:ring-brand-500/20" />
          <span>I agree to Presera's Terms of Service and Privacy Policy.</span>
        </label>

        {formError && (
          <div className="rounded-lg border border-error-400/20 bg-error-500/10 px-3.5 py-2.5 text-sm font-medium text-error-300">
            {formError}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner /> : 'Create account'}
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
        Sign up with Google
      </button>

      <p className="mt-4 text-center text-xs text-slate-500">
        By signing up you'll receive a verification email. You must confirm your email before logging in.
      </p>
    </AuthLayout>
  );
}
