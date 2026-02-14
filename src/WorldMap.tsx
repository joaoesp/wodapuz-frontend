import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function WorldMap() {
  return (
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
                  style={{
                    default: {
                      fill: "#2a2a3d",
                      stroke: "#3a3a5c",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: "#4a4a7a",
                      stroke: "#6a6aaa",
                      strokeWidth: 0.75,
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
  );
}

export default WorldMap;
