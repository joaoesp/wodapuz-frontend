export type MineralType =
  | "lithium"
  | "rare-earths"
  | "copper"
  | "nickel"
  | "cobalt"
  | "uranium"
  | "iron-ore"
  | "bauxite"
  | "zinc";

export type MineralView = "reserves" | "production";

export interface MineralRecord {
  c: string;
  v: number;
}

export interface MineralConfig {
  label: string;
  color: string;
  file: string;
  unit: string;
  unitShort: string;
  productionFile: string;
  productionUnit: string;
  productionUnitShort: string;
}

export const MINERAL_CONFIGS: Record<MineralType, MineralConfig> = {
  lithium: {
    label: "Lithium",
    color: "#06b6d4",
    file: "lithium.json",
    unit: "Thousand Tonnes",
    unitShort: "kt",
    productionFile: "lithium-production.json",
    productionUnit: "Thousand Tonnes/yr",
    productionUnitShort: "kt/yr",
  },
  "rare-earths": {
    label: "Rare Earths",
    color: "#8b5cf6",
    file: "rare-earths.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
    productionFile: "rare-earths-production.json",
    productionUnit: "Thousand Tonnes/yr",
    productionUnitShort: "kt/yr",
  },
  copper: {
    label: "Copper",
    color: "#c2410c",
    file: "copper.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
    productionFile: "copper-production.json",
    productionUnit: "Million Tonnes/yr",
    productionUnitShort: "Mt/yr",
  },
  nickel: {
    label: "Nickel",
    color: "#737373",
    file: "nickel.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
    productionFile: "nickel-production.json",
    productionUnit: "Million Tonnes/yr",
    productionUnitShort: "Mt/yr",
  },
  cobalt: {
    label: "Cobalt",
    color: "#2563eb",
    file: "cobalt.json",
    unit: "Thousand Tonnes",
    unitShort: "kt",
    productionFile: "cobalt-production.json",
    productionUnit: "Thousand Tonnes/yr",
    productionUnitShort: "kt/yr",
  },
  uranium: {
    label: "Uranium",
    color: "#16a34a",
    file: "uranium.json",
    unit: "Thousand Tonnes",
    unitShort: "kt",
    productionFile: "uranium-production.json",
    productionUnit: "Thousand Tonnes/yr",
    productionUnitShort: "kt/yr",
  },
  "iron-ore": {
    label: "Iron Ore",
    color: "#dc2626",
    file: "iron-ore.json",
    unit: "Billion Tonnes",
    unitShort: "Bt",
    productionFile: "iron-ore-production.json",
    productionUnit: "Billion Tonnes/yr",
    productionUnitShort: "Bt/yr",
  },
  bauxite: {
    label: "Bauxite",
    color: "#d97706",
    file: "bauxite.json",
    unit: "Billion Tonnes",
    unitShort: "Bt",
    productionFile: "bauxite-production.json",
    productionUnit: "Million Tonnes/yr",
    productionUnitShort: "Mt/yr",
  },
  zinc: {
    label: "Zinc",
    color: "#64748b",
    file: "zinc.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
    productionFile: "zinc-production.json",
    productionUnit: "Million Tonnes/yr",
    productionUnitShort: "Mt/yr",
  },
};

export const MINERAL_ORDER: MineralType[] = [
  "lithium",
  "rare-earths",
  "copper",
  "nickel",
  "cobalt",
  "uranium",
  "iron-ore",
  "bauxite",
  "zinc",
];
