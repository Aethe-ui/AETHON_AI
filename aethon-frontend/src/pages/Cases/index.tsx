import { useNavigate } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';
import { severityChipClass, statusChipClass, formatStatus, formatDate, severityBorderClass } from '@/utils/helpers';
import { useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import type { CaseSeverity, CaseStatus } from '@/schemas/case';

export default function CasesPage() {
  const { data: cases, isLoading } = useCases();
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<CaseSeverity | ''>('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [search, setSearch] = useState('');

  const filtered = (cases ?? []).filter((c) => {
    if (severityFilter && c.severity !== severityFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (search && !c.subject.toLowerCase().includes(search.toLowerCase()) && !c.caseId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount = (cases ?? []).filter((c) => c.status === 'open').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Cases</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{openCount} open cases</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/investigate')}>
          <Plus size={16} /> New investigation
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as CaseSeverity | '')}
          className="input"
          style={{ width: 160 }}
        >
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
          className="input"
          style={{ width: 160 }}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="needs_review">Needs review</option>
          <option value="confirmed">Confirmed</option>
          <option value="closed">Closed</option>
        </select>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases..."
            className="input"
            style={{ paddingLeft: 34 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr 100px 120px 120px 110px',
            gap: 16,
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Case ID</span><span>Subject</span><span>Severity</span><span>Status</span><span>Analyst</span><span>Date ↓</span>
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading cases...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No cases match your filters — try adjusting your search
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.caseId}
              onClick={() => navigate(`/cases/${c.caseId}`)}
              className={severityBorderClass(c.severity)}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 100px 120px 120px 110px',
                gap: 16,
                padding: '12px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'background-color 0.1s',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-signal)' }}>{c.caseId}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</span>
              <span className={severityChipClass(c.severity)}>{c.severity}</span>
              <span className={statusChipClass(c.status)}>{formatStatus(c.status)}</span>
              <span style={{ fontSize: 12, color: c.analyst ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: c.analyst ? 'normal' : 'italic' }}>
                {c.analyst || 'Unassigned'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</span>
            </div>
          ))
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing 1-{filtered.length} of {filtered.length} cases</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} disabled>Previous</button>
            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: 12, minWidth: 28 }}>1</button>
            <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
