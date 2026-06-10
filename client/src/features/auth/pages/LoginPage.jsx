import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { BotProtectionFields } from '@/components/security/BotProtectionFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useBotProtection } from '@/hooks/useBotProtection';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bot = useBotProtection();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(
    Boolean(location.state?.verifyPending || location.state?.emailVerifiedRequired)
  );
  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const handleResendVerification = async () => {
    if (!form.email) {
      toast.error('Enter your email address first.');
      return;
    }
    if (!bot.isReady) {
      toast.error('Complete the security check first.');
      return;
    }

    setResending(true);
    try {
      await authApi.resendVerificationEmail({
        email: form.email,
        ...bot.getBotPayload(),
      });
      toast.success('If your email is unverified, a new verification link has been sent.');
    } catch (error) {
      toast.error(getErrorMessage(error));
      bot.resetTurnstile();
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bot.isReady) {
      toast.error('Complete the security check first.');
      return;
    }

    setLoading(true);
    setShowResend(false);
    try {
      await login({ ...form, ...bot.getBotPayload() });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const code = error.response?.data?.error?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        setShowResend(true);
        toast.error('Pehle apni email verify karein. Inbox check karein ya neeche resend karein.');
      } else if (code === 'INVALID_REQUEST') {
        toast.error('Thoda wait karke dubara try karein.');
      } else if (code === 'LOGIN_RATE_LIMIT_EXCEEDED') {
        toast.error('Bahut zyada attempts. 15 minute baad try karein.');
      } else {
        toast.error(getErrorMessage(error));
      }
      bot.resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle="Use the email and password you registered with">
      {(showResend || location.state?.verifyPending) && (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <p>Please verify your email before signing in. Check your inbox for the verification link.</p>
          <Button
            type="button"
            variant="link"
            className="mt-1 h-auto p-0 text-amber-100"
            onClick={handleResendVerification}
            disabled={resending}
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative space-y-4">
        <BotProtectionFields
          honeypot={bot.honeypot}
          onHoneypotChange={bot.setHoneypot}
          turnstileSiteKey={bot.turnstileSiteKey}
          onTurnstileVerify={bot.setTurnstileToken}
          onTurnstileExpire={bot.resetTurnstile}
          onTurnstileError={bot.resetTurnstile}
        />

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !bot.isReady}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
