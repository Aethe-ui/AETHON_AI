import { useQuery } from "@tanstack/react-query";
import { fetchThreatIntel } from "../services/threatIntelService";

export function useThreatIntel(query: string | undefined) {
  return useQuery({
    queryKey: ["threat-intel", query],
    queryFn: () => fetchThreatIntel(query!),
    enabled: Boolean(query && query.trim().length > 0),
    staleTime: 300_000, // Threat intel is relatively stable — 5 min cache
  });
}
