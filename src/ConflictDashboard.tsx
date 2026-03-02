import type { ActiveConflict } from "./conflictData";
import { codeToCountryName } from "./utils/countryNameToCode";
import "./ConflictDashboard.css";

interface ConflictDashboardProps {
  conflict: ActiveConflict;
  onClose: () => void;
}

const ACCENT = "#c0392b";

function ConflictDashboard({ conflict, onClose }: ConflictDashboardProps) {
  return (
    <div className="cd-overlay" onClick={onClose}>
      <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cd-header">
          <div className="cd-header-accent" style={{ background: ACCENT }} />
          <div className="cd-header-text">
            <h2 className="cd-title" style={{ color: ACCENT }}>
              {conflict.name}
            </h2>
            <p className="cd-type">{conflict.type}</p>
          </div>
          <button className="cd-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="cd-stats">
          <div className="cd-stat">
            <span className="cd-stat-label">Type</span>
            <span className="cd-stat-value">{conflict.type}</span>
          </div>
          <div className="cd-stat-divider" />
          <div className="cd-stat">
            <span className="cd-stat-label">Started</span>
            <span className="cd-stat-value">{conflict.startDate}</span>
          </div>
          <div className="cd-stat-divider" />
          <div className="cd-stat">
            <span className="cd-stat-label">Countries</span>
            <span className="cd-stat-value">{conflict.countries.length}</span>
          </div>
        </div>

        <p className="cd-description">{conflict.summary}</p>

        <div className="cd-countries-section">
          <h3 className="cd-countries-title">Involved Countries</h3>
          <div className="cd-countries-grid">
            {conflict.countries.map((code) => (
              <span key={code} className="cd-country-chip">
                {codeToCountryName[code] || code}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConflictDashboard;
