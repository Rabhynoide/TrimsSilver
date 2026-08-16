export async function register() {
  // Only the Node.js runtime can reach Postgres; skip under the Edge runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Auto-migrate only in production (the Docker image), where docker-compose
  // guarantees Postgres is up first (see `depends_on.condition:
  // service_healthy`). In local dev, a missing/unreachable DB would
  // otherwise crash the whole dev server on every boot, including for
  // routes that don't touch it at all - run `npm run db:migrate` manually
  // instead (see README).
  if (process.env.NODE_ENV !== "production") return;

  const { migrate } = await import("drizzle-orm/node-postgres/migrator");
  const { db } = await import("@/lib/db");

  await migrate(db, { migrationsFolder: "./drizzle" });
}
