import { ExternalLink } from "lucide-react";
import { SeverityBadge } from "../ui/Badge";
import { riskColorVar } from "../../utils/riskColor";
import type { CaseSeverityType } from "../../types";

interface EvidenceCardProps {
  type: "domain" | "url" | "ip" | "attachment";
  value: string;
  risk: CaseSeverityType;
  note?: string;
}

const TYPE_LABEL: Record<string, string> = {
  domain: "Domain",
  url: "URL",
  ip: "IP Address",
  attachment: "Attachment",
};

export function EvidenceCard({ type, value, risk, note }: EvidenceCardProps) {
  const isLink = type === "url" || type === "domain";

  return (
    <div
      className="evidence-card"
      style={{ "--evidence-accent": riskColorVar(risk) } as React.CSSProperties}
    >
      <div className="evidence-card__header">
        <span className="evidence-card__type">{TYPE_LABEL[type]}</span>
        <SeverityBadge severity={risk} />
      </div>
      <div className="evidence-card__value-row">
        <code className="evidence-card__value">{value}</code>
        {isLink && (
          <a
            href={type === "url" ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="evidence-card__ext-link"
            aria-label={`Open ${value} in new tab (external)`}
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      {note && <p className="evidence-card__note">{note}</p>}
    </div>
  );
}
