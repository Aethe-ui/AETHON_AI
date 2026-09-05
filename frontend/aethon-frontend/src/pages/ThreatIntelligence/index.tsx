import { useState } from "react";
import { Shield } from "lucide-react";
import { IOCSearchBar } from "../../components/threat/IOCSearchBar";
import { ReputationPanel } from "../../components/threat/ReputationPanel";
import { useThreatIntel } from "../../hooks/useThreatIntel";

export function ThreatIntelligencePage() {
  const [query, setQuery] = useState<string | undefined>(undefined);
  const { data, isLoading, error } = useThreatIntel(query);

  return (
    <div className="page threat-intel-page">
      <div className="page__header">
        <h1 className="page__title">
          <Shield size={20} aria-hidden="true" />
          Threat Intelligence
        </h1>
        <p className="page__subtitle">
          Look up an IP address, domain, URL, or file hash to view reputation, ASN, and related cases.
        </p>
      </div>

      <IOCSearchBar onSearch={setQuery} loading={isLoading} />

      <div className="threat-intel-result" aria-live="polite" aria-atomic="true">
        {isLoading && (
          <div className="page-loading" aria-label="Looking up threat intelligence…">
            <div className="page-loading__spinner" />
            <p>Querying threat intelligence sources…</p>
          </div>
        )}

        {error && (
          <div className="page-error" role="alert">
            <p>
              Threat intelligence lookup failed — retry or continue without enrichment.
            </p>
            <button className="btn btn--secondary btn--sm" onClick={() => setQuery(undefined)}>
              Clear
            </button>
          </div>
        )}

        {data && !isLoading && <ReputationPanel result={data} />}

        {!query && !data && !isLoading && (
          <div className="empty-state">
            <Shield size={40} className="empty-state__icon" aria-hidden="true" />
            <p className="empty-state__title">Enter an indicator to look up</p>
            <p className="empty-state__body">
              Supports IPv4/IPv6 addresses, domain names, full URLs, and MD5/SHA1/SHA256 hashes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
