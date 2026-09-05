import { useDashboardData } from '@/hooks/useDashboardData';
import { useCases } from '@/hooks/useCases';
import { TrendingUp, TrendingDown, AlertTriangle, Mail, Shield, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { severityChipClass, statusChipClass, formatStatus, formatDate, severityBorderClass } from '@/utils/helpers';

const categoryColors = ['var(--risk-critical)', 'var(--risk-high)', 'var(--risk-medium)', 'var(--risk-info)', 'var(--text-muted)'];

export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();
  const { data: cases } = useCases();
  const navigate = useNavigate();

  if (isLoading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    );
  }

  const { stats, trend, categories } = data;

  const kpis = [
    { label: 'Emails analyzed', value: stats.emailsAnalyzed.toLocaleString(), trend: stats.emailsTrend, icon: Mail },
    { label: 'Threats detected', value: stats.threatsDetected.toLocaleString(), trend: stats.threatsTrend, icon: AlertTriangle },
    { label: 'Critical threats', value: stats.criticalThreats.toString(), trend: stats.criticalTrend, icon: Shield, critical: true },
    { label: 'Open cases', value: stats.openCases.toString(), trend: stats.openCasesTrend, icon: FolderOpen },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
        Dashboard
      </h1>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{kpi.label}</span>
              <kpi.icon size={18} style={{ color: kpi.critical ? 'var(--risk-critical)' : 'var(--text-muted)' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {kpi.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              {kpi.trend >= 0 ? (
                <TrendingUp size={14} style={{ color: kpi.critical ? 'var(--risk-critical)' : 'var(--risk-low)' }} />
              ) : (
                <TrendingDown size={14} style={{ color: 'var(--risk-low)' }} />
              )}
              <span style={{ color: kpi.trend >= 0 && kpi.critical ? 'var(--risk-critical)' : kpi.trend >= 0 ? 'var(--risk-low)' : 'var(--risk-low)' }}>
                {kpi.trend >= 0 ? '+' : ''}{kpi.trend}{typeof kpi.trend === 'number' && kpi.trend > 20 ? '' : '%'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Trend chart */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--text-secondary)' }}>Detection trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3FD0C9" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3FD0C9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#5E6B85', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5E6B85', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
              />
              <Area type="monotone" dataKey="count" stroke="#3FD0C9" strokeWidth={2} fill="url(#trendGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category chart */}
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, color: 'var(--text-secondary)' }}>Threat categories</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categories} layout="vertical">
              <XAxis type="number" tick={{ fill: '#5E6B85', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#9AA7BD', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                }}
                formatter={((value: unknown, _name: unknown, props: unknown) => {
                  const p = props as { payload: { percentage: number } };
                  return [`${value} (${p.payload.percentage}%)`, 'Count'];
                }) as never}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {categories.map((_entry, index) => (
                  <Cell key={index} fill={categoryColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent investigations */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>Recent investigations</h2>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => navigate('/cases')}>
            View all
          </button>
        </div>
        <div>
          {(cases ?? []).slice(0, 5).map((c) => (
            <div
              key={c.caseId}
              onClick={() => navigate(`/cases/${c.caseId}`)}
              className={severityBorderClass(c.severity)}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 100px 100px 100px',
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
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
