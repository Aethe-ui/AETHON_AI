import { useState } from 'react';
import { useThreatIntel } from '@/hooks/useThreatIntel';
import { Search, AlertTriangle, Globe, Server, ExternalLink, Tag, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { severityChipClass, severityBorderClass } from '@/utils/helpers';
import { detectIOCType } from '@/utils/helpers';

export default function ThreatIntelligencePage() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useThreatIntel(searchTerm);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) setSearchTerm(query.trim());
  };

  const iocTypes = ['IP address', 'Domain', 'URL', 'File hash'];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
        Threat intelligence
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Look up IPs, domains, URLs, and file hashes for reputation and threat context
      </p>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter IP, domain, URL, or file hash..."
            className="input input-mono"
            style={{ paddingLeft: 40, fontSize: 14, padding: '12px 14px 12px 40px', border: '1px solid var(--border-strong)' }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSearch} style={{ padding: '12px 24px' }}>
          Search
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {iocTypes.map((type) => (
          <span key={type} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            {type}
          </span>
        ))}
        {query && (
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(63, 208, 201, 0.1)', color: 'var(--accent-signal)' }}>
            Detected: {detectIOCType(query)}
          </span>
        )}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          Looking up threat intelligence...
        </div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Reputation Overview */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 8 }}>{data.query}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 500,
                    backgroundColor: data.reputationScore >= 70 ? 'rgba(229, 72, 77, 0.15)' : 'rgba(224, 179, 65, 0.15)',
                    color: data.reputationScore >= 70 ? 'var(--risk-critical)' : 'var(--risk-medium)',
                  }}>
                    {data.classification}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                  {data.threatType}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  First seen: {data.firstSeen} · Last seen: {data.lastSeen}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: data.reputationScore >= 70 ? 'var(--risk-critical)' : 'var(--risk-medium)' }}>
                  {data.reputationScore}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/100</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {data.tags.map((tag) => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Network Info */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Server size={14} /> Network information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'ASN', value: data.network.asn, mono: true },
                { label: 'Country', value: data.network.country },
                { label: 'City', value: data.network.city },
                { label: 'Organization', value: data.network.organization },
                { label: 'CIDR', value: data.network.cidr, mono: true },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: item.mono ? 'var(--font-mono)' : 'inherit' }}>{item.value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detection Stats */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>Detection stats</h3>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 8 }}>
              Detected by <strong>{data.detectionStats.detected}</strong>/{data.detectionStats.total} threat intelligence vendors
            </div>
            <div style={{ height: 6, backgroundColor: 'var(--bg-surface-2)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${(data.detectionStats.detected / data.detectionStats.total) * 100}%`, backgroundColor: 'var(--risk-high)', borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {data.detectionStats.categories.map((cat) => (
                <span key={cat.name} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {cat.name} ({cat.count})
                </span>
              ))}
            </div>
          </div>

          {/* Related Cases */}
          {data.relatedCases.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>
                <Globe size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                {data.relatedCases.length} related cases
              </h3>
              {data.relatedCases.map((rc) => (
                <div
                  key={rc.caseId}
                  onClick={() => navigate(`/cases/${rc.caseId}`)}
                  className={severityBorderClass(rc.severity)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-signal)' }}>{rc.caseId}</span>
                  <span className={severityChipClass(rc.severity)}>{rc.severity}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{rc.classification}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{rc.date}</span>
                  <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!data && !isLoading && !searchTerm && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Shield size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontSize: 14 }}>Enter an IP, domain, URL, or hash to look up threat intelligence</div>
        </div>
      )}
    </div>
  );
}
