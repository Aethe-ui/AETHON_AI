import { useState } from "react";
import { Search } from "lucide-react";
import { detectQueryType } from "../../services/threatIntelService";

interface IOCSearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function IOCSearchBar({ onSearch, loading }: IOCSearchBarProps) {
  const [query, setQuery] = useState("");
  const detectedType = query.trim() ? detectQueryType(query.trim()) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="ioc-search" role="search" aria-label="Threat intelligence search">
      <div className="ioc-search__input-wrap">
        <Search size={16} className="ioc-search__icon" aria-hidden="true" />
        <input
          id="ioc-search-input"
          type="text"
          className="ioc-search__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search IP, domain, URL, or hash…"
          aria-label="Search IP address, domain, URL, or file hash"
          autoComplete="off"
          spellCheck={false}
        />
        {detectedType && (
          <span className="ioc-search__type-hint" aria-live="polite">
            {detectedType.toUpperCase()}
          </span>
        )}
      </div>
      <button
        type="submit"
        className="btn btn--primary btn--md"
        disabled={!query.trim() || loading}
        aria-busy={loading}
      >
        {loading ? "Looking up…" : "Look up"}
      </button>
    </form>
  );
}
