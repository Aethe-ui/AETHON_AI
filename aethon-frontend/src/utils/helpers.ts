import { CaseSeverity, CaseStatus } from '@/schemas/case';

/** Map severity to the correct CSS custom property color */
export function riskColor(severity: CaseSeverity): string {
  const map: Record<CaseSeverity, string> = {
    critical: 'var(--risk-critical)',
    high: 'var(--risk-high)',
    medium: 'var(--risk-medium)',
    low: 'var(--risk-low)',
  };
  return map[severity];
}

/** Map severity to chip CSS class */
export function severityChipClass(severity: CaseSeverity): string {
  return `chip chip-${severity}`;
}

/** Map status to chip CSS class */
export function statusChipClass(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    open: 'chip chip-open',
    needs_review: 'chip chip-needs-review',
    confirmed: 'chip chip-confirmed',
    closed: 'chip chip-closed',
  };
  return map[status];
}

/** Map severity to left-border class for table rows */
export function severityBorderClass(severity: CaseSeverity): string {
  return `severity-border-${severity}`;
}

/** Format status for display */
export function formatStatus(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    open: 'Open',
    needs_review: 'Needs review',
    confirmed: 'Confirmed',
    closed: 'Closed',
  };
  return map[status];
}

/** Format a date string for display */
export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Format date with time */
export function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

/** Combine class names (simple clsx alternative) */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Detect IOC type from a query string */
export function detectIOCType(query: string): 'ip' | 'domain' | 'url' | 'hash' | 'unknown' {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(query)) return 'ip';
  // IPv6 (simplified)
  if (/^[0-9a-fA-F:]+$/.test(query) && query.includes(':')) return 'ip';
  // URL
  if (/^https?:\/\//.test(query)) return 'url';
  // Hash (MD5, SHA1, SHA256)
  if (/^[a-fA-F0-9]{32}$/.test(query)) return 'hash';
  if (/^[a-fA-F0-9]{40}$/.test(query)) return 'hash';
  if (/^[a-fA-F0-9]{64}$/.test(query)) return 'hash';
  // Domain
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(query)) return 'domain';
  return 'unknown';
}
