import { useCallback, useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { worldBankService, type IndicatorData } from "./services/worldBankService";
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
  const [indicatorDataByYear, setIndicatorDataByYear] = useState<Record<string, Map<string, IndicatorData>>>({});

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
    if (selectedMetric) {
      worldBankService.getIndicatorYearRange(selectedMetric, 1960, 2024).then((dataByYear) => {
        const processedData: Record<string, Map<string, IndicatorData>> = {};

        Object.keys(dataByYear).forEach((year) => {
          const yearData = dataByYear[year];
          const dataMap = new Map<string, IndicatorData>();
          yearData.forEach((item) => {
            dataMap.set(item.countryCode, item);
          });
          processedData[year] = dataMap;
        });

        console.log(`${selectedMetric} data loaded for years:`, Object.keys(processedData).length);
        setIndicatorDataByYear(processedData);
      }).catch((error) => {
        console.error(`Failed to load ${selectedMetric} data:`, error);
      });
    } else {
      setIndicatorDataByYear({});
    }
  }, [selectedMetric]);

  const getCountryColor = (countryCode: string, countryName?: string) => {
    if (selectedMetric) {
      // If no country code mapping, show white
      if (!countryCode || countryCode === "") {
        return "#ffffff";
      }

      const yearData = indicatorDataByYear[selectedYear.toString()];
      if (yearData) {
        const data = yearData.get(countryCode);
        if (data && data.value !== null && data.value !== undefined) {
          const value = data.value;

          // Different color scales for different metrics
          switch (selectedMetric) {
            case "GDP": {
              const gdpInTrillions = value / 1_000_000_000_000;
              if (gdpInTrillions > 10) return "#2d5016";
              if (gdpInTrillions > 5) return "#4a7a23";
              if (gdpInTrillions > 1) return "#6b9c2f";
              if (gdpInTrillions > 0.5) return "#9cc837";
              if (gdpInTrillions > 0.1) return "#b8d66b";
              return "#d4e89f";
            }
            case "GDP growth": {
              // Negative to positive scale
              if (value < -5) return "#8b0000"; // Dark red
              if (value < 0) return "#d32f2f"; // Red
              if (value < 2) return "#fdd835"; // Yellow
              if (value < 5) return "#9cc837"; // Green
              if (value < 8) return "#4a7a23"; // Dark green
              return "#2d5016"; // Darkest green
            }
            case "GDP per capita": {
              if (value > 50000) return "#2d5016";
              if (value > 30000) return "#4a7a23";
              if (value > 15000) return "#6b9c2f";
              if (value > 5000) return "#9cc837";
              if (value > 1000) return "#b8d66b";
              return "#d4e89f";
            }
            case "Debt-to-GDP": {
              // Higher debt is worse (red)
              if (value > 150) return "#8b0000";
              if (value > 100) return "#d32f2f";
              if (value > 75) return "#ff9800";
              if (value > 50) return "#fdd835";
              if (value > 25) return "#9cc837";
              return "#4a7a23";
            }
            case "Inflation": {
              // Low inflation is better
              if (value > 20) return "#8b0000";
              if (value > 10) return "#d32f2f";
              if (value > 5) return "#ff9800";
              if (value > 2) return "#fdd835";
              if (value > 0) return "#9cc837";
              if (value > -2) return "#4a7a23";
              return "#d32f2f"; // Deflation
            }
            case "Current Account Balance": {
              // Positive surplus is good, negative deficit is bad
              if (value < -10) return "#8b0000";
              if (value < -5) return "#d32f2f";
              if (value < -2) return "#ff9800";
              if (value < 2) return "#fdd835";
              if (value < 5) return "#9cc837";
              if (value < 10) return "#4a7a23";
              return "#2d5016";
            }
          }
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

                    if (selectedMetric && countryCode) {
                      const yearData = indicatorDataByYear[selectedYear.toString()];
                      if (yearData) {
                        const data = yearData.get(countryCode);
                        if (data && data.value !== null && data.value !== undefined) {
                          const value = data.value;

                          switch (selectedMetric) {
                            case "GDP": {
                              const gdpInTrillions = value / 1_000_000_000_000;
                              if (gdpInTrillions >= 1) {
                                metricValue = `GDP: $${gdpInTrillions.toFixed(2)}T`;
                              } else {
                                const gdpInBillions = value / 1_000_000_000;
                                metricValue = `GDP: $${gdpInBillions.toFixed(0)}B`;
                              }
                              break;
                            }
                            case "GDP growth": {
                              metricValue = `GDP growth: ${value.toFixed(1)}%`;
                              break;
                            }
                            case "GDP per capita": {
                              metricValue = `GDP per capita: $${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
                              break;
                            }
                            case "Debt-to-GDP": {
                              metricValue = `Debt-to-GDP: ${value.toFixed(1)}%`;
                              break;
                            }
                            case "Inflation": {
                              metricValue = `Inflation: ${value.toFixed(1)}%`;
                              break;
                            }
                            case "Current Account Balance": {
                              metricValue = `Current Account: ${value.toFixed(1)}% of GDP`;
                              break;
                            }
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
