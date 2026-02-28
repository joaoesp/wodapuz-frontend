import { useEffect, useState } from "react";
import { INFRA_CONFIGS, type InfraType, type PlantRecord } from "./infraConfig";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./InfrastructureDashboard.css";

interface InfrastructureDashboardProps {
  infraType: InfraType;
  onClose: () => void;
}

function InfrastructureDashboard({ infraType, onClose }: InfrastructureDashboardProps) {
  const [plants, setPlants] = useState<PlantRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const config = INFRA_CONFIGS[infraType];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on infraType change
    setLoading(true);
    setPlants(null);
    fetch(`/data/infrastructure/${config.file}`)
      .then((r) => r.json())
      .then((data: PlantRecord[]) => setPlants(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [config.file]);

  const top5 = plants ? [...plants].sort((a, b) => b.mw - a.mw).slice(0, 5) : [];

  const countryCounts = plants
    ? Object.entries(
        plants.reduce<Record<string, number>>((acc, p) => {
          acc[p.c] = (acc[p.c] || 0) + 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
    : [];

  const maxCount = countryCounts[0]?.[1] ?? 1;

  return (
    <div className="infra-dashboard-overlay" onClick={onClose}>
      <div className="infra-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="infra-dashboard-header">
          <span className="infra-dashboard-dot" style={{ background: config.color }} />
          <h2 className="infra-dashboard-title">
            {infraType === "oil" ? "Oil Refineries" : `${config.label} Plants`}
            <span className="infra-dashboard-threshold">{config.minCapacity}</span>
          </h2>
          <button className="infra-dashboard-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <div className="infra-dashboard-loading">Loading…</div>
        ) : !plants || plants.length === 0 ? (
          <div className="infra-dashboard-loading">No data available.</div>
        ) : (
          <div className="infra-dashboard-body">
            <div>
              <h4 className="infra-section-label">
                {infraType === "oil" ? "Top 5 Oil Refineries" : "Top 5 Plants"}
              </h4>
              <table className="infra-top-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>{infraType === "oil" ? "kb/d" : "MW"}</th>
                  </tr>
                </thead>
                <tbody>
                  {top5.map((plant, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        {plant.n}
                        <span className="infra-top-country">
                          {codeToCountryName[plant.c] ?? plant.c}
                        </span>
                      </td>
                      <td>{plant.mw.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="infra-section-label">
                {infraType === "oil" ? "Oil Refineries by Country" : "Plants by Country"}
              </h4>
              {countryCounts.map(([code, count]) => (
                <div key={code} className="infra-country-bar-row">
                  <div className="infra-country-bar-label">{codeToCountryName[code] ?? code}</div>
                  <div className="infra-country-bar-track">
                    <div
                      className="infra-country-bar-fill"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: config.color,
                      }}
                    />
                  </div>
                  <div className="infra-country-bar-value">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfrastructureDashboard;
