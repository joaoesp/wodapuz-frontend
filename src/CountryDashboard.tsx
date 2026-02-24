import "./CountryDashboard.css";

// --- Symlog helpers (linear near zero, log for large values) ---
const SYMLOG_C = 5; // transition point in %

function symlog(v: number): number {
  return Math.sign(v) * Math.log10(1 + Math.abs(v) / SYMLOG_C);
}

// Candidate tick values for a symlog inflation axis
const SYMLOG_TICK_CANDIDATES = [
  -1000000, -100000, -10000, -1000, -200, -100, -50, -20, -10, -5, -2, 0, 2, 5, 10, 20, 50, 100,
  200, 1000, 10000, 100000, 1000000,
];

function percentile(sorted: number[], p: number): number {
  return sorted[Math.max(0, Math.floor(sorted.length * p) - 1)];
}

// --- Metric config ---
type ScaleMode = "linear" | "symlog" | "clipped";

type MetricConfig = {
  subtitle: string;
  formatValue: (v: number) => string;
  formatLatest: (v: number) => string;
  scaleMode: ScaleMode;
};

const METRIC_CONFIGS: Record<string, MetricConfig> = {
  "GDP per capita": {
    subtitle: "GDP per Capita — Historical",
    formatValue: (v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(0)}`),
    formatLatest: (v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(0)}`),
    scaleMode: "linear",
  },
  Inflation: {
    subtitle: "Inflation Rate — Historical (symlog scale)",
    formatValue: (v) =>
      Math.abs(v) >= 1000
        ? `${(v / 1000).toFixed(0)}K%`
        : Math.abs(v) >= 100
          ? `${v.toFixed(0)}%`
          : `${v.toFixed(1)}%`,
    formatLatest: (v) => `${v.toFixed(1)}%`,
    scaleMode: "symlog",
  },
  "Current Account Balance": {
    subtitle: "Current Account Balance (% of GDP) — Historical",
    formatValue: (v) => `${v.toFixed(1)}%`,
    formatLatest: (v) => `${v.toFixed(1)}%`,
    scaleMode: "clipped",
  },
};

interface CountryDashboardProps {
  countryName: string;
  metric: string;
  data: { year: number; value: number }[];
  onClose: () => void;
}

function CountryDashboard({ countryName, metric, data, onClose }: CountryDashboardProps) {
  if (data.length === 0) return null;

  const config = METRIC_CONFIGS[metric] ?? METRIC_CONFIGS["GDP per capita"];

  const width = 560;
  const height = 300;
  // Wider left padding for symlog (tick labels can be wide like "100K%")
  const leftPad = config.scaleMode === "symlog" ? 80 : 70;
  const padding = { top: 20, right: 20, bottom: 40, left: leftPad };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const startYear = data[0].year;
  const endYear = data[data.length - 1].year;
  const allValues = data.map((d) => d.value);
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const latestValue = data[data.length - 1].value;

  const xScale = (year: number) =>
    ((year - startYear) / (endYear - startYear)) * chartWidth + padding.left;

  // --- Build scale-specific state ---
  let yScale: (v: number) => number;
  let yTickValues: number[];
  let showZeroLine = false;
  let clippedAnnotations: { label: string; y: number }[] = [];

  if (config.scaleMode === "symlog") {
    const tMin = symlog(rawMin);
    const tMax = symlog(rawMax);
    yScale = (v) => {
      const t = symlog(v);
      return chartHeight - ((t - tMin) / (tMax - tMin)) * chartHeight + padding.top;
    };
    yTickValues = SYMLOG_TICK_CANDIDATES.filter((v) => v >= rawMin - 1 && v <= rawMax + 1);
    showZeroLine = rawMin < 0;
  } else if (config.scaleMode === "clipped") {
    const sorted = [...allValues].sort((a, b) => a - b);
    const p5 = percentile(sorted, 0.05);
    const p95 = percentile(sorted, 0.95);
    const range = Math.max(p95 - p5, 1);
    const clampMin = p5 - range * 0.15;
    const clampMax = p95 + range * 0.15;

    yScale = (v) => {
      const clamped = Math.max(clampMin, Math.min(clampMax, v));
      return (
        chartHeight - ((clamped - clampMin) / (clampMax - clampMin)) * chartHeight + padding.top
      );
    };
    yTickValues = Array.from({ length: 5 }, (_, i) => clampMin + (i * (clampMax - clampMin)) / 4);
    showZeroLine = clampMin < 0 && clampMax > 0;

    if (rawMax > clampMax) {
      clippedAnnotations.push({
        label: `▲ Peak: ${config.formatValue(rawMax)}`,
        y: padding.top + 14,
      });
    }
    if (rawMin < clampMin) {
      clippedAnnotations.push({
        label: `▼ Low: ${config.formatValue(rawMin)}`,
        y: height - padding.bottom - 6,
      });
    }
  } else {
    // linear (GDP per capita)
    const scaleMin = 0;
    const scaleMax = rawMax;
    yScale = (v) =>
      chartHeight - ((v - scaleMin) / (scaleMax - scaleMin)) * chartHeight + padding.top;
    yTickValues = Array.from({ length: 5 }, (_, i) => scaleMin + (i * (scaleMax - scaleMin)) / 4);
  }

  const linePath = data
    .map((point, i) => `${i === 0 ? "M" : "L"} ${xScale(point.year)} ${yScale(point.value)}`)
    .join(" ");

  const zeroY = yScale(0);
  const areaPath = linePath + ` L ${xScale(endYear)} ${zeroY} L ${xScale(startYear)} ${zeroY} Z`;

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
            <p className="country-dashboard-subtitle">{config.subtitle}</p>
          </div>
          <div className="country-dashboard-latest">
            <span className="country-dashboard-latest-label">Latest ({endYear})</span>
            <span className="country-dashboard-latest-value">
              {config.formatLatest(latestValue)}
            </span>
          </div>
          <button className="country-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <svg width={width} height={height}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9cc837" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#9cc837" stopOpacity="0.02" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} />
            </clipPath>
          </defs>

          {/* Area fill clipped to chart bounds */}
          <path d={areaPath} fill="url(#areaGradient)" clipPath="url(#chartClip)" />

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

          {/* Zero line */}
          {showZeroLine && (
            <line
              x1={padding.left}
              y1={zeroY}
              x2={width - padding.right}
              y2={zeroY}
              stroke="#666"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
          )}

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
              {config.formatValue(value)}
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

          {/* Line (clipped to chart area) */}
          <path
            d={linePath}
            fill="none"
            stroke="#9cc837"
            strokeWidth="2.5"
            strokeLinejoin="round"
            clipPath="url(#chartClip)"
          />

          {/* Endpoint dot */}
          <circle cx={xScale(endYear)} cy={yScale(latestValue)} r="4" fill="#9cc837" />

          {/* Clipping annotations */}
          {clippedAnnotations.map((ann) => (
            <text
              key={ann.label}
              x={width - padding.right - 4}
              y={ann.y}
              textAnchor="end"
              fill="#f9ca24"
              fontSize="11"
              fontStyle="italic"
            >
              {ann.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default CountryDashboard;
