import { useEffect, useRef, useState } from "react";
import { worldBankService } from "./services/worldBankService";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./MilitaryInventoryCompare.css";

type MetricType = "Arable Land" | "Freshwater Resources";

interface ResourceLineChartProps {
  metric: MetricType;
  onClose: () => void;
}

const METRIC_CONFIG: Record<
  MetricType,
  { title: string; unit: string; format: (v: number) => string }
> = {
  "Arable Land": {
    title: "Arable Land per Capita",
    unit: "ha/person",
    format: (v) => v.toFixed(2),
  },
  "Freshwater Resources": {
    title: "Freshwater Resources per Capita",
    unit: "m³/capita",
    format: (v) => v.toLocaleString(),
  },
};

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

interface CountryTimeSeries {
  code: string;
  name: string;
  dataPoints: { year: number; value: number }[];
}

function ResourceLineChart({ metric, onClose }: ResourceLineChartProps) {
  const config = METRIC_CONFIG[metric];
  const [allCountries, setAllCountries] = useState<
    { code: string; name: string; latestValue: number }[]
  >([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countryData, setCountryData] = useState<Record<string, CountryTimeSeries>>({});
  const [loading, setLoading] = useState(true);
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(new Set());
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    worldBankService
      .getIndicatorYearRange(metric, 1960, 2024)
      .then((data) => {
        // Build time series per country
        const byCountry: Record<
          string,
          { name: string; dataPoints: { year: number; value: number }[] }
        > = {};

        for (const [yearStr, entries] of Object.entries(data)) {
          const year = parseInt(yearStr);
          for (const entry of entries) {
            if (entry.value == null) continue;
            if (!byCountry[entry.countryCode]) {
              byCountry[entry.countryCode] = {
                name: entry.countryName,
                dataPoints: [],
              };
            }
            byCountry[entry.countryCode].dataPoints.push({ year, value: entry.value });
          }
        }

        // Sort data points by year
        for (const c of Object.values(byCountry)) {
          c.dataPoints.sort((a, b) => a.year - b.year);
        }

        // Rank by latest value
        const ranked = Object.entries(byCountry)
          .map(([code, { name, dataPoints }]) => {
            const latest = dataPoints[dataPoints.length - 1]?.value ?? 0;
            return { code, name, latestValue: latest, dataPoints };
          })
          .filter((c) => c.dataPoints.length > 0)
          .sort((a, b) => b.latestValue - a.latestValue);

        // Store all country data
        const dataMap: Record<string, CountryTimeSeries> = {};
        for (const r of ranked) {
          dataMap[r.code] = { code: r.code, name: r.name, dataPoints: r.dataPoints };
        }
        setCountryData(dataMap);

        // Set rankings for search
        setAllCountries(
          ranked.map((r) => ({ code: r.code, name: r.name, latestValue: r.latestValue }))
        );

        // Auto-select top 8
        const top8 = ranked.slice(0, 8).map((r) => r.code);
        setSelectedCountries(top8);
        setVisibleCountries(new Set(top8));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [metric]);

  const addCountry = (code: string) => {
    if (!selectedCountries.includes(code) && selectedCountries.length < 8) {
      setSelectedCountries((prev) => [...prev, code]);
      setVisibleCountries((prev) => new Set([...prev, code]));
    }
    setSearchQuery("");
    setShowSearch(false);
  };

  const removeCountry = (code: string) => {
    setSelectedCountries((prev) => prev.filter((c) => c !== code));
    setVisibleCountries((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  };

  const toggleCountry = (code: string) => {
    setVisibleCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const filteredRankings = allCountries.filter(
    (r) =>
      !selectedCountries.includes(r.code) &&
      (codeToCountryName[r.code] ?? r.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Chart dimensions
  const width = 700;
  const height = 400;
  const padding = { top: 20, right: 150, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Compute scales from selected + visible data
  const visibleData = selectedCountries
    .filter((code) => visibleCountries.has(code) && countryData[code])
    .map((code) => countryData[code]);

  const allValues = visibleData.flatMap((c) => c.dataPoints.map((d) => d.value));
  const allYears = visibleData.flatMap((c) => c.dataPoints.map((d) => d.year));
  const minYear = allYears.length > 0 ? Math.min(...allYears) : 1960;
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : 2024;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;
  const minValue = 0;

  const xScale = (year: number) =>
    maxYear === minYear
      ? padding.left + chartWidth / 2
      : ((year - minYear) / (maxYear - minYear)) * chartWidth + padding.left;

  const yScale = (value: number) =>
    maxValue === minValue
      ? padding.top + chartHeight / 2
      : chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight + padding.top;

  const createLinePath = (dataPoints: { year: number; value: number }[]) => {
    if (dataPoints.length === 0) return "";
    return dataPoints
      .map((point, i) => `${i === 0 ? "M" : "L"} ${xScale(point.year)} ${yScale(point.value)}`)
      .join(" ");
  };

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from(
    { length: yTicks },
    (_, i) => minValue + (i * (maxValue - minValue)) / (yTicks - 1)
  );

  // X-axis ticks every 10 years
  const xTickValues: number[] = [];
  for (let year = Math.ceil(minYear / 10) * 10; year <= maxYear; year += 10) {
    xTickValues.push(year);
  }

  return (
    <div className="mic-overlay" onClick={onClose}>
      <div className="mic-modal" style={{ width: 940 }} onClick={(e) => e.stopPropagation()}>
        <div className="mic-header">
          <div>
            <h2 className="mic-title">{config.title}</h2>
            <p className="mic-subtitle">Comparison over time ({config.unit})</p>
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
                placeholder="Search country..."
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

        {/* Chart */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#888", padding: "32px 0" }}>Loading...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <svg
              width={width}
              height={height}
              style={{ display: "block", margin: "0 auto" }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredCountry(null)}
            >
              {/* Y-axis */}
              <line
                x1={padding.left}
                y1={padding.top}
                x2={padding.left}
                y2={height - padding.bottom}
                stroke="#666"
                strokeWidth="1"
              />
              {/* X-axis */}
              <line
                x1={padding.left}
                y1={height - padding.bottom}
                x2={width - padding.right}
                y2={height - padding.bottom}
                stroke="#666"
                strokeWidth="1"
              />

              {/* Y-axis ticks + grid */}
              {yTickValues.map((value) => (
                <g key={value}>
                  <line
                    x1={padding.left}
                    y1={yScale(value)}
                    x2={width - padding.right}
                    y2={yScale(value)}
                    stroke="#333"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <line
                    x1={padding.left - 5}
                    y1={yScale(value)}
                    x2={padding.left}
                    y2={yScale(value)}
                    stroke="#666"
                  />
                  <text
                    x={padding.left - 10}
                    y={yScale(value)}
                    textAnchor="end"
                    fill="#fff"
                    fontSize="11"
                    dominantBaseline="middle"
                  >
                    {config.format(value)}
                  </text>
                </g>
              ))}

              {/* X-axis ticks */}
              {xTickValues.map((year) => (
                <g key={year}>
                  <line
                    x1={xScale(year)}
                    y1={height - padding.bottom}
                    x2={xScale(year)}
                    y2={height - padding.bottom + 5}
                    stroke="#666"
                  />
                  <text
                    x={xScale(year)}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="11"
                  >
                    {year}
                  </text>
                </g>
              ))}

              {/* Lines */}
              {selectedCountries.map((code, i) => {
                const series = countryData[code];
                if (!series || !visibleCountries.has(code)) return null;
                const path = createLinePath(series.dataPoints);
                const color = COUNTRY_COLORS[i % COUNTRY_COLORS.length];
                return (
                  <g key={code}>
                    <path
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="10"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredCountry(code)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke={color}
                      strokeWidth={hoveredCountry === code ? 3 : 2}
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                );
              })}

              {/* Legend */}
              {selectedCountries.map((code, index) => {
                const name = codeToCountryName[code] ?? code;
                const color = COUNTRY_COLORS[index % COUNTRY_COLORS.length];
                return (
                  <g
                    key={code}
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleCountry(code)}
                    opacity={visibleCountries.has(code) ? 1 : 0.3}
                  >
                    <line
                      x1={width - padding.right + 10}
                      y1={padding.top + index * 20}
                      x2={width - padding.right + 30}
                      y2={padding.top + index * 20}
                      stroke={color}
                      strokeWidth="2"
                    />
                    <text
                      x={width - padding.right + 35}
                      y={padding.top + index * 20}
                      fill="#fff"
                      fontSize="11"
                      dominantBaseline="middle"
                    >
                      {name}
                    </text>
                  </g>
                );
              })}

              {/* Tooltip */}
              {hoveredCountry && (
                <g>
                  <rect
                    x={tooltipPos.x + 10}
                    y={tooltipPos.y - 15}
                    width={(codeToCountryName[hoveredCountry] ?? hoveredCountry).length * 7 + 10}
                    height={20}
                    fill="rgba(48, 48, 48, 0.95)"
                    stroke="#9cc837"
                    strokeWidth="1"
                    rx="4"
                  />
                  <text
                    x={tooltipPos.x + 15}
                    y={tooltipPos.y}
                    fill="#fff"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {codeToCountryName[hoveredCountry] ?? hoveredCountry}
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceLineChart;
