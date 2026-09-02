import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField, inputClasses } from '@/components/FormField';
import { Spinner } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The reset link redirects here with a recovery token in the URL hash.
    // Supabase auto-detects it on session load. Wait for it to be processed.
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        setReady(true);
      } else {
        // Listen for the recovery event in case the session isn't ready yet.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
          if (!mounted) return;
          if (event === 'PASSWORD_RECOVERY' || sess?.user) {
            setReady(true);
          }
        });
        // Also poll briefly — sometimes the session resolves after mount.
        setTimeout(async () => {
          if (!mounted) return;
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (s2?.user) setReady(true);
        }, 1500);
        return () => {
          subscription.unsubscribe();
        };
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      showError('Could not update password', updateError.message);
      return;
    }
    setDone(true);
    success('Password updated!', 'You can now log in with your new password.');
  };

  if (done) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your new password is active."
        footer={<>Need to go back? <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">Log in</Link></>}
      >
        <div className="animate-scale-in rounded-xl border border-success-400/20 bg-success-500/10 backdrop-blur-md p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-500/15 border border-success-400/20">
            <CheckCircle2 className="h-6 w-6 text-success-400" />
          </div>
          <h3 className="mt-4 font-semibold text-white">All set!</h3>
          <p className="mt-1.5 text-sm text-slate-400">
            Your password has been changed successfully. Use your new password to log in.
          </p>
          <Link to="/login" className="mt-5 inline-block">
            <Button variant="primary" size="md">Log in with new password</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (!ready) {
    return (
      <AuthLayout
        title="Reset your password"
        subtitle="Verifying your reset link…"
        footer={<Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">Back to login</Link>}
      >
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner />
          <p className="mt-4 text-sm text-slate-400">Verifying your reset link…</p>
          <p className="mt-1 text-xs text-slate-500">If this takes too long, try clicking the link in your email again.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
      footer={<Link to="/login" className="flex items-center gap-1.5 font-semibold text-brand-400 hover:text-brand-300"><ArrowLeft className="h-4 w-4" /> Back to login</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="New password" htmlFor="password" required hint="At least 6 characters">
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

        <FormField label="Confirm new password" htmlFor="confirmPw" required>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input id="confirmPw" type={showPw ? 'text' : 'password'} value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••"
              className={`${inputClasses} pl-10`} autoComplete="new-password" />
          </div>
        </FormField>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-error-400/20 bg-error-500/10 px-3.5 py-2.5 text-sm font-medium text-error-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-400" />
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner /> : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
