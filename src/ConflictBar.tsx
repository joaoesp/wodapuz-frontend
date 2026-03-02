import { useState } from "react";
import type { ActiveConflict } from "./conflictData";
import "./ConflictBar.css";

interface ConflictBarProps {
  conflicts: ActiveConflict[];
  onHover: (conflict: ActiveConflict | null) => void;
  onOpen: (conflict: ActiveConflict) => void;
}

function ConflictBar({ conflicts, onHover, onOpen }: ConflictBarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="conflict-bar">
      {conflicts.map((c) => (
        <div key={c.id} className="conflict-bar-item">
          <button
            className={`conflict-bar-btn ${hoveredId === c.id ? "hovered" : ""}`}
            onMouseEnter={() => {
              setHoveredId(c.id);
              onHover(c);
            }}
            onMouseLeave={() => {
              setHoveredId(null);
              onHover(null);
            }}
            onClick={() => onOpen(c)}
            aria-label={c.name}
          >
            <span className="conflict-bar-icon">{c.icon}</span>
          </button>
          {hoveredId === c.id && <div className="conflict-bar-tooltip">{c.name}</div>}
        </div>
      ))}
    </div>
  );
}

export default ConflictBar;
