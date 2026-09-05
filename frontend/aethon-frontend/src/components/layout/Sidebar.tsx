import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Shield,
  FolderOpen,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { cn } from "../../utils/classNames";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/investigate", label: "Investigate", icon: Search },
  { to: "/threat-intel", label: "Threat Intel", icon: Shield },
  { to: "/cases", label: "Cases", icon: FolderOpen },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "sidebar",
        sidebarCollapsed && "sidebar--collapsed"
      )}
    >
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Zap size={18} />
        </div>
        {!sidebarCollapsed && (
          <span className="sidebar__logo-text">AETHON</span>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn("sidebar__nav-item", isActive && "sidebar__nav-item--active")
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={18} className="sidebar__nav-icon" />
            {!sidebarCollapsed && (
              <span className="sidebar__nav-label">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        className="sidebar__toggle"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!sidebarCollapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
