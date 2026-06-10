import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Flame } from 'lucide-react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders title, value, and subtitle', () => {
    render(
      <StatCard
        title="Current Streak"
        value="7 days"
        subtitle="Keep it going!"
        icon={Flame}
      />
    );

    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
    expect(screen.getByText('Keep it going!')).toBeInTheDocument();
  });
});
