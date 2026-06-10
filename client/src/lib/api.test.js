import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './api';

describe('getErrorMessage', () => {
  it('returns API error message when present', () => {
    const error = {
      response: {
        data: {
          error: { message: 'Invalid credentials' },
        },
      },
    };

    expect(getErrorMessage(error)).toBe('Invalid credentials');
  });

  it('falls back to generic message field', () => {
    const error = {
      response: {
        data: { message: 'Bad request' },
      },
    };

    expect(getErrorMessage(error)).toBe('Bad request');
  });

  it('falls back to error.message', () => {
    expect(getErrorMessage(new Error('Network Error'))).toBe('Network Error');
  });

  it('returns default message for unknown errors', () => {
    expect(getErrorMessage({})).toBe('Something went wrong');
  });
});
