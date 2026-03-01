import { RESERVE_CONFIGS, RESERVE_ORDER, type ReserveType } from "./reserveConfig";
import "./ReservesToggle.css";

interface ReservesToggleProps {
  activeType: ReserveType | null;
  onSelect: (t: ReserveType) => void;
  onChartOpen: (t: ReserveType) => void;
}

function ReservesToggle({ activeType, onSelect, onChartOpen }: ReservesToggleProps) {
  return (
    <div className="reserves-toggle">
      {RESERVE_ORDER.map((type) => {
        const config = RESERVE_CONFIGS[type];
        const isActive = activeType === type;
        return (
          <div key={type} className="reserves-toggle-cell">
            {isActive && (
              <button
                className="reserves-chart-btn"
                onClick={() => onChartOpen(type)}
                title={`Top 10 ${config.label} Reserves`}
              >
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
              className={`reserves-toggle-btn ${isActive ? "active" : ""}`}
              style={{ "--reserves-color": config.color } as React.CSSProperties}
              onClick={() => onSelect(type)}
              title={config.label}
            >
              <span className="reserves-dot" style={{ background: config.color }} />
              <span className="reserves-label">{config.label.toUpperCase()}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ReservesToggle;
