export type InfraType = "nuclear" | "hydro" | "solar" | "wind" | "coal" | "gas" | "oil";

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
  minCapacity: string;
}

export const INFRA_CONFIGS: Record<InfraType, InfraConfig> = {
  nuclear: { label: "Nuclear", color: "#9cc837", file: "nuclear.json", minCapacity: "≥20 MW" },
  hydro: { label: "Hydro", color: "#4fc3f7", file: "hydro.json", minCapacity: "≥1,000 MW" },
  solar: { label: "Solar", color: "#ffd700", file: "solar.json", minCapacity: "≥200 MW" },
  wind: { label: "Wind", color: "#c56cf0", file: "wind.json", minCapacity: "≥200 MW" },
  coal: { label: "Coal", color: "#4a4a4a", file: "coal.json", minCapacity: "≥500 MW" },
  gas: { label: "Gas", color: "#ff6600", file: "gas.json", minCapacity: "≥1,000 MW" },
  oil: { label: "Oil", color: "#b91c1c", file: "oil.json", minCapacity: "≥50 kb/d" },
};
