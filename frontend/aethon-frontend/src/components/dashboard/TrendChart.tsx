import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DashboardStats } from "../../types";

interface TrendChartProps {
  data: DashboardStats["detectionTrend"];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__label">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="chart-tooltip__row">
            <span>{p.name}: </span>
            <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--border-subtle)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)" }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name="Emails Analyzed"
          stroke="var(--text-muted)"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 4, fill: "var(--text-secondary)" }}
        />
        <Line
          type="monotone"
          dataKey="threats"
          name="Threats Detected"
          stroke="var(--accent-signal)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "var(--accent-signal)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
