import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField, inputClasses } from '@/components/FormField';
import { Spinner } from '@/components/EmptyState';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<>Remembered your password? <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">Back to login</Link></>}
    >
      {sent ? (
        <div className="animate-scale-in rounded-xl border border-success-400/20 bg-success-500/10 backdrop-blur-md p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-500/15 border border-success-400/20">
            <CheckCircle2 className="h-6 w-6 text-success-400" />
          </div>
          <h3 className="mt-4 font-semibold text-white">Check your inbox</h3>
          <p className="mt-1.5 text-sm text-slate-400">
            If an account exists for <span className="font-semibold text-white">{email}</span>, you'll receive a password reset link shortly.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Click the link in your email to choose a new password.
          </p>
          <Link to="/login" className="mt-5 inline-block">
            <Button variant="outline" size="md">Back to login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Email" htmlFor="email" required>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" className={`${inputClasses} pl-10`} autoComplete="email" />
            </div>
          </FormField>

          {error && (
            <div className="rounded-lg border border-error-400/20 bg-error-500/10 px-3.5 py-2.5 text-sm font-medium text-error-300">{error}</div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Send reset link'}
          </Button>

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
