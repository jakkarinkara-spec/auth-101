// Run pending migrations in drizzle/ over Neon's HTTP driver (same one app/db uses).
// Used by `vercel-build` instead of `drizzle-kit migrate`, whose Neon driver needs a
// WebSocket — that isn't available on every Node version in Vercel's build image.
//
//   npm run db:migrate
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

async function main() {
  console.log(`Target DB host: ${new URL(url!).host}`);
  await migrate(drizzle(url!), { migrationsFolder: "./drizzle" });
  console.log("Migrations up to date.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
