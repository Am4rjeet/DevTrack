import { useCallback, useMemo, useRef, useState } from 'react';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

export function useBotProtection() {
  const formStartedAt = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const isTurnstileEnabled = Boolean(TURNSTILE_SITE_KEY);
  const isReady = !isTurnstileEnabled || Boolean(turnstileToken);

  const getBotPayload = useCallback(
    () => ({
      _ft: formStartedAt.current,
      website: honeypot,
      ...(turnstileToken && { turnstileToken }),
    }),
    [honeypot, turnstileToken]
  );

  const resetTurnstile = useCallback(() => {
    setTurnstileToken('');
  }, []);

  return useMemo(
    () => ({
      isTurnstileEnabled,
      isReady,
      turnstileSiteKey: TURNSTILE_SITE_KEY,
      turnstileToken,
      setTurnstileToken,
      resetTurnstile,
      honeypot,
      setHoneypot,
      getBotPayload,
    }),
    [
      isTurnstileEnabled,
      isReady,
      turnstileToken,
      setTurnstileToken,
      resetTurnstile,
      honeypot,
      getBotPayload,
    ]
  );
}
