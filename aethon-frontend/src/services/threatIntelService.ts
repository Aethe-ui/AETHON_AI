import apiClient from './apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ThreatIntelResultSchema, type ThreatIntelResult } from '@/schemas/threatIntel';
import threatIntelMock from '../../mock/threat-intel.json';
import { detectIOCType } from '@/utils/helpers';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

export async function lookupThreatIntel(query: string): Promise<ThreatIntelResult> {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 800));
    return ThreatIntelResultSchema.parse({ ...threatIntelMock, query });
  }

  const iocType = detectIOCType(query);
  let endpoint: string;

  switch (iocType) {
    case 'ip':
      endpoint = ENDPOINTS.THREAT_INTEL_IP(query);
      break;
    case 'domain':
      endpoint = ENDPOINTS.THREAT_INTEL_DOMAIN(query);
      break;
    case 'url':
      endpoint = `${ENDPOINTS.THREAT_INTEL_URL}?url=${encodeURIComponent(query)}`;
      break;
    default:
      endpoint = ENDPOINTS.THREAT_INTEL_IP(query);
  }

  const { data } = await apiClient.get(endpoint);
  return ThreatIntelResultSchema.parse(data);
}
