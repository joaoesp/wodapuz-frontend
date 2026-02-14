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
                      fill: "#a6a6a6",
                      stroke: "#303030",
                      strokeWidth: 0.3,
                      outline: "none",
                    },
                    hover: {
                      fill: "#9CC837",
                      stroke: "#303030",
                      strokeWidth: 0.3,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: "#8ab82e",
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
