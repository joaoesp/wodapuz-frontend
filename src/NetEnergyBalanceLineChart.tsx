import { useEffect, useState } from "react";
import "./GdpLineChart.css";

interface NetEnergyBalanceLineChartProps {
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
  { code: "AUS", name: "Australia", color: "#c8d6e5" },
  { code: "MEX", name: "Mexico", color: "#55efc4" },
  { code: "IDN", name: "Indonesia", color: "#ffeaa7" },
  { code: "TUR", name: "Turkey", color: "#ff7675" },
  { code: "SAU", name: "Saudi Arabia", color: "#fab1a0" },
  { code: "ARG", name: "Argentina", color: "#a29bfe" },
  { code: "ZAF", name: "South Africa", color: "#fdcb6e" },
];

function NetEnergyBalanceLineChart({
  startYear,
  endYear,
  onClose,
}: NetEnergyBalanceLineChartProps) {
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
          `http://localhost:1337/api/world-bank/net-energy-balance/years/${startYear}/${endYear}`
        );
        if (!response.ok) throw new Error("Failed to fetch Net Energy Balance data");
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
              if (entry != null) {
                dataPoints.push({ year, value: entry.value });
              }
            }
          }
          if (dataPoints.length > 0) {
            countries.push({ name: country.name, color: country.color, dataPoints });
          }
        });

        setCountryData(countries);
        setVisibleCountries(new Set(countries.map((c) => c.name)));
      } catch (error) {
        console.error("Error fetching Net Energy Balance data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startYear, endYear]);

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
  const padding = { top: 20, right: 155, bottom: 40, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = countryData.flatMap((c) => c.dataPoints.map((d) => d.value));
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const pad = (rawMax - rawMin) * 0.05;
  const minValue = Math.floor((rawMin - pad) / 10) * 10;
  const maxValue = Math.ceil((rawMax + pad) / 10) * 10;

  const xScale = (year: number) =>
    ((year - startYear) / (endYear - startYear)) * chartWidth + padding.left;

  const yScale = (v: number) =>
    chartHeight - ((v - minValue) / (maxValue - minValue)) * chartHeight + padding.top;

  const createLinePath = (dataPoints: { year: number; value: number }[]) =>
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year)} ${yScale(p.value)}`)
      .join(" ");

  const yTickCount = 6;
  const yTickValues = Array.from({ length: yTickCount }, (_, i) =>
    Math.round(minValue + (i * (maxValue - minValue)) / (yTickCount - 1))
  );

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

  const zeroY = yScale(0);
  const showZeroLine = minValue < 0 && maxValue > 0;

  return (
    <div className="gdp-line-chart">
      <div className="chart-header">
        <h3 className="chart-title">G20 Net Energy Balance</h3>
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
                {v}%
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

          {showZeroLine && (
            <line
              x1={padding.left}
              y1={zeroY}
              x2={width - padding.right}
              y2={zeroY}
              stroke="#888"
              strokeWidth="1.5"
            />
          )}

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
            const ly = padding.top + index * 20;
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

export default NetEnergyBalanceLineChart;
