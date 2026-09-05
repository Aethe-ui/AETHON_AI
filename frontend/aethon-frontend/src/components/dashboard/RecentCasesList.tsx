import { useNavigate } from "react-router-dom";
import type { CaseListItem } from "../../types";
import { riskColorVar } from "../../utils/riskColor";
import { formatRelative } from "../../utils/formatDate";
import { SeverityBadge, StatusBadge } from "../ui/Badge";

interface RecentCasesListProps {
  cases: CaseListItem[];
}

export function RecentCasesList({ cases }: RecentCasesListProps) {
  const navigate = useNavigate();
  const recent = cases.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="empty-state">
        <p>No cases yet — analyze an email to create your first case.</p>
      </div>
    );
  }

  return (
    <ul className="recent-cases" role="list">
      {recent.map((c) => (
        <li
          key={c.caseId}
          className="recent-cases__item"
          style={{ "--severity-color": riskColorVar(c.severity) } as React.CSSProperties}
          onClick={() => navigate(`/cases/${c.caseId}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/cases/${c.caseId}`)}
          aria-label={`Open case ${c.caseId}: ${c.subject ?? c.classification}`}
        >
          <div className="recent-cases__left-border" aria-hidden="true" />
          <div className="recent-cases__body">
            <div className="recent-cases__header">
              <span className="recent-cases__id">{c.caseId}</span>
              <SeverityBadge severity={c.severity} />
              <StatusBadge status={c.status} />
            </div>
            <p className="recent-cases__subject">{c.subject ?? c.classification}</p>
            <div className="recent-cases__meta">
              <span>{c.analyst ?? "Unassigned"}</span>
              <span className="recent-cases__dot" aria-hidden="true">·</span>
              <time dateTime={c.createdAt}>{formatRelative(c.createdAt)}</time>
            </div>
          </div>
          <div className="recent-cases__score" aria-label={`Risk score: ${c.riskScore}`}>
            {c.riskScore}
          </div>
        </li>
      ))}
    </ul>
  );
}
