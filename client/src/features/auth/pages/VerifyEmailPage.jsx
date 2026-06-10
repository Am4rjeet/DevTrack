import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { authApi } from '@/features/auth/api/authApi';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { refetchUser, isAuthenticated } = useAuth();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(async () => {
        setStatus('success');
        setMessage('Your email has been verified successfully.');
        if (isAuthenticated) await refetchUser();
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Verification failed.');
      });
  }, [token, isAuthenticated, refetchUser]);

  return (
    <AuthLayout title="Email verification" subtitle="Confirming your email address">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        {status === 'loading' && <LoadingSpinner size="lg" />}
        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
        {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link to="/login" state={{ verifyPending: status === 'success' }}>
          <Button>Sign in</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
