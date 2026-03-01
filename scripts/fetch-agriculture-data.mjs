/**
 * Fetch crop production data from Our World in Data (sourced from FAOSTAT)
 * and generate static JSON files.
 *
 * OWID indicator API:
 *   https://api.ourworldindata.org/v1/indicators/{id}.data.json
 *   https://api.ourworldindata.org/v1/indicators/{id}.metadata.json
 *
 * Output format per crop file (e.g., wheat.json):
 * {
 *   "1961": [{"c": "USA", "v": 33.5}, ...],
 *   "2024": [...]
 * }
 * Values in million tonnes.
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_DIR = resolve(__dirname, "../public/data/agriculture");

mkdirSync(OUT_DIR, { recursive: true });

const CROPS = [
  { name: "wheat", indicatorId: 1199532 },
  { name: "corn", indicatorId: 1198621 },
  { name: "rice", indicatorId: 1199243 },
  { name: "soybeans", indicatorId: 1199355 },
];

/**
 * Fetch indicator data and metadata from OWID API.
 * Returns { entityMap: Map<id, iso3>, values, years, entities }
 */
async function fetchIndicator(indicatorId) {
  const [dataRes, metaRes] = await Promise.all([
    fetch(`https://api.ourworldindata.org/v1/indicators/${indicatorId}.data.json`),
    fetch(`https://api.ourworldindata.org/v1/indicators/${indicatorId}.metadata.json`),
  ]);

  if (!dataRes.ok) throw new Error(`Data fetch failed: ${dataRes.status}`);
  if (!metaRes.ok) throw new Error(`Metadata fetch failed: ${metaRes.status}`);

  const data = await dataRes.json();
  const meta = await metaRes.json();

  // Build entity ID -> ISO3 code map (skip aggregates with null code)
  const entityMap = new Map();
  for (const entity of meta.dimensions.entities.values) {
    if (entity.code) {
      entityMap.set(entity.id, entity.code);
    }
  }

  return { entityMap, values: data.values, years: data.years, entities: data.entities };
}

/**
 * Process raw OWID data into year-keyed format.
 * Converts tonnes to million tonnes, filters to countries only.
 */
function processData({ entityMap, values, years, entities }) {
  const byYear = {};

  for (let i = 0; i < values.length; i++) {
    const entityId = entities[i];
    const year = String(years[i]);
    const valueTonnes = values[i];

    const iso3 = entityMap.get(entityId);
    if (!iso3) continue; // Skip aggregates with null code
    if (iso3.startsWith("OWID_")) continue; // Skip OWID aggregates (world, continents)
    if (valueTonnes == null || valueTonnes <= 0) continue;

    const mt = Math.round((valueTonnes / 1e6) * 100) / 100; // million tonnes, 2 decimals
    if (mt <= 0) continue;

    if (!byYear[year]) byYear[year] = [];
    byYear[year].push({ c: iso3, v: mt });
  }

  // Sort each year by value descending
  for (const year of Object.keys(byYear)) {
    byYear[year].sort((a, b) => b.v - a.v);
  }

  // Sort keys numerically
  const sorted = {};
  const sortedYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b);
  for (const y of sortedYears) {
    sorted[String(y)] = byYear[y];
  }

  return sorted;
}

async function main() {
  for (const crop of CROPS) {
    console.log(`\n=== ${crop.name.toUpperCase()} ===`);

    try {
      console.log(`  Fetching indicator ${crop.indicatorId}...`);
      const raw = await fetchIndicator(crop.indicatorId);
      console.log(`  Raw records: ${raw.values.length}, entities: ${raw.entityMap.size} countries`);

      const data = processData(raw);
      const years = Object.keys(data);
      console.log(`  Years with data: ${years.length} (${years[0]}–${years.at(-1)})`);

      const lastYear = years.at(-1);
      console.log(
        `  ${lastYear}: ${data[lastYear].length} countries, top: ${data[lastYear][0].c} (${data[lastYear][0].v} Mt)`,
      );

      const outPath = resolve(OUT_DIR, `${crop.name}.json`);
      writeFileSync(outPath, JSON.stringify(data));
      console.log(`  Written to ${outPath}`);
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
