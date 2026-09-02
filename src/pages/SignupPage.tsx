import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { FormField, inputClasses } from '@/components/FormField';
import { Spinner } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

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
  const [formError, setFormError] = useState('');

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
    success('Account created!', "Let's set up your interview preferences.");
    navigate('/onboarding');
  };

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
    </AuthLayout>
  );
}
