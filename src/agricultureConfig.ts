export type CropType = "wheat" | "corn" | "rice" | "soybeans";

export interface CropRecord {
  c: string;
  v: number;
}

export interface CropConfig {
  label: string;
  color: string;
  file: string;
  unit: string;
  unitShort: string;
}

export const CROP_CONFIGS: Record<CropType, CropConfig> = {
  wheat: {
    label: "Wheat",
    color: "#d97706",
    file: "wheat.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
  },
  corn: {
    label: "Corn",
    color: "#eab308",
    file: "corn.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
  },
  rice: {
    label: "Rice",
    color: "#059669",
    file: "rice.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
  },
  soybeans: {
    label: "Soybeans",
    color: "#92400e",
    file: "soybeans.json",
    unit: "Million Tonnes",
    unitShort: "Mt",
  },
};

export const CROP_ORDER: CropType[] = ["wheat", "corn", "rice", "soybeans"];
