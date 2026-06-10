import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { BotProtectionFields } from '@/components/security/BotProtectionFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useBotProtection } from '@/hooks/useBotProtection';
import { getErrorMessage } from '@/lib/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const bot = useBotProtection();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bot.isReady) {
      toast.error('Complete the security check first.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        ...(form.displayName && { displayName: form.displayName }),
        ...bot.getBotPayload(),
      });
      toast.success('Account created! Check your email to verify before signing in.');
      navigate('/login', {
        state: { email: form.email, verifyPending: true },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
      bot.resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="You'll need to verify your email before logging in">
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="devuser"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            pattern="^[a-zA-Z0-9_]{3,30}$"
            title="3-30 characters, letters, numbers, underscores"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display name (optional)</Label>
          <Input
            id="displayName"
            placeholder="Dev User"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 chars, upper, lower, number"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !bot.isReady}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
