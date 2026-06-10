import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './LoadingSpinner';

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  const requiresVerifiedEmail = import.meta.env.PROD;

  if (requiresVerifiedEmail && user && !user.isEmailVerified) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          email: user.email,
          emailVerifiedRequired: true,
        }}
        replace
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isLoading) return <PageLoader />;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children;
}
