import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { Code2, Flame, Target, Trophy } from 'lucide-react';

const features = [
  { icon: Code2, label: 'Track coding hours' },
  { icon: Target, label: 'DSA progress' },
  { icon: Flame, label: 'Daily streaks' },
  { icon: Trophy, label: 'XP & leaderboard' },
];

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="gradient-mesh absolute inset-0" />
        <div className="relative z-10">
          <Logo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 space-y-6"
        >
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Build better habits.
            <br />
            <span className="text-primary">Ship more code.</span>
          </h1>
          <p className="max-w-md text-muted-foreground">
            The developer progress tracker for coding hours, DSA grind, streaks, and growth — built
            like a real SaaS product.
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
        </motion.div>

        <p className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} DEVTRACK
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
