import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/features/auth/api/authApi';
import { getErrorMessage } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.changePassword(passwords);
      toast.success('Password changed. Please sign in again.');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await authApi.resendVerification();
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username</span>
            <span>@{user?.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email verified</span>
            <span className={user?.isEmailVerified ? 'text-green-500' : 'text-amber-500'}>
              {user?.isEmailVerified ? 'Yes' : 'No'}
            </span>
          </div>
          {!user?.isEmailVerified && (
            <Button variant="outline" size="sm" onClick={handleResendVerification}>
              Resend verification email
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update your password (logs out all sessions)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GitHub</CardTitle>
          <CardDescription>Connect your profile to show repos and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/github">
              <Github className="mr-2 h-4 w-4" />
              Manage GitHub connection
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
