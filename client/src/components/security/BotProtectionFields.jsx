import { TurnstileWidget } from './TurnstileWidget';

export function BotProtectionFields({
  honeypot,
  onHoneypotChange,
  turnstileSiteKey,
  onTurnstileVerify,
  onTurnstileExpire,
  onTurnstileError,
}) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => onHoneypotChange(e.target.value)}
        />
      </div>

      {turnstileSiteKey && (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          onVerify={onTurnstileVerify}
          onExpire={onTurnstileExpire}
          onError={onTurnstileError}
        />
      )}
    </>
  );
}
