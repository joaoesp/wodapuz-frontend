import { useCallback, useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { worldBankService, type IndicatorData } from "./services/worldBankService";
import { gfpService } from "./services/gfpService";
import { owidService } from "./services/owidService";
import { getCountryCode } from "./utils/countryNameToCode";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

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
  "Trade Openness": {
    thresholds: [25, 50, 75, 100, 150],
    colors: ["#d4e89f", "#b8d66b", "#9cc837", "#6b9c2f", "#4a7a23", "#2d5016"],
    format: (value: number) => `Trade Openness: ${value.toFixed(1)}% of GDP`,
  },
  Exports: {
    thresholds: [10, 20, 30, 50, 75],
    colors: ["#d4e89f", "#b8d66b", "#9cc837", "#6b9c2f", "#4a7a23", "#2d5016"],
    format: (value: number) => `Exports: ${value.toFixed(1)}% of GDP`,
  },
  Imports: {
    thresholds: [10, 20, 30, 50, 75],
    colors: ["#d4e89f", "#b8d66b", "#9cc837", "#6b9c2f", "#4a7a23", "#2d5016"],
    format: (value: number) => `Imports: ${value.toFixed(1)}% of GDP`,
  },
  "Trade Balance": {
    thresholds: [-100e9, -10e9, -1e9, 0, 10e9, 100e9],
    colors: ["#8b0000", "#d32f2f", "#ff9800", "#fdd835", "#9cc837", "#4a7a23", "#2d5016"],
    format: (value: number) => {
      const b = value / 1e9;
      return `Trade Balance: ${b >= 0 ? "+" : ""}${b.toFixed(1)}B`;
    },
  },
  "Military Spending": {
    thresholds: [1e9, 5e9, 20e9, 100e9, 500e9],
    colors: ["#f0e6ff", "#c9a0e8", "#a855c8", "#7c3aad", "#4a1080", "#1a0030"],
    format: (v: number) => {
      const b = v / 1e9;
      return b >= 1 ? `$${b.toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    },
  },
  "Active Personnel": {
    thresholds: [10000, 50000, 200000, 500000, 1000000],
    colors: ["#e8f5e9", "#a5d6a7", "#66bb6a", "#388e3c", "#1b5e20", "#0a2e0f"],
    format: (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : `${(v / 1e3).toFixed(0)}K`),
  },
  "Military Inventory": {
    // PwrIndx: lower = stronger; dark green = most powerful, light gray = weakest
    thresholds: [0.3, 0.8, 1.5, 3.0],
    colors: ["#2d5016", "#4a7a23", "#9cc837", "#fdd835", "#c8c8c8"],
    format: (v: number) => `Power Index: ${v.toFixed(4)}`,
  },
  "Nuclear Capability": {
    thresholds: [0.5],
    colors: ["#ffffff", "#ff7c00"],
    format: () => "Nuclear Armed State",
  },
  "Energy Production": {
    thresholds: [10, 100, 500, 1000, 3000],
    colors: ["#fff8e1", "#ffe082", "#ffb300", "#e65100", "#b71c1c", "#4a0000"],
    format: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k TWh` : `${v.toFixed(1)} TWh`),
  },
};

// Military alliance definitions — each country assigned to its primary alliance
export const ALLIANCES = [
  {
    name: "NATO",
    color: "#1a6db5",
    members: new Set([
      "ALB",
      "BEL",
      "BGR",
      "CAN",
      "HRV",
      "CZE",
      "DNK",
      "EST",
      "FIN",
      "FRA",
      "DEU",
      "GRC",
      "HUN",
      "ISL",
      "ITA",
      "LVA",
      "LTU",
      "LUX",
      "MNE",
      "NLD",
      "MKD",
      "NOR",
      "POL",
      "PRT",
      "ROU",
      "SVK",
      "SVN",
      "ESP",
      "SWE",
      "TUR",
      "GBR",
      "USA",
    ]),
  },
  {
    name: "CSTO",
    color: "#c0392b",
    members: new Set(["RUS", "BLR", "KAZ", "KGZ", "TJK"]),
  },
  {
    name: "ANZUS",
    color: "#16a085",
    members: new Set(["AUS", "NZL"]),
  },
  {
    name: "GCC",
    color: "#f39c12",
    members: new Set(["SAU", "ARE", "KWT", "QAT", "BHR", "OMN"]),
  },
] as const;

const ALLIANCE_BY_COUNTRY: Record<string, { name: string; color: string }> = {};
for (const alliance of ALLIANCES) {
  for (const code of alliance.members) {
    ALLIANCE_BY_COUNTRY[code] = { name: alliance.name, color: alliance.color };
  }
}

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
  onCountryClick?: (
    countryCode: string,
    countryName: string,
    timeSeries: { year: number; value: number }[]
  ) => void;
}

function WorldMap({
  selectedMetric,
  selectedYear,
  onYearRangeUpdate,
  onCountryClick,
}: WorldMapProps) {
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
    if (!selectedMetric) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicatorDataByYear({});
      return;
    }

    if (selectedMetric === "Military Alliances") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicatorDataByYear({});
      onYearRangeUpdate(2024, 2024);
      return;
    }

    if (selectedMetric === "Nuclear Capability") {
      const NUCLEAR_STATES = ["USA", "RUS", "GBR", "FRA", "CHN", "IND", "PAK", "PRK", "ISR"];
      const dataMap = new Map<string, IndicatorData>();
      NUCLEAR_STATES.forEach((code) => {
        dataMap.set(code, {
          countryCode: code,
          countryName: code,
          year: "2026",
          value: 1,
          indicator: "Nuclear Capability",
        });
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndicatorDataByYear({ "2026": dataMap });
      onYearRangeUpdate(2026, 2026);
      return;
    }

    if (selectedMetric === "Military Inventory") {
      gfpService
        .fetchRankings()
        .then((rankings) => {
          const dataMap = new Map<string, IndicatorData>();
          rankings.forEach((r) => {
            dataMap.set(r.countryCode, {
              countryCode: r.countryCode,
              countryName: r.countryCode,
              year: "2026",
              value: r.powerIndex,
              indicator: "Military Inventory",
            });
          });
          setIndicatorDataByYear({ "2026": dataMap });
          onYearRangeUpdate(2026, 2026);
        })
        .catch((error) => {
          console.error("Failed to load GFP rankings:", error);
        });
      return;
    }

    if (selectedMetric === "Energy Production") {
      owidService
        .fetchEnergyYearRange(1965, 2030)
        .then((dataByYear) => {
          const processedData: Record<string, Map<string, IndicatorData>> = {};
          Object.keys(dataByYear).forEach((year) => {
            const dataMap = new Map<string, IndicatorData>();
            dataByYear[year].forEach((item) => {
              dataMap.set(item.countryCode, item);
            });
            processedData[year] = dataMap;
          });
          setIndicatorDataByYear(processedData);
          const availableYears = Object.keys(processedData)
            .map((y) => parseInt(y))
            .sort((a, b) => a - b);
          if (availableYears.length > 0) {
            onYearRangeUpdate(availableYears[0], availableYears[availableYears.length - 1]);
          }
        })
        .catch((error) => {
          console.error("Failed to load energy production data:", error);
        });
      return;
    }

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

        console.log(`${selectedMetric} data loaded for years:`, Object.keys(processedData).length);
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
  }, [selectedMetric, onYearRangeUpdate]);

  const getCountryColor = (countryCode: string) => {
    if (selectedMetric === "Military Alliances") {
      return ALLIANCE_BY_COUNTRY[countryCode]?.color ?? "#ffffff";
    }
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

  // Small countries/city-states that are too tiny to click reliably on the polygon map
  const TINY_COUNTRIES: { name: string; code: string; coordinates: [number, number] }[] = [
    { name: "Singapore", code: "SGP", coordinates: [103.82, 1.35] },
    { name: "Bahrain", code: "BHR", coordinates: [50.55, 26.07] },
    { name: "Maldives", code: "MDV", coordinates: [73.22, 3.2] },
    { name: "Malta", code: "MLT", coordinates: [14.37, 35.9] },
    { name: "Luxembourg", code: "LUX", coordinates: [6.13, 49.81] },
    { name: "Qatar", code: "QAT", coordinates: [51.18, 25.35] },
  ];

  const handleTinyCountryClick = (name: string, code: string) => {
    if (!onCountryClick) return;
    const timeSeries: { year: number; value: number }[] = [];
    Object.entries(indicatorDataByYear).forEach(([year, yearMap]) => {
      const entry = yearMap.get(code);
      if (entry && entry.value != null) {
        timeSeries.push({ year: parseInt(year), value: entry.value });
      }
    });
    timeSeries.sort((a, b) => a.year - b.year);
    onCountryClick(code, name, timeSeries);
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
          maxZoom={20}
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
                      if (selectedMetric === "Military Alliances") {
                        metricValue = ALLIANCE_BY_COUNTRY[countryCode]?.name;
                      } else {
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
                    }

                    setTooltip({
                      name: geo.properties.name,
                      value: metricValue,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => {
                    if (!onCountryClick) return;
                    const countryCode = getCountryCode(geo.properties.name);
                    if (!countryCode) return;
                    const timeSeries: { year: number; value: number }[] = [];
                    Object.entries(indicatorDataByYear).forEach(([year, yearMap]) => {
                      const entry = yearMap.get(countryCode);
                      if (entry && entry.value != null) {
                        timeSeries.push({ year: parseInt(year), value: entry.value });
                      }
                    });
                    timeSeries.sort((a, b) => a.year - b.year);
                    onCountryClick(countryCode, geo.properties.name, timeSeries);
                  }}
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
          {TINY_COUNTRIES.map((country) => {
            const yearData = indicatorDataByYear[selectedYear.toString()];
            const entry = yearData?.get(country.code);
            const color =
              selectedMetric === "Military Alliances"
                ? (ALLIANCE_BY_COUNTRY[country.code]?.color ?? "#ffffff")
                : selectedMetric && entry?.value != null
                  ? getColorFromThresholds(
                      entry.value,
                      METRIC_CONFIGS[selectedMetric].thresholds,
                      METRIC_CONFIGS[selectedMetric].colors
                    )
                  : selectedMetric
                    ? "#ffffff"
                    : "#a6a6a6";
            return (
              <Marker key={country.code} coordinates={country.coordinates}>
                <circle
                  r={4 / zoom}
                  fill={color}
                  stroke="#303030"
                  strokeWidth={0.3 / zoom}
                  style={{ cursor: "pointer" }}
                  onMouseMove={(e) => {
                    let metricValue: string | undefined;
                    if (selectedMetric === "Military Alliances") {
                      metricValue = ALLIANCE_BY_COUNTRY[country.code]?.name;
                    } else if (selectedMetric && entry?.value != null) {
                      metricValue = METRIC_CONFIGS[selectedMetric].format(entry.value);
                    }
                    setTooltip({
                      name: country.name,
                      value: metricValue,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => handleTinyCountryClick(country.name, country.code)}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      {selectedMetric === "Military Alliances" && (
        <div className="alliance-legend">
          {ALLIANCES.map((a) => (
            <div key={a.name} className="alliance-legend-item">
              <span className="alliance-legend-color" style={{ background: a.color }} />
              <span>{a.name}</span>
            </div>
          ))}
          <div className="alliance-legend-item">
            <span className="alliance-legend-color alliance-legend-none" />
            <span>No Alliance</span>
          </div>
        </div>
      )}
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
