import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute, GuestRoute } from '@/components/common/ProtectedRoute';

import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@/features/auth/pages/VerifyEmailPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ProgressPage from '@/features/progress/pages/ProgressPage';
import GoalsPage from '@/features/goals/pages/GoalsPage';
import AnalyticsPage from '@/features/analytics/pages/AnalyticsPage';
import LeaderboardPage from '@/features/leaderboard/pages/LeaderboardPage';
import GitHubPage from '@/features/github/pages/GitHubPage';
import PublicProfilePage from '@/features/profile/pages/PublicProfilePage';
import SettingsPage from '@/features/settings/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <GuestRoute>
        <ResetPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/progress', element: <ProgressPage /> },
      { path: '/goals', element: <GoalsPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/leaderboard', element: <LeaderboardPage /> },
      { path: '/github', element: <GitHubPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/settings/github', element: <SettingsPage /> },
      { path: '/profile/:username', element: <PublicProfilePage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
