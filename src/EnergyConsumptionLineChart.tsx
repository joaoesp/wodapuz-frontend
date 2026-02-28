import { useEffect, useState } from "react";
import { owidService } from "./services/owidService";
import "./GdpLineChart.css";

interface EnergyConsumptionLineChartProps {
  onClose: () => void;
}

interface CountryData {
  name: string;
  color: string;
  dataPoints: { year: number; value: number }[];
}

const COLORS = [
  "#ff6b6b",
  "#9cc837",
  "#4ecdc4",
  "#45b7d1",
  "#f9ca24",
  "#6c5ce7",
  "#fd79a8",
  "#26de81",
  "#ff9f43",
  "#a29bfe",
  "#00b894",
  "#74b9ff",
  "#e17055",
  "#fdcb6e",
  "#55efc4",
  "#d63031",
  "#0984e3",
  "#c56af9",
  "#43a047",
  "#fb8c00",
];

function formatTwh(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k TWh`;
  return `${Math.round(v)} TWh`;
}

function EnergyConsumptionLineChart({ onClose }: EnergyConsumptionLineChartProps) {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(new Set());
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const rawData = await owidService.fetchConsumptionYearRange(1965, 2025);

        const byCountry: Record<string, { name: string; points: Map<number, number> }> = {};
        for (const [yearStr, entries] of Object.entries(rawData)) {
          const year = parseInt(yearStr);
          if (year > 2024) continue;
          for (const entry of entries) {
            if (!byCountry[entry.countryCode]) {
              byCountry[entry.countryCode] = { name: entry.countryName, points: new Map() };
            }
            byCountry[entry.countryCode].points.set(year, entry.value);
          }
        }

        const ranked = Object.entries(byCountry)
          .map(([, { name, points }]) => {
            const sortedYears = [...points.keys()].sort((a, b) => a - b);
            const latestValue = points.get(sortedYears[sortedYears.length - 1]) ?? 0;
            const dataPoints = sortedYears.map((y) => ({ year: y, value: points.get(y) ?? 0 }));
            return { name, latestValue, dataPoints };
          })
          .sort((a, b) => b.latestValue - a.latestValue)
          .slice(0, 20);

        const countries: CountryData[] = ranked.map((c, i) => ({
          name: c.name,
          color: COLORS[i],
          dataPoints: c.dataPoints,
        }));

        setCountryData(countries);
        setVisibleCountries(new Set(countries.map((c) => c.name)));
      } catch (error) {
        console.error("Error fetching energy consumption data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleCountry = (name: string) => {
    setVisibleCountries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  if (loading) {
    return (
      <div className="gdp-line-chart">
        <div className="chart-loading">Loading chart...</div>
      </div>
    );
  }

  if (countryData.length === 0) return null;

  const width = 700;
  const height = 420;
  const padding = { top: 20, right: 155, bottom: 40, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allYears = countryData.flatMap((c) => c.dataPoints.map((d) => d.year));
  const startYear = Math.min(...allYears);
  const endYear = Math.max(...allYears);

  const allValues = countryData.flatMap((c) => c.dataPoints.map((d) => d.value));
  const maxValue = Math.max(...allValues);
  const minNonZero = Math.min(...allValues.filter((v) => v > 0));

  const logMin = Math.log10(Math.max(1, minNonZero));
  const logMax = Math.log10(maxValue);

  const xScale = (year: number) =>
    ((year - startYear) / (endYear - startYear)) * chartWidth + padding.left;

  const yScale = (value: number) => {
    if (value <= 0) return height - padding.bottom;
    const logVal = Math.log10(value);
    return chartHeight - ((logVal - logMin) / (logMax - logMin)) * chartHeight + padding.top;
  };

  const createLinePath = (dataPoints: { year: number; value: number }[]) => {
    const valid = dataPoints.filter((p) => p.value > 0);
    return valid
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year)} ${yScale(p.value)}`)
      .join(" ");
  };

  const yTickValues: number[] = [];
  for (let pow = Math.floor(logMin); pow <= Math.ceil(logMax); pow++) {
    yTickValues.push(Math.pow(10, pow));
  }

  const xTickInterval = 10;
  const xTickValues: number[] = [startYear];
  for (
    let y = Math.ceil(startYear / xTickInterval) * xTickInterval;
    y < endYear;
    y += xTickInterval
  ) {
    if (y > startYear) xTickValues.push(y);
  }
  if (!xTickValues.includes(endYear)) xTickValues.push(endYear);

  return (
    <div className="gdp-line-chart">
      <div className="chart-header">
        <h3 className="chart-title">Top 20 Energy Consumers</h3>
        <button className="close-button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="chart-container">
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCountry(null)}
        >
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#666"
            strokeWidth="1"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#666"
            strokeWidth="1"
          />

          {yTickValues.map((v) => (
            <g key={v}>
              <line
                x1={padding.left - 5}
                y1={yScale(v)}
                x2={padding.left}
                y2={yScale(v)}
                stroke="#666"
              />
              <text
                x={padding.left - 8}
                y={yScale(v)}
                textAnchor="end"
                fill="#fff"
                fontSize="10"
                dominantBaseline="middle"
              >
                {formatTwh(v)}
              </text>
              <line
                x1={padding.left}
                y1={yScale(v)}
                x2={width - padding.right}
                y2={yScale(v)}
                stroke="#333"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          ))}

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

          {countryData
            .filter((c) => visibleCountries.has(c.name))
            .map((country) => {
              const path = createLinePath(country.dataPoints);
              return (
                <g key={country.name}>
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="10"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredCountry(country.name)}
                    onMouseLeave={() => setHoveredCountry(null)}
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={country.color}
                    strokeWidth={hoveredCountry === country.name ? 3 : 1.5}
                    style={{ pointerEvents: "none" }}
                  />
                </g>
              );
            })}

          {countryData.map((country, index) => {
            const lx = width - padding.right + 10;
            const ly = padding.top + index * 18;
            const isVisible = visibleCountries.has(country.name);
            return (
              <g
                key={country.name}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCountry(country.name)}
                opacity={isVisible ? 1 : 0.3}
              >
                <line x1={lx} y1={ly} x2={lx + 16} y2={ly} stroke={country.color} strokeWidth="2" />
                <text x={lx + 21} y={ly} fill="#fff" fontSize="10" dominantBaseline="middle">
                  {country.name}
                </text>
              </g>
            );
          })}

          {hoveredCountry && (
            <g>
              <rect
                x={tooltipPos.x + 10}
                y={tooltipPos.y - 15}
                width={hoveredCountry.length * 7 + 10}
                height={20}
                fill="rgba(48,48,48,0.95)"
                stroke="#4ecdc4"
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
                {hoveredCountry}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export default EnergyConsumptionLineChart;
