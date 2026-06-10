import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Logo } from './Logo';

describe('Logo', () => {
  it('renders DEVTRACK branding', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    expect(screen.getByText(/DEV/)).toBeInTheDocument();
    expect(screen.getByText(/TRACK/)).toBeInTheDocument();
  });
});
