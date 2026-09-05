import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Shield,
  FolderOpen,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/investigate', icon: Search, label: 'Investigate' },
  { to: '/threat-intel', icon: Shield, label: 'Threat Intel' },
  { to: '/cases', icon: FolderOpen, label: 'Cases' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'fixed',
        top: 'var(--topbar-height)',
        left: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        zIndex: 40,
      }}
    >
      <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: collapsed ? '10px 12px' : '10px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--accent-signal)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'rgba(63, 208, 201, 0.08)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent-signal)' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '10px 12px' : '10px 14px',
            borderRadius: 6,
            fontSize: 13,
            color: 'var(--text-muted)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'color 0.15s',
            fontFamily: 'var(--font-ui)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--risk-critical)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
