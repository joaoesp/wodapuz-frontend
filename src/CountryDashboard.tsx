import "./CountryDashboard.css";

interface CountryDashboardProps {
  countryName: string;
  data: { year: number; value: number }[];
  onClose: () => void;
}

function formatValue(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function CountryDashboard({ countryName, data, onClose }: CountryDashboardProps) {
  if (data.length === 0) return null;

  const width = 560;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const startYear = data[0].year;
  const endYear = data[data.length - 1].year;
  const allValues = data.map((d) => d.value);
  const maxValue = Math.max(...allValues);
  const minValue = 0;

  const latestValue = data[data.length - 1].value;

  const xScale = (year: number) =>
    ((year - startYear) / (endYear - startYear)) * chartWidth + padding.left;

  const yScale = (value: number) =>
    chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight + padding.top;

  const linePath = data
    .map((point, i) => `${i === 0 ? "M" : "L"} ${xScale(point.year)} ${yScale(point.value)}`)
    .join(" ");

  const areaPath =
    linePath + ` L ${xScale(endYear)} ${yScale(0)} L ${xScale(startYear)} ${yScale(0)} Z`;

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

  return (
    <div className="country-dashboard-overlay" onClick={onClose}>
      <div className="country-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="country-dashboard-header">
          <div>
            <h2 className="country-dashboard-title">{countryName}</h2>
            <p className="country-dashboard-subtitle">GDP per Capita — Historical</p>
          </div>
          <div className="country-dashboard-latest">
            <span className="country-dashboard-latest-label">Latest ({endYear})</span>
            <span className="country-dashboard-latest-value">{formatValue(latestValue)}</span>
          </div>
          <button className="country-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <svg width={width} height={height}>
          {/* Area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9cc837" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9cc837" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGradient)" />

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
              strokeDasharray="3,3"
            />
          ))}

          {/* Y-axis */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#555"
            strokeWidth="1"
          />
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#555"
            strokeWidth="1"
          />

          {/* Y-axis labels */}
          {yTickValues.map((value) => (
            <text
              key={`ylabel-${value}`}
              x={padding.left - 8}
              y={yScale(value)}
              textAnchor="end"
              fill="#aaa"
              fontSize="11"
              dominantBaseline="middle"
            >
              {formatValue(value)}
            </text>
          ))}

          {/* X-axis labels */}
          {xTickValues.map((year) => (
            <g key={year}>
              <line
                x1={xScale(year)}
                y1={height - padding.bottom}
                x2={xScale(year)}
                y2={height - padding.bottom + 4}
                stroke="#555"
              />
              <text
                x={xScale(year)}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                fill="#aaa"
                fontSize="11"
              >
                {year}
              </text>
            </g>
          ))}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#9cc837"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Endpoint dot */}
          <circle cx={xScale(endYear)} cy={yScale(latestValue)} r="4" fill="#9cc837" />
        </svg>
      </div>
    </div>
  );
}

export default CountryDashboard;
