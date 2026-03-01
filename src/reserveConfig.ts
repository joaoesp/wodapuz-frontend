export type ReserveType = "oil" | "gas" | "coal";

export interface ReserveRecord {
  c: string;
  v: number;
}

export interface ReserveConfig {
  label: string;
  color: string;
  file: string;
  unit: string;
  unitShort: string;
}

export const RESERVE_CONFIGS: Record<ReserveType, ReserveConfig> = {
  oil: {
    label: "Oil",
    color: "#b91c1c",
    file: "oil-reserves.json",
    unit: "Billion Barrels",
    unitShort: "Bb",
  },
  gas: {
    label: "Gas",
    color: "#ff6600",
    file: "gas-reserves.json",
    unit: "Trillion Cubic Meters",
    unitShort: "Tcm",
  },
  coal: {
    label: "Coal",
    color: "#4a4a4a",
    file: "coal-reserves.json",
    unit: "Billion Tonnes",
    unitShort: "Bt",
  },
};

export const RESERVE_ORDER: ReserveType[] = ["oil", "gas", "coal"];
