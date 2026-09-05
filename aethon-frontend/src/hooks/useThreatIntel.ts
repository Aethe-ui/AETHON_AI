import { useQuery } from '@tanstack/react-query';
import { lookupThreatIntel } from '@/services/threatIntelService';

export function useThreatIntel(query: string) {
  return useQuery({
    queryKey: ['threat-intel', query],
    queryFn: () => lookupThreatIntel(query),
    enabled: !!query && query.length > 2,
    staleTime: 300000, // Cache for 5 minutes
  });
}
