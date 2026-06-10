import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { renderWithProviders } from '@/test/utils';

const useAuthMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it('redirects unauthenticated users to login', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isLoading: false });

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: '/dashboard' }
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderWithProviders(
      <ProtectedRoute>
        <div>Dashboard</div>
      </ProtectedRoute>,
      { route: '/dashboard' }
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects authenticated guests away from auth pages', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isLoading: false });

    renderWithProviders(
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <div>Login Form</div>
            </GuestRoute>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { route: '/login' }
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
