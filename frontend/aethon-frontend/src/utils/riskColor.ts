import type { CaseSeverityType } from "../types";

/** Returns a CSS class name corresponding to the risk severity level */
export function riskColorClass(severity: CaseSeverityType): string {
  switch (severity) {
    case "critical": return "risk-critical";
    case "high":     return "risk-high";
    case "medium":   return "risk-medium";
    case "low":      return "risk-low";
    default:         return "risk-low";
  }
}

/** Returns the CSS variable value string for inline styles */
export function riskColorVar(severity: CaseSeverityType): string {
  switch (severity) {
    case "critical": return "var(--risk-critical)";
    case "high":     return "var(--risk-high)";
    case "medium":   return "var(--risk-medium)";
    case "low":      return "var(--risk-low)";
    default:         return "var(--risk-low)";
  }
}

/** Returns a human-readable label for a severity level */
export function riskLabel(severity: CaseSeverityType): string {
  return severity.toUpperCase();
}
