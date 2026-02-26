import { useEffect, useState } from "react";
import "./GdpLineChart.css";

interface InflationLineChartProps {
  startYear: number;
  endYear: number;
  onClose: () => void;
}

interface CountryData {
  name: string;
  color: string;
  dataPoints: { year: number; value: number }[];
}

const G20_COUNTRIES = [
  { code: "USA", name: "United States", color: "#9cc837" },
  { code: "CHN", name: "China", color: "#ff6b6b" },
  { code: "JPN", name: "Japan", color: "#ff9f43" },
  { code: "DEU", name: "Germany", color: "#45b7d1" },
  { code: "IND", name: "India", color: "#f9ca24" },
  { code: "GBR", name: "United Kingdom", color: "#6c5ce7" },
  { code: "FRA", name: "France", color: "#fd79a8" },
  { code: "BRA", name: "Brazil", color: "#26de81" },
  { code: "ITA", name: "Italy", color: "#00b894" },
  { code: "CAN", name: "Canada", color: "#a55eea" },
  { code: "KOR", name: "South Korea", color: "#e17055" },
  { code: "RUS", name: "Russia", color: "#74b9ff" },
  { code: "AUS", name: "Australia", color: "#ff2929" },
  { code: "MEX", name: "Mexico", color: "#55efc4" },
  { code: "IDN", name: "Indonesia", color: "#ffeaa7" },
  { code: "TUR", name: "Turkey", color: "#ff7675" },
  { code: "SAU", name: "Saudi Arabia", color: "#fab1a0" },
  { code: "ARG", name: "Argentina", color: "#a29bfe" },
  { code: "ZAF", name: "South Africa", color: "#fdcb6e" },
];

function InflationLineChart({ startYear, endYear, onClose }: InflationLineChartProps) {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(new Set());
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:1337/api/world-bank/inflation/years/${startYear}/${endYear}`
        );
        if (!response.ok) throw new Error("Failed to fetch Inflation data");
        const data = await response.json();

        const countries: CountryData[] = [];

        G20_COUNTRIES.forEach((country) => {
          const dataPoints: { year: number; value: number }[] = [];
          for (let year = startYear; year <= endYear; year++) {
            const yearData = data[year.toString()];
            if (yearData) {
              const entry = yearData.find(
                (item: { countryCode: string; value: number }) => item.countryCode === country.code
              );
              if (entry && entry.value != null) {
                dataPoints.push({ year, value: entry.value });
              }
            }
          }
          if (dataPoints.length > 0) {
            countries.push({ name: country.name, color: country.color, dataPoints });
          }
        });

        // Sort by average absolute inflation descending, take top 10
        countries.sort((a, b) => {
          const aAvg =
            a.dataPoints.reduce((s, d) => s + Math.abs(d.value), 0) / a.dataPoints.length;
          const bAvg =
            b.dataPoints.reduce((s, d) => s + Math.abs(d.value), 0) / b.dataPoints.length;
          return bAvg - aAvg;
        });

        const top10 = countries.slice(0, 10);
        setCountryData(top10);
        setVisibleCountries(new Set(top10.map((c) => c.name)));
      } catch (error) {
        console.error("Error fetching Inflation data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startYear, endYear]);

  const toggleCountry = (countryName: string) => {
    setVisibleCountries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(countryName)) {
        newSet.delete(countryName);
      } else {
        newSet.add(countryName);
      }
      return newSet;
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
  const height = 400;
  const padding = { top: 20, right: 150, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = countryData.flatMap((c) => c.dataPoints.map((d) => d.value));
  const rawMax = Math.max(...allValues);
  const rawMin = Math.min(...allValues);
  // Cap extreme outliers (e.g. Argentina hyperinflation) to keep chart readable
  const maxValue = Math.min(rawMax, 50);
  const minValue = Math.min(rawMin, 0);

  const xScale = (year: number) =>
    ((year - startYear) / (endYear - startYear)) * chartWidth + padding.left;

  const yScale = (value: number) => {
    const clamped = Math.max(minValue, Math.min(maxValue, value));
    return chartHeight - ((clamped - minValue) / (maxValue - minValue)) * chartHeight + padding.top;
  };

  const createLinePath = (dataPoints: { year: number; value: number }[]) => {
    if (dataPoints.length === 0) return "";
    return dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year)} ${yScale(p.value)}`)
      .join(" ");
  };

  const yTicks = 5;
  const yTickValues = Array.from(
    { length: yTicks },
    (_, i) => minValue + (i * (maxValue - minValue)) / (yTicks - 1)
  );

  const xTickInterval = 10;
  const xTickValues: number[] = [];
  for (
    let year = Math.ceil(startYear / xTickInterval) * xTickInterval;
    year <= endYear;
    year += xTickInterval
  ) {
    xTickValues.push(year);
  }

  const zeroY = yScale(0);

  return (
    <div className="gdp-line-chart">
      <div className="chart-header">
        <h3 className="chart-title">Inflation Rate Over Time</h3>
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

          {/* Zero line */}
          {minValue < 0 && (
            <line
              x1={padding.left}
              y1={zeroY}
              x2={width - padding.right}
              y2={zeroY}
              stroke="#555"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
          )}

          {/* Y-axis ticks and labels */}
          {yTickValues.map((value) => {
            const y = yScale(value);
            return (
              <g key={value}>
                <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#666" />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  fill="#fff"
                  fontSize="11"
                  dominantBaseline="middle"
                >
                  {value.toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* X-axis ticks and labels */}
          {xTickValues.map((year) => {
            const x = xScale(year);
            return (
              <g key={year}>
                <line
                  x1={x}
                  y1={height - padding.bottom}
                  x2={x}
                  y2={height - padding.bottom + 5}
                  stroke="#666"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="11"
                >
                  {year}
                </text>
              </g>
            );
          })}

          {/* Grid lines */}
          {yTickValues.map((value) => (
            <line
              key={`grid-${value}`}
              x1={padding.left}
              y1={yScale(value)}
              x2={width - padding.right}
              y2={yScale(value)}
              stroke="#333"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Lines */}
          {countryData
            .filter((country) => visibleCountries.has(country.name))
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
                    strokeWidth={hoveredCountry === country.name ? 3 : 2}
                    style={{ pointerEvents: "none" }}
                  />
                </g>
              );
            })}

          {/* Legend */}
          {countryData.map((country, index) => {
            const x = width - padding.right + 10;
            const y = padding.top + index * 20;
            const isVisible = visibleCountries.has(country.name);
            return (
              <g
                key={country.name}
                style={{ cursor: "pointer" }}
                onClick={() => toggleCountry(country.name)}
                opacity={isVisible ? 1 : 0.3}
              >
                <line x1={x} y1={y} x2={x + 20} y2={y} stroke={country.color} strokeWidth="2" />
                <text x={x + 25} y={y} fill="#fff" fontSize="11" dominantBaseline="middle">
                  {country.name}
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
                width={hoveredCountry.length * 7 + 10}
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
                {hoveredCountry}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export default InflationLineChart;
