import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';

import Layout from './components/layout/Layout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './router/RouteGuards';
import { useToastStore } from './store/useToastStore';
import { Toast } from './components/common/Toast';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const DashboardPage = lazy(() => import('./pages/user/DashboardPage'));
const MyUrlsPage = lazy(() => import('./pages/user/MyUrlsPage'));
const CreateUrlPage = lazy(() => import('./pages/user/CreateUrlPage'));
const EditUrlPage = lazy(() => import('./pages/user/EditUrlPage'));
const AnalyticsPage = lazy(() => import('./pages/user/AnalyticsPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminUrlsPage = lazy(() => import('./pages/admin/AdminUrlsPage'));
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));
const ExpiredPage = lazy(() => import('./pages/error/ExpiredPage'));
const DisabledPage = lazy(() => import('./pages/error/DisabledPage'));
const PasswordPromptPage = lazy(() => import('./pages/error/PasswordPromptPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* Global Toast Notifications */}
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {toasts.map((t) => (
            <Toast key={t.id} id={t.id} type={t.type} message={t.message} />
          ))}
        </div>

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public — with layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/error/404" element={<NotFoundPage />} />
              <Route path="/error/410" element={<ExpiredPage />} />
              <Route path="/error/403" element={<DisabledPage />} />
              <Route path="/:shortCode/unlock" element={<PasswordPromptPage />} />
            </Route>

            {/* Guest-only (redirect to dashboard if logged in) */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Auth pages (no layout) */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout showSidebar />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/urls" element={<MyUrlsPage />} />
                <Route path="/urls/new" element={<CreateUrlPage />} />
                <Route path="/urls/:id/edit" element={<EditUrlPage />} />
                <Route path="/urls/:id/analytics" element={<AnalyticsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route element={<Layout showSidebar isAdmin />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/urls" element={<AdminUrlsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/error/404" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
