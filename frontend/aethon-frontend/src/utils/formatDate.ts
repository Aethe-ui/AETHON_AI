import { format, formatDistanceToNow, parseISO } from "date-fns";

/** Format an ISO string to "Sep 5, 2026, 06:14" */
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy, HH:mm");
}

/** Format an ISO string to "Sep 5, 2026" */
export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

/** Format an ISO string to "2 hours ago" */
export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

/** Format an ISO string to "06:14:22 UTC" for timeline events */
export function formatTimestamp(iso: string): string {
  return format(parseISO(iso), "HH:mm:ss 'UTC'");
}
