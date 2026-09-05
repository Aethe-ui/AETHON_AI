import { useNavigate } from "react-router-dom";
import type { ThreatIntelResult } from "../../types";
import { SeverityBadge } from "../ui/Badge";
import { formatDate } from "../../utils/formatDate";
import { riskColorVar } from "../../utils/riskColor";
import type { CaseSeverityType } from "../../types";

interface ReputationPanelProps {
  result: ThreatIntelResult;
}

const VERDICT_COLOR: Record<string, string> = {
  malicious: "var(--risk-critical)",
  suspicious: "var(--risk-high)",
  clean: "var(--risk-low)",
  unknown: "var(--text-muted)",
};

export function ReputationPanel({ result }: ReputationPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="reputation-panel">
      <div className="reputation-panel__header">
        <div>
          <span className="reputation-panel__query-type">{result.queryType.toUpperCase()}</span>
          <code className="reputation-panel__query">{result.query}</code>
        </div>
        <div className="reputation-panel__score-wrap">
          <span
            className="reputation-panel__score"
            style={{ color: VERDICT_COLOR[result.verdict] }}
            aria-label={`Reputation score: ${result.reputationScore} out of 100`}
          >
            {result.reputationScore}
          </span>
          <span className="reputation-panel__score-label">/ 100</span>
        </div>
      </div>

      <div
        className="reputation-panel__verdict"
        style={{ borderColor: VERDICT_COLOR[result.verdict] }}
      >
        <span style={{ color: VERDICT_COLOR[result.verdict] }} className="reputation-panel__verdict-text">
          {result.verdict.toUpperCase()}
        </span>
      </div>

      <div className="reputation-panel__grid">
        <div className="reputation-panel__field">
          <span className="reputation-panel__field-label">ASN</span>
          <span className="reputation-panel__field-value">{result.asn ?? "—"}</span>
        </div>
        <div className="reputation-panel__field">
          <span className="reputation-panel__field-label">Country</span>
          <span className="reputation-panel__field-value">{result.country ?? "—"}</span>
        </div>
        <div className="reputation-panel__field">
          <span className="reputation-panel__field-label">First seen</span>
          <span className="reputation-panel__field-value">
            {result.firstSeen ? formatDate(result.firstSeen) : "—"}
          </span>
        </div>
        <div className="reputation-panel__field">
          <span className="reputation-panel__field-label">Last seen</span>
          <span className="reputation-panel__field-value">
            {result.lastSeen ? formatDate(result.lastSeen) : "—"}
          </span>
        </div>
      </div>

      {result.categories.length > 0 && (
        <div className="reputation-panel__categories">
          <span className="reputation-panel__field-label">Categories</span>
          <div className="reputation-panel__tag-row">
            {result.categories.map((cat) => (
              <span key={cat} className="reputation-panel__tag">{cat}</span>
            ))}
          </div>
        </div>
      )}

      {result.sources.length > 0 && (
        <div className="reputation-panel__sources">
          <span className="reputation-panel__field-label">Sources</span>
          <div className="reputation-panel__tag-row">
            {result.sources.map((src) => (
              <span key={src} className="reputation-panel__tag reputation-panel__tag--source">{src}</span>
            ))}
          </div>
        </div>
      )}

      {result.relatedCases.length > 0 && (
        <div className="reputation-panel__related">
          <span className="reputation-panel__field-label">Related cases ({result.relatedCases.length})</span>
          <div className="reputation-panel__related-list">
            {result.relatedCases.map((c) => (
              <button
                key={c.caseId}
                className="reputation-panel__case-link"
                onClick={() => navigate(`/cases/${c.caseId}`)}
                aria-label={`Open case ${c.caseId}`}
              >
                <SeverityBadge severity={c.severity as CaseSeverityType} />
                <span>{c.caseId}</span>
                <span className="reputation-panel__case-date">{formatDate(c.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
