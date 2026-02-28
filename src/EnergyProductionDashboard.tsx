import { useEffect, useState } from "react";
import { owidService, type CountryEnergyData } from "./services/owidService";
import "./EnergyProductionDashboard.css";

interface EnergyProductionDashboardProps {
  countryCode: string;
  countryName: string;
  selectedYear: number;
  onClose: () => void;
}

const SOURCES = [
  { key: "coal" as const, label: "Coal", color: "#78716c" },
  { key: "gas" as const, label: "Gas", color: "#f97316" },
  { key: "oil" as const, label: "Oil", color: "#a16207" },
  { key: "nuclear" as const, label: "Nuclear", color: "#a855f7" },
  { key: "hydro" as const, label: "Hydro", color: "#3b82f6" },
  { key: "solar" as const, label: "Solar", color: "#eab308" },
  { key: "wind" as const, label: "Wind", color: "#22d3ee" },
  { key: "biofuel" as const, label: "Biofuel", color: "#22c55e" },
];

function formatTwh(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k TWh`;
  return `${v.toFixed(1)} TWh`;
}

function TrendChart({ years, values }: { years: number[]; values: (number | null)[] }) {
  const data = years
    .map((y, i) => ({ year: y, value: values[i] }))
    .filter((d): d is { year: number; value: number } => d.value !== null);

  if (data.length < 2) return <div className="energy-no-data">No data</div>;

  const W = 380,
    H = 160;
  const padL = 64,
    padR = 8,
    padT = 8,
    padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  const maxValue = Math.max(...data.map((d) => d.value));

  const x = (year: number) =>
    maxYear === minYear
      ? padL + innerW / 2
      : padL + ((year - minYear) / (maxYear - minYear)) * innerW;

  const y = (v: number) =>
    maxValue === 0 ? padT + innerH : padT + innerH - (v / maxValue) * innerH;

  const points = data.map((d) => `${x(d.year)},${y(d.value)}`).join(" ");
  const yTicks = [0, maxValue / 2, maxValue];
  const span = maxYear - minYear;
  const step = Math.ceil(span / 6);
  const xTickYears = data
    .map((d) => d.year)
    .filter((yr) => (yr - minYear) % step === 0 || yr === maxYear);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      {yTicks.map((v, i) => (
        <g key={i}>
          <line x1={padL - 4} y1={y(v)} x2={padL} y2={y(v)} stroke="#555" strokeWidth={1} />
          <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize={9} fill="#888">
            {formatTwh(v)}
          </text>
        </g>
      ))}
      {xTickYears.map((yr) => (
        <g key={yr}>
          <line
            x1={x(yr)}
            y1={padT + innerH}
            x2={x(yr)}
            y2={padT + innerH + 4}
            stroke="#555"
            strokeWidth={1}
          />
          <text
            x={x(yr)}
            y={padT + innerH + 14}
            textAnchor="middle"
            fontSize={9}
            fill="#888"
            transform={`rotate(-45, ${x(yr)}, ${padT + innerH + 14})`}
          >
            {yr}
          </text>
        </g>
      ))}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#444" strokeWidth={1} />
      <line
        x1={padL}
        y1={padT + innerH}
        x2={padL + innerW}
        y2={padT + innerH}
        stroke="#444"
        strokeWidth={1}
      />
      <polyline points={points} fill="none" stroke="#ffb300" strokeWidth={2} />
      {data.map((d) => (
        <circle key={d.year} cx={x(d.year)} cy={y(d.value)} r={2} fill="#ffb300" />
      ))}
    </svg>
  );
}

function BreakdownBars({ data, selectedYear }: { data: CountryEnergyData; selectedYear: number }) {
  // Find the closest year <= selectedYear that has total data
  let idx = -1;
  for (let i = data.years.length - 1; i >= 0; i--) {
    if (data.years[i] <= selectedYear && data.total[i] !== null) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return <div className="energy-no-data">No data</div>;

  const displayYear = data.years[idx];
  const total = data.total[idx] ?? 0;

  const sourceValues = SOURCES.map((s) => ({
    ...s,
    value: data[s.key][idx] ?? 0,
  }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  const maxVal = sourceValues[0]?.value ?? 1;

  return (
    <div>
      <div className="energy-breakdown-year">
        {displayYear} — Total: {formatTwh(total)}
      </div>
      {sourceValues.map((s) => (
        <div key={s.key} className="energy-bar-row">
          <div className="energy-bar-label">{s.label}</div>
          <div className="energy-bar-track">
            <div
              className="energy-bar-fill"
              style={{ width: `${(s.value / maxVal) * 100}%`, background: s.color }}
            />
          </div>
          <div className="energy-bar-value">{formatTwh(s.value)}</div>
        </div>
      ))}
    </div>
  );
}

function EnergyProductionDashboard({
  countryCode,
  countryName,
  selectedYear,
  onClose,
}: EnergyProductionDashboardProps) {
  const [data, setData] = useState<CountryEnergyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);
    owidService
      .fetchCountryEnergy(countryCode)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [countryCode]);

  return (
    <div className="energy-dashboard-overlay" onClick={onClose}>
      <div className="energy-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="energy-dashboard-header">
          <div>
            <h2 className="energy-dashboard-title">{countryName}</h2>
            <p className="energy-dashboard-subtitle">Energy Production</p>
          </div>
          <button className="energy-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <div className="energy-dashboard-loading">Loading…</div>
        ) : !data || data.years.length === 0 ? (
          <div className="energy-dashboard-loading">No data available.</div>
        ) : (
          <div className="energy-dashboard-charts">
            <div className="energy-chart-section">
              <h4 className="energy-section-label">Total Electricity Generation</h4>
              <TrendChart years={data.years} values={data.total} />
            </div>
            <div className="energy-chart-section">
              <h4 className="energy-section-label">Breakdown by Source</h4>
              <BreakdownBars data={data} selectedYear={selectedYear} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnergyProductionDashboard;
