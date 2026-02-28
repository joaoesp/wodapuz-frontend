// preprocess-power-plants.mjs
// Usage: node scripts/preprocess-power-plants.mjs ./global_power_plant_database.csv
//
// Reads the WRI Global Power Plant Database CSV and outputs one JSON file per
// fuel type into public/data/infrastructure/

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/data/infrastructure");

mkdirSync(OUT_DIR, { recursive: true });

const FUEL_MAP = {
  Nuclear: "nuclear",
  Hydro: "hydro",
  Solar: "solar",
  Wind: "wind",
  Coal: "coal",
  Gas: "gas",
  "Natural Gas": "gas",
};

// MW thresholds (0 means no minimum)
const THRESHOLDS = {
  nuclear: 0,
  hydro: 1000,
  solar: 200,
  wind: 200,
  coal: 500,
  gas: 1000,
};

// Accumulators
const plants = {
  nuclear: [],
  hydro: [],
  solar: [],
  wind: [],
  coal: [],
  gas: [],
};

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/preprocess-power-plants.mjs <path-to-csv>");
  process.exit(1);
}

const strip = (s) => s.replace(/^["']|["']$/g, "").trim();

let lineNum = 0;

const rl = createInterface({
  input: createReadStream(resolve(csvPath)),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  lineNum++;
  if (lineNum === 1) return; // skip header

  // Simple CSV split (fields don't contain commas themselves in this dataset)
  const cols = line.split(",");
  if (cols.length < 8) return;

  // col indices per v1.3.0 schema:
  // 0=country, 2=name, 4=capacity_mw, 5=latitude, 6=longitude, 7=primary_fuel
  const country = strip(cols[0]);
  const name = strip(cols[2]).substring(0, 40);
  const mwRaw = parseFloat(strip(cols[4]));
  const lat = parseFloat(strip(cols[5]));
  const lon = parseFloat(strip(cols[6]));
  const fuel = strip(cols[7]);

  if (!country || isNaN(mwRaw) || isNaN(lat) || isNaN(lon)) return;

  const type = FUEL_MAP[fuel];
  if (!type) return;

  const threshold = THRESHOLDS[type];
  if (mwRaw < threshold) return;

  plants[type].push({
    n: name,
    lat: Math.round(lat * 1000) / 1000,
    lon: Math.round(lon * 1000) / 1000,
    mw: Math.round(mwRaw),
    c: country,
  });
});

rl.on("close", () => {
  for (const [type, records] of Object.entries(plants)) {
    const outPath = resolve(OUT_DIR, `${type}.json`);
    writeFileSync(outPath, JSON.stringify(records), "utf-8");
    console.log(`${type}: ${records.length} plants → ${outPath}`);
  }
  console.log("Done.");
});
