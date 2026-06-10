import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { BotProtectionFields } from '@/components/security/BotProtectionFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBotProtection } from '@/hooks/useBotProtection';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/lib/api';

export default function ForgotPasswordPage() {
  const bot = useBotProtection();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bot.isReady) {
      toast.error('Complete the security check first.');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email, ...bot.getBotPayload() });
      setSent(true);
      toast.success('If that email exists, a reset link has been sent.');
    } catch (error) {
      toast.error(getErrorMessage(error));
      bot.resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="We'll send you a reset link">
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Check your inbox for a password reset link. It expires in 1 hour.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      ) : (
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !bot.isReady}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            Back to login
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
