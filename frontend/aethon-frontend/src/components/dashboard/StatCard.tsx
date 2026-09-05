import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../utils/classNames";

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: number; // Positive = up, negative = down, undefined = no trend
  icon?: React.ReactNode;
  accent?: "default" | "critical" | "signal";
}

export function StatCard({ label, value, trend, icon, accent = "default" }: StatCardProps) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? TrendingUp
      : TrendingDown;

  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div className={cn("stat-card", accent !== "default" && `stat-card--${accent}`)}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {icon && <span className="stat-card__icon">{icon}</span>}
      </div>
      <div className="stat-card__value">{typeof value === "number" ? value.toLocaleString() : value}</div>
      {trend !== undefined && (
        <div
          className={cn(
            "stat-card__trend",
            trendPositive && "stat-card__trend--up",
            trendNegative && "stat-card__trend--down"
          )}
        >
          <TrendIcon size={13} aria-hidden="true" />
          <span>{Math.abs(trend).toFixed(1)}% vs last period</span>
        </div>
      )}
    </div>
  );
}
