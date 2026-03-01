import { useEffect, useState } from "react";
import { CROP_CONFIGS, type CropType, type CropRecord } from "./agricultureConfig";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./AgricultureDashboard.css";

interface AgricultureDashboardProps {
  cropType: CropType;
  selectedYear: number;
  onClose: () => void;
}

function AgricultureDashboard({ cropType, selectedYear, onClose }: AgricultureDashboardProps) {
  const [records, setRecords] = useState<CropRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const config = CROP_CONFIGS[cropType];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on cropType/year change
    setLoading(true);
    setRecords(null);
    fetch(`/data/agriculture/${config.file}`)
      .then((r) => r.json())
      .then((data: Record<string, CropRecord[]>) => {
        const yearData = data[String(selectedYear)];
        setRecords(yearData ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [config.file, selectedYear]);

  const top10 = records ? [...records].sort((a, b) => b.v - a.v).slice(0, 10) : [];
  const maxValue = top10[0]?.v ?? 1;
  const worldTotal = records ? records.reduce((sum, r) => sum + r.v, 0) : 0;

  return (
    <div className="agriculture-dashboard-overlay" onClick={onClose}>
      <div className="agriculture-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="agriculture-dashboard-header">
          <span className="agriculture-dashboard-dot" style={{ background: config.color }} />
          <h2 className="agriculture-dashboard-title">
            Top 10 {config.label} Producers ({selectedYear})
            <span className="agriculture-dashboard-unit">{config.unit}</span>
          </h2>
          <button className="agriculture-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <div className="agriculture-dashboard-loading">Loading…</div>
        ) : !records || records.length === 0 ? (
          <div className="agriculture-dashboard-loading">No data available.</div>
        ) : (
          <div className="agriculture-dashboard-body">
            {top10.map((record, i) => (
              <div key={record.c} className="agriculture-bar-row">
                <div className="agriculture-bar-rank">{i + 1}</div>
                <div className="agriculture-bar-label">
                  {codeToCountryName[record.c] ?? record.c}
                </div>
                <div className="agriculture-bar-track">
                  <div
                    className="agriculture-bar-fill"
                    style={{
                      width: `${(record.v / maxValue) * 100}%`,
                      background: config.color,
                    }}
                  />
                </div>
                <div className="agriculture-bar-value">
                  {record.v.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </div>
                {worldTotal > 0 && (
                  <div className="agriculture-bar-pct">
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

export default AgricultureDashboard;
