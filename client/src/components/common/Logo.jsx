import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">
        DT
      </div>
      {showText && (
        <span className="text-lg font-semibold tracking-tight">
          DEV<span className="text-primary">TRACK</span>
        </span>
      )}
    </Link>
  );
}
