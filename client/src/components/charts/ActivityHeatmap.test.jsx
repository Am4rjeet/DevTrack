import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';

const buildGrid = (days) => {
  const grid = [];
  const start = new Date('2026-01-01');

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    grid.push({
      date: date.toISOString().slice(0, 10),
      totalMinutes: i % 3 === 0 ? 60 : 0,
      count: i % 3 === 0 ? 1 : 0,
      level: i % 3 === 0 ? 2 : 0,
    });
  }

  return grid;
};

describe('ActivityHeatmap', () => {
  it('shows empty state when no activity', () => {
    render(<ActivityHeatmap grid={[]} />);

    expect(screen.getByText(/No data for this period/i)).toBeInTheDocument();
  });

  it('renders heatmap cells for activity data', () => {
    const { container } = render(<ActivityHeatmap grid={buildGrid(14)} weeks={2} />);

    expect(container.querySelectorAll('[title*="sessions"]')).not.toHaveLength(0);
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
