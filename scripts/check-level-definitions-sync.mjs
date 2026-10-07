// Guards against the level_definitions seed in
// supabase/migrations/0017_level_configuration.sql silently drifting from
// lib/data/class-levels.ts's CLASS_LEVELS - the migration's own comment
// promises they match exactly ("codes/labels matching lib/data/class-levels.ts
// exactly"), but nothing enforced that until this script. Parses both files
// as text rather than importing the TS module, since this runs standalone in
// CI with no build step.
//
// Run with: node scripts/check-level-definitions-sync.mjs
import { readFileSync } from "fs";

const CLASS_LEVELS_PATH = new URL("../lib/data/class-levels.ts", import.meta.url);
const MIGRATION_PATH = new URL(
  "../supabase/migrations/0017_level_configuration.sql",
  import.meta.url
);

function levelSlug(level) {
  return level.toLowerCase().replace(/\s+/g, "-");
}

function extractClassLevels(source) {
  const match = source.match(/export const CLASS_LEVELS = \[([\s\S]*?)\] as const;/);
  if (!match) throw new Error("Could not find CLASS_LEVELS array in class-levels.ts");
  return [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function extractSeedRows(source) {
  const match = source.match(
    /insert into public\.level_definitions \(programme_id, code, display_label, sort_order\)\nvalues\n([\s\S]*?);/
  );
  if (!match) throw new Error("Could not find level_definitions seed insert in 0017");
  const rows = [...match[1].matchAll(/\('[^']+',\s*'([^']+)',\s*'([^']+)',\s*(\d+)\)/g)];
  return rows
    .map(([, code, displayLabel, sortOrder]) => ({ code, displayLabel, sortOrder: Number(sortOrder) }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

const classLevels = extractClassLevels(readFileSync(CLASS_LEVELS_PATH, "utf8"));
const seedRows = extractSeedRows(readFileSync(MIGRATION_PATH, "utf8"));

const errors = [];

if (classLevels.length !== seedRows.length) {
  errors.push(
    `CLASS_LEVELS has ${classLevels.length} entries but the migration seed has ${seedRows.length} rows.`
  );
}

classLevels.forEach((label, i) => {
  const row = seedRows[i];
  if (!row) return;
  if (row.displayLabel !== label) {
    errors.push(
      `Position ${i + 1}: CLASS_LEVELS has "${label}" but the seed has "${row.displayLabel}" (sort_order ${row.sortOrder}).`
    );
  }
  const expectedCode = levelSlug(label);
  if (row.displayLabel === label && row.code !== expectedCode) {
    errors.push(`"${label}": expected code "${expectedCode}" but the seed has "${row.code}".`);
  }
});

if (errors.length > 0) {
  console.error("lib/data/class-levels.ts and the 0017 level_definitions seed have drifted:\n");
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nCLASS_LEVELS changed without a new migration activating/renaming the matching level_definitions row(s). Editing an already-applied migration doesn't fix this - add a new migration."
  );
  process.exit(1);
}

console.log(`OK: ${classLevels.length} CLASS_LEVELS entries match the 0017 level_definitions seed exactly.`);
