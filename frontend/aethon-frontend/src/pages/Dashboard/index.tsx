import { LayoutDashboard, Mail, ShieldAlert, FolderOpen } from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useCases } from "../../hooks/useCases";
import { StatCard } from "../../components/dashboard/StatCard";
import { TrendChart } from "../../components/dashboard/TrendChart";
import { CategoryChart } from "../../components/dashboard/CategoryChart";
import { RecentCasesList } from "../../components/dashboard/RecentCasesList";
import { Card, CardHeader, CardTitle, CardBody } from "../../components/ui/Card";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: cases, isLoading: casesLoading } = useCases();

  if (statsError) {
    return (
      <div className="page-error" role="alert">
        <p>Dashboard data failed to load — retry or check your connection.</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="page__header">
        <h1 className="page__title">
          <LayoutDashboard size={20} aria-hidden="true" />
          Dashboard
        </h1>
        <p className="page__subtitle">SOC overview — last 24 hours</p>
      </div>

      {/* KPI Strip */}
      <section className="dashboard-kpi" aria-label="Key performance indicators">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card stat-card--skeleton" aria-hidden="true" />
          ))
        ) : stats ? (
          <>
            <StatCard
              label="Emails Analyzed"
              value={stats.emailsAnalyzed}
              trend={stats.emailsAnalyzedTrend}
              icon={<Mail size={16} />}
            />
            <StatCard
              label="Threats Detected"
              value={stats.threatsDetected}
              trend={stats.threatsDetectedTrend}
              icon={<ShieldAlert size={16} />}
              accent="signal"
            />
            <StatCard
              label="Critical Threats"
              value={stats.criticalThreats}
              trend={stats.criticalThreatsTrend}
              icon={<ShieldAlert size={16} />}
              accent="critical"
            />
            <StatCard
              label="Open Cases"
              value={stats.openCases}
              trend={stats.openCasesTrend}
              icon={<FolderOpen size={16} />}
            />
          </>
        ) : null}
      </section>

      {/* Charts */}
      <section className="dashboard-charts" aria-label="Detection analytics">
        <Card>
          <CardHeader>
            <CardTitle>Threat detection trend</CardTitle>
          </CardHeader>
          <CardBody>
            {stats ? (
              <TrendChart data={stats.detectionTrend} />
            ) : (
              <div className="chart-skeleton" aria-hidden="true" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Threat category breakdown</CardTitle>
          </CardHeader>
          <CardBody>
            {stats ? (
              <CategoryChart data={stats.categoryBreakdown} />
            ) : (
              <div className="chart-skeleton" aria-hidden="true" />
            )}
          </CardBody>
        </Card>
      </section>

      {/* Recent Cases */}
      <section aria-label="Recent investigations">
        <Card>
          <CardHeader>
            <CardTitle>Recent investigations</CardTitle>
          </CardHeader>
          <CardBody>
            {casesLoading ? (
              <div className="recent-cases-skeleton" aria-hidden="true" />
            ) : cases ? (
              <RecentCasesList cases={cases} />
            ) : (
              <p className="empty-state__text">
                No cases yet — analyze an email to create your first case.
              </p>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
