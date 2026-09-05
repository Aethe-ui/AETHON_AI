import { cn } from "../../utils/classNames";
import { riskColorClass } from "../../utils/riskColor";
import type { CaseSeverityType, CaseStatusType } from "../../types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "severity" | "status" | "verdict";
  severity?: CaseSeverityType;
  status?: CaseStatusType;
  className?: string;
}

const STATUS_LABEL: Record<CaseStatusType, string> = {
  open: "Open",
  needs_review: "Needs Review",
  confirmed: "Confirmed",
  closed: "Closed",
};

export function Badge({ children, variant = "default", severity, status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        variant === "severity" && severity && `badge--${riskColorClass(severity)}`,
        variant === "status" && `badge--status-${status}`,
        className
      )}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: CaseSeverityType }) {
  return (
    <Badge variant="severity" severity={severity}>
      {severity.toUpperCase()}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: CaseStatusType }) {
  return (
    <Badge variant="status" status={status}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
