import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./shared/schema.ts",  // your schema file
  out: "./migrations",           // where migration SQL files live
  dbCredentials: {
    url: process.env.DATABASE_URL!, // read from env
  },
});