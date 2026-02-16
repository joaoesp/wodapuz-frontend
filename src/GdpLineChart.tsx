import { useEffect, useState } from "react";
import "./GdpLineChart.css";

interface GdpLineChartProps {
  startYear: number;
  endYear: number;
}

interface CountryData {
  name: string;
  color: string;
  dataPoints: { year: number; percentage: number }[];
}

// G20 countries with distinct colors
const G20_COUNTRIES = [
  { code: "USA", name: "United States", color: "#9cc837" }, // bright green
  { code: "CHN", name: "China", color: "#ff6b6b" }, // red
  { code: "JPN", name: "Japan", color: "#ff9f43" }, // orange
  { code: "DEU", name: "Germany", color: "#45b7d1" }, // blue
  { code: "IND", name: "India", color: "#f9ca24" }, // yellow
  { code: "GBR", name: "United Kingdom", color: "#6c5ce7" }, // purple
  { code: "FRA", name: "France", color: "#fd79a8" }, // pink
  { code: "BRA", name: "Brazil", color: "#26de81" }, // emerald
  { code: "ITA", name: "Italy", color: "#00b894" }, // teal
  { code: "CAN", name: "Canada", color: "#a55eea" }, // violet
  { code: "KOR", name: "South Korea", color: "#e17055" }, // coral
  { code: "RUS", name: "Russia", color: "#74b9ff" }, // light blue
  { code: "AUS", name: "Australia", color: "#fd79a8" }, // rose
  { code: "MEX", name: "Mexico", color: "#55efc4" }, // mint
  { code: "IDN", name: "Indonesia", color: "#ffeaa7" }, // cream
  { code: "TUR", name: "Turkey", color: "#ff7675" }, // salmon
  { code: "SAU", name: "Saudi Arabia", color: "#fab1a0" }, // peach
  { code: "ARG", name: "Argentina", color: "#a29bfe" }, // lavender
  { code: "ZAF", name: "South Africa", color: "#fdcb6e" }, // gold
];

function GdpLineChart({ startYear, endYear }: GdpLineChartProps) {
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(new Set());
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:1337/api/world-bank/gdp/years/${startYear}/${endYear}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch GDP data");
        }

        const data = await response.json();

        // Process data for each country
        const countries: CountryData[] = [];

        G20_COUNTRIES.forEach((country) => {
          const dataPoints: { year: number; percentage: number }[] = [];

          // Calculate global totals per year
          const yearlyTotals: Record<number, number> = {};

          for (let year = startYear; year <= endYear; year++) {
            const yearData = data[year.toString()];
            if (yearData) {
              const total = yearData.reduce((sum: number, item: { value: number }) => {
                return sum + (item.value || 0);
              }, 0);
              yearlyTotals[year] = total;
            }
          }

          // Get data points for this country
          for (let year = startYear; year <= endYear; year++) {
            const yearData = data[year.toString()];
            if (yearData && yearlyTotals[year]) {
              const countryData = yearData.find(
                (item: { countryCode: string; value: number }) => item.countryCode === country.code
              );
              if (countryData && countryData.value) {
                const percentage = (countryData.value / yearlyTotals[year]) * 100;
                dataPoints.push({ year, percentage });
              }
            }
          }

          if (dataPoints.length > 0) {
            countries.push({
              name: country.name,
              color: country.color,
              dataPoints,
            });
          }
        });

        // Sort by latest year percentage and take top 10
        countries.sort((a, b) => {
          const aLatest = a.dataPoints[a.dataPoints.length - 1]?.percentage || 0;
          const bLatest = b.dataPoints[b.dataPoints.length - 1]?.percentage || 0;
          return bLatest - aLatest;
        });

        const top10 = countries.slice(0, 10);
        setCountryData(top10);
        // Initialize all countries as visible
        setVisibleCountries(new Set(top10.map((c) => c.name)));
      } catch (error) {
        console.error("Error fetching GDP data:", error);
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
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (loading) {
    return (
      <div className="gdp-line-chart">
        <div className="chart-loading">Loading chart...</div>
      </div>
    );
  }

  if (countryData.length === 0) {
    return null;
  }

  // Chart dimensions
  const width = 700;
  const height = 400;
  const padding = { top: 20, right: 150, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min and max values
  const allPercentages = countryData.flatMap((c) => c.dataPoints.map((d) => d.percentage));
  const maxPercentage = Math.max(...allPercentages);
  const minPercentage = 0;

  // Scale functions
  const xScale = (year: number) => {
    return ((year - startYear) / (endYear - startYear)) * chartWidth + padding.left;
  };

  const yScale = (percentage: number) => {
    return (
      chartHeight -
      ((percentage - minPercentage) / (maxPercentage - minPercentage)) * chartHeight +
      padding.top
    );
  };

  // Create path for line
  const createLinePath = (dataPoints: { year: number; percentage: number }[]) => {
    if (dataPoints.length === 0) return "";
    const path = dataPoints
      .map((point, i) => {
        const x = xScale(point.year);
        const y = yScale(point.percentage);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
    return path;
  };

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return minPercentage + (i * (maxPercentage - minPercentage)) / (yTicks - 1);
  });

  // X-axis ticks (every 10 years)
  const xTickInterval = 10;
  const xTickValues = [];
  for (
    let year = Math.ceil(startYear / xTickInterval) * xTickInterval;
    year <= endYear;
    year += xTickInterval
  ) {
    xTickValues.push(year);
  }

  return (
    <div className={`gdp-line-chart ${isMinimized ? "minimized" : ""}`}>
      <div className="chart-header">
        <h3 className="chart-title">GDP Share Over Time</h3>
        <button
          className="minimize-button"
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? "□" : "−"}
        </button>
      </div>
      {!isMinimized && (
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
                    {value.toFixed(1)}%
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
            {yTickValues.map((value) => {
              const y = yScale(value);
              return (
                <line
                  key={`grid-${value}`}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#333"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              );
            })}

            {/* Lines */}
            {countryData
              .filter((country) => visibleCountries.has(country.name))
              .map((country) => {
                const path = createLinePath(country.dataPoints);
                return (
                  <g key={country.name}>
                    {/* Invisible wider path for easier hovering */}
                    <path
                      d={path}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="10"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredCountry(country.name)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    />
                    {/* Visible line */}
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
      )}
    </div>
  );
}

export default GdpLineChart;
