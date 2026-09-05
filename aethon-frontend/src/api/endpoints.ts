// §8.1 — API endpoint constants aligned with the FastAPI backend
export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',

  // Email Analysis
  EMAILS_ANALYZE: '/emails/analyze',

  // Investigations / Cases
  INVESTIGATIONS: '/investigations',
  INVESTIGATION_BY_ID: (id: string) => `/investigations/${id}`,

  // Threat Intelligence
  THREAT_INTEL_IP: (ip: string) => `/threat-intel/ip/${ip}`,
  THREAT_INTEL_DOMAIN: (domain: string) => `/threat-intel/domain/${domain}`,
  THREAT_INTEL_URL: '/threat-intel/url',

  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',

  // Reports
  REPORTS_GENERATE: '/reports/generate',
  REPORTS_LIST: '/reports',
} as const;
