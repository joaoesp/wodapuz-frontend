import { useCallback, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { worldBankService, type GDPData } from "./services/worldBankService";
import { getCountryCode } from "./utils/countryNameToCode";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const INITIAL_CENTER: [number, number] = [0, 30];
const INITIAL_ZOOM = 1;

interface Tooltip {
  name: string;
  value?: string;
  x: number;
  y: number;
}

interface WorldMapProps {
  selectedMetric: string | null;
  selectedYear: number;
}

function WorldMap({ selectedMetric, selectedYear }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [gdpDataByYear, setGdpDataByYear] = useState<Record<string, Map<string, GDPData>>>({});

  const resetMap = useCallback(() => {
    setCenter(INITIAL_CENTER);
    setZoom(INITIAL_ZOOM);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        resetMap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetMap]);

  useEffect(() => {
    if (selectedMetric === "GDP") {
      worldBankService.getGDPYearRange(1960, 2024).then((dataByYear) => {
        const processedData: Record<string, Map<string, GDPData>> = {};

        Object.keys(dataByYear).forEach((year) => {
          const yearData = dataByYear[year];
          const dataMap = new Map<string, GDPData>();
          yearData.forEach((item) => {
            dataMap.set(item.countryCode, item);
          });
          processedData[year] = dataMap;
        });

        console.log("GDP data loaded for years:", Object.keys(processedData).length);
        setGdpDataByYear(processedData);
      }).catch((error) => {
        console.error("Failed to load GDP data:", error);
      });
    }
  }, [selectedMetric]);

  const getCountryColor = (countryCode: string, countryName?: string) => {
    if (selectedMetric === "GDP") {
      // If no country code mapping, show white
      if (!countryCode || countryCode === "") {
        return "#ffffff";
      }

      const yearData = gdpDataByYear[selectedYear.toString()];
      if (yearData) {
        const data = yearData.get(countryCode);
        if (data && data.value) {
          // Color scale based on GDP (in trillions)
          const gdpInTrillions = data.value / 1_000_000_000_000;
          if (gdpInTrillions > 10) return "#2d5016"; // Dark green for >10T
          if (gdpInTrillions > 5) return "#4a7a23"; // Medium-dark green for >5T
          if (gdpInTrillions > 1) return "#6b9c2f"; // Medium green for >1T
          if (gdpInTrillions > 0.5) return "#9cc837"; // Light green for >500B
          if (gdpInTrillions > 0.1) return "#b8d66b"; // Very light green for >100B
          return "#d4e89f"; // Pale green for <100B
        }
      }
      return "#ffffff"; // White for no data when metric is selected
    }
    return "#a6a6a6"; // Default gray when no metric selected
  };

  return (
    <>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [0, 30] }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          onMoveEnd={({ coordinates, zoom: z }) => {
            setCenter(coordinates);
            setZoom(z);
          }}
          translateExtent={[[-200, -100], [1000, 600]]}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseMove={(e) => {
                    const countryCode = getCountryCode(geo.properties.name);
                    let metricValue: string | undefined;

                    if (selectedMetric === "GDP" && countryCode) {
                      const yearData = gdpDataByYear[selectedYear.toString()];
                      if (yearData) {
                        const data = yearData.get(countryCode);
                        if (data && data.value) {
                          const gdpInTrillions = data.value / 1_000_000_000_000;
                          if (gdpInTrillions >= 1) {
                            metricValue = `GDP: $${gdpInTrillions.toFixed(2)}T`;
                          } else {
                            const gdpInBillions = data.value / 1_000_000_000;
                            metricValue = `GDP: $${gdpInBillions.toFixed(0)}B`;
                          }
                        }
                      }
                    }

                    setTooltip({
                      name: geo.properties.name,
                      value: metricValue,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: {
                      fill: getCountryColor(getCountryCode(geo.properties.name) || "", geo.properties.name),
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
          <div>{tooltip.name}</div>
          {tooltip.value && <div style={{ fontSize: '12px', opacity: 0.9 }}>{tooltip.value}</div>}
        </div>
      )}
    </>
  );
}

export default WorldMap;
