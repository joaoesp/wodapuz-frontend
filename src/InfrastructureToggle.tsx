import { INFRA_CONFIGS, type InfraType } from "./InfrastructureLayer";
import "./InfrastructureToggle.css";

interface InfrastructureToggleProps {
  activeType: InfraType | null;
  counts: Partial<Record<InfraType, number>>;
  onSelect: (t: InfraType) => void;
}

const INFRA_ORDER: InfraType[] = ["nuclear", "hydro", "solar", "wind", "coal", "gas"];

function InfrastructureToggle({ activeType, counts, onSelect }: InfrastructureToggleProps) {
  return (
    <div className="infra-toggle">
      {INFRA_ORDER.map((type) => {
        const config = INFRA_CONFIGS[type];
        const isActive = activeType === type;
        const count = counts[type];
        return (
          <button
            key={type}
            className={`infra-toggle-btn ${isActive ? "active" : ""}`}
            style={{ "--infra-color": config.color } as React.CSSProperties}
            onClick={() => onSelect(type)}
            title={config.label}
          >
            <span className="infra-symbol">{config.symbol}</span>
            <span className="infra-label">{config.label.toUpperCase()}</span>
            {count !== undefined && <span className="infra-count">{count.toLocaleString()}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default InfrastructureToggle;
