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
