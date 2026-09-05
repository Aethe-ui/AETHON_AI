import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { useCases } from "../../hooks/useCases";
import { useUIStore } from "../../stores/uiStore";
import { SeverityBadge, StatusBadge } from "../../components/ui/Badge";
import { formatRelative } from "../../utils/formatDate";
import type { CaseSeverityType, CaseStatusType } from "../../types";

const SEVERITIES: CaseSeverityType[] = ["critical", "high", "medium", "low"];
const STATUSES: CaseStatusType[] = ["open", "needs_review", "confirmed", "closed"];

export function CasesPage() {
  const navigate = useNavigate();
  const { data: cases, isLoading, error } = useCases();
  const { activeFilters, setFilter, clearFilters } = useUIStore();
  const [search, setSearch] = useState("");

  const filtered = (cases ?? []).filter((c) => {
    const matchesSeverity =
      activeFilters.severity.length === 0 ||
      activeFilters.severity.includes(c.severity);
    const matchesStatus =
      activeFilters.status.length === 0 ||
      activeFilters.status.includes(c.status);
    const matchesSearch =
      !search ||
      c.caseId.toLowerCase().includes(search.toLowerCase()) ||
      (c.subject ?? "").toLowerCase().includes(search.toLowerCase()) ||
      c.classification.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  function toggleFilter(key: "severity" | "status", value: string) {
    const current = activeFilters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilter(key, next);
  }

  return (
    <div className="page cases-page">
      <div className="page__header">
        <h1 className="page__title">
          <FolderOpen size={20} aria-hidden="true" />
          Cases
        </h1>
        <p className="page__subtitle">{filtered.length} case{filtered.length !== 1 ? "s" : ""} matching filters</p>
      </div>

      {/* Filters */}
      <div className="cases-filters" role="group" aria-label="Filter cases">
        <input
          id="cases-search"
          className="input cases-filters__search"
          type="search"
          placeholder="Search by ID, subject, or classification…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search cases"
        />

        <div className="cases-filters__group">
          <span className="cases-filters__label">Severity</span>
          {SEVERITIES.map((s) => (
            <button
              key={s}
              className={`filter-chip filter-chip--${s} ${activeFilters.severity.includes(s) ? "filter-chip--active" : ""}`}
              onClick={() => toggleFilter("severity", s)}
              aria-pressed={activeFilters.severity.includes(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="cases-filters__group">
          <span className="cases-filters__label">Status</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`filter-chip ${activeFilters.status.includes(s) ? "filter-chip--active" : ""}`}
              onClick={() => toggleFilter("status", s)}
              aria-pressed={activeFilters.status.includes(s)}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {(activeFilters.severity.length > 0 || activeFilters.status.length > 0) && (
          <button className="btn btn--ghost btn--sm" onClick={clearFilters} aria-label="Clear all filters">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="page-loading" aria-busy="true"><div className="page-loading__spinner" /></div>
      ) : error ? (
        <div className="page-error" role="alert">Cases failed to load. Try refreshing.</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">No cases match your filters.</p>
          <button className="btn btn--ghost btn--sm" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="cases-table-wrap" role="region" aria-label="Cases table">
          <table className="cases-table" aria-label="All cases">
            <thead>
              <tr>
                <th scope="col">Case ID</th>
                <th scope="col">Subject / Classification</th>
                <th scope="col">Severity</th>
                <th scope="col">Status</th>
                <th scope="col">Analyst</th>
                <th scope="col">Created</th>
                <th scope="col">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.caseId}
                  className="cases-table__row"
                  onClick={() => navigate(`/cases/${c.caseId}`)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/cases/${c.caseId}`)}
                  role="button"
                  aria-label={`Open case ${c.caseId}`}
                >
                  <td className="cases-table__id">
                    <code>{c.caseId}</code>
                  </td>
                  <td className="cases-table__subject">{c.subject ?? c.classification}</td>
                  <td><SeverityBadge severity={c.severity} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.analyst ?? <span className="text-muted">Unassigned</span>}</td>
                  <td>
                    <time dateTime={c.createdAt}>{formatRelative(c.createdAt)}</time>
                  </td>
                  <td className="cases-table__score">{c.riskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
