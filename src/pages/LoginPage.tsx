import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField, inputClasses } from '@/components/FormField';
import { Spinner } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) {
      setFormError(res.error ?? 'Login failed.');
      showError('Login failed', res.error);
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

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Spinner /> : 'Log in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
