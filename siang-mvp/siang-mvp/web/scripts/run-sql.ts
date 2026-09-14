// Runs a .sql file directly against the project's Postgres database.
// Usage: npx tsx scripts/run-sql.ts <path-to-file.sql> [more.sql ...]
import { readFileSync } from "fs";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: new URL("../.env.local", import.meta.url) });

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("Usage: npx tsx scripts/run-sql.ts <file.sql> [more.sql ...]");
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    for (const file of files) {
      const sql = readFileSync(file, "utf8");
      console.log(`Running ${file}...`);
      const res = await client.query(sql);
      const result = Array.isArray(res) ? res[res.length - 1] : res;
      if (result?.rows?.length) console.table(result.rows);
      console.log(`✓ ${file} done`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
