import { useReports } from '@/hooks/useReports';
import { severityChipClass, formatDateTime } from '@/utils/helpers';
import { FileText, Download, Eye, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function ReportsPage() {
  const { data: reports, isLoading } = useReports();
  const [search, setSearch] = useState('');

  const filtered = (reports ?? []).filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.caseId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Reports</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Generated forensic investigation reports</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Generate new report
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="input"
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading reports...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <FileText size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontSize: 14, marginBottom: 4 }}>No reports generated yet</div>
          <div style={{ fontSize: 12 }}>Open a case and generate your first forensic report</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((report) => (
            <div
              key={report.reportId}
              className="card card-hover"
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(63, 208, 201, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={20} style={{ color: 'var(--accent-signal)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {report.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-signal)' }}>{report.caseId}</span>
                    <span className={severityChipClass(report.severity)}>{report.severity}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.classification}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Generated {formatDateTime(report.generatedAt)} by {report.generatedBy}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                  <Eye size={14} /> View
                </button>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, borderColor: 'var(--accent-signal)', color: 'var(--accent-signal)' }}>
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing 1-{filtered.length} of {filtered.length} reports</span>
          </div>
        </div>
      )}
    </div>
  );
}
