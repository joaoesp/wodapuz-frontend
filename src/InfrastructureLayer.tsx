import { useEffect, useMemo, useState } from "react";
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
  color: string;
  file: string;
}

export const INFRA_CONFIGS: Record<InfraType, InfraConfig> = {
  nuclear: { label: "Nuclear", color: "#9cc837", file: "nuclear.json" },
  hydro: { label: "Hydro", color: "#4fc3f7", file: "hydro.json" },
  solar: { label: "Solar", color: "#ffd700", file: "solar.json" },
  wind: { label: "Wind", color: "#c56cf0", file: "wind.json" },
  coal: { label: "Coal", color: "#4a4a4a", file: "coal.json" },
  gas: { label: "Gas", color: "#ff6600", file: "gas.json" },
};

interface Cluster {
  lat: number;
  lon: number;
  plants: PlantRecord[];
  totalMw: number;
}

function clusterPlants(plants: PlantRecord[], zoom: number): Cluster[] {
  // At zoom >= 8, show individual markers (no clustering)
  if (zoom >= 8) {
    return plants.map((p) => ({
      lat: p.lat,
      lon: p.lon,
      plants: [p],
      totalMw: p.mw,
    }));
  }

  // Grid cell size shrinks as zoom increases
  const cellSize = 25 / zoom;
  const grid = new Map<string, PlantRecord[]>();

  for (const plant of plants) {
    const cellX = Math.floor(plant.lon / cellSize);
    const cellY = Math.floor(plant.lat / cellSize);
    const key = `${cellX},${cellY}`;
    let cell = grid.get(key);
    if (!cell) {
      cell = [];
      grid.set(key, cell);
    }
    cell.push(plant);
  }

  const clusters: Cluster[] = [];
  for (const group of grid.values()) {
    let latSum = 0;
    let lonSum = 0;
    let mwSum = 0;
    for (const p of group) {
      latSum += p.lat;
      lonSum += p.lon;
      mwSum += p.mw;
    }
    clusters.push({
      lat: latSum / group.length,
      lon: lonSum / group.length,
      plants: group,
      totalMw: mwSum,
    });
  }

  return clusters;
}

interface InfrastructureLayerProps {
  infraType: InfraType;
  zoom: number;
  onHover: (tip: { name: string; value: string; x: number; y: number } | null) => void;
  onClusterClick: (lon: number, lat: number, zoom: number) => void;
}

function InfrastructureLayer({
  infraType,
  zoom,
  onHover,
  onClusterClick,
}: InfrastructureLayerProps) {
  const [plants, setPlants] = useState<PlantRecord[]>([]);

  useEffect(() => {
    const config = INFRA_CONFIGS[infraType];
    fetch(`/data/infrastructure/${config.file}`)
      .then((r) => r.json())
      .then((data: PlantRecord[]) => setPlants(data))
      .catch(console.error);
  }, [infraType]);

  const clusters = useMemo(() => clusterPlants(plants, zoom), [plants, zoom]);
  const config = INFRA_CONFIGS[infraType];

  return (
    <>
      {clusters.map((cluster, i) => {
        const count = cluster.plants.length;

        if (count === 1) {
          const plant = cluster.plants[0];
          // Radius scales with sqrt(MW) for perceptual area-proportionality
          const plantRadius = Math.max(5, Math.min(18, 4 + Math.sqrt(plant.mw / 50))) / zoom;
          return (
            <Marker key={i} coordinates={[plant.lon, plant.lat]}>
              <circle
                r={plantRadius}
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
            </Marker>
          );
        }

        // Cluster marker — radius scales with sqrt(totalMw) for perceptual balance
        const clusterRadius = Math.min(35, (6 + Math.sqrt(cluster.totalMw / 50)) / zoom);
        const totalMwFormatted =
          cluster.totalMw >= 1000
            ? `${(cluster.totalMw / 1000).toFixed(1)}k MW`
            : `${cluster.totalMw.toLocaleString()} MW`;

        return (
          <Marker key={i} coordinates={[cluster.lon, cluster.lat]}>
            <circle
              r={clusterRadius}
              fill={config.color}
              fillOpacity={0.7}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth={1 / zoom}
              style={{ cursor: "pointer" }}
              onMouseMove={(e) => {
                onHover({
                  name: `${count} ${config.label} plants`,
                  value: `Total: ${totalMwFormatted}`,
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onMouseLeave={() => onHover(null)}
              onClick={() => onClusterClick(cluster.lon, cluster.lat, Math.min(20, zoom * 2.5))}
            />
            <text
              fontSize={Math.max(3, clusterRadius * 0.8)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000"
              fontWeight="bold"
              pointerEvents="none"
            >
              {count}
            </text>
          </Marker>
        );
      })}
    </>
  );
}

export default InfrastructureLayer;
