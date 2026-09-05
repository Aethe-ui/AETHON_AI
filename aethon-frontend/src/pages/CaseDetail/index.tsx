import { useParams } from 'react-router-dom';
import { useCase } from '@/hooks/useCases';
import { severityChipClass, statusChipClass, formatStatus, formatDateTime } from '@/utils/helpers';
import { useState } from 'react';
import { Shield, Globe, Link2, Paperclip, CheckCircle, XCircle, MinusCircle, MapPin, Clock } from 'lucide-react';

export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { data: caseData, isLoading } = useCase(caseId || '');
  const [notes, setNotes] = useState('');

  if (isLoading || !caseData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        Loading case...
      </div>
    );
  }

  const authIcon = (result: string) => {
    if (result === 'pass') return <CheckCircle size={14} style={{ color: 'var(--risk-low)' }} />;
    if (result === 'fail') return <XCircle size={14} style={{ color: 'var(--risk-critical)' }} />;
    return <MinusCircle size={14} style={{ color: 'var(--text-muted)' }} />;
  };

  const authChipStyle = (result: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: result === 'pass' ? 'rgba(63, 191, 127, 0.12)' : result === 'fail' ? 'rgba(229, 72, 77, 0.12)' : 'rgba(94, 107, 133, 0.12)',
    color: result === 'pass' ? 'var(--risk-low)' : result === 'fail' ? 'var(--risk-critical)' : 'var(--text-muted)',
  });

  const weightDot = (weight: string) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: weight === 'high' ? 'var(--risk-high)' : weight === 'medium' ? 'var(--risk-medium)' : 'var(--risk-low)',
    flexShrink: 0,
  });

  const evidenceIcons = { domains: Globe, urls: Link2, ips: Shield, attachments: Paperclip };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="card" style={{ padding: 24, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent-signal)', fontWeight: 500 }}>
            {caseData.caseId}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{caseData.classification}</span>
          <span className={statusChipClass(caseData.status)}>{formatStatus(caseData.status)}</span>
          <span className={severityChipClass(caseData.severity)}>{caseData.severity}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <svg viewBox="0 0 36 36" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-subtle)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke={caseData.riskScore >= 80 ? 'var(--risk-critical)' : caseData.riskScore >= 60 ? 'var(--risk-high)' : caseData.riskScore >= 40 ? 'var(--risk-medium)' : 'var(--risk-low)'}
                strokeWidth="2.5"
                strokeDasharray={`${caseData.riskScore * 0.975} 97.5`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
              {caseData.riskScore}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Risk score</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence: {caseData.confidence}</div>
        </div>
      </div>

      {/* AI Explanation */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>Why AETHON flagged this</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {caseData.explanation.map((exp, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={weightDot(exp.weight)} />
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{exp.signal}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', textTransform: 'capitalize' }}>{exp.weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {(Object.entries(caseData.indicators) as [keyof typeof evidenceIcons, typeof caseData.indicators.domains][]).map(([key, items]) => {
          const Icon = evidenceIcons[key];
          return (
            <div key={key} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{key}</span>
                </div>
                {items[0] && <span className={severityChipClass(items[0].risk)}>{items[0].risk}</span>}
              </div>
              {items.map((item, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{item.value}</div>
                  {item.note && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.note}</div>}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Authentication */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>Authentication results</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {(['spf', 'dkim', 'dmarc'] as const).map((auth) => (
            <div key={auth} style={authChipStyle(caseData.authentication[auth])}>
              {authIcon(caseData.authentication[auth])}
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{auth}</span>
              <span>{caseData.authentication[auth]}</span>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10 }}>Received path</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {caseData.receivedPath.map((hop) => (
            <div key={hop.hop} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 40 }}>Hop {hop.hop}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)' }}>{hop.ip}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hop.server}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                {hop.geo.city}, {hop.geo.country}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Geolocation placeholder */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>Sender geolocation</h2>
        <div style={{ height: 200, backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <MapPin size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
            <div style={{ fontSize: 13 }}>Map requires Mapbox token</div>
            <div style={{ fontSize: 11 }}>Set VITE_MAPBOX_TOKEN in .env</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Country', value: caseData.receivedPath[0]?.geo.country },
            { label: 'City', value: caseData.receivedPath[0]?.geo.city },
            { label: 'Confidence', value: caseData.receivedPath[0]?.geo.confidence },
            { label: 'Accuracy', value: `~${caseData.receivedPath[0]?.geo.accuracyRadiusKm}km` },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          Location is approximate based on IP geolocation
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>
          <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Investigation timeline
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', paddingLeft: 24 }}>
          <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, backgroundColor: 'var(--border-subtle)' }} />
          {caseData.timeline.map((entry, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '8px 0', position: 'relative' }}>
              <div style={{ position: 'absolute', left: -20, top: 12, width: 10, height: 10, borderRadius: '50%', backgroundColor: i === caseData.timeline.length - 1 ? 'var(--accent-signal)' : 'var(--border-strong)', border: '2px solid var(--bg-surface)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', minWidth: 140, flexShrink: 0 }}>
                {formatDateTime(entry.time)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{entry.event}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analyst Notes */}
      {caseData.notes.length > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>Analyst notes</h2>
          {caseData.notes.map((note, i) => (
            <div key={i} style={{ padding: 12, backgroundColor: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-signal)' }}>{note.author}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDateTime(note.createdAt)}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{note.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>Actions</h2>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className="btn btn-danger">Confirm suspicious</button>
          <button className="btn btn-success">Mark as safe</button>
          <button className="btn btn-warning">Needs review</button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add analyst notes..."
          className="input"
          style={{ height: 80, resize: 'vertical', marginBottom: 12 }}
        />
        <button className="btn btn-primary">Generate report</button>
      </div>
    </div>
  );
}
