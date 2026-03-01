import { useEffect, useState } from "react";
import { RESERVE_CONFIGS, type ReserveType, type ReserveRecord } from "./reserveConfig";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./ReservesDashboard.css";

interface ReservesDashboardProps {
  reserveType: ReserveType;
  onClose: () => void;
}

function ReservesDashboard({ reserveType, onClose }: ReservesDashboardProps) {
  const [records, setRecords] = useState<ReserveRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const config = RESERVE_CONFIGS[reserveType];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on reserveType change
    setLoading(true);
    setRecords(null);
    fetch(`/data/resources/${config.file}`)
      .then((r) => r.json())
      .then((data: ReserveRecord[]) => setRecords(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [config.file]);

  const top10 = records ? [...records].sort((a, b) => b.v - a.v).slice(0, 10) : [];
  const maxValue = top10[0]?.v ?? 1;

  return (
    <div className="reserves-dashboard-overlay" onClick={onClose}>
      <div className="reserves-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="reserves-dashboard-header">
          <span className="reserves-dashboard-dot" style={{ background: config.color }} />
          <h2 className="reserves-dashboard-title">
            Top 10 {config.label} Reserves
            <span className="reserves-dashboard-unit">{config.unit}</span>
          </h2>
          <button className="reserves-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <div className="reserves-dashboard-loading">Loading…</div>
        ) : !records || records.length === 0 ? (
          <div className="reserves-dashboard-loading">No data available.</div>
        ) : (
          <div className="reserves-dashboard-body">
            {top10.map((record, i) => (
              <div key={record.c} className="reserves-bar-row">
                <div className="reserves-bar-rank">{i + 1}</div>
                <div className="reserves-bar-label">{codeToCountryName[record.c] ?? record.c}</div>
                <div className="reserves-bar-track">
                  <div
                    className="reserves-bar-fill"
                    style={{
                      width: `${(record.v / maxValue) * 100}%`,
                      background: config.color,
                    }}
                  />
                </div>
                <div className="reserves-bar-value">
                  {record.v.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReservesDashboard;
