import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { FullUser, OnboardingProfile, User } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import {
  createProfile, getProfile, saveOnboarding, updateProfileName,
} from '@/lib/storage';

interface AuthContextValue {
  user: User | null;
  fullUser: FullUser | null;
  loading: boolean;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (profile: OnboardingProfile) => Promise<void>;
  updateProfile: (patch: Partial<Pick<FullUser, 'name'>>) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fullUser, setFullUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFullUser = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setFullUser(null);
      return;
    }
    const authUser = session.user;
    const profile = await getProfile(authUser.id);
    if (!profile) {
      // Profile row missing — create it (first login after signup race).
      await createProfile(authUser.id, (authUser as { user_metadata?: { name?: string } }).user_metadata?.name ?? 'User');
      const fresh = await getProfile(authUser.id);
      if (!fresh) {
        setFullUser(null);
        return;
      }
      setFullUser({
        ...fresh.user,
        email: authUser.email ?? '',
        onboarded: fresh.onboarded,
        onboarding: fresh.onboarding ?? undefined,
      });
      return;
    }
    setFullUser({
      ...profile.user,
      email: authUser.email ?? '',
      onboarded: profile.onboarded,
      onboarding: profile.onboarding ?? undefined,
    });
  }, []);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await loadFullUser(session);
  }, [loadFullUser]);

  useEffect(() => {
    let mounted = true;

    // Initial session load.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      await loadFullUser(session);
      setLoading(false);
    })();

    // Listen for auth state changes. Wrap async work to avoid deadlock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (!mounted) return;
        await loadFullUser(session);
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadFullUser]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    if (data.user) {
      await createProfile(data.user.id, name, email);
    }
    return { ok: true };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setFullUser(null);
  }, []);

  const completeOnboarding = useCallback(async (profile: OnboardingProfile) => {
    if (!fullUser) return;
    await saveOnboarding(fullUser.id, profile);
    setFullUser({ ...fullUser, onboarding: profile, onboarded: true });
  }, [fullUser]);

  const updateProfile = useCallback(async (patch: Partial<Pick<FullUser, 'name'>>) => {
    if (!fullUser) return;
    if (patch.name) await updateProfileName(fullUser.id, patch.name);
    setFullUser({ ...fullUser, ...patch });
  }, [fullUser]);

  const user = useMemo(() => {
    if (!fullUser) return null;
    const { id, name, email, createdAt } = fullUser;
    return { id, name, email, createdAt };
  }, [fullUser]);

  const value: AuthContextValue = {
    user,
    fullUser,
    loading,
    signup,
    login,
    logout,
    completeOnboarding,
    updateProfile,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
