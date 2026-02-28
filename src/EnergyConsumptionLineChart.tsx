import { useEffect, useRef, useState } from "react";
import { owidService, type CountryConsumptionData } from "./services/owidService";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./MilitaryInventoryCompare.css";

interface EnergyConsumptionLineChartProps {
  onClose: () => void;
}

const SOURCES = [
  { key: "coal" as const, label: "Coal", color: "#6b7280" },
  { key: "oil" as const, label: "Oil", color: "#b91c1c" },
  { key: "gas" as const, label: "Gas", color: "#f97316" },
  { key: "nuclear" as const, label: "Nuclear", color: "#a855f7" },
  { key: "hydro" as const, label: "Hydro", color: "#3b82f6" },
  { key: "wind" as const, label: "Wind", color: "#22d3ee" },
  { key: "solar" as const, label: "Solar", color: "#eab308" },
  { key: "biofuel" as const, label: "Biofuel", color: "#22c55e" },
  { key: "otherRenewable" as const, label: "Other Renew.", color: "#14b8a6" },
];

type SourceKey = (typeof SOURCES)[number]["key"];

const COUNTRY_COLORS = [
  "#9cc837",
  "#ff6b6b",
  "#45b7d1",
  "#f9ca24",
  "#fd79a8",
  "#74b9ff",
  "#26de81",
  "#ff9f43",
];

interface RankEntry {
  code: string;
  name: string;
}

function StackedAreaChart({ data }: { data: CountryConsumptionData }) {
  const W = 280;
  const H = 160;
  const padL = 30;
  const padR = 4;
  const padT = 4;
  const padB = 24;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Find years with valid total data
  const validIndices: number[] = [];
  for (let i = 0; i < data.years.length; i++) {
    if (data.total[i] !== null && data.total[i]! > 0) {
      validIndices.push(i);
    }
  }

  if (validIndices.length < 2) {
    return (
      <div style={{ color: "#666", fontSize: 12, textAlign: "center", padding: "40px 0" }}>
        No data
      </div>
    );
  }

  const years = validIndices.map((i) => data.years[i]);
  const minYear = years[0];
  const maxYear = years[years.length - 1];

  const x = (year: number) =>
    maxYear === minYear
      ? padL + innerW / 2
      : padL + ((year - minYear) / (maxYear - minYear)) * innerW;

  const y = (pct: number) => padT + innerH - (pct / 100) * innerH;

  // Compute stacked percentages per year
  const stackedData = validIndices.map((idx) => {
    const total = data.total[idx] ?? 1;
    const values: Record<SourceKey, number> = {} as Record<SourceKey, number>;
    for (const s of SOURCES) {
      values[s.key] = ((data[s.key][idx] ?? 0) / total) * 100;
    }
    return { year: data.years[idx], values };
  });

  // Build area paths (stacked bottom to top)
  const areas: { key: string; color: string; path: string }[] = [];
  for (let si = 0; si < SOURCES.length; si++) {
    const source = SOURCES[si];
    const topPoints: string[] = [];
    const bottomPoints: string[] = [];
    for (const d of stackedData) {
      let bottom = 0;
      for (let j = 0; j < si; j++) {
        bottom += d.values[SOURCES[j].key];
      }
      const top = bottom + d.values[source.key];
      topPoints.push(`${x(d.year)},${y(top)}`);
      bottomPoints.push(`${x(d.year)},${y(bottom)}`);
    }
    const path = `M ${topPoints.join(" L ")} L ${bottomPoints.reverse().join(" L ")} Z`;
    areas.push({ key: source.key, color: source.color, path });
  }

  // X-axis ticks
  const span = maxYear - minYear;
  const step = span <= 20 ? 5 : span <= 40 ? 10 : 20;
  const xTicks = years.filter((yr) => yr === minYear || yr === maxYear || yr % step === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {/* Y axis */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#444" strokeWidth={1} />
      <line
        x1={padL}
        y1={padT + innerH}
        x2={padL + innerW}
        y2={padT + innerH}
        stroke="#444"
        strokeWidth={1}
      />
      {[0, 25, 50, 75, 100].map((pct) => (
        <g key={pct}>
          <line
            x1={padL}
            y1={y(pct)}
            x2={padL + innerW}
            y2={y(pct)}
            stroke="#333"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
          <text x={padL - 4} y={y(pct) + 3} textAnchor="end" fontSize={8} fill="#666">
            {pct}%
          </text>
        </g>
      ))}
      {/* Stacked areas */}
      {areas.map((a) => (
        <path key={a.key} d={a.path} fill={a.color} fillOpacity={0.8} />
      ))}
      {/* X ticks */}
      {xTicks.map((yr) => (
        <text
          key={yr}
          x={x(yr)}
          y={padT + innerH + 14}
          textAnchor="middle"
          fontSize={8}
          fill="#666"
        >
          {yr}
        </text>
      ))}
    </svg>
  );
}

function EnergyConsumptionLineChart({ onClose }: EnergyConsumptionLineChartProps) {
  const [allRankings, setAllRankings] = useState<RankEntry[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryData, setCountryData] = useState<Record<string, CountryConsumptionData>>({});
  const [loadingCountries, setLoadingCountries] = useState<Set<string>>(new Set());
  const [initLoading, setInitLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef<Set<string>>(new Set());

  // Load rankings and determine top 5
  useEffect(() => {
    owidService
      .fetchConsumptionYearRange(1965, 2025)
      .then((rawData) => {
        const byCountry: Record<string, { name: string; latest: number }> = {};
        for (const [yearStr, entries] of Object.entries(rawData)) {
          const year = parseInt(yearStr);
          if (year > 2024) continue;
          for (const entry of entries) {
            if (!byCountry[entry.countryCode] || year > 0) {
              const existing = byCountry[entry.countryCode];
              if (!existing || entry.value > (existing.latest ?? 0)) {
                byCountry[entry.countryCode] = { name: entry.countryName, latest: entry.value };
              }
            }
          }
        }
        const ranked = Object.entries(byCountry)
          .map(([code, { name, latest }]) => ({ code, name, latest }))
          .sort((a, b) => b.latest - a.latest);

        setAllRankings(ranked.map((r) => ({ code: r.code, name: r.name })));
        setSelectedCountries(ranked.slice(0, 5).map((r) => r.code));
        setInitLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setInitLoading(false);
      });
  }, []);

  // Fetch consumption data for newly selected countries
  useEffect(() => {
    const toFetch = selectedCountries.filter((code) => !fetchedRef.current.has(code));
    if (toFetch.length === 0) return;
    toFetch.forEach((c) => fetchedRef.current.add(c));
    setLoadingCountries((prev) => new Set([...prev, ...toFetch]));
    Promise.allSettled(
      toFetch.map((code) => owidService.fetchCountryConsumption(code).then((d) => ({ code, d })))
    ).then((results) => {
      const newData: Record<string, CountryConsumptionData> = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") newData[r.value.code] = r.value.d;
      });
      setCountryData((prev) => ({ ...prev, ...newData }));
      setLoadingCountries((prev) => {
        const next = new Set(prev);
        toFetch.forEach((c) => next.delete(c));
        return next;
      });
    });
  }, [selectedCountries]);

  const addCountry = (code: string) => {
    if (!selectedCountries.includes(code) && selectedCountries.length < 8) {
      setSelectedCountries((prev) => [...prev, code]);
    }
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeCountry = (code: string) => {
    setSelectedCountries((prev) => prev.filter((c) => c !== code));
  };

  const filteredRankings = allRankings.filter(
    (r) =>
      !selectedCountries.includes(r.code) &&
      (codeToCountryName[r.code] ?? r.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mic-overlay" onClick={onClose}>
      <div className="mic-modal" style={{ width: 940 }} onClick={(e) => e.stopPropagation()}>
        <div className="mic-header">
          <div>
            <h2 className="mic-title">Energy Consumption Over Time</h2>
            <p className="mic-subtitle">Source breakdown as % of total consumption over time</p>
          </div>
          <button className="mic-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Shared legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 4 }}>
          {SOURCES.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: "#aaa" }}>{s.label}</span>
            </div>
          ))}
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
            {selectedCountries.length < 8 && (
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
                      key={r.code}
                      className="mic-search-option"
                      onMouseDown={() => addCountry(r.code)}
                    >
                      {codeToCountryName[r.code] ?? r.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chart grid */}
        {initLoading ? (
          <div style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Loading…</div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {selectedCountries.map((code) => {
              const data = countryData[code];
              const isLoading = loadingCountries.has(code);
              return (
                <div
                  key={code}
                  style={{
                    width: "calc((100% - 32px) / 3)",
                    minWidth: 200,
                    background: "#1e1e1e",
                    borderRadius: 10,
                    padding: "10px 12px 8px",
                    border: "1px solid #2e2e2e",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ddd",
                      marginBottom: 6,
                    }}
                  >
                    {codeToCountryName[code] ?? code}
                  </div>
                  {isLoading ? (
                    <div
                      style={{
                        color: "#666",
                        fontSize: 12,
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      Loading…
                    </div>
                  ) : data ? (
                    <StackedAreaChart data={data} />
                  ) : (
                    <div
                      style={{
                        color: "#666",
                        fontSize: 12,
                        textAlign: "center",
                        padding: "40px 0",
                      }}
                    >
                      No data
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EnergyConsumptionLineChart;
