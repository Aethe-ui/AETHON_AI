import apiClient from "./apiClient";
import { ThreatIntelResultSchema } from "../schemas/threatIntel";
import type { ThreatIntelResult } from "../types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export type QueryType = "ip" | "domain" | "url" | "hash";

export function detectQueryType(query: string): QueryType {
  if (/^[\da-f]{32,64}$/i.test(query)) return "hash";
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query)) return "ip";
  if (/^https?:\/\//i.test(query)) return "url";
  return "domain";
}

export async function fetchThreatIntel(query: string): Promise<ThreatIntelResult> {
  if (USE_MOCK) {
    const data = await import("../../mock/threat-intel.json");
    return ThreatIntelResultSchema.parse({ ...data.default, query });
  }
  const type = detectQueryType(query);
  const endpoint =
    type === "ip"
      ? `/api/threat-intel/ip/${encodeURIComponent(query)}`
      : type === "domain"
      ? `/api/threat-intel/domain/${encodeURIComponent(query)}`
      : `/api/threat-intel/url?q=${encodeURIComponent(query)}`;
  const res = await apiClient.get(endpoint);
  return ThreatIntelResultSchema.parse(res.data);
}
