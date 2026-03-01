import { useEffect, useState } from "react";
import {
  MINERAL_CONFIGS,
  type MineralType,
  type MineralView,
  type MineralRecord,
} from "./mineralConfig";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./MineralsDashboard.css";

interface MineralsDashboardProps {
  mineralType: MineralType;
  mineralView: MineralView;
  onClose: () => void;
}

function MineralsDashboard({ mineralType, mineralView, onClose }: MineralsDashboardProps) {
  const [records, setRecords] = useState<MineralRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const config = MINERAL_CONFIGS[mineralType];

  const file = mineralView === "production" ? config.productionFile : config.file;
  const unit = mineralView === "production" ? config.productionUnit : config.unit;
  const viewLabel = mineralView === "production" ? "Producers" : "Reserves";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on mineralType change
    setLoading(true);
    setRecords(null);
    fetch(`/data/resources/${file}`)
      .then((r) => r.json())
      .then((data: MineralRecord[]) => setRecords(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [file]);

  const top10 = records ? [...records].sort((a, b) => b.v - a.v).slice(0, 10) : [];
  const maxValue = top10[0]?.v ?? 1;
  const worldTotal = records ? records.reduce((sum, r) => sum + r.v, 0) : 0;

  return (
    <div className="minerals-dashboard-overlay" onClick={onClose}>
      <div className="minerals-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="minerals-dashboard-header">
          <span className="minerals-dashboard-dot" style={{ background: config.color }} />
          <h2 className="minerals-dashboard-title">
            Top 10 {config.label} {viewLabel}
            <span className="minerals-dashboard-unit">{unit}</span>
          </h2>
          <button className="minerals-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <div className="minerals-dashboard-loading">Loading…</div>
        ) : !records || records.length === 0 ? (
          <div className="minerals-dashboard-loading">No data available.</div>
        ) : (
          <div className="minerals-dashboard-body">
            {top10.map((record, i) => (
              <div key={record.c} className="minerals-bar-row">
                <div className="minerals-bar-rank">{i + 1}</div>
                <div className="minerals-bar-label">{codeToCountryName[record.c] ?? record.c}</div>
                <div className="minerals-bar-track">
                  <div
                    className="minerals-bar-fill"
                    style={{
                      width: `${(record.v / maxValue) * 100}%`,
                      background: config.color,
                    }}
                  />
                </div>
                <div className="minerals-bar-value">
                  {record.v.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </div>
                {mineralView === "production" && worldTotal > 0 && (
                  <div className="minerals-bar-pct">
                    {((record.v / worldTotal) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MineralsDashboard;
