// Mark existing migrations as applied without running their SQL.
// Use on a DB whose schema was created via `drizzle-kit push` / manual SQL,
// so `drizzle-kit migrate` only runs migrations newer than the baseline.
//
//   npm run db:baseline            -> mark all migrations in drizzle/ as applied
//   npm run db:baseline -- 0003    -> mark only up to and including idx 0003
import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

type JournalEntry = { idx: number; when: number; tag: string };

const migrationsDir = path.join(process.cwd(), "drizzle");
const journal: { entries: JournalEntry[] } = JSON.parse(
  fs.readFileSync(path.join(migrationsDir, "meta", "_journal.json"), "utf8"),
);

const upTo = process.argv[2] !== undefined ? Number(process.argv[2]) : Infinity;
const entries = journal.entries.filter((e) => e.idx <= upTo);

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = neon(url);

async function main() {
  console.log(`Target DB host: ${new URL(url!).host}`);

  // Same table drizzle-kit migrate uses
  await sql`create schema if not exists drizzle`;
  await sql`
    create table if not exists drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    )`;

  const applied = await sql`select hash, created_at from drizzle.__drizzle_migrations`;
  const appliedMillis = new Set(applied.map((r) => Number(r.created_at)));

  for (const entry of entries) {
    if (appliedMillis.has(entry.when)) {
      console.log(`skip    ${entry.tag} (already recorded)`);
      continue;
    }
    // Hash computed the same way as drizzle-orm's readMigrationFiles
    const query = fs.readFileSync(path.join(migrationsDir, `${entry.tag}.sql`)).toString();
    const hash = crypto.createHash("sha256").update(query).digest("hex");
    await sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${hash}, ${entry.when})`;
    console.log(`marked  ${entry.tag}`);
  }

  console.log("Done. `npm run db:migrate` will now only run migrations newer than these.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
