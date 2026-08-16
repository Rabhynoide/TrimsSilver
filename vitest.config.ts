import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      // Never connected to in unit tests (Pool construction is lazy) - just
      // needs to be present so importing src/lib/db doesn't throw.
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    },
  },
});
