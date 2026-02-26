import { useEffect, useRef, useState } from "react";
import { gfpService, type GfpCountryDetail, type GfpRanking } from "./services/gfpService";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./MilitaryInventoryCompare.css";

interface ActivePersonnelCompareProps {
  onClose: () => void;
}

const DEFAULT_COUNTRIES = ["CHN", "IND", "USA", "RUS", "PRK", "PAK", "KOR"];

const COUNTRY_COLORS = [
  "#9cc837",
  "#ff6b6b",
  "#45b7d1",
  "#f9ca24",
  "#fd79a8",
  "#74b9ff",
  "#26de81",
  "#ff9f43",
  "#a55eea",
  "#55efc4",
  "#e17055",
  "#00b894",
];

interface MetricDef {
  key: string;
  label: string;
  get: (d: GfpCountryDetail) => number | null;
}

const METRICS: MetricDef[] = [
  {
    key: "total",
    label: "Total",
    get: (d) => {
      const sum = (d.manpower.army ?? 0) + (d.manpower.airForce ?? 0) + (d.manpower.navy ?? 0);
      return sum > 0 ? sum : null;
    },
  },
  { key: "army", label: "Army", get: (d) => d.manpower.army },
  { key: "airForce", label: "Air Force", get: (d) => d.manpower.airForce },
  { key: "navy", label: "Navy", get: (d) => d.manpower.navy },
];

function fmt(value: number | null): string {
  if (value === null || value === undefined) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return `${value}`;
}

function ActivePersonnelCompare({ onClose }: ActivePersonnelCompareProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(DEFAULT_COUNTRIES);
  const [details, setDetails] = useState<Record<string, GfpCountryDetail>>({});
  const [loadingCountries, setLoadingCountries] = useState<Set<string>>(new Set());
  const [rankings, setRankings] = useState<GfpRanking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeMetricKey, setActiveMetricKey] = useState("total");
  const searchRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef<Set<string>>(new Set<string>());

  useEffect(() => {
    gfpService.fetchRankings().then(setRankings).catch(console.error);
  }, []);

  useEffect(() => {
    const toFetch = selectedCountries.filter((code) => !fetchedRef.current.has(code));
    if (toFetch.length === 0) return;
    toFetch.forEach((c) => fetchedRef.current.add(c));
    setLoadingCountries((prev) => new Set([...prev, ...toFetch]));
    Promise.allSettled(
      toFetch.map((code) => gfpService.fetchCountryDetail(code).then((d) => ({ code, d })))
    ).then((results) => {
      const newDetails: Record<string, GfpCountryDetail> = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") newDetails[r.value.code] = r.value.d;
      });
      setDetails((prev) => ({ ...prev, ...newDetails }));
      setLoadingCountries((prev) => {
        const next = new Set(prev);
        toFetch.forEach((c) => next.delete(c));
        return next;
      });
    });
  }, [selectedCountries]);

  const addCountry = (code: string) => {
    if (!selectedCountries.includes(code) && selectedCountries.length < 12) {
      setSelectedCountries((prev) => [...prev, code]);
    }
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeCountry = (code: string) => {
    setSelectedCountries((prev) => prev.filter((c) => c !== code));
  };

  const filteredRankings = rankings.filter(
    (r) =>
      !selectedCountries.includes(r.countryCode) &&
      (codeToCountryName[r.countryCode] ?? r.countryCode)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const metricDef = METRICS.find((m) => m.key === activeMetricKey) ?? METRICS[0];

  const barData = selectedCountries
    .map((code, i) => ({
      code,
      name: codeToCountryName[code] ?? code,
      color: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
      value: details[code] ? metricDef.get(details[code]) : null,
      loading: loadingCountries.has(code),
    }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));

  const maxValue = Math.max(...barData.map((d) => d.value ?? 0), 1);

  return (
    <div className="mic-overlay" onClick={onClose}>
      <div className="mic-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mic-header">
          <div>
            <h2 className="mic-title">Active Military Personnel — Country Comparison</h2>
            <p className="mic-subtitle">Global Firepower {new Date().getFullYear()}</p>
          </div>
          <button className="mic-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Country selector */}
        <div className="mic-selector">
          <div className="mic-chips">
            {selectedCountries.map((code, i) => (
              <span
                key={code}
                className="mic-chip"
                style={{ borderColor: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }}
              >
                <span
                  className="mic-chip-dot"
                  style={{ background: COUNTRY_COLORS[i % COUNTRY_COLORS.length] }}
                />
                {codeToCountryName[code] ?? code}
                <button
                  className="mic-chip-remove"
                  onClick={() => removeCountry(code)}
                  aria-label={`Remove ${code}`}
                >
                  ×
                </button>
              </span>
            ))}
            {selectedCountries.length < 12 && (
              <button
                className="mic-add-btn"
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchRef.current?.focus(), 50);
                }}
              >
                + Add country
              </button>
            )}
          </div>
          {showSearch && (
            <div className="mic-search-wrap">
              <input
                ref={searchRef}
                className="mic-search"
                placeholder="Search country…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  setTimeout(() => setShowSearch(false), 150);
                }}
              />
              {filteredRankings.length > 0 && (
                <div className="mic-search-dropdown">
                  {filteredRankings.slice(0, 10).map((r) => (
                    <button
                      key={r.countryCode}
                      className="mic-search-option"
                      onMouseDown={() => addCountry(r.countryCode)}
                    >
                      <span>{codeToCountryName[r.countryCode] ?? r.countryCode}</span>
                      <span className="mic-search-rank">#{r.rank}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metric tabs */}
        <div className="mic-sections">
          <section className="mic-section">
            <h3 className="mic-section-title">Personnel</h3>
            <div className="mic-metric-tabs">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  className={`mic-metric-tab ${activeMetricKey === m.key ? "active" : ""}`}
                  onClick={() => setActiveMetricKey(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="mic-bar-chart">
              {barData.map((d) => (
                <div key={d.code} className="mic-bar-row">
                  <span className="mic-bar-label" title={d.name}>
                    {d.name}
                  </span>
                  <div className="mic-bar-track">
                    <div
                      className="mic-bar"
                      style={{
                        width:
                          d.value !== null && d.value > 0 ? `${(d.value / maxValue) * 100}%` : "0%",
                        background: d.color,
                      }}
                    />
                  </div>
                  <span className="mic-bar-value">{d.loading ? "…" : fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ActivePersonnelCompare;
