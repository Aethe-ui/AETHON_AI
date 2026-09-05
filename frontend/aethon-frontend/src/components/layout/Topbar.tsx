import { Bell, Search } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  activeCaseId?: string;
}

export function Topbar({ activeCaseId }: TopbarProps) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__logo-text">AETHON</span>
        <span className="topbar__tagline">Threat Intelligence Console</span>
      </div>

      <div className="topbar__search">
        <Search size={14} className="topbar__search-icon" />
        <input
          className="topbar__search-input"
          placeholder="Search cases, IPs, domains…"
          aria-label="Global search"
        />
      </div>

      <div className="topbar__actions">
        {activeCaseId && (
          <span className="topbar__case-badge">
            case:{activeCaseId}
          </span>
        )}
        <button className="topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar__notif-dot" aria-hidden="true" />
        </button>
        <button
          className="topbar__user-btn"
          onClick={handleLogout}
          title="Click to log out"
          aria-label={`Logged in as ${user?.name ?? "Analyst"}. Click to log out.`}
        >
          <span className="topbar__user-avatar">
            {(user?.name ?? "A")[0].toUpperCase()}
          </span>
          <span className="topbar__user-name">{user?.name ?? "Analyst"}</span>
        </button>
      </div>
    </header>
  );
}
