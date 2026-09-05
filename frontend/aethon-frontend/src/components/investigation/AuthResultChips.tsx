import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { cn } from "../../utils/classNames";

type AuthResult = "pass" | "fail" | "none";

interface AuthResultChipsProps {
  spf: AuthResult;
  dkim: AuthResult;
  dmarc: AuthResult;
}

function AuthChip({ label, result }: { label: string; result: AuthResult }) {
  const Icon =
    result === "pass"
      ? CheckCircle2
      : result === "fail"
      ? XCircle
      : MinusCircle;

  return (
    <div
      className={cn("auth-chip", `auth-chip--${result}`)}
      role="status"
      aria-label={`${label}: ${result}`}
    >
      <Icon size={14} aria-hidden="true" />
      <span className="auth-chip__label">{label}</span>
      <span className="auth-chip__result">{result.toUpperCase()}</span>
    </div>
  );
}

export function AuthResultChips({ spf, dkim, dmarc }: AuthResultChipsProps) {
  return (
    <div className="auth-chips" role="group" aria-label="Email authentication results">
      <AuthChip label="SPF" result={spf} />
      <AuthChip label="DKIM" result={dkim} />
      <AuthChip label="DMARC" result={dmarc} />
    </div>
  );
}
