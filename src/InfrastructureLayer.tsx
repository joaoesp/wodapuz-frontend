import { useEffect, useState } from "react";
import { Marker } from "react-simple-maps";

export type InfraType = "nuclear" | "hydro" | "solar" | "wind" | "coal" | "gas";

export interface PlantRecord {
  n: string;
  lat: number;
  lon: number;
  mw: number;
  c: string;
}

export interface InfraConfig {
  label: string;
  symbol: string;
  color: string;
  file: string;
}

export const INFRA_CONFIGS: Record<InfraType, InfraConfig> = {
  nuclear: { label: "Nuclear", symbol: "⚛", color: "#f9ca24", file: "nuclear.json" },
  hydro: { label: "Hydro", symbol: "〜", color: "#4fc3f7", file: "hydro.json" },
  solar: { label: "Solar", symbol: "☀", color: "#ffa502", file: "solar.json" },
  wind: { label: "Wind", symbol: "⟳", color: "#26de81", file: "wind.json" },
  coal: { label: "Coal", symbol: "◼", color: "#636e72", file: "coal.json" },
  gas: { label: "Gas", symbol: "🔥", color: "#fd9644", file: "gas.json" },
};

interface InfrastructureLayerProps {
  infraType: InfraType;
  zoom: number;
  onHover: (tip: { name: string; value: string; x: number; y: number } | null) => void;
}

function InfrastructureLayer({ infraType, zoom, onHover }: InfrastructureLayerProps) {
  const [plants, setPlants] = useState<PlantRecord[]>([]);

  useEffect(() => {
    const config = INFRA_CONFIGS[infraType];
    fetch(`/data/infrastructure/${config.file}`)
      .then((r) => r.json())
      .then((data: PlantRecord[]) => setPlants(data))
      .catch(console.error);
  }, [infraType]);

  const config = INFRA_CONFIGS[infraType];

  return (
    <>
      {plants.map((plant, i) => (
        <Marker key={i} coordinates={[plant.lon, plant.lat]}>
          <circle
            r={5 / zoom}
            fill={config.color}
            fillOpacity={0.85}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth={0.5 / zoom}
            onMouseMove={(e) => {
              onHover({
                name: plant.n,
                value: `${plant.mw.toLocaleString()} MW`,
                x: e.clientX,
                y: e.clientY,
              });
            }}
            onMouseLeave={() => onHover(null)}
          />
          {zoom >= 3 && (
            <text
              fontSize={Math.max(4, 7 / zoom)}
              textAnchor="middle"
              dominantBaseline="central"
              pointerEvents="none"
            >
              {config.symbol}
            </text>
          )}
        </Marker>
      ))}
    </>
  );
}

export default InfrastructureLayer;
