import { INFRA_CONFIGS, type InfraType } from "./infraConfig";
import "./InfrastructureToggle.css";

interface InfrastructureToggleProps {
  activeType: InfraType | null;
  counts: Partial<Record<InfraType, number>>;
  onSelect: (t: InfraType) => void;
  onChartOpen?: () => void;
}

const INFRA_ORDER: InfraType[] = ["solar", "nuclear", "hydro", "wind", "gas", "oil", "coal"];

function InfrastructureToggle({
  activeType,
  counts,
  onSelect,
  onChartOpen,
}: InfrastructureToggleProps) {
  return (
    <div className="infra-toggle">
      {INFRA_ORDER.map((type) => {
        const config = INFRA_CONFIGS[type];
        const isActive = activeType === type;
        const count = counts[type];
        return (
          <div key={type} className="infra-toggle-cell">
            {isActive && onChartOpen && (
              <button className="infra-chart-btn" onClick={onChartOpen} title="View dashboard">
                <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <line
                    x1="3"
                    y1="16"
                    x2="3"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="9"
                    y1="16"
                    x2="9"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="15"
                    y1="16"
                    x2="15"
                    y2="2"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            <button
              className={`infra-toggle-btn ${isActive ? "active" : ""}`}
              style={{ "--infra-color": config.color } as React.CSSProperties}
              onClick={() => onSelect(type)}
              title={config.label}
            >
              <span className="infra-dot" style={{ background: config.color }} />
              <span className="infra-label">{config.label.toUpperCase()}</span>
              {count !== undefined && <span className="infra-count">{count.toLocaleString()}</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default InfrastructureToggle;
