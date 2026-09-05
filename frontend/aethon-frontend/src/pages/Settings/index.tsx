import { Settings } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

export function SettingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <div className="page settings-page">
      <div className="page__header">
        <h1 className="page__title">
          <Settings size={20} aria-hidden="true" />
          Settings
        </h1>
        <p className="page__subtitle">User profile and platform configuration</p>
      </div>

      <div className="settings-sections">
        <section className="settings-section" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="settings-section__title">User profile</h2>
          <div className="settings-field">
            <span className="settings-field__label">Name</span>
            <span className="settings-field__value">{user?.name ?? "—"}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field__label">Email</span>
            <span className="settings-field__value">{user?.email ?? "—"}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field__label">Role</span>
            <span className="settings-field__value">{user?.role ?? "—"}</span>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="api-heading">
          <h2 id="api-heading" className="settings-section__title">API configuration</h2>
          <div className="settings-field">
            <span className="settings-field__label">API base URL</span>
            <code className="settings-field__value">
              {import.meta.env.VITE_API_BASE_URL || "Not configured"}
            </code>
          </div>
          <div className="settings-field">
            <span className="settings-field__label">Mock mode</span>
            <code className="settings-field__value">
              {import.meta.env.VITE_USE_MOCK === "true" ? "Enabled" : "Disabled"}
            </code>
          </div>
          <div className="settings-field">
            <span className="settings-field__label">Mapbox token</span>
            <code className="settings-field__value">
              {import.meta.env.VITE_MAPBOX_TOKEN && import.meta.env.VITE_MAPBOX_TOKEN !== "pk.xxxxx"
                ? "Configured ✓"
                : "Not configured — geolocation map disabled"}
            </code>
          </div>
        </section>

        {isAdmin && (
          <section className="settings-section" aria-labelledby="admin-heading">
            <h2 id="admin-heading" className="settings-section__title">User management</h2>
            <p className="settings-section__body">
              Admin user management is available via the backend API. Contact your system administrator to add or remove analyst accounts.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
