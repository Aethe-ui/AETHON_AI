import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Settings</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
        User and role management, API key configuration
      </p>

      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <SettingsIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.3 }} />
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
          Settings panel coming soon
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          User/role management and API key configuration (admin only)
        </div>
      </div>
    </div>
  );
}
