import { evaluateBotSignals } from '../../../src/middleware/botProtection.middleware.js';

describe('evaluateBotSignals', () => {
  const now = 1_700_000_000_000;

  it('should reject requests when honeypot is filled', () => {
    const error = evaluateBotSignals({ website: 'http://spam.com' }, now);
    expect(error?.code).toBe('INVALID_REQUEST');
    expect(error?.statusCode).toBe(400);
  });

  it('should reject submissions that are too fast', () => {
    const error = evaluateBotSignals({ _ft: now }, now);
    expect(error?.code).toBe('INVALID_REQUEST');
    expect(error?.statusCode).toBe(400);
  });

  it('should allow normal submissions', () => {
    const error = evaluateBotSignals({ _ft: now - 5000 }, now);
    expect(error).toBeNull();
  });
});
