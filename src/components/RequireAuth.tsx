import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/EmptyState';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { fullUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingState className="min-h-screen" />;
  if (!fullUser) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!fullUser.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const { fullUser, loading } = useAuth();
  if (loading) return <LoadingState className="min-h-screen" />;
  if (fullUser) return <Navigate to={fullUser.onboarded ? '/dashboard' : '/onboarding'} replace />;
  return <>{children}</>;
}
