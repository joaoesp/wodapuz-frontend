import {
  MINERAL_CONFIGS,
  MINERAL_ORDER,
  type MineralType,
  type MineralView,
} from "./mineralConfig";
import "./MineralsToggle.css";

interface MineralsToggleProps {
  activeType: MineralType | null;
  onSelect: (t: MineralType) => void;
  onChartOpen: (t: MineralType) => void;
  mineralView: MineralView;
}

function MineralsToggle({ activeType, onSelect, onChartOpen, mineralView }: MineralsToggleProps) {
  return (
    <div className="minerals-toggle">
      {MINERAL_ORDER.map((type) => {
        const config = MINERAL_CONFIGS[type];
        const isActive = activeType === type;
        return (
          <div key={type} className="minerals-toggle-cell">
            {isActive && (
              <button
                className="minerals-chart-btn"
                onClick={() => onChartOpen(type)}
                title={`Top 10 ${config.label} ${mineralView === "production" ? "Production" : "Reserves"}`}
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
              className={`minerals-toggle-btn ${isActive ? "active" : ""}`}
              style={{ "--minerals-color": config.color } as React.CSSProperties}
              onClick={() => onSelect(type)}
              title={config.label}
            >
              <span className="minerals-dot" style={{ background: config.color }} />
              <span className="minerals-label">{config.label.toUpperCase()}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default MineralsToggle;
