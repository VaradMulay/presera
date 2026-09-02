import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { RequireAuth, PublicOnly } from '@/components/RequireAuth';
import { AppLayout } from '@/components/AppLayout';
import { LoadingState } from '@/components/EmptyState';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NewInterviewPage = lazy(() => import('@/pages/NewInterviewPage'));
const InterviewPage = lazy(() => import('@/pages/InterviewPage'));
const ResultsPage = lazy(() => import('@/pages/ResultsPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingState className="min-h-screen" />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
              <Route path="/signup" element={<PublicOnly><SignupPage /></PublicOnly>} />
              <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/interview/new" element={<NewInterviewPage />} />
                <Route path="/interview/:id" element={<InterviewPage />} />
                <Route path="/results/:id" element={<ResultsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
