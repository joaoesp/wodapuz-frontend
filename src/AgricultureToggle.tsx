import { CROP_CONFIGS, CROP_ORDER, type CropType } from "./agricultureConfig";
import "./AgricultureToggle.css";

interface AgricultureToggleProps {
  activeType: CropType | null;
  onSelect: (t: CropType) => void;
  onChartOpen: (t: CropType) => void;
}

function AgricultureToggle({ activeType, onSelect, onChartOpen }: AgricultureToggleProps) {
  return (
    <div className="agriculture-toggle">
      {CROP_ORDER.map((type) => {
        const config = CROP_CONFIGS[type];
        const isActive = activeType === type;
        return (
          <div key={type} className="agriculture-toggle-cell">
            <button
              className={`agriculture-toggle-btn ${isActive ? "active" : ""}`}
              style={{ "--agriculture-color": config.color } as React.CSSProperties}
              onClick={() => onSelect(type)}
              title={config.label}
            >
              <span className="agriculture-dot" style={{ background: config.color }} />
              <span className="agriculture-label">{config.label.toUpperCase()}</span>
            </button>
            {isActive && (
              <button
                className="agriculture-chart-btn"
                onClick={() => onChartOpen(type)}
                title={`Top 10 ${config.label} Producers`}
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
          </div>
        );
      })}
    </div>
  );
}

export default AgricultureToggle;
