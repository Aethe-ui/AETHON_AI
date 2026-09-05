import { FileText, Download, Eye } from "lucide-react";
import { useReports } from "../../hooks/useReports";
import { formatDateTime } from "../../utils/formatDate";

export function ReportsPage() {
  const { data: reports, isLoading, error } = useReports();

  return (
    <div className="page reports-page">
      <div className="page__header">
        <h1 className="page__title">
          <FileText size={20} aria-hidden="true" />
          Reports
        </h1>
        <p className="page__subtitle">Generated forensic investigation reports</p>
      </div>

      {isLoading && <div className="page-loading" aria-busy="true"><div className="page-loading__spinner" /></div>}
      {error && <div className="page-error" role="alert">Reports failed to load. Try refreshing.</div>}

      {reports && reports.length === 0 && (
        <div className="empty-state">
          <FileText size={40} className="empty-state__icon" />
          <p className="empty-state__title">No reports yet</p>
          <p className="empty-state__body">
            Open a case and click "Generate report" to create a forensic report.
          </p>
        </div>
      )}

      {reports && reports.length > 0 && (
        <div className="reports-list" role="list">
          {reports.map((r) => (
            <div key={r.reportId} className="report-item" role="listitem">
              <div className="report-item__body">
                <div className="report-item__header">
                  <code className="report-item__id">{r.reportId}</code>
                  <span
                    className={`report-item__status report-item__status--${r.status}`}
                    aria-label={`Status: ${r.status}`}
                  >
                    {r.status === "generating" ? "Generating…" : r.status === "ready" ? "Generated" : "Failed"}
                  </span>
                </div>
                <p className="report-item__title">{r.title}</p>
                <div className="report-item__meta">
                  <span>Case: <code>{r.caseId}</code></span>
                  <span className="report-item__sep">·</span>
                  <span>By {r.generatedBy}</span>
                  <span className="report-item__sep">·</span>
                  <time dateTime={r.generatedAt}>{formatDateTime(r.generatedAt)}</time>
                </div>
                {r.summary && <p className="report-item__summary">{r.summary}</p>}
              </div>
              <div className="report-item__actions">
                {r.downloadUrl && (
                  <>
                    <a
                      href={r.downloadUrl}
                      download
                      className="btn btn--secondary btn--sm"
                      aria-label={`Download PDF for ${r.reportId}`}
                    >
                      <Download size={14} aria-hidden="true" />
                      Download PDF
                    </a>
                    <a
                      href={r.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--ghost btn--sm"
                      aria-label={`View report ${r.reportId} in browser`}
                    >
                      <Eye size={14} aria-hidden="true" />
                      View
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
