import { useCallback, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { worldBankService, type IndicatorData } from "./services/worldBankService";
import { getCountryCode } from "./utils/countryNameToCode";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const INITIAL_CENTER: [number, number] = [0, 30];
const INITIAL_ZOOM = 1;

// Exported for testing
/* eslint-disable react-refresh/only-export-components */
export interface MetricConfig {
  thresholds: number[];
  colors: string[];
  format: (value: number) => string;
}

export const METRIC_CONFIGS: Record<string, MetricConfig> = {
  GDP: {
    thresholds: [0.1e12, 0.5e12, 1e12, 5e12, 10e12],
    colors: ["#d4e89f", "#b8d66b", "#9cc837", "#6b9c2f", "#4a7a23", "#2d5016"],
    format: (value: number) => {
      const trillions = value / 1e12;
      return trillions >= 1
        ? `GDP: $${trillions.toFixed(2)}T`
        : `GDP: $${(value / 1e9).toFixed(0)}B`;
    },
  },
  "GDP growth": {
    thresholds: [-5, 0, 2, 5, 8],
    colors: ["#8b0000", "#d32f2f", "#fdd835", "#9cc837", "#4a7a23", "#2d5016"],
    format: (value: number) => `GDP growth: ${value.toFixed(1)}%`,
  },
  "GDP per capita": {
    thresholds: [1000, 5000, 15000, 30000, 50000],
    colors: ["#d4e89f", "#b8d66b", "#9cc837", "#6b9c2f", "#4a7a23", "#2d5016"],
    format: (value: number) =>
      `GDP per capita: $${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  },
  "Debt-to-GDP": {
    thresholds: [25, 50, 75, 100, 150],
    colors: ["#4a7a23", "#9cc837", "#fdd835", "#ff9800", "#d32f2f", "#8b0000"],
    format: (value: number) => `Debt-to-GDP: ${value.toFixed(1)}%`,
  },
  Inflation: {
    thresholds: [-2, 0, 2, 5, 10, 20],
    colors: ["#d32f2f", "#4a7a23", "#9cc837", "#fdd835", "#ff9800", "#d32f2f", "#8b0000"],
    format: (value: number) => `Inflation: ${value.toFixed(1)}%`,
  },
  "Current Account Balance": {
    thresholds: [-10, -5, -2, 2, 5, 10],
    colors: ["#8b0000", "#d32f2f", "#ff9800", "#fdd835", "#9cc837", "#4a7a23", "#2d5016"],
    format: (value: number) => `Current Account: ${value.toFixed(1)}% of GDP`,
  },
};

export function getColorFromThresholds(
  value: number,
  thresholds: number[],
  colors: string[]
): string {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) {
      return colors[i];
    }
  }
  return colors[colors.length - 1];
}
/* eslint-enable react-refresh/only-export-components */

interface Tooltip {
  name: string;
  value?: string;
  x: number;
  y: number;
}

interface WorldMapProps {
  selectedMetric: string | null;
  selectedYear: number;
  onYearRangeUpdate: (startYear: number, endYear: number) => void;
}

function WorldMap({ selectedMetric, selectedYear, onYearRangeUpdate }: WorldMapProps) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [center, setCenter] = useState<[number, number]>(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [indicatorDataByYear, setIndicatorDataByYear] = useState<
    Record<string, Map<string, IndicatorData>>
  >({});

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
      worldBankService
        .getIndicatorYearRange(selectedMetric, 1960, 2024)
        .then((dataByYear) => {
          const processedData: Record<string, Map<string, IndicatorData>> = {};

          Object.keys(dataByYear).forEach((year) => {
            const yearData = dataByYear[year];
            const dataMap = new Map<string, IndicatorData>();
            yearData.forEach((item) => {
              dataMap.set(item.countryCode, item);
            });
            processedData[year] = dataMap;
          });

          console.log(
            `${selectedMetric} data loaded for years:`,
            Object.keys(processedData).length
          );
          setIndicatorDataByYear(processedData);

          // Extract available year range from actual data
          const availableYears = Object.keys(processedData)
            .map((y) => parseInt(y))
            .sort((a, b) => a - b);

          if (availableYears.length > 0) {
            const minYear = availableYears[0];
            const maxYear = availableYears[availableYears.length - 1];
            onYearRangeUpdate(minYear, maxYear);
          }
        })
        .catch((error) => {
          console.error(`Failed to load ${selectedMetric} data:`, error);
        });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicatorDataByYear({});
    }
  }, [selectedMetric, onYearRangeUpdate]);

  const getCountryColor = (countryCode: string) => {
    if (selectedMetric) {
      // If no country code mapping, show white
      if (!countryCode || countryCode === "") {
        return "#ffffff";
      }

      const yearData = indicatorDataByYear[selectedYear.toString()];
      if (yearData) {
        const data = yearData.get(countryCode);
        if (data && data.value !== null && data.value !== undefined) {
          const config = METRIC_CONFIGS[selectedMetric];
          if (config) {
            return getColorFromThresholds(data.value, config.thresholds, config.colors);
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
          translateExtent={[
            [-200, -100],
            [1000, 600],
          ]}
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
                          const config = METRIC_CONFIGS[selectedMetric];
                          if (config) {
                            metricValue = config.format(data.value);
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
                      fill: getCountryColor(getCountryCode(geo.properties.name) || ""),
                      stroke: "#303030",
                      strokeWidth: 0.3,
                      outline: "none",
                    },
                    hover: {
                      fill: getCountryColor(getCountryCode(geo.properties.name) || ""),
                      stroke: "#ffffff",
                      strokeWidth: 1.5,
                      outline: "none",
                      cursor: "pointer",
                      filter: "drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.5))",
                    },
                    pressed: {
                      fill: getCountryColor(getCountryCode(geo.properties.name) || ""),
                      stroke: "#ffffff",
                      strokeWidth: 1.5,
                      outline: "none",
                      filter: "drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.5))",
                    },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}>
          <div>{tooltip.name}</div>
          {tooltip.value && <div style={{ fontSize: "12px", opacity: 0.9 }}>{tooltip.value}</div>}
        </div>
      )}
    </>
  );
}

export default WorldMap;
