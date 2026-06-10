import { Logo } from '@/components/common/Logo';
import { Code2, Flame, Target, Trophy } from 'lucide-react';

const features = [
  { icon: Code2, label: 'Log sessions' },
  { icon: Target, label: 'Track DSA' },
  { icon: Flame, label: 'Streaks' },
  { icon: Trophy, label: 'XP & ranks' },
];

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="gradient-mesh absolute inset-0" />
        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Build better habits.
            <br />
            <span className="text-primary">Ship more code.</span>
          </h1>
          <p className="max-w-md text-muted-foreground">
            Log sessions, hit weekly goals, and see your streaks and XP add up over time.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-background/50 px-3 py-2.5 text-sm"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} DevTrack
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
