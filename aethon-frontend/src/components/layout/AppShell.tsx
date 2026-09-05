import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { useUIStore } from '@/stores/uiStore';

export default function AppShell() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      <Topbar />
      <Sidebar />
      <main
        style={{
          marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          marginTop: 'var(--topbar-height)',
          padding: 24,
          transition: 'margin-left 0.2s ease',
          minHeight: `calc(100vh - var(--topbar-height))`,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
