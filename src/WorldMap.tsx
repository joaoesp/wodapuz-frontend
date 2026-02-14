import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Tooltip {
  name: string;
  x: number;
  y: number;
}

function WorldMap() {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  return (
    <>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [0, 30] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseMove={(e) =>
                    setTooltip({
                      name: geo.properties.name,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: {
                      fill: "#2a2a3d",
                      stroke: "#3a3a5c",
                      strokeWidth: 0.2,
                      outline: "none",
                    },
                    hover: {
                      fill: "#4a4a7a",
                      stroke: "#6a6aaa",
                      strokeWidth: 0.4,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#5a5a9a",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
        >
          {tooltip.name}
        </div>
      )}
    </>
  );
}

export default WorldMap;
