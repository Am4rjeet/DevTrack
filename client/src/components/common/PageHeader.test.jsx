import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title, description, and action slot', () => {
    render(
      <PageHeader
        title="Progress"
        description="Track your coding sessions"
        action={<button type="button">Add entry</button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByText('Track your coding sessions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add entry' })).toBeInTheDocument();
  });
});
